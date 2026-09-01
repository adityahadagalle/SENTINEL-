import React from 'react';

/**
 * RiskBadge Component
 * Displays a severity badge with an optional radial ring gauge for HIGH and CRITICAL scores.
 */
const RiskBadge = ({ score = 0, showRadial = false }) => {
  const numScore = Number(score) || 0;

  if (numScore >= 85) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-rose-500/10 border border-rose-500/25 text-rose-400 font-mono text-[10px] font-bold uppercase tracking-wider">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
        </span>
        <span>{numScore}</span>
        <span className="text-[8px] text-rose-500/70 font-semibold">CRITICAL</span>
      </span>
    );
  }

  if (numScore >= 70) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-orange-500/10 border border-orange-500/25 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
        <span>{numScore}</span>
        <span className="text-[8px] text-orange-500/70 font-semibold">HIGH</span>
      </span>
    );
  }

  if (numScore >= 40) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
        <span>{numScore}</span>
        <span className="text-[8px] text-amber-500/70 font-semibold">MED</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
      <span>{numScore}</span>
      <span className="text-[8px] text-emerald-500/70 font-semibold">LOW</span>
    </span>
  );
};

export default RiskBadge;
