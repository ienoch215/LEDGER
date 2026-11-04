/**
 * Signal - Single source of truth for Ledger's three-state financial signal.
 * 
 * Rules:
 * ratio = remaining ÷ salary
 * - Comfortable: 50% or more (ratio >= 0.50)
 * - Careful: 20% to under 50% (0.20 <= ratio < 0.50)
 * - Low: under 20%, including zero and negative (ratio < 0.20)
 * 
 * All labels, thresholds, messages, and ticks read from these constants.
 */

export const SIGNAL_THRESHOLDS = {
  CAREFUL_PCT: 20, // 20%
  COMFORTABLE_PCT: 50, // 50%
} as const;

export type SignalLevel = 'COMFORTABLE' | 'CAREFUL' | 'LOW';

export interface SignalInfo {
  level: SignalLevel;
  label: string;
  message: string;
  ratio: number; // e.g. 0.445
  percentage: number; // e.g. 44.5
  formattedPercentage: string; // "44.5%"
  barFillPercentage: number; // clamped 0 to 100 for the visual bar
  isNegative: boolean;
}

export const SIGNAL_CONFIG: Record<
  SignalLevel,
  {
    label: string;
    message: string;
  }
> = {
  COMFORTABLE: {
    label: 'COMFORTABLE',
    message: 'You can spend well.',
  },
  CAREFUL: {
    label: 'CAREFUL',
    message: 'Use it carefully.',
  },
  LOW: {
    label: 'LOW',
    message: 'You have little money, reduce your spending.',
  },
};

/**
 * Calculates the signal level and descriptive info given remaining balance and monthly salary.
 * Can accept numbers in either rupees or paise, provided both are in the same unit.
 */
export function calculateSignal(
  remaining: number | null | undefined,
  salary: number | null | undefined
): SignalInfo | null {
  if (salary === null || salary === undefined || salary <= 0 || remaining === null || remaining === undefined) {
    return null;
  }

  const ratio = remaining / salary;
  const percentage = ratio * 100;
  const isNegative = remaining < 0;

  // Bar fill clamped between 0% and 100%
  const barFillPercentage = Math.min(100, Math.max(0, percentage));

  let level: SignalLevel;
  if (percentage >= SIGNAL_THRESHOLDS.COMFORTABLE_PCT) {
    level = 'COMFORTABLE';
  } else if (percentage >= SIGNAL_THRESHOLDS.CAREFUL_PCT) {
    level = 'CAREFUL';
  } else {
    level = 'LOW';
  }

  const config = SIGNAL_CONFIG[level];

  return {
    level,
    label: config.label,
    message: config.message,
    ratio,
    percentage,
    formattedPercentage: `${percentage.toFixed(1)}%`,
    barFillPercentage,
    isNegative,
  };
}
