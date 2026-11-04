import React from 'react';
import { MonthRow } from '@/types/database';
import { formatMonthYear } from '@/lib/dates';
import { formatRupees } from '@/lib/money';
import { ArrowLeft, ArrowUpRight, Calendar } from 'lucide-react';

interface AllMonthsViewProps {
  months: MonthRow[];
  activeMonth: string;
  onSelectMonth: (month: string) => void;
  onBackToLedger: () => void;
}

export const AllMonthsView: React.FC<AllMonthsViewProps> = ({
  months,
  activeMonth,
  onSelectMonth,
  onBackToLedger,
}) => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between border-b border-[#e2e4e8] dark:border-[#23262d] pb-4">
        <div>
          <button
            onClick={onBackToLedger}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#475467] dark:text-[#8c92a0] hover:text-black dark:hover:text-white mb-2 transition-colors cursor-pointer font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Monthly Ledger</span>
          </button>
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            All Months
          </h2>
          <p className="text-xs text-[#667085] dark:text-[#8c92a0] mt-1 font-medium">
            Recorded accounting cycles. Select any month to view or edit its transactions.
          </p>
        </div>
      </div>

      {months.length === 0 ? (
        <div className="bg-white dark:bg-[#111318] border border-[#e2e4e8] dark:border-[#23262d] rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <Calendar className="w-8 h-8 text-[#98a2b3] dark:text-[#5f6575] mx-auto" />
          <h3 className="text-base font-bold text-black dark:text-white">No months recorded yet</h3>
          <p className="text-xs text-[#667085] dark:text-[#8c92a0]">
            Set your monthly salary on the main ledger to establish your first accounting cycle.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#edf0f4] dark:divide-[#23262d] bg-white dark:bg-[#111318] border border-[#e2e4e8] dark:border-[#23262d] rounded-2xl overflow-hidden shadow-sm">
          {months.map((m) => {
            const isSelected = m.month === activeMonth;
            return (
              <div
                key={m.id}
                onClick={() => onSelectMonth(m.month)}
                className={`p-4 sm:p-5 flex items-center justify-between transition-colors cursor-pointer hover:bg-[#f8f9fa] dark:hover:bg-[#161820] ${
                  isSelected ? 'bg-[#f2f4f7] dark:bg-[#151821]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-black dark:bg-white' : 'bg-[#cbd5e1] dark:bg-[#3b404d]'}`} />
                  <div>
                    <div className="text-base font-bold text-black dark:text-white">
                      {formatMonthYear(m.month)}
                    </div>
                    <div className="text-xs font-mono text-[#667085] dark:text-[#737987] font-medium">
                      {isSelected ? 'Currently Viewing' : 'Archived Cycle'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs font-mono text-[#667085] dark:text-[#737987] uppercase font-semibold">Salary Base</div>
                    <div className="text-base font-mono font-bold text-black dark:text-white">
                      {formatRupees(m.salary)}
                    </div>
                  </div>

                  <div className="text-[#667085] dark:text-[#8c92a0] hover:text-black dark:hover:text-white">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
