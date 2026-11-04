/**
 * Money utilities for Ledger
 * All arithmetic is performed strictly using integer paise (1 Rupee = 100 paise)
 * to eliminate floating-point inaccuracies.
 */

export const PAISE_PER_RUPEE = 100;

/**
 * Convert rupee amount (number or string) to integer paise.
 * Rounds cleanly to avoid fractional paise.
 */
export function rupeesToPaise(rupees: number | string): number {
  if (typeof rupees === 'string') {
    const cleaned = rupees.replace(/,/g, '').trim();
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) return 0;
    return Math.round(parsed * PAISE_PER_RUPEE);
  }
  if (isNaN(rupees)) return 0;
  return Math.round(rupees * PAISE_PER_RUPEE);
}

/**
 * Convert integer paise to decimal rupees.
 */
export function paiseToRupees(paise: number): number {
  return paise / PAISE_PER_RUPEE;
}

/**
 * Format a number using the Indian digit grouping (e.g. 1,50,000.00)
 */
export function formatIndianNumber(val: number, decimals: number = 2): string {
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const fixed = absVal.toFixed(decimals);
  const [integerPart, decimalPart] = fixed.split('.');

  // Indian format: last 3 digits, then groups of 2
  let result = '';
  if (integerPart.length <= 3) {
    result = integerPart;
  } else {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${formattedOthers},${lastThree}`;
  }

  if (decimals > 0 && decimalPart !== undefined) {
    result = `${result}.${decimalPart}`;
  }

  return isNegative ? `-${result}` : result;
}

/**
 * Formats a rupee value into Indian Rupee display string with symbol.
 * Options:
 * - showSign: if true, prepends '+' for positive numbers (e.g. +₹1,50,000.00)
 * - hideSymbol: if true, returns without ₹ prefix
 */
export function formatRupees(
  amount: number | string | null | undefined,
  options?: { showSign?: boolean; hideSymbol?: boolean }
): string {
  if (amount === null || amount === undefined) {
    return '₹0.00';
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0.00';

  const isNegative = num < 0;
  const absFormatted = formatIndianNumber(Math.abs(num), 2);
  const symbol = options?.hideSymbol ? '' : '₹';

  if (isNegative) {
    return `-${symbol}${absFormatted}`;
  }
  if (options?.showSign && num > 0) {
    return `+${symbol}${absFormatted}`;
  }
  return `${symbol}${absFormatted}`;
}

/**
 * Formats integer paise into Indian Rupee display string.
 */
export function formatPaise(
  paise: number,
  options?: { showSign?: boolean; hideSymbol?: boolean }
): string {
  return formatRupees(paiseToRupees(paise), options);
}

/**
 * Safe paise arithmetic
 */
export function addPaise(...amounts: number[]): number {
  return amounts.reduce((acc, curr) => acc + (Math.round(curr) || 0), 0);
}

export function subtractPaise(initial: number, ...deductions: number[]): number {
  return deductions.reduce((acc, curr) => acc - (Math.round(curr) || 0), Math.round(initial) || 0);
}
