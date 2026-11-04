import React from 'react';
import { ShieldCheck, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#f2f3f5] dark:bg-[#090a0c] text-[#0e1014] dark:text-[#e5e8ec] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative transition-colors duration-200">
      {/* Top right theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-2 rounded-lg border border-[#d0d4dc] dark:border-[#272a33] bg-white dark:bg-[#15171d] text-[#525866] dark:text-[#8c92a0] hover:text-black dark:hover:text-white transition-colors cursor-pointer shadow-sm"
        title={isDark ? 'Switch to Monolith Light' : 'Switch to Monolith Dark'}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl border border-[#e2e4e8] dark:border-[#23262d] bg-white dark:bg-[#0e1014] overflow-hidden shadow-xl dark:shadow-2xl">
        
        {/* Left Branding Column */}
        <div className="p-8 sm:p-12 border-b lg:border-b-0 lg:border-r border-[#e2e4e8] dark:border-[#23262d] flex flex-col justify-between bg-[#eaeaea] dark:bg-[#0e1014]/60">
          <div>
            <div className="mb-8">
              <span className="font-mono text-xs font-bold tracking-widest text-[#525866] dark:text-[#8c92a0] uppercase">
                LEDGER
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black dark:text-white mb-4">
              LEDGER
            </h1>

            <p className="text-sm sm:text-base text-[#525866] dark:text-[#8c92a0] leading-relaxed max-w-md">
              Replace the Excel pain point. Exact manual discipline, live remaining spendable balance, zero automated clutter.
            </p>
          </div>

          <div className="mt-12 lg:mt-24">
            <div className="font-mono text-[11px] font-bold tracking-wider text-[#717784] dark:text-[#737987] uppercase mb-2">
              CORE PRINCIPLES
            </div>
            <div className="text-xs text-[#525866] dark:text-[#8c92a0] font-mono flex flex-wrap gap-2 items-center">
              <span>Private to user</span>
              <span>•</span>
              <span>Three-state signal</span>
              <span>•</span>
              <span>One clean record per month</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="p-8 sm:p-12 flex flex-col justify-between bg-white dark:bg-[#111318]">
          <div className="my-auto">
            {children}
          </div>

          {/* Bottom Security Note */}
          <div className="mt-8 pt-6 border-t border-[#edf0f4] dark:border-[#23262d] flex items-start gap-3 text-xs text-[#717784] dark:text-[#737987]">
            <ShieldCheck className="w-4 h-4 text-[#525866] dark:text-[#8c92a0] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-black dark:text-[#cbd0d8] font-semibold">Strictly private data.</strong> No multi-currency or third-party bank syncing. Online manual ledger.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
