import React from 'react';

/**
 * ActionButton — 3-tier variant system
 * 
 * variant="primary"   → Solid critical action (Freeze / high-stakes)
 * variant="secondary" → Outline style (Escalate / Police)
 * variant="tertiary"  → Ghost text (View / Monitor)
 * variant="default"   → Backwards-compatible blue primary (existing callers)
 */
const ActionButton = ({ label, onClick, disabled, variant = 'default', className = "" }) => {
  const base = `inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
    transition-all duration-150 font-sans shrink-0 select-none
    ${disabled ? 'opacity-40 grayscale cursor-not-allowed pointer-events-none' : 'cursor-pointer active:scale-[0.97]'}`;

  const variants = {
    primary: `bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20
              border border-rose-600/50 hover:border-rose-500/70`,
    secondary: `border border-slate-600 text-slate-300 bg-transparent
                hover:bg-slate-800 hover:text-white hover:border-slate-500`,
    tertiary: `text-slate-400 hover:text-blue-400 hover:bg-blue-900/10 bg-transparent
               border border-transparent hover:border-blue-800/40`,
    default: `bg-primary text-white hover:bg-primary/90 shadow-sm border border-primary/30`
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.default} ${className}`}
    >
      {label}
    </button>
  );
};

export default ActionButton;
