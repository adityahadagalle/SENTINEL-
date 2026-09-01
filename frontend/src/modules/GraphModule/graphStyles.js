/**
 * SENTINEL Enterprise Cytoscape.js Styling
 * 
 * Distinct node geometries and colors:
 * - Victim Account: blue concentric double circle
 * - Mule Accounts: red/orange octagon
 * - Merchants: amber rounded rectangle
 * - UPI IDs: teal diamond
 * - Individuals: slate circle with initials
 * 
 * Interactive states:
 * - .highlighted: bright accent, high z-index
 * - .dimmed: faded 0.15 opacity
 * - .suspicious-path: animated red edge flow
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
  if (combined.includes('MERCH')) return 'merchant';
  if (combined.includes('@') || combined.includes('UPI')) return 'upi';
  return 'individual';
};

const NODE_COLORS = {
  victim:     { bg: '#1E3A8A', border: '#3B82F6', borderWidth: 3 },
  mule:       { bg: '#7F1D1D', border: '#EF4444', borderWidth: 3 },
  merchant:   { bg: '#78350F', border: '#F59E0B', borderWidth: 2 },
  upi:        { bg: '#134E4A', border: '#14B8A6', borderWidth: 2 },
  individual: { bg: '#1E293B', border: '#475569', borderWidth: 2 }
};

const NODE_SHAPES = {
  victim:     'ellipse',
  mule:       'polygon',
  merchant:   'round-rectangle',
  upi:        'diamond',
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

  const shortLabel = label.length > 15 ? `${label.slice(0, 4)}..${label.slice(-4)}` : label;
  return icon ? `${shortLabel} ${icon}` : shortLabel;
};

const getNodeSize = (type) => {
  switch (type) {
    case 'victim': return 64;
    case 'mule': return 58;
    case 'merchant': return 54;
    case 'upi': return 50;
    default: return 44;
  }
};

export const graphStyles = [
  /* ─── Base Node ─── */
  {
    selector: 'node',
    style: {
      'label': (node) => getNodeLabel(node),
      'shape': (node) => NODE_SHAPES[getNodeType(node)] || 'ellipse',
      'shape-polygon-points': (node) => getNodeType(node) === 'mule' ? OCTAGON_POINTS : undefined,
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
      'text-outline-color': '#0B1120',
      'text-max-width': '80px',
      'text-wrap': 'ellipsis',
      'transition-property': 'background-color, border-color, width, height, opacity',
      'transition-duration': '0.2s'
    }
  },

  /* ─── Base Edge ─── */
  {
    selector: 'edge',
    style: {
      'label': '',
      'width': 1.5,
      'line-color': '#283548',
      'target-arrow-color': '#334155',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'font-size': 9,
      'font-family': 'JetBrains Mono, monospace',
      'text-rotation': 'autorotate',
      'text-margin-y': -10,
      'text-background-color': '#0D1424',
      'text-background-opacity': 0.95,
      'text-background-padding': 3,
      'text-border-color': '#1E293B',
      'text-border-width': 1,
      'color': '#94A3B8',
      'opacity': 0.5,
      'arrow-scale': 0.8,
      'transition-property': 'line-color, target-arrow-color, opacity, width',
      'transition-duration': '0.15s'
    }
  },

  /* ─── Suspicious Edge ─── */
  {
    selector: 'edge.suspicious-edge, edge.show-label',
    style: {
      'label': 'data(label)',
      'width': 2.5,
      'line-color': '#EF4444',
      'target-arrow-color': '#EF4444',
      'opacity': 0.95,
      'z-index': 20,
      'color': '#FCA5A5',
      'font-weight': 600,
      'text-background-color': '#1C1016',
      'text-border-color': '#7F1D1D'
    }
  },

  /* ─── Selected / Neighborhood Highlighted ─── */
  {
    selector: 'node.highlighted, node:selected',
    style: {
      'border-width': 3,
      'border-color': '#3B82F6',
      'opacity': 1,
      'z-index': 30
    }
  },
  {
    selector: 'edge.highlighted',
    style: {
      'width': 2.5,
      'line-color': '#3B82F6',
      'target-arrow-color': '#3B82F6',
      'opacity': 1,
      'z-index': 25,
      'label': 'data(label)'
    }
  },

  /* ─── Dimmed (when inspecting specific node) ─── */
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
