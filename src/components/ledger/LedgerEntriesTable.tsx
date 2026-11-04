import React, { useState, useMemo } from 'react';
import {
  Pencil,
  Trash2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { EntryWithCategory, MonthSummaryRow } from '@/types/database';
import { formatRupees } from '@/lib/money';
import { formatEntryDate, getAsOfTodayString } from '@/lib/dates';

interface LedgerEntriesTableProps {
  monthStr: string;
  entries: EntryWithCategory[];
  summary: MonthSummaryRow | null;
  loading: boolean;
  onEditEntry: (entry: EntryWithCategory) => void;
  onDeleteEntry: (entry: EntryWithCategory) => void;
  onEditSalary: () => void;
  onRecordEntryClick: () => void;
}

const PAGE_SIZE = 20;

export const LedgerEntriesTable: React.FC<LedgerEntriesTableProps> = ({
  monthStr,
  entries,
  summary,
  loading,
  onEditEntry,
  onDeleteEntry,
  onEditSalary,
  onRecordEntryClick,
}) => {
  const [filter, setFilter] = useState<'all' | 'spending' | 'saving'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const salary = summary?.salary || 0;
  const totalSpent = summary?.total_spent || 0;
  const totalSaved = summary?.total_saved || 0;
  const netOutflow = totalSpent + totalSaved;

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return entries;
    return entries.filter((e) => e.kind === filter);
  }, [entries, filter]);

  const showSalaryRow = filter === 'all' && salary > 0;
  const totalItemsCount = filteredEntries.length + (showSalaryRow ? 1 : 0);
  const totalPages = Math.max(1, Math.ceil(totalItemsCount / PAGE_SIZE));

  const paginatedEntries = useMemo(() => {
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const endIdx = startIdx + PAGE_SIZE;
    return filteredEntries.slice(startIdx, endIdx);
  }, [filteredEntries, currentPage]);

  const isLastPage = currentPage === totalPages;
  const shouldRenderSalaryRowOnCurrentPage = showSalaryRow && isLastPage;

  const handleFilterChange = (newFilter: 'all' | 'spending' | 'saving') => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white dark:bg-[#111318] border border-[#e2e4e8] dark:border-[#23262d] rounded-xl overflow-hidden shadow-sm">
      {/* Table Header Section */}
      <div className="p-5 sm:p-6 border-b border-[#e2e4e8] dark:border-[#23262d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">
            Ledger Entries
          </h2>
          <p className="text-xs font-mono text-[#667085] dark:text-[#737987] mt-0.5 font-medium">
            Chronological activity for current billing cycle (Newest first)
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#f2f4f7] dark:bg-[#15171d] border border-[#e4e7ec] dark:border-[#272a33] p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                : 'text-[#475467] hover:text-black dark:text-[#8c92a0] dark:hover:text-white'
            }`}
          >
            ALL ({entries.length + (salary > 0 ? 1 : 0)})
          </button>
          <button
            onClick={() => handleFilterChange('spending')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
              filter === 'spending'
                ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                : 'text-[#475467] hover:text-black dark:text-[#8c92a0] dark:hover:text-white'
            }`}
          >
            SPENDING ({summary?.spending_entries_count || 0})
          </button>
          <button
            onClick={() => handleFilterChange('saving')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
              filter === 'saving'
                ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                : 'text-[#475467] hover:text-black dark:text-[#8c92a0] dark:hover:text-white'
            }`}
          >
            SAVING ({summary?.saving_entries_count || 0})
          </button>
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e2e4e8] dark:border-[#23262d] text-[11px] font-mono tracking-wider text-[#475467] dark:text-[#737987] uppercase bg-[#f8f9fa] dark:bg-[#0e1014]/60 font-bold">
              <th className="py-3 px-5">DATE</th>
              <th className="py-3 px-5">DESCRIPTION / CATEGORY</th>
              <th className="py-3 px-5">KIND</th>
              <th className="py-3 px-5 text-right">AMOUNT (₹)</th>
              <th className="py-3 px-5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf0f4] dark:divide-[#1e2129] font-mono text-xs">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-5"><div className="h-4 w-20 bg-[#f2f4f7] dark:bg-[#181a20] rounded"></div></td>
                  <td className="py-4 px-5"><div className="h-4 w-48 bg-[#f2f4f7] dark:bg-[#181a20] rounded"></div></td>
                  <td className="py-4 px-5"><div className="h-4 w-20 bg-[#f2f4f7] dark:bg-[#181a20] rounded"></div></td>
                  <td className="py-4 px-5 text-right"><div className="h-4 w-24 bg-[#f2f4f7] dark:bg-[#181a20] rounded ml-auto"></div></td>
                  <td className="py-4 px-5 text-right"><div className="h-4 w-12 bg-[#f2f4f7] dark:bg-[#181a20] rounded ml-auto"></div></td>
                </tr>
              ))
            ) : totalItemsCount === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#667085] dark:text-[#8c92a0]">
                  <p className="text-sm text-black dark:text-white mb-2 font-sans font-medium">No activity logged for this view</p>
                  <p className="text-xs mb-4">Record your spending or savings to see your live ledger activity.</p>
                  <button
                    onClick={onRecordEntryClick}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#d0d5dd] dark:border-[#272a33] hover:border-black dark:hover:border-white rounded text-xs text-black dark:text-white transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record Entry</span>
                  </button>
                </td>
              </tr>
            ) : (
              <>
                {/* Transaction Rows */}
                {paginatedEntries.map((entry) => {
                  const isSpending = entry.kind === 'spending';
                  const title = entry.memo || (isSpending ? entry.category?.name : entry.saving_type?.toUpperCase());
                  const subtext = isSpending
                    ? `${entry.category?.name || 'Uncategorized'}`
                    : `${entry.saving_type ? entry.saving_type.charAt(0).toUpperCase() + entry.saving_type.slice(1) : 'Asset'} • Reserved Savings`;

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-[#f8f9fa] dark:hover:bg-[#15171e] transition-colors group"
                    >
                      <td className="py-4 px-5 text-[#344054] dark:text-[#cbd0d8] whitespace-nowrap font-medium">
                        {formatEntryDate(entry.entry_date)}
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-semibold text-black dark:text-white truncate max-w-xs sm:max-w-md font-sans">
                          {title}
                        </div>
                        <div className="text-[11px] text-[#667085] dark:text-[#737987] truncate max-w-xs sm:max-w-md font-medium">
                          {subtext}
                        </div>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#f2f4f7] dark:bg-[#1a1d24] border border-[#e4e7ec] dark:border-[#2a2e39] text-[10px] uppercase text-[#344054] dark:text-[#cbd0d8] font-bold">
                          {entry.kind}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right font-bold text-black dark:text-white whitespace-nowrap">
                        -{formatRupees(entry.amount)}
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 text-[#667085] dark:text-[#737987]">
                          <button
                            onClick={() => onEditEntry(entry)}
                            title="Edit entry"
                            className="p-1 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteEntry(entry)}
                            title="Delete entry"
                            className="p-1 hover:text-[#dc2626] dark:hover:text-[#f87171] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Protected Inflow Baseline Salary Row */}
                {shouldRenderSalaryRowOnCurrentPage && (
                  <tr className="hover:bg-[#f8f9fa] dark:hover:bg-[#15171e] transition-colors bg-[#f8f9fa]/80 dark:bg-[#14161d]/50">
                    <td className="py-4 px-5 text-[#344054] dark:text-[#cbd0d8] whitespace-nowrap font-medium">
                      {formatEntryDate(`${monthStr.substring(0, 7)}-01`)}
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-black dark:text-white font-sans">
                        Monthly Salary Inflow
                      </div>
                      <div className="text-[11px] text-[#667085] dark:text-[#737987] font-medium">
                        Inflow Baseline • Corporate Payroll
                      </div>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black text-[10px] uppercase font-bold">
                        INFLOW BASELINE
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right font-bold text-black dark:text-white whitespace-nowrap">
                      +{formatRupees(salary)}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 text-[#667085] dark:text-[#737987]">
                        <button
                          onClick={onEditSalary}
                          title="Edit salary base"
                          className="p-1 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <span
                          title="Protected Inflow Baseline (cannot be deleted)"
                          className="p-1 text-[#98a2b3] dark:text-[#555a68] cursor-not-allowed"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-4 sm:p-5 border-t border-[#e2e4e8] dark:border-[#23262d] flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-[#667085] dark:text-[#737987] gap-3">
        <div className="font-medium">
          Showing {Math.min(paginatedEntries.length + (shouldRenderSalaryRowOnCurrentPage ? 1 : 0), totalItemsCount)} of {totalItemsCount} Entries • Net Monthly Outflow: {formatRupees(netOutflow)}
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          <span>{getAsOfTodayString()}</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-[#d0d5dd] dark:border-[#272a33] rounded hover:border-black dark:hover:border-white disabled:opacity-30 disabled:cursor-not-allowed text-black dark:text-white transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-black dark:text-white font-semibold">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 border border-[#d0d5dd] dark:border-[#272a33] rounded hover:border-black dark:hover:border-white disabled:opacity-30 disabled:cursor-not-allowed text-black dark:text-white transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
