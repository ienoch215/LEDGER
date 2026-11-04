import { describe, it, expect } from 'vitest';
import { calculateSignal, SIGNAL_CONFIG, SIGNAL_THRESHOLDS } from '../src/lib/signal';

describe('Signal Logic (Single Source of Truth)', () => {
  const SALARY = 100000; // ₹1,00,000

  it('correctly classifies COMFORTABLE when remaining is >= 50% of salary', () => {
    // Exactly 50%
    const sig50 = calculateSignal(50000, SALARY);
    expect(sig50?.level).toBe('COMFORTABLE');
    expect(sig50?.message).toBe(SIGNAL_CONFIG.COMFORTABLE.message);
    expect(sig50?.percentage).toBe(50);
    expect(sig50?.barFillPercentage).toBe(50);

    // 75%
    const sig75 = calculateSignal(75000, SALARY);
    expect(sig75?.level).toBe('COMFORTABLE');
    expect(sig75?.percentage).toBe(75);

    // 100%
    const sig100 = calculateSignal(100000, SALARY);
    expect(sig100?.level).toBe('COMFORTABLE');
    expect(sig100?.barFillPercentage).toBe(100);

    // > 100% (e.g. edge cases, bar fill capped at 100)
    const sig120 = calculateSignal(120000, SALARY);
    expect(sig120?.level).toBe('COMFORTABLE');
    expect(sig120?.barFillPercentage).toBe(100);
  });

  it('correctly classifies CAREFUL when remaining is between 20% and under 50%', () => {
    // Exactly 20%
    const sig20 = calculateSignal(20000, SALARY);
    expect(sig20?.level).toBe('CAREFUL');
    expect(sig20?.message).toBe(SIGNAL_CONFIG.CAREFUL.message);
    expect(sig20?.percentage).toBe(20);

    // 35%
    const sig35 = calculateSignal(35000, SALARY);
    expect(sig35?.level).toBe('CAREFUL');
    expect(sig35?.percentage).toBe(35);

    // 49.9%
    const sig499 = calculateSignal(49900, SALARY);
    expect(sig499?.level).toBe('CAREFUL');
  });

  it('correctly classifies LOW when remaining is under 20%, zero, or negative', () => {
    // 19.9%
    const sig199 = calculateSignal(19900, SALARY);
    expect(sig199?.level).toBe('LOW');
    expect(sig199?.message).toBe(SIGNAL_CONFIG.LOW.message);

    // Exactly 0
    const sigZero = calculateSignal(0, SALARY);
    expect(sigZero?.level).toBe('LOW');
    expect(sigZero?.percentage).toBe(0);
    expect(sigZero?.barFillPercentage).toBe(0);
    expect(sigZero?.isNegative).toBe(false);

    // Negative remaining (deficit/overdraft)
    const sigNegative = calculateSignal(-15000, SALARY);
    expect(sigNegative?.level).toBe('LOW');
    expect(sigNegative?.isNegative).toBe(true);
    expect(sigNegative?.barFillPercentage).toBe(0);
    expect(sigNegative?.message).toBe(SIGNAL_CONFIG.LOW.message);
  });

  it('returns null if salary is null, zero, or negative', () => {
    expect(calculateSignal(50000, 0)).toBeNull();
    expect(calculateSignal(50000, -10000)).toBeNull();
    expect(calculateSignal(50000, null)).toBeNull();
    expect(calculateSignal(null, 50000)).toBeNull();
  });
});
