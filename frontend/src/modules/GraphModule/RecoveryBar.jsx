import React from 'react';

/**
 * RecoveryBar Component
 * 
 * Visualizes recoverable vs frozen vs lost funds.
 */
const RecoveryBar = ({ recovery }) => {
  const total = Math.max(recovery.totalFraud || 0, recovery.recovered || 0, recovery.inflight || 0, recovery.lost || 0, 1);
  const recoveredWidth = `${Math.max((recovery.recovered || 0) / total * 100, 0)}%`;
  const inflightWidth = `${Math.max((recovery.inflight || 0) / total * 100, 0)}%`;
  const lostWidth = `${Math.max((recovery.lost || 0) / total * 100, 0)}%`;

  return (
    <div className="p-4 bg-[#0D1424] border-b border-slate-800 space-y-3 font-sans select-none">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
            Asset Recovery Potential
          </span>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
            {recovery.percentage}%{' '}
            <span className="text-[11px] font-normal text-slate-500">Recoverable</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Exposure: ₹{Number(recovery.totalFraud || 0).toLocaleString('en-IN')}
        </span>
      </div>

      {/* Progress Track */}
      <div
        className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex"
        role="img"
        aria-label={`Recovered ${recovery.recovered || 0}, in-flight ${recovery.inflight || 0}, lost ${recovery.lost || 0}`}
      >
        <div style={{ width: recoveredWidth }} className="bg-emerald-500 h-full" />
        <div style={{ width: inflightWidth }} className="bg-amber-500 h-full" />
        <div style={{ width: lostWidth }} className="bg-rose-500 h-full" />
      </div>

      {/* Stat Breakdown Grid */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        <div className="p-2 rounded bg-[#111927] border border-emerald-900/30">
          <span className="text-[8px] text-slate-500 uppercase block">Recovered</span>
          <span className="font-bold text-emerald-400 text-[11px]">
            ₹{Number(recovery.recovered || 0).toLocaleString('en-IN')}
          </span>
        </div>
        <div className="p-2 rounded bg-[#111927] border border-amber-900/30">
          <span className="text-[8px] text-slate-500 uppercase block">In-Flight</span>
          <span className="font-bold text-amber-400 text-[11px]">
            ₹{Number(recovery.inflight || 0).toLocaleString('en-IN')}
          </span>
        </div>
        <div className="p-2 rounded bg-[#111927] border border-rose-900/30">
          <span className="text-[8px] text-slate-500 uppercase block">Est. Lost</span>
          <span className="font-bold text-rose-400 text-[11px]">
            ₹{Number(recovery.lost || 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecoveryBar;
