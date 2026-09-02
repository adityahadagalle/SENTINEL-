import React from 'react';

/**
 * Avatar — Reusable circular identity component.
 *
 * Used in:
 * - Sidebar (Analyst Raj)
 * - Top header user dropdown
 * - Any person-type node in the graph intelligence panel
 *
 * Features:
 * - Initials-based monogram (2 chars max)
 * - Deterministic hue from name string (consistent across renders)
 * - Risk-color ring border (optional)
 * - 3 size tiers: xs (20px), sm (24px), md (32px), lg (40px)
 */

const SIZE_MAP = {
  xs: { outer: 'w-5 h-5',   text: 'text-[7px]'  },
  sm: { outer: 'w-6 h-6',   text: 'text-[8px]'  },
  md: { outer: 'w-8 h-8',   text: 'text-[10px]' },
  lg: { outer: 'w-10 h-10', text: 'text-[12px]' },
};

/**
 * Stable hue from name string (0–360).
 * Same name always produces the same color — no state required.
 */
const nameToHue = (name = '') => {
  const h = name.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffff, 0);
  return h % 360;
};

const Avatar = ({
  name = 'Unknown',
  size = 'sm',
  ringColor = null,   // CSS color string — overrides default hue-derived ring
  className = '',
}) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .map(w => w[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  const hue = nameToHue(name);
  // Muted HSL background — dark enough for dark surfaces
  const bg    = `hsl(${hue}, 55%, 20%)`;
  const ring  = ringColor || `hsl(${hue}, 75%, 55%)`;
  const { outer, text } = SIZE_MAP[size] || SIZE_MAP.sm;

  return (
    <div
      className={`${outer} rounded-full flex items-center justify-center font-mono font-bold select-none shrink-0 ${className}`}
      style={{
        background: bg,
        border: `1.5px solid ${ring}`,
        boxShadow: `0 0 0 1px ${ring}22`,
        color: `hsl(${hue}, 80%, 80%)`,
      }}
      aria-label={name}
      title={name}
    >
      <span className={text}>{initials}</span>
    </div>
  );
};

export default Avatar;
