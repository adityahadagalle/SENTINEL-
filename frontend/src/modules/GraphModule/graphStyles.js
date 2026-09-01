/**
 * SENTINEL Enterprise Cytoscape.js Styling
 * 
 * Distinct node geometries and colors:
 * - Victim Account: Blue ellipse with shield border
 * - Mule Accounts: Red/Orange octagon with alert ring
 * - Merchants: Amber rounded rectangle
 * - UPI IDs: Violet diamond
 * - Cashout: Gold octagon
 * 
 * Edge formatting:
 * - Suspicious flow: Red dashed line with high-contrast label pill
 * - Standard flow: Slate solid line
 * - Tracing active: Electric blue pulse
 */

export const STATUS_STYLES = {
  active:    { bg: '#1D4ED8', border: '#3B82F6', icon: '' },
  flagged:   { bg: '#991B1B', border: '#EF4444', icon: '⚠' },
  frozen:    { bg: '#334155', border: '#64748B', icon: '🔒' },
  withdrawn: { bg: '#881337', border: '#F43F5E', icon: '✕' }
};

const getNodeType = (node) => {
  const id = (node.data('id') || '').toUpperCase();
  const label = (node.data('displayLabel') || node.data('label') || '').toUpperCase();
  const accountId = (node.data('accountId') || node.data('account_id') || '').toUpperCase();
  const combined = `${id} ${label} ${accountId}`;

  if (combined.includes('VICTIM')) return 'victim';
  if (combined.includes('MULE')) return 'mule';
  if (combined.includes('MERCH') || combined.includes('STORE')) return 'merchant';
  if (combined.includes('@') || combined.includes('UPI')) return 'upi';
  if (combined.includes('CASH') || combined.includes('ATM')) return 'cashout';
  return 'individual';
};

const NODE_COLORS = {
  victim:     { bg: '#1E3A8A', border: '#3B82F6', borderWidth: 3 },
  mule:       { bg: '#7F1D1D', border: '#EF4444', borderWidth: 3 },
  merchant:   { bg: '#064E3B', border: '#10B981', borderWidth: 2.5 },
  upi:        { bg: '#4C1D95', border: '#8B5CF6', borderWidth: 2.5 },
  cashout:    { bg: '#78350F', border: '#F59E0B', borderWidth: 2.5 },
  individual: { bg: '#1E293B', border: '#475569', borderWidth: 2 }
};

const NODE_SHAPES = {
  victim:     'ellipse',
  mule:       'polygon',
  merchant:   'round-rectangle',
  upi:        'diamond',
  cashout:    'polygon',
  individual: 'ellipse'
};

const OCTAGON_POINTS = [-0.383, -0.924, 0.383, -0.924, 0.924, -0.383, 0.924, 0.383, 0.383, 0.924, -0.383, 0.924, -0.924, 0.383, -0.924, -0.383];

