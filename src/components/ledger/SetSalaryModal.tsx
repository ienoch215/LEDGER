import React, { useState, useEffect } from 'react';
import { X, Info, RotateCcw } from 'lucide-react';
import { formatRupees, rupeesToPaise, paiseToRupees } from '@/lib/money';
import { formatMonthYear, formatShortMonthYear, getPrevMonthStart } from '@/lib/dates';
import { calculateSignal } from '@/lib/signal';
import { fetchMostRecentEarlierMonthSalary, saveMonthSalary } from '@/lib/ledgerApi';

interface SetSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMonth: string; // YYYY-MM-01
  currentSalary?: number | null;
  onSalarySaved: (savedSalary: number) => void;
  onBackToPrevious?: () => void;
  isEditMode?: boolean;
}

export const SetSalaryModal: React.FC<SetSalaryModalProps> = ({
  isOpen,
  onClose,
  targetMonth,
  currentSalary,
  onSalarySaved,
  onBackToPrevious,
  isEditMode = false,
}) => {
  const [salaryInput, setSalaryInput] = useState<string>('');
  const [prefilledFromMonth, setPrefilledFromMonth] = useState<string | null>(null);
  const [initialPrefillValue, setInitialPrefillValue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const prevMonth = getPrevMonthStart(targetMonth);

  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg(null);
    if (currentSalary && currentSalary > 0) {
      const valStr = currentSalary.toString();
      setSalaryInput(valStr);
      setInitialPrefillValue(valStr);
      setPrefilledFromMonth(null);
    } else {
      fetchMostRecentEarlierMonthSalary(targetMonth).then((earlier) => {
        if (earlier && earlier.salary > 0) {
          const valStr = earlier.salary.toString();
          setSalaryInput(valStr);
          setInitialPrefillValue(valStr);
          setPrefilledFromMonth(earlier.month);
        } else {
          setSalaryInput('');
          setInitialPrefillValue('');
          setPrefilledFromMonth(null);
        }
      });
    }
  }, [isOpen, targetMonth, currentSalary]);

  if (!isOpen) return null;

  const parsedPaise = rupeesToPaise(salaryInput);
  const parsedRupees = paiseToRupees(parsedPaise);
  const previewSignal = parsedRupees > 0 ? calculateSignal(parsedRupees, parsedRupees) : null;

  const handleReset = () => {
    setSalaryInput(initialPrefillValue);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (parsedPaise <= 0 || isNaN(parsedPaise)) {
      setErrorMsg('Please enter a valid salary amount greater than ₹0.00.');
      return;
    }

    setLoading(true);
    try {
      const saved = await saveMonthSalary(targetMonth, parsedRupees);
      onSalarySaved(Number(saved.salary));
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save salary.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#0e1014] border border-[#e2e4e8] dark:border-[#23262d] rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2e4e8] dark:border-[#23262d] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-[#475467] dark:text-[#8c92a0] uppercase font-bold">
            <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>
            <span>{isEditMode ? 'EDIT MONTHLY INFLOW' : 'MONTHLY INFLOW CONFIRMATION'}</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#667085] dark:text-[#737987] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-2">
              {isEditMode ? `Edit Salary for ${formatMonthYear(targetMonth)}` : `Set Salary for ${formatMonthYear(targetMonth)}`}
            </h2>
            <p className="text-xs text-[#667085] dark:text-[#8c92a0]">
              Each month operates as its own isolated accounting cycle.
            </p>
          </div>

          {/* Info callout */}
          <div className="p-3.5 bg-[#f2f4f7] dark:bg-[#14161b] border border-[#e4e7ec] dark:border-[#23262d] rounded-xl text-xs text-[#344054] dark:text-[#8c92a0] flex items-start gap-2.5 leading-relaxed font-medium">
            <Info className="w-4 h-4 text-black dark:text-[#cbd0d8] shrink-0 mt-0.5" />
            <div>
              Each month keeps its own salary and entries. Leftover amounts from {formatMonthYear(prevMonth)} do not carry over per ledger rules.
            </div>
          </div>

          {/* Salary Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[#475467] dark:text-[#8c92a0] font-bold">
                Monthly Net Received Salary (₹)
              </label>
              {prefilledFromMonth && (
                <span className="text-[10px] font-mono text-[#344054] dark:text-[#cbd0d8] bg-[#f2f4f7] dark:bg-[#1a1d24] px-2 py-0.5 rounded border border-[#e4e7ec] dark:border-[#2a2e39] font-bold">
                  PRE-POPULATED ({formatShortMonthYear(prefilledFromMonth).toUpperCase()} CYCLE)
                </span>
              )}
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-base font-mono text-[#667085] dark:text-[#8c92a0]">₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={salaryInput}
                onChange={(e) => {
                  setSalaryInput(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="1,50,000.00"
                autoFocus
                required
                className="w-full bg-[#f8f9fa] dark:bg-[#15171d] border border-[#d0d5dd] dark:border-[#272a33] focus:border-black dark:focus:border-white focus:outline-none rounded-lg pl-8 pr-20 py-2.5 text-base text-black dark:text-white placeholder-[#98a2b3] dark:placeholder-[#505664] font-mono transition-colors font-semibold"
              />
              {initialPrefillValue && salaryInput !== initialPrefillValue && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute right-3 text-xs font-mono text-[#475467] dark:text-[#8c92a0] hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer font-bold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET</span>
                </button>
              )}
            </div>
            
            {errorMsg ? (
              <p className="mt-2 text-xs font-mono text-[#dc2626] dark:text-[#f87171]">{errorMsg}</p>
            ) : (
              <p className="mt-2 text-xs text-[#667085] dark:text-[#737987]">
                Confirm or edit what you actually received for this month.
              </p>
            )}
          </div>

          {/* Live Preview Card */}
          <div className="p-4 bg-[#f8f9fa] dark:bg-[#14161b] border border-[#e2e4e8] dark:border-[#23262d] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-wider text-[#667085] dark:text-[#737987] uppercase font-bold">
                INITIAL REMAINING BALANCE
              </span>
              {previewSignal && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black text-white dark:bg-[#1f232b] dark:border dark:border-[#2d323e] dark:text-white text-[10px] font-mono font-medium shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  {previewSignal.label} (100% REMAINING)
                </span>
              )}
            </div>

            <div className="text-3xl font-bold font-mono text-black dark:text-white tracking-tight">
              {formatRupees(parsedRupees)}
            </div>

            <div className="pt-2 border-t border-[#e2e4e8] dark:border-[#23262d] flex items-center justify-between text-xs font-mono text-[#475467] dark:text-[#8c92a0]">
              <span>100% Capital Headroom</span>
              <span>Allocated: ₹0.00</span>
              <span className="text-black dark:text-white font-bold">Clean Slate Inflow: {formatRupees(parsedRupees)}</span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
            {onBackToPrevious ? (
              <button
                type="button"
                onClick={onBackToPrevious}
                className="w-full sm:w-auto px-4 py-2.5 border border-[#d0d5dd] dark:border-[#272a33] hover:border-black dark:hover:border-white rounded-lg text-xs font-mono text-[#475467] dark:text-[#8c92a0] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                Back to {formatShortMonthYear(prevMonth)}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 border border-[#d0d5dd] dark:border-[#272a33] hover:border-black dark:hover:border-white rounded-lg text-xs font-mono text-[#475467] dark:text-[#8c92a0] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={loading || parsedPaise <= 0}
              className="w-full sm:flex-1 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {loading ? (
                <span className="font-mono text-xs">Saving...</span>
              ) : (
                <>
                  <span>{isEditMode ? 'Save Salary Changes' : `Confirm & Open ${formatShortMonthYear(targetMonth)} Ledger`}</span>
                  <span className="font-mono">→</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
