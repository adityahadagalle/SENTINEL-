import React from 'react';

/**
 * Legend Component
 * 
 * Clean overlay explaining entity shapes and line indicators.
 * Standardized across SENTINEL design system.
 */
const Legend = () => {
  const entityTypes = [
    { label: 'Victim Account', color: '#1E3A8A', border: '#3B82F6', shape: 'rounded-full' },
    { label: 'Mule Account', color: '#7F1D1D', border: '#EF4444', shape: 'rounded-sm' },
    { label: 'Merchant Outlet', color: '#064E3B', border: '#10B981', shape: 'rounded-sm' },
    { label: 'UPI Handle', color: '#4C1D95', border: '#8B5CF6', shape: 'rotate-45' },
    { label: 'Cashout Terminal', color: '#78350F', border: '#F59E0B', shape: 'rounded-sm' }
  ];

  const lineTypes = [
    { label: 'Suspicious Flow', color: '#EF4444', dashed: true },
    { label: 'Standard Transfer', color: '#475569', dashed: false },
    { label: 'Traced Active Route', color: '#3B82F6', dashed: false }
  ];

  return (
    <div className="absolute bottom-4 left-4 z-20 p-3 bg-[#0C1220]/95 border border-[#1A2640] rounded-sm shadow-2xl backdrop-blur-md space-y-2.5 font-sans select-none max-w-[210px]">
      <div>
        <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500 font-mono block mb-1.5">
          Entity Geometries
        </span>
        <div className="space-y-1.5">
          {entityTypes.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className={`w-3 h-3 ${item.shape} shrink-0 border`}
                style={{ background: item.color, borderColor: item.border }}
              />
              <span className="text-[9.5px] text-slate-300 font-mono truncate">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-[#1A2640]">
        <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500 font-mono block mb-1.5">
          Flow Paths
        </span>
        <div className="space-y-1.5">
          {lineTypes.map((line) => (
            <div key={line.label} className="flex items-center gap-2">
              <div
                className={`w-4 h-0.5 shrink-0 ${line.dashed ? 'border-b border-dashed border-rose-500' : ''}`}
                style={{ background: line.dashed ? 'transparent' : line.color }}
              />
              <span className="text-[9.5px] text-slate-300 font-mono truncate">
                {line.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Legend;