const getNodeLabel = (node) => {
  const type = getNodeType(node);
  const label = node.data('displayLabel') || node.data('id') || '';
  const status = node.data('status');
  const icon = STATUS_STYLES[status]?.icon || '';

  if (type === 'individual') {
    const initials = label.split(/[-_\s]/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
    return icon ? `${initials} ${icon}` : initials || label.slice(0, 3);
  }

  const shortLabel = label.length > 18 ? `${label.slice(0, 6)}..${label.slice(-4)}` : label;
  return icon ? `${shortLabel} ${icon}` : shortLabel;
};

const getNodeSize = (type) => {
  switch (type) {
    case 'victim': return 66;
    case 'mule': return 62;
    case 'merchant': return 56;
    case 'upi': return 52;
    case 'cashout': return 56;
    default: return 48;
  }
};

export const graphStyles = [
  /* ─── Base Node ─── */
  {
    selector: 'node',
    style: {
      'label': (node) => getNodeLabel(node),
      'shape': (node) => NODE_SHAPES[getNodeType(node)] || 'ellipse',
      'shape-polygon-points': (node) => ['mule', 'cashout'].includes(getNodeType(node)) ? OCTAGON_POINTS : undefined,
      'background-color': (node) => {
        const status = node.data('status');
        if (status && STATUS_STYLES[status]) return STATUS_STYLES[status].bg;
        return NODE_COLORS[getNodeType(node)]?.bg || NODE_COLORS.individual.bg;
      },
      'border-width': (node) => NODE_COLORS[getNodeType(node)]?.borderWidth || 2,
      'border-color': (node) => {
        const status = node.data('status');
        if (status && STATUS_STYLES[status]) return STATUS_STYLES[status].border;
        return NODE_COLORS[getNodeType(node)]?.border || NODE_COLORS.individual.border;
      },
      'border-style': (node) => node.data('status') === 'withdrawn' ? 'dashed' : 'solid',
      'color': '#F8FAFC',
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': (node) => getNodeType(node) === 'individual' ? 10 : 9,
      'font-family': 'JetBrains Mono, monospace',
      'font-weight': 600,
      'width': (node) => getNodeSize(getNodeType(node)),
      'height': (node) => getNodeSize(getNodeType(node)),
      'text-outline-width': 2,
      'text-outline-color': '#080D18',
      'text-max-width': '90px',
      'text-wrap': 'ellipsis',
      'transition-property': 'background-color, border-color, width, height, opacity, border-width',
      'transition-duration': '0.2s'
    }
  },

  /* ─── Base Edge ─── */
  {
    selector: 'edge',
    style: {
      'label': 'data(label)',
      'width': 2,
      'line-color': '#283548',
      'target-arrow-color': '#475569',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'font-size': 8.5,
      'font-family': 'JetBrains Mono, monospace',
      'font-weight': 500,
      'text-rotation': 'autorotate',
      'text-margin-y': -8,
      'text-background-color': '#0C1220',
      'text-background-opacity': 0.92,
      'text-background-padding': 3,
      'text-border-color': '#1A2640',
      'text-border-width': 1,
      'color': '#94A3B8',
      'opacity': 0.85,
      'arrow-scale': 0.85,
      'transition-property': 'line-color, target-arrow-color, opacity, width',
      'transition-duration': '0.2s'
    }
  },

  /* ─── Suspicious Edge ─── */
  {
    selector: 'edge.suspicious-edge',
    style: {
      'width': 2.5,
      'line-color': '#EF4444',
      'target-arrow-color': '#EF4444',
      'line-style': 'dashed',
      'line-dash-pattern': [6, 3],
      'opacity': 0.95,
      'z-index': 20,
      'color': '#FCA5A5',
      'font-weight': 600,
      'text-background-color': '#1C1016',
      'text-border-color': '#7F1D1D'
    }
  },

  /* ─── Sequentially Traced Flow Edge ─── */
  {
    selector: 'edge.traced-edge',
    style: {
      'width': 3.5,
      'line-color': '#3B82F6',
      'target-arrow-color': '#60A5FA',
      'opacity': 1,
      'z-index': 35,
      'color': '#93C5FD',
      'font-weight': 700,
      'text-background-color': '#0B1A30',
      'text-border-color': '#1D4ED8'
    }
  },

  /* ─── Selected / Neighborhood Highlighted ─── */
  {
    selector: 'node.highlighted, node:selected',
    style: {
      'border-width': 3.5,
      'border-color': '#3B82F6',
      'opacity': 1,
      'z-index': 30
    }
  },
  {
    selector: 'edge.highlighted',
    style: {
      'width': 3,
      'line-color': '#3B82F6',
      'target-arrow-color': '#3B82F6',
      'opacity': 1,
      'z-index': 25
    }
  },

  /* ─── Dimmed State ─── */
  {
    selector: 'node.dimmed',
    style: {
      'opacity': 0.15
    }
  },
  {
    selector: 'edge.dimmed',
    style: {
      'opacity': 0.08
    }
  }
];
