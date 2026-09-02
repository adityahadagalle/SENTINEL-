# SENTINEL Sequential Path Tracing Specification

## 1. Concept & Flow

Path tracing visually demonstrates the forensic money laundering trajectory from initial victim injection, through intermediary mules, to exit terminals in sequential chronological order.

---

## 2. Implementation Logic

Implemented in `GraphCanvas.jsx` (`traceSuspiciousPath`):

```javascript
const traceSuspiciousPath = useCallback(() => {
  const cy = cyRef.current;
  if (!cy || isTracingRef.current) return;
  isTracingRef.current = true;
  setIsTracing(true);

  // 1. Reset existing states
  cy.elements().removeClass('highlighted dimmed traced-edge');

  // 2. Sort edges chronologically by transfer timestamp
  const pathEdges = cy.edges().sort((a, b) =>
    (a.data('time') || '').localeCompare(b.data('time') || '')
  );

  let step = 0;
  const interval = setInterval(() => {
    if (step < pathEdges.length) {
      const edge = pathEdges[step];
      
      // Highlight active transfer flow and connected nodes
      edge.addClass('traced-edge');
      edge.source().addClass('highlighted');
      edge.target().addClass('highlighted');

      // Dim everything not in active step
      cy.elements()
        .not(edge)
        .not(edge.source())
        .not(edge.target())
        .addClass('dimmed');

      // Notify parent timeline
      onHopTraceRef.current?.(step);
      step++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        cy.elements().removeClass('dimmed traced-edge');
        isTracingRef.current = false;
        setIsTracing(false);
      }, 1400);
    }
  }, 450); // 450ms interval per hop
}, []);
```

---

## 3. Visual Styling During Trace

- **Active Edge (`edge.traced-edge`)**:
  - Width: `4.0px`
  - Color: `#3B82F6` (Electric Blue)
  - Glow: `shadow-blur: 18`, `shadow-color: '#3B82F6'`, `shadow-opacity: 0.95`
- **Connected Nodes**: Highlighted with `#3B82F6` border and drop-shadow.
- **Uninvolved Elements**: Dimmed to `opacity: 0.15` (nodes) and `0.08` (edges).
