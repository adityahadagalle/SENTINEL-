# SENTINEL Edge System Specification

## 1. Edge Data Model

Edges represent directional capital transfers between accounts:

```typescript
interface SentinelEdgeData {
  id: string;               // Unique ID (e.g. 'e-vo-0', 'e-hop-1')
  source: string;           // Sender account ID
  target: string;           // Receiver account ID
  amount: number;           // Transfer volume in INR
  channel: 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'CARD' | 'SWIFT';
  time: string;             // ISO or clock timestamp (e.g. '10:14:22')
  is_suspicious: boolean;   // Whether the transfer tripped fraud thresholds
  label: string;            // Formatted string (e.g. '₹72,031 · IMPS')
}
```

---

## 2. Smooth Curved Bezier Geometry

To avoid rigid straight angles and emulate modern vector design tools, edges use curved bezier paths:

```javascript
'curve-style':             'bezier',
'control-point-step-size': 40,
'loop-direction':          '-45deg',
'loop-sweep':              '-90deg',
'target-arrow-shape':      'triangle',
'arrow-scale':             0.8,
```

---

## 3. Edge Visual Class Hierarchy

### Base / Standard Transfer (`edge`)
- **Color**: `#243352` (Line) / `#3D4F6B` (Arrow)
- **Width**: `1.8px`
- **Style**: `solid`
- **Label Backdrop**: `#0A0F1D` with `#1A2640` border.

### Suspicious Money Flow (`edge.suspicious-edge`)
- **Color**: `#EF4444` (Vibrant Crimson)
- **Width**: `2.5px`
- **Style**: `dashed` with pattern `[8, 4]`
- **Motion Animation**: Continuous movement driven by RAF loop modifying `line-dash-offset`.
- **Drop-Shadow Glow**: `shadow-blur: 8`, `shadow-color: '#EF4444'`, `shadow-opacity: 0.4`.

### Active Traced Path (`edge.traced-edge`)
- **Color**: `#3B82F6` (Electric Blue)
- **Arrow Color**: `#60A5FA`
- **Width**: `4.0px`
- **Style**: `solid`
- **Glow**: `shadow-blur: 18`, `shadow-color: '#3B82F6'`, `shadow-opacity: 0.95`.
- **Z-Index**: `35` (Paints on top of all other edges).

---

## 4. Continuous Flow Animation Loop

Executed within `GraphCanvas.jsx`:

```javascript
useEffect(() => {
  let offset = 0;
  const loop = () => {
    const cy = cyRef.current;
    if (cy) {
      offset = (offset + 0.5) % 24;
      // Animate dash offset backwards to simulate forward current flow
      cy.edges('.suspicious-edge').style('line-dash-offset', -offset);
    }
    animFrameRef.current = requestAnimationFrame(loop);
  };
  animFrameRef.current = requestAnimationFrame(loop);
  return () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };
}, []);
```
