import React from 'react';
import { MonthSummaryRow } from '@/types/database';
import { formatRupees } from '@/lib/money';
import { calculateSignal } from '@/lib/signal';
import { AllocationBar } from './AllocationBar';
import { Plus } from 'lucide-react';

interface LiveSpendableBalanceCardProps {
  summary: MonthSummaryRow | null;
  loading: boolean;
  onSetSalaryClick: () => void;
}

export const LiveSpendableBalanceCard: React.FC<LiveSpendableBalanceCardProps> = ({
  summary,
  loading,
  onSetSalaryClick,
}) => {
  if (loading || !summary) {
    return (
      <div className="bg-white dark:bg-[#111318] border border-[#e2e4e8] dark:border-[#23262d] rounded-xl p-6 sm:p-8 space-y-6 animate-pulse shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-3">
            <div className="w-36 h-4 bg-[#f2f4f7] dark:bg-[#1a1d24] rounded"></div>
            <div className="w-64 h-12 bg-[#f2f4f7] dark:bg-[#1a1d24] rounded"></div>
            <div className="w-48 h-4 bg-[#f2f4f7] dark:bg-[#1a1d24] rounded"></div>
          </div>
          <div className="flex gap-6">
            <div className="w-24 h-12 bg-[#f2f4f7] dark:bg-[#1a1d24] rounded"></div>
            <div className="w-24 h-12 bg-[#f2f4f7] dark:bg-[#1a1d24] rounded"></div>
            <div className="w-24 h-12 bg-[#f2f4f7] dark:bg-[#1a1d24] rounded"></div>
          </div>
        </div>
        <div className="w-full h-8 bg-[#f2f4f7] dark:bg-[#1a1d24] rounded"></div>
      </div>
    );
  }

  const hasSalary = summary.salary !== null && summary.salary > 0;
  const remaining = summary.remaining ?? 0;
  const salary = summary.salary ?? 0;
  const spent = summary.total_spent ?? 0;
  const saved = summary.total_saved ?? 0;

  if (!hasSalary) {
    return (
      <div className="bg-white dark:bg-[#111318] border border-[#e2e4e8] dark:border-[#23262d] rounded-xl p-8 text-center space-y-4 shadow-sm">
        <div className="font-mono text-xs text-[#667085] dark:text-[#8c92a0] uppercase tracking-wider font-semibold">
          LIVE SPENDABLE BALANCE
        </div>
        <div className="text-3xl font-bold text-black dark:text-white">
          No Salary Established
        </div>
        <p className="text-sm text-[#475467] dark:text-[#8c92a0] max-w-md mx-auto">
          Establish this month's net received salary to calculate your live remaining spendable balance and signal.
        </p>
        <button
          onClick={onSetSalaryClick}
          className="inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black font-medium px-5 py-2.5 rounded-lg text-sm hover:opacity-90 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Set Salary</span>
        </button>
      </div>
    );
  }

  const signal = calculateSignal(remaining, salary);

  return (
    <div className="bg-white dark:bg-[#111318] border border-[#e2e4e8] dark:border-[#23262d] rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Top Section: Balance & Summary Stats */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-xs tracking-wider text-[#475467] dark:text-[#8c92a0] uppercase font-bold">
              LIVE SPENDABLE BALANCE
            </span>
            {signal && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black text-white dark:bg-[#181b22] dark:border dark:border-[#2d323e] dark:text-white text-xs font-mono font-medium shadow-sm">
                <span className={`w-1.5 h-1.5 ${signal.level === 'COMFORTABLE' ? 'rounded-full bg-white' : signal.level === 'CAREFUL' ? 'border border-white' : 'rotate-45 border border-white'}`}></span>
                <span>{signal.label}</span>
              </span>
            )}
          </div>

          <div className={`text-4xl sm:text-5xl font-black font-mono tracking-tight mb-2 ${remaining < 0 ? 'text-[#dc2626] dark:text-[#f87171]' : 'text-black dark:text-white'}`}>
            {formatRupees(remaining)}
          </div>

          {signal && (
            <p className="text-sm text-[#475467] dark:text-[#8c92a0] font-medium">
              {signal.message}
            </p>
          )}
        </div>

        {/* Top Right Mini Stats */}
        <div className="flex items-center gap-6 sm:gap-8 pt-2 border-t lg:border-t-0 border-[#e2e4e8] dark:border-[#23262d]">
          <div>
            <div className="text-[11px] font-mono tracking-wider text-[#667085] dark:text-[#737987] uppercase mb-1 font-semibold">
              MONTHLY SALARY
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-black dark:text-white">
              {formatRupees(salary)}
            </div>
          </div>

          <div className="w-[1px] h-8 bg-[#e2e4e8] dark:bg-[#23262d]"></div>

          <div>
            <div className="text-[11px] font-mono tracking-wider text-[#667085] dark:text-[#737987] uppercase mb-1 font-semibold">
              TOTAL SPENT
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-black dark:text-white">
              {formatRupees(spent)}
            </div>
          </div>

          <div className="w-[1px] h-8 bg-[#e2e4e8] dark:bg-[#23262d]"></div>

          <div>
            <div className="text-[11px] font-mono tracking-wider text-[#667085] dark:text-[#737987] uppercase mb-1 font-semibold">
              TOTAL SAVED
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-black dark:text-white">
              {formatRupees(saved)}
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Bar with Threshold Ticks */}
      {signal && (
        <AllocationBar
          remaining={remaining}
          salary={salary}
          signal={signal}
        />
      )}
    </div>
  );
};
