import React from 'react';
import { Pencil } from 'lucide-react';
import { MonthSummaryRow } from '@/types/database';
import { formatRupees } from '@/lib/money';
import { formatShortMonthYear } from '@/lib/dates';

interface SummaryCardsProps {
  summary: MonthSummaryRow;
  monthStr: string;
  onEditSalary: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  monthStr,
  onEditSalary,
}) => {
  const salary = summary.salary || 0;
  const spent = summary.total_spent || 0;
  const saved = summary.total_saved || 0;

  const spentPct = salary > 0 ? ((spent / salary) * 100).toFixed(1) : '0.0';
  const savedPct = salary > 0 ? ((saved / salary) * 100).toFixed(1) : '0.0';

  // Construct savings breakdown string
  const savingsBreakdownParts: string[] = [];
  if (summary.saved_stocks > 0) {
    savingsBreakdownParts.push(`Stocks (${formatRupees(summary.saved_stocks)})`);
  }
  if (summary.saved_gold > 0) {
    savingsBreakdownParts.push(`Gold (${formatRupees(summary.saved_gold)})`);
  }
  if (summary.saved_bonds > 0) {
    savingsBreakdownParts.push(`Bonds (${formatRupees(summary.saved_bonds)})`);
  }
  if (summary.saved_crypto > 0) {
    savingsBreakdownParts.push(`Crypto (${formatRupees(summary.saved_crypto)})`);
  }

  const savingsBreakdownText = savingsBreakdownParts.length > 0
    ? `${savingsBreakdownParts.join(' • ')} • ${savedPct}% of Inflow`
    : `No savings logged • ${savedPct}% of Inflow`;

  const shortMonth = formatShortMonthYear(monthStr);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Salary Base Card */}
      <div className="bg-white dark:bg-[#111318] border border-[#e2e4e8] dark:border-[#23262d] rounded-xl p-5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs tracking-wider text-[#475467] dark:text-[#8c92a0] uppercase font-bold">
            SALARY BASE (INFLOW)
          </span>
          <button
            onClick={onEditSalary}
            className="flex items-center gap-1 text-xs font-mono text-[#475467] dark:text-[#8c92a0] hover:text-black dark:hover:text-white transition-colors cursor-pointer font-medium"
          >
            <span>Edit Salary</span>
            <Pencil className="w-3 h-3" />
          </button>
        </div>

        <div className="text-2xl sm:text-3xl font-bold font-mono text-black dark:text-white tracking-tight mb-4">
          {salary > 0 ? formatRupees(salary) : 'Not Set'}
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-[#667085] dark:text-[#737987] border-t border-[#edf0f4] dark:border-[#1e2129] pt-3">
          <span>Direct Deposit • Credited {shortMonth.split(' ')[0]} 01</span>
          <span className="text-black dark:text-white font-bold">100.0%</span>
        </div>
      </div>

      {/* 2. Spending Logged Card */}
      <div className="bg-white dark:bg-[#111318] border border-[#e2e4e8] dark:border-[#23262d] rounded-xl p-5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs tracking-wider text-[#475467] dark:text-[#8c92a0] uppercase font-bold">
            SPENDING LOGGED
          </span>
          <span className="px-2 py-0.5 rounded bg-[#f2f4f7] dark:bg-[#1a1d24] border border-[#e4e7ec] dark:border-[#2a2e39] text-[10px] font-mono text-[#344054] dark:text-[#cbd0d8] font-semibold">
            {summary.spending_entries_count} TRANSACTIONS
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-bold font-mono text-black dark:text-white tracking-tight mb-4">
          {formatRupees(spent)}
        </div>

        <div className="text-xs font-mono text-[#667085] dark:text-[#737987] border-t border-[#edf0f4] dark:border-[#1e2129] pt-3 truncate font-medium" title={`Essential & Discretionary Burn • ${spentPct}% of Inflow`}>
          Essential & Discretionary Burn • {spentPct}% of Inflow
        </div>
      </div>

      {/* 3. Savings Allocated Card */}
      <div className="bg-white dark:bg-[#111318] border border-[#e2e4e8] dark:border-[#23262d] rounded-xl p-5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs tracking-wider text-[#475467] dark:text-[#8c92a0] uppercase font-bold">
            SAVINGS ALLOCATED
          </span>
          <span className="px-2 py-0.5 rounded bg-[#f2f4f7] dark:bg-[#1a1d24] border border-[#e4e7ec] dark:border-[#2a2e39] text-[10px] font-mono text-[#344054] dark:text-[#cbd0d8] font-semibold">
            {summary.saving_entries_count} ASSETS
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-bold font-mono text-black dark:text-white tracking-tight mb-4">
          {formatRupees(saved)}
        </div>

        <div className="text-xs font-mono text-[#667085] dark:text-[#737987] border-t border-[#edf0f4] dark:border-[#1e2129] pt-3 truncate font-medium" title={savingsBreakdownText}>
          {savingsBreakdownText}
        </div>
      </div>
    </div>
  );
};
