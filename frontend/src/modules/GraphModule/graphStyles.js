/**
 * SENTINEL Enterprise Cytoscape.js Visual Craft Styling
 *
 * Depth & Motion:
 * 1. Radial Gradient Node Fills: 3D sphere-like center lighting to dark perimeter.
 * 2. Embedded Iconography: High-contrast crisp SVG icons centered inside each node.
 * 3. Animated Dash-Flow: Moving dashes along suspicious paths.
 * 4. Critical Node Threat Aura: Radiant glowing crimson drop-shadow.
 * 5. Label Backdrop Pills: High-contrast semi-transparent backdrop behind all text.
 */

// ─── Inline SVG Icons as Data URIs ──────────────────────────────────────────

const SVG_ICONS = {
  // Shield / User Protection (Blue)
  victim: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2360A5FA" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  
  // Alert Warning Triangle / Skull (Red)
  mule: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23EF4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  
  // Storefront / POS Terminal (Emerald)
  merchant: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2310B981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>`,
  
  // Lightning Zap / UPI Virtual Payment (Violet)
  upi: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23C084FC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  
  // Banknote / ATM Cashout Machine (Amber)
  cashout: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  
  // Crypto Currency OTC Desk (Cyan)
  crypto: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2306B6D4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>`,
  
  // Aggregator / Inflow Collector (Orange)
  collector: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23FB923C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  
  // Fallback Individual (Slate)
  individual: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2394A3B8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
};

export const NODE_CONFIG = {
  victim:     { bg: '#0A1838', innerGlow: '#1E3A8A', border: '#3B82F6', borderWidth: 2.5, shape: 'ellipse',         size: 58 },
  mule:       { bg: '#380707', innerGlow: '#7F1D1D', border: '#EF4444', borderWidth: 3.0, shape: 'polygon',         size: 60 },
  merchant:   { bg: '#022417', innerGlow: '#065F46', border: '#10B981', borderWidth: 2.5, shape: 'round-rectangle', size: 56 },
  upi:        { bg: '#200C44', innerGlow: '#4C1D95', border: '#8B5CF6', borderWidth: 2.5, shape: 'diamond',         size: 58 },
  cashout:    { bg: '#361600', innerGlow: '#78350F', border: '#F59E0B', borderWidth: 2.5, shape: 'polygon',         size: 58 },
  crypto:     { bg: '#03232C', innerGlow: '#155E75', border: '#06B6D4', borderWidth: 2.5, shape: 'polygon',         size: 58 },
  collector:  { bg: '#331505', innerGlow: '#7C2D12', border: '#F97316', borderWidth: 3.0, shape: 'round-rectangle', size: 62 },
  individual: { bg: '#0F172A', innerGlow: '#1E293B', border: '#475569', borderWidth: 2.0, shape: 'ellipse',         size: 50 },
};

const OCTAGON_POINTS = [
  -0.383, -0.924,  0.383, -0.924,
   0.924, -0.383,  0.924,  0.383,
   0.383,  0.924, -0.383,  0.924,
  -0.924,  0.383, -0.924, -0.383
];

const HEXAGON_POINTS = [
  0, -1,
  0.866, -0.5,
  0.866, 0.5,
  0, 1,
  -0.866, 0.5,
  -0.866, -0.5
];

export const getNodeType = (node) => {
  const explicitType = (node.data('type') || '').toLowerCase();
  if (NODE_CONFIG[explicitType]) return explicitType;

  const id = (node.data('id') || '').toUpperCase();
  if (id.includes('VICTIM') || id.includes('ORIGIN') || id.includes('FEEDER')) return 'victim';
  if (id.includes('MULE') || id.includes('WASH')) return 'mule';
  if (id.includes('MERCH') || id.includes('RETAIL') || id.includes('POS') || id.includes('GATEWAY')) return 'merchant';
  if (id.includes('UPI') || id.includes('@')) return 'upi';
  if (id.includes('CASH') || id.includes('ATM') || id.includes('EXIT')) return 'cashout';
  if (id.includes('CRYPTO') || id.includes('DESK') || id.includes('OTC')) return 'crypto';
  if (id.includes('COLLECTOR') || id.includes('HUB')) return 'collector';
  return 'mule';
};

export const isCriticalNode = (node) => {
  const type = getNodeType(node);
  const status = (node.data('status') || '').toLowerCase();
  return type === 'mule' || type === 'collector' || status === 'flagged';
};

const getNodeLabel = (node) => {
  const raw = node.data('displayLabel') || node.data('id') || '';
  const status = node.data('status') || '';
  const statusGlyph = status === 'withdrawn' ? ' ✕' : status === 'frozen' ? ' 🔒' : '';

  if (raw.length > 18) {
    return `${raw.slice(0, 7)}…${raw.slice(-4)}${statusGlyph}`;
  }
  return `${raw}${statusGlyph}`;
};

