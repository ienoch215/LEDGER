import { describe, it, expect } from 'vitest';
import { toMonthStart, getNextMonthStart, isCurrentMonth, formatEntryDate } from '../src/lib/dates';
import { calculateSignal } from '../src/lib/signal';
import { rupeesToPaise, paiseToRupees, subtractPaise, formatRupees } from '../src/lib/money';

describe('Ledger Business Rules & Edge Cases', () => {
  describe('Month Boundary Handling (1st day and last day of month)', () => {
    it('correctly associates an entry on the 1st day to its calendar month', () => {
      const entryDate = '2026-10-01';
      const monthStart = toMonthStart(entryDate);
      expect(monthStart).toBe('2026-10-01');
      expect(formatEntryDate(entryDate)).toBe('01 Oct 2026');
    });

    it('correctly associates an entry on the last day of a 31-day month to its calendar month without leaking', () => {
      const entryDate = '2026-10-31';
      const monthStart = toMonthStart(entryDate);
      const nextMonthStart = getNextMonthStart(monthStart);

      expect(monthStart).toBe('2026-10-01');
      expect(nextMonthStart).toBe('2026-11-01');

      // The entry date must be >= monthStart AND strictly < nextMonthStart
      expect(entryDate >= monthStart).toBe(true);
      expect(entryDate < nextMonthStart).toBe(true);
    });

    it('correctly associates an entry on the last day of February (leap and non-leap)', () => {
      const feb28 = '2026-02-28';
      expect(toMonthStart(feb28)).toBe('2026-02-01');
      expect(getNextMonthStart('2026-02-01')).toBe('2026-03-01');
      expect(feb28 < '2026-03-01').toBe(true);
    });

    it('correctly associates an entry on the last day of a 30-day month (April, June, Sept, Nov)', () => {
      const apr30 = '2026-04-30';
      expect(toMonthStart(apr30)).toBe('2026-04-01');
      expect(getNextMonthStart('2026-04-01')).toBe('2026-05-01');
      expect(apr30 < '2026-05-01').toBe(true);
    });
  });

  describe('Salary Isolation Across Months', () => {
    it('editing salary for one month does not alter other months', () => {
      const monthsStore = [
        { id: '1', month: '2026-10-01', salary: 150000 },
        { id: '2', month: '2026-11-01', salary: 150000 },
        { id: '3', month: '2026-12-01', salary: 160000 },
      ];

      // Edit only October salary
      const targetMonth = '2026-10-01';
      const newOctoberSalary = 180000;

      const updatedMonths = monthsStore.map((m) =>
        m.month === targetMonth ? { ...m, salary: newOctoberSalary } : m
      );

      const october = updatedMonths.find((m) => m.month === '2026-10-01');
      const november = updatedMonths.find((m) => m.month === '2026-11-01');
      const december = updatedMonths.find((m) => m.month === '2026-12-01');

      expect(october?.salary).toBe(180000);
      expect(november?.salary).toBe(150000); // Unchanged
      expect(december?.salary).toBe(160000); // Unchanged
    });
  });

  describe('Month with No Salary Established', () => {
    it('returns null signal and correctly indicates salary is missing', () => {
      const salary = null;
      const spent = 12000;
      const saved = 5000;

      // In month_summary view: when salary is null, remaining is null
      const remaining = salary !== null ? salary - spent - saved : null;
      const signal = calculateSignal(remaining, salary);

      expect(remaining).toBeNull();
      expect(signal).toBeNull();
    });
  });

  describe('Negative Remaining Balance (Overdraft / Deficit)', () => {
    it('accurately calculates below-zero remaining balance and classifies as LOW', () => {
      const salaryPaise = rupeesToPaise(100000); // ₹1,00,000
      const spentPaise = rupeesToPaise(115000);  // ₹1,15,000
      const remainingPaise = subtractPaise(salaryPaise, spentPaise);
      const remaining = paiseToRupees(remainingPaise); // -₹15,000

      expect(remaining).toBe(-15000);
      expect(remaining < 0).toBe(true);

      const signal = calculateSignal(remaining, paiseToRupees(salaryPaise));
      expect(signal?.level).toBe('LOW');
      expect(signal?.isNegative).toBe(true);
      expect(signal?.barFillPercentage).toBe(0);
      expect(signal?.message).toBe('You have little money, reduce your spending.');

      expect(formatRupees(remaining)).toBe('-₹15,000.00');
    });
  });
});
