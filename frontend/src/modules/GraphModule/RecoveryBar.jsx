import React from 'react';
import { useCountUp } from '../../utils/useCountUp';

/**
 * RecoveryBar Component — Animated asset recovery potential gauge & breakdown cards.
 */
const RecoveryBar = ({ recovery = {} }) => {
  const totalFraud = Number(recovery.totalFraud || 0);
  const recovered = Number(recovery.recovered || 0);
  const inflight = Number(recovery.inflight || 0);
  const lost = Number(recovery.lost || 0);
  const rawPct = Number(recovery.percentage || 0);

  // Animated Count-Up Numbers
  const animatedPct = useCountUp(rawPct, 700, 1);
  const animatedTotal = useCountUp(totalFraud, 750, 0);
  const animatedRecovered = useCountUp(recovered, 700, 0);
  const animatedInflight = useCountUp(inflight, 700, 0);
  const animatedLost = useCountUp(lost, 700, 0);

  const total = Math.max(totalFraud, recovered, inflight, lost, 1);
  const recoveredWidth = `${Math.max((recovered / total) * 100, 0)}%`;
  const inflightWidth = `${Math.max((inflight / total) * 100, 0)}%`;
  const lostWidth = `${Math.max((lost / total) * 100, 0)}%`;

  return (
    <div className="p-4 bg-[#080D18] border-b border-[#1A2640] space-y-3 font-sans select-none shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.14em] block font-semibold">
            Asset Recovery Potential
          </span>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5 tracking-tight flex items-baseline gap-1.5">
            <span>{animatedPct.toFixed(1)}%</span>
            <span className="text-[10px] font-normal text-slate-500 uppercase tracking-wider">Recoverable</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 tabular-nums">
          Exposure: <strong className="text-slate-200">₹{animatedTotal.toLocaleString('en-IN')}</strong>
        </span>
      </div>

      {/* Progress Track */}
      <div
        className="h-2 w-full bg-[#101A2B] rounded-full overflow-hidden flex border border-[#1A2640]/80 p-0.5 shadow-inner"
        role="img"
        aria-label={`Recovered ${recovered}, in-flight ${inflight}, lost ${lost}`}
      >
        <div
          style={{ width: recoveredWidth }}
          className="bg-emerald-500 h-full rounded-l-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]"
        />
        <div
          style={{ width: inflightWidth }}
          className="bg-amber-500 h-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(245,158,11,0.4)]"
        />
        <div
          style={{ width: lostWidth }}
          className="bg-rose-500 h-full rounded-r-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(239,68,68,0.4)]"
        />
      </div>

      {/* Stat Breakdown Grid (Elevated Cards) */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded-sm bg-[#0C1424] border border-[#1E2D4A] shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all hover:border-emerald-500/30">
          <span className="text-[7.5px] text-slate-500 uppercase block font-bold tracking-wider">Recovered</span>
          <span className="font-bold text-emerald-400 text-[11px] mt-0.5 block tabular-nums">
            ₹{animatedRecovered.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="p-2.5 rounded-sm bg-[#0C1424] border border-[#1E2D4A] shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all hover:border-amber-500/30">
          <span className="text-[7.5px] text-slate-500 uppercase block font-bold tracking-wider">In-Flight</span>
          <span className="font-bold text-amber-400 text-[11px] mt-0.5 block tabular-nums">
            ₹{animatedInflight.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="p-2.5 rounded-sm bg-[#0C1424] border border-[#1E2D4A] shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all hover:border-rose-500/30">
          <span className="text-[7.5px] text-slate-500 uppercase block font-bold tracking-wider">Est. Lost</span>
          <span className="font-bold text-rose-400 text-[11px] mt-0.5 block tabular-nums">
            ₹{animatedLost.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecoveryBar;
