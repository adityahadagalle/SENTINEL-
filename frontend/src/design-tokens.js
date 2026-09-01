/**
 * SENTINEL Enterprise Design System Tokens
 * Standardized across all pages, graph visualizers, and panels.
 */

export const TOKENS = {
  // Surface Hierarchy (3 distinct levels)
  surfaces: {
    base: '#080D18',          // Canvas floor
    panel: '#0C1220',         // Sidebars & toolbars
    card: '#0F1926',          // Containers & tables
    cardHover: '#131E2E',     // Active hover state
    cardActive: '#172338',    // Selected row/card
    overlay: 'rgba(8, 13, 24, 0.85)',
  },

  // Borders & Dividers
  borders: {
    subtle: '#141E33',
    default: '#1A2640',
    strong: '#243352',
    accent: '#3B82F6',
  },

  // Semantic Risk Colors (strictly unified)
  risk: {
    critical: {
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.10)',
      border: 'rgba(239, 68, 68, 0.25)',
      glow: 'rgba(239, 68, 68, 0.20)',
    },
    high: {
      color: '#F97316',
      bg: 'rgba(249, 115, 22, 0.10)',
      border: 'rgba(249, 115, 22, 0.25)',
      glow: 'rgba(249, 115, 22, 0.20)',
    },
    medium: {
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.10)',
      border: 'rgba(245, 158, 11, 0.25)',
      glow: 'rgba(245, 158, 11, 0.20)',
    },
    low: {
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.10)',
      border: 'rgba(16, 185, 129, 0.25)',
      glow: 'rgba(16, 185, 129, 0.20)',
    },
  },

  // Entity Types for Graph Nodes & Indicators
  entities: {
    victim: {
      label: 'Victim Account',
      color: '#3B82F6',
      border: '#60A5FA',
      shape: 'ellipse',
      icon: 'Shield',
    },
    mule: {
      label: 'Mule Account',
      color: '#EF4444',
      border: '#F87171',
      shape: 'hexagon',
      icon: 'AlertTriangle',
    },
    merchant: {
      label: 'Merchant Outlet',
      color: '#10B981',
      border: '#34D399',
      shape: 'rectangle',
      icon: 'Store',
    },
    upi: {
      label: 'UPI Handle',
      color: '#8B5CF6',
      border: '#A78BFA',
      shape: 'diamond',
      icon: 'Zap',
    },
    cashout: {
      label: 'Cashout Terminal',
      color: '#F59E0B',
      border: '#FBBF24',
      shape: 'octagon',
      icon: 'DollarSign',
    },
  },

  // Motion & Animation Tokens
  motion: {
    hover: '120ms ease-out',
    transition: '200ms cubic-bezier(0.16, 1, 0.3, 1)',
    panel: '250ms cubic-bezier(0.16, 1, 0.3, 1)',
    graphHop: 350, // ms per edge animation
  },

  // Typography
  typography: {
    mono: "'JetBrains Mono', monospace",
    sans: "'Inter', -apple-system, sans-serif",
  },
};

export default TOKENS;
