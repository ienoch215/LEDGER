import React, { useState } from 'react';
import {
  Calendar,
  Grid,
  CreditCard,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { formatMonthBadge, formatMonthYear } from '@/lib/dates';
import { MonthRow } from '@/types/database';

interface SidebarProps {
  currentMonth: string;
  allMonths: MonthRow[];
  onSelectMonth: (month: string) => void;
  activeNav: 'ledger' | 'all-months';
  onNavChange: (nav: 'ledger' | 'all-months') => void;
  onOpenSalarySetup: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMonth,
  allMonths,
  onSelectMonth,
  activeNav,
  onNavChange,
  onOpenSalarySetup,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Collect unique months for dropdown
  const monthOptions = Array.from(
    new Set([currentMonth, ...allMonths.map((m) => m.month)])
  ).sort((a, b) => b.localeCompare(a));

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-white dark:bg-[#0e1014]">
      <div className="p-5 space-y-6">
        {/* Brand & User Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base tracking-wider text-black dark:text-white uppercase font-black">
                LEDGER
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] bg-[#f2f4f7] dark:bg-[#1a1d24] border border-[#e4e7ec] dark:border-[#2a2e39] text-[#344054] dark:text-[#cbd0d8] px-2 py-0.5 rounded font-semibold">
                {formatMonthBadge(currentMonth)}
              </span>
              {onMobileClose && (
                <button
                  onClick={onMobileClose}
                  className="md:hidden text-[#667085] dark:text-[#737987] hover:text-black dark:hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#667085] dark:text-[#8c92a0] truncate mt-1">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{user?.email || 'user@domain.com'}</span>
          </div>
        </div>

        {/* Month Selector Dropdown */}
        <div>
          <div className="font-mono text-[11px] font-bold tracking-wider text-[#475467] dark:text-[#737987] uppercase mb-2">
            LEDGER TIMEFRAME
          </div>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full bg-[#f8f9fa] dark:bg-[#15171d] border border-[#d0d5dd] dark:border-[#272a33] hover:border-black dark:hover:border-white rounded-lg px-3 py-2 text-xs font-mono text-black dark:text-white flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white"></span>
                <span className="truncate font-semibold">{formatMonthYear(currentMonth)}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#667085] dark:text-[#737987]" />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#15171d] border border-[#d0d5dd] dark:border-[#272a33] rounded-lg shadow-xl z-30 py-1 max-h-56 overflow-y-auto">
                {monthOptions.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      onSelectMonth(m);
                      setDropdownOpen(false);
                      onNavChange('ledger');
                      if (onMobileClose) onMobileClose();
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center gap-2 hover:bg-[#f2f4f7] dark:hover:bg-[#1f222a] transition-colors cursor-pointer ${
                      m === currentMonth
                        ? 'text-black dark:text-white font-bold bg-[#f2f4f7] dark:bg-[#1a1d24]'
                        : 'text-[#475467] dark:text-[#8c92a0]'
                    }`}
                  >
                    <span className={`w-1 h-1 rounded-full ${m === currentMonth ? 'bg-black dark:bg-white' : 'bg-transparent'}`}></span>
                    <span>{formatMonthYear(m)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <button
            onClick={() => {
              onNavChange('ledger');
              if (onMobileClose) onMobileClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              activeNav === 'ledger'
                ? 'bg-black text-white dark:bg-[#181a20] dark:text-white dark:border dark:border-[#2c303c] font-semibold shadow-sm'
                : 'text-[#475467] dark:text-[#8c92a0] hover:text-black dark:hover:text-white hover:bg-[#f2f4f7] dark:hover:bg-[#14161b]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Monthly Ledger</span>
          </button>

          <button
            onClick={() => {
              onNavChange('all-months');
              if (onMobileClose) onMobileClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              activeNav === 'all-months'
                ? 'bg-black text-white dark:bg-[#181a20] dark:text-white dark:border dark:border-[#2c303c] font-semibold shadow-sm'
                : 'text-[#475467] dark:text-[#8c92a0] hover:text-black dark:hover:text-white hover:bg-[#f2f4f7] dark:hover:bg-[#14161b]'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>All Months</span>
          </button>

          <button
            onClick={() => {
              onOpenSalarySetup();
              if (onMobileClose) onMobileClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono text-[#475467] dark:text-[#8c92a0] hover:text-black dark:hover:text-white hover:bg-[#f2f4f7] dark:hover:bg-[#14161b] transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Salary Setup</span>
          </button>
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-5 border-t border-[#e2e4e8] dark:border-[#23262d] space-y-3">
        {/* Theme toggle indicator */}
        <div className="flex items-center justify-between text-xs font-mono text-[#475467] dark:text-[#8c92a0]">
          <div className="flex items-center gap-2 font-medium">
            {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-black" />}
            <span className="text-black dark:text-[#cbd0d8]">Theme: {isDark ? 'Monolith Dark' : 'Monolith Light'}</span>
          </div>
          <button
            onClick={toggleTheme}
            className="text-[10px] uppercase font-mono px-2 py-0.5 border border-[#d0d5dd] dark:border-[#272a33] hover:border-black dark:hover:border-white text-black dark:text-white rounded cursor-pointer transition-colors font-bold"
          >
            TOGGLE
          </button>
        </div>

        {/* Sign Out */}
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-[#475467] dark:text-[#8c92a0] hover:text-black dark:hover:text-white hover:bg-[#f2f4f7] dark:hover:bg-[#14161b] transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-[#0e1014] border-r border-[#e2e4e8] dark:border-[#23262d] flex-col justify-between h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="relative w-64 bg-white dark:bg-[#0e1014] border-r border-[#e2e4e8] dark:border-[#23262d] h-full z-10 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
