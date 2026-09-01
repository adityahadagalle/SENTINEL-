import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const RiskBadge = ({ score, showLabel = true, className = "" }) => {
  const getRiskDetails = (s) => {
    if (s >= 85) {
      return {
        label: 'CRITICAL',
        styles: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        shadow: 'shadow-[0_0_12px_rgba(239,68,68,0.2)]',
        dot: 'bg-rose-500'
      };
    }
    if (s >= 70) {
      return {
        label: 'HIGH',
        styles: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
        shadow: 'shadow-[0_0_10px_rgba(249,115,22,0.15)]',
        dot: 'bg-orange-500'
      };
    }
    if (s >= 40) {
      return {
        label: 'MEDIUM',
        styles: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        shadow: '',
        dot: 'bg-amber-500'
      };
    }
    return {
      label: 'LOW',
      styles: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      shadow: '',
      dot: 'bg-emerald-500'
    };
  };

  const { label, styles, shadow, dot } = getRiskDetails(Number(score || 0));

  return (
    <div
      className={twMerge(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border shrink-0 font-mono",
        styles,
        shadow,
        className
      )}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <span className="text-xs font-bold tabular-nums">{score}</span>
      {showLabel && (
        <span className="text-[9px] font-sans font-semibold tracking-widest opacity-90 border-l border-current/30 pl-1.5 uppercase">
          {label}
        </span>
      )}
    </div>
  );
};

export default RiskBadge;
