import React from 'react';
import { Plus, FastForward, Menu } from 'lucide-react';
import {
  formatMonthYear,
  formatShortMonthYear,
  isCurrentMonth,
  getAsOfTodayString,
  getNextMonthStart,
} from '@/lib/dates';

interface MainHeaderProps {
  currentMonth: string;
  nextMonthHasRecord: boolean;
  onStartNextMonth: (nextMonthStr: string) => void;
  onRecordEntryClick: () => void;
  onOpenMobileMenu?: () => void;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  currentMonth,
  nextMonthHasRecord,
  onStartNextMonth,
  onRecordEntryClick,
  onOpenMobileMenu,
}) => {
  const isMonthInProgress = isCurrentMonth(currentMonth);
  const nextMonthStr = getNextMonthStart(currentMonth);
  const nextMonthShort = formatShortMonthYear(nextMonthStr);

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#e2e4e8] dark:border-[#23262d] gap-4">
      <div>
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-1.5 border border-[#d0d5dd] dark:border-[#272a33] rounded hover:border-black dark:hover:border-white text-[#475467] dark:text-[#8c92a0] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white">
            {formatMonthYear(currentMonth)}
          </h1>
          {isMonthInProgress && (
            <span className="px-2 py-0.5 rounded bg-[#f2f4f7] dark:bg-[#1a1d24] border border-[#e4e7ec] dark:border-[#2a2e39] text-[10px] font-mono tracking-wider font-semibold text-[#344054] dark:text-white uppercase">
              IN PROGRESS
            </span>
          )}
        </div>
        <p className="text-xs font-mono text-[#667085] dark:text-[#737987] mt-1 font-medium">
          {getAsOfTodayString()}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Start Next Month Button (shows only if next month has no record) */}
        {!nextMonthHasRecord && (
          <button
            onClick={() => onStartNextMonth(nextMonthStr)}
            className="flex items-center gap-2 px-3.5 py-2 border border-[#d0d5dd] dark:border-[#272a33] hover:border-black dark:hover:border-white rounded-lg text-xs font-mono text-black dark:text-[#cbd0d8] hover:text-black dark:hover:text-white bg-white dark:bg-transparent transition-colors cursor-pointer shadow-sm"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Start Next Month ({nextMonthShort})</span>
          </button>
        )}

        {/* Record Entry Primary Button */}
        <button
          onClick={onRecordEntryClick}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Record Entry</span>
        </button>
      </div>
    </header>
  );
};
