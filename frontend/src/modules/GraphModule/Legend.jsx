import React from 'react';

/**
 * Legend Component
 * 
 * Clean overlay explaining entity shapes and line indicators.
 */
const Legend = () => {
  const entityTypes = [
    { label: 'Victim Account', color: '#1E3A8A', border: '#3B82F6', shape: 'rounded-full' },
    { label: 'Mule Layer', color: '#7F1D1D', border: '#EF4444', shape: 'rounded-sm' },
    { label: 'Merchant', color: '#78350F', border: '#F59E0B', shape: 'rounded-sm' },
    { label: 'UPI Entity', color: '#134E4A', border: '#14B8A6', shape: 'rotate-45' }
  ];

  const lineTypes = [
    { label: 'Suspicious Flow', color: '#EF4444', width: 'h-0.5' },
    { label: 'Standard Transfer', color: '#334155', width: 'h-0.5' }
  ];

  return (
    <div className="absolute bottom-4 left-4 z-20 p-3 bg-[#0D1829]/90 border border-slate-800 rounded-lg shadow-xl backdrop-blur-md space-y-2.5 font-sans select-none max-w-[200px]">
      <div>
        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-1.5">
          Entity Types
        </span>
        <div className="space-y-1.5">
          {entityTypes.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className={`w-3 h-3 ${item.shape} shrink-0 border`}
                style={{ background: item.color, borderColor: item.border }}
              />
              <span className="text-[10px] text-slate-300 font-mono truncate">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80">
        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-1.5">
          Flow Paths
        </span>
        <div className="space-y-1.5">
          {lineTypes.map((line) => (
            <div key={line.label} className="flex items-center gap-2">
              <div
                className={`w-4 ${line.width} shrink-0`}
                style={{ background: line.color }}
              />
              <span className="text-[10px] text-slate-300 font-mono truncate">
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
