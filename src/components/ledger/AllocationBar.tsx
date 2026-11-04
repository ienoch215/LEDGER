import React from 'react';
import { SIGNAL_THRESHOLDS, SignalInfo } from '@/lib/signal';
import { formatRupees } from '@/lib/money';

interface AllocationBarProps {
  remaining: number;
  salary: number;
  signal: SignalInfo;
}

export const AllocationBar: React.FC<AllocationBarProps> = ({
  remaining,
  salary,
  signal,
}) => {
  const carefulPct = SIGNAL_THRESHOLDS.CAREFUL_PCT;
  const comfortablePct = SIGNAL_THRESHOLDS.COMFORTABLE_PCT;

  return (
    <div className="w-full space-y-2.5 pt-4">
      {/* Top Header Labels */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-[#525866] dark:text-[#8c92a0] gap-1">
        <div className="flex items-center gap-2">
          <span className="text-black dark:text-white font-semibold">{signal.formattedPercentage} ALLOCATION REMAINING</span>
          <span className="text-[#656d7d] dark:text-[#5f6575]">
            {formatRupees(remaining)} / {formatRupees(salary)}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-[#656d7d] dark:text-[#737987]">
          <span>{carefulPct}% THRESHOLD (CAREFUL)</span>
          <span>{comfortablePct}% TARGET (COMFORTABLE)</span>
        </div>
      </div>

      {/* Progress Bar Container with Ticks */}
      <div className="relative w-full h-2.5 bg-[#e5e8ec] dark:bg-[#171920] border border-[#d0d4dc] dark:border-[#272b36] rounded-full overflow-visible">
        {/* Fill */}
        <div
          className="h-full bg-black dark:bg-white rounded-full transition-all duration-300"
          style={{ width: `${signal.barFillPercentage}%` }}
        />

        {/* 20% Tick Mark */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#717784] dark:bg-[#4a5060] z-10 pointer-events-none"
          style={{ left: `${carefulPct}%` }}
          title={`${carefulPct}% Careful Threshold`}
        />

        {/* 50% Tick Mark */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#717784] dark:bg-[#4a5060] z-10 pointer-events-none"
          style={{ left: `${comfortablePct}%` }}
          title={`${comfortablePct}% Comfortable Target`}
        />
      </div>

      {/* Legend Below Bar */}
      <div className="relative w-full h-4 text-[10px] font-mono text-[#525866] dark:text-[#5f6575]">
        <div className="absolute left-0">0% (LOW)</div>
        <div
          className="absolute -translate-x-1/2"
          style={{ left: `${carefulPct}%` }}
        >
          {carefulPct}% CAREFUL
        </div>
        <div
          className="absolute -translate-x-1/2"
          style={{ left: `${comfortablePct}%` }}
        >
          {comfortablePct}% COMFORTABLE
        </div>
        <div className="absolute right-0 text-right">100% INFLOW BASE</div>
      </div>
    </div>
  );
};