export const graphStyles = [
  /* ─── Base Node (Radial Gradient Sphere Lighting) ─── */
  {
    selector: 'node',
    style: {
      'label':                   (n) => getNodeLabel(n),
      'shape':                   (n) => NODE_CONFIG[getNodeType(n)]?.shape || 'ellipse',
      'shape-polygon-points':    (n) => {
        const t = getNodeType(n);
        if (t === 'crypto') return HEXAGON_POINTS;
        if (['mule', 'cashout'].includes(t)) return OCTAGON_POINTS;
        return undefined;
      },
      
      // 3D Radial Gradient Fill
      'background-fill':         'radial-gradient',
      'background-gradient-stop-colors': (n) => {
        const t = getNodeType(n);
        const c = NODE_CONFIG[t] || NODE_CONFIG.mule;
        return `${c.innerGlow} ${c.bg}`;
      },
      'background-gradient-stop-positions': '0% 100%',
      'background-color':        (n) => NODE_CONFIG[getNodeType(n)]?.bg || '#0F172A',
      'border-color':            (n) => NODE_CONFIG[getNodeType(n)]?.border || '#475569',
      'border-width':            (n) => NODE_CONFIG[getNodeType(n)]?.borderWidth || 2.5,
      'border-style':            (n) => n.data('status') === 'withdrawn' ? 'dashed' : 'solid',
      'width':                   (n) => NODE_CONFIG[getNodeType(n)]?.size || 58,
      'height':                  (n) => NODE_CONFIG[getNodeType(n)]?.size || 58,
      
      // Embedded SVG Icon
      'background-image':        (n) => SVG_ICONS[getNodeType(n)] || SVG_ICONS.individual,
      'background-fit':          'none',
      'background-width':        '22px',
      'background-height':       '22px',
      'background-position-x':   '50%',
      'background-position-y':   '50%',
      'background-image-opacity': 0.95,

      // Threat Aura Glow on CRITICAL nodes
      'shadow-blur':             (n) => isCriticalNode(n) ? 22 : 6,
      'shadow-color':            (n) => isCriticalNode(n) ? '#EF4444' : '#000000',
      'shadow-opacity':          (n) => isCriticalNode(n) ? 0.80 : 0.45,
      'shadow-offset-x':         0,
      'shadow-offset-y':         0,

      // Label styling with high-contrast semi-transparent backdrop pill
      'color':                   '#F8FAFC',
      'text-valign':             'bottom',
      'text-halign':             'center',
      'text-margin-y':           8,
      'font-size':               9,
      'font-family':             'JetBrains Mono, monospace',
      'font-weight':             600,
      'text-background-color':   '#050A14',
      'text-background-opacity': 0.92,
      'text-background-padding': '3px',
      'text-background-shape':   'round-rectangle',
      'text-border-color':       '#1A2640',
      'text-border-width':       1,
      'text-border-opacity':     0.9,
      'text-max-width':          '120px',
      'text-wrap':               'ellipsis',

      'transition-property':     'background-color, border-color, border-width, opacity, shadow-blur, shadow-opacity, transform',
      'transition-duration':     '0.25s'
    }
  },

  /* ─── Base Edge: Smooth Curved Bezier Connectors ─── */
  {
    selector: 'edge',
    style: {
      'label':                   'data(label)',
      'width':                   1.8,
      'line-color':              '#243352',
      'target-arrow-color':      '#3D4F6B',
      'target-arrow-shape':      'triangle',
      'arrow-scale':             0.8,
      
      // Figma / tldraw Smooth Bezier Connectors
      'curve-style':             'bezier',
      'control-point-step-size': 40,
      'loop-direction':          '-45deg',
      'loop-sweep':              '-90deg',

      'font-size':               8,
      'font-family':             'JetBrains Mono, monospace',
      'font-weight':             500,
      'text-rotation':           'autorotate',
      'text-margin-y':           -8,
      'text-background-color':   '#0A0F1D',
      'text-background-opacity': 0.95,
      'text-background-padding': '3px',
      'text-border-color':       '#1A2640',
      'text-border-width':       1,
      'text-border-opacity':     1,
      'color':                   '#64748B',
      'opacity':                 0.85,
      'transition-property':     'line-color, target-arrow-color, opacity, width, shadow-blur',
      'transition-duration':     '0.25s'
    }
  },

  /* ─── Suspicious Edge (Animated continuous flow) ─── */
  {
    selector: 'edge.suspicious-edge',
    style: {
      'width':                   2.5,
      'line-color':              '#EF4444',
      'target-arrow-color':      '#EF4444',
      'line-style':              'dashed',
      'line-dash-pattern':       [8, 4],
      'opacity':                 1.0,
      'z-index':                 20,
      'color':                   '#FCA5A5',
      'font-weight':             700,
      'text-background-color':   '#160808',
      'text-border-color':       '#7F1D1D',
      'shadow-blur':             8,
      'shadow-color':            '#EF4444',
      'shadow-opacity':          0.4
    }
  },

  /* ─── Active Traced Flow (Electric Blue Glowing Pulse) ─── */
  {
    selector: 'edge.traced-edge',
    style: {
      'width':                   4.0,
      'line-color':              '#3B82F6',
      'target-arrow-color':      '#60A5FA',
      'line-style':              'solid',
      'opacity':                 1.0,
      'z-index':                 35,
      'color':                   '#93C5FD',
      'font-weight':             700,
      'text-background-color':   '#06101E',
      'text-border-color':       '#1D4ED8',
      'shadow-blur':             18,
      'shadow-color':            '#3B82F6',
      'shadow-opacity':          0.95
    }
  },

  /* ─── Hovered / Selected Focus ─── */
  {
    selector: 'node.highlighted, node:selected, node.hovered-focus',
    style: {
      'border-width':   4.0,
      'border-color':   '#3B82F6',
      'shadow-blur':    28,
      'shadow-color':   '#3B82F6',
      'shadow-opacity': 0.95,
      'opacity':        1.0,
      'z-index':        30
    }
  },
  {
    selector: 'edge.highlighted, edge.hovered-focus',
    style: {
      'width':             3.5,
      'line-color':        '#3B82F6',
      'target-arrow-color':'#3B82F6',
      'opacity':           1.0,
      'z-index':           25
    }
  },

  /* ─── Dimmed Non-Participating Elements ─── */
  {
    selector: 'node.dimmed',
    style: { 'opacity': 0.15, 'shadow-opacity': 0 }
  },
  {
    selector: 'edge.dimmed',
    style: { 'opacity': 0.08, 'shadow-opacity': 0 }
  }
];
