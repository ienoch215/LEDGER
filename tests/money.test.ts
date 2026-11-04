import { describe, it, expect } from 'vitest';
import {
  rupeesToPaise,
  paiseToRupees,
  formatIndianNumber,
  formatRupees,
  formatPaise,
  addPaise,
  subtractPaise,
} from '../src/lib/money';

describe('Money Utilities & Integer Paise Arithmetic', () => {
  it('converts decimal rupees and string amounts to integer paise accurately', () => {
    expect(rupeesToPaise(150000)).toBe(15000000);
    expect(rupeesToPaise('1,50,000.50')).toBe(15000050);
    expect(rupeesToPaise(0.1 + 0.2)).toBe(30); // 0.30 rupees = 30 paise (no floating drift)
    expect(rupeesToPaise('0.05')).toBe(5);
  });

  it('converts integer paise back to decimal rupees accurately', () => {
    expect(paiseToRupees(15000000)).toBe(150000);
    expect(paiseToRupees(15000050)).toBe(150000.5);
    expect(paiseToRupees(5)).toBe(0.05);
  });

  it('formats numbers using Indian digit grouping (e.g. 1,50,000.00)', () => {
    expect(formatIndianNumber(150000)).toBe('1,50,000.00');
    expect(formatIndianNumber(48250)).toBe('48,250.00');
    expect(formatIndianNumber(8450)).toBe('8,450.00');
    expect(formatIndianNumber(500)).toBe('500.00');
    expect(formatIndianNumber(12345678.9)).toBe('1,23,45,678.90');
    expect(formatIndianNumber(-4850)).toBe('-4,850.00');
  });

  it('formats currency with Rupee symbol and signs', () => {
    expect(formatRupees(150000)).toBe('₹1,50,000.00');
    expect(formatRupees(150000, { showSign: true })).toBe('+₹1,50,000.00');
    expect(formatRupees(-4850)).toBe('-₹4,850.00');
    expect(formatRupees(0)).toBe('₹0.00');
    expect(formatRupees(null)).toBe('₹0.00');
    expect(formatRupees(undefined)).toBe('₹0.00');
  });

  it('formats paise directly', () => {
    expect(formatPaise(15000000)).toBe('₹1,50,000.00');
    expect(formatPaise(4825000)).toBe('₹48,250.00');
    expect(formatPaise(-485000)).toBe('-₹4,850.00');
  });

  it('performs safe paise arithmetic without floating-point error', () => {
    const p1 = rupeesToPaise(0.1);
    const p2 = rupeesToPaise(0.2);
    const sum = addPaise(p1, p2);
    expect(sum).toBe(30);
    expect(paiseToRupees(sum)).toBe(0.3);

    const salaryPaise = rupeesToPaise(150000);
    const spentPaise = rupeesToPaise(48250);
    const savedPaise = rupeesToPaise(35000);
    const remainingPaise = subtractPaise(salaryPaise, spentPaise, savedPaise);

    expect(remainingPaise).toBe(6675000);
    expect(paiseToRupees(remainingPaise)).toBe(66750);
  });
});
