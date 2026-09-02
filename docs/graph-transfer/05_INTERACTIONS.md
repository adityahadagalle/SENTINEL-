# SENTINEL Graph Interactions & Event Handlers

## 1. Interaction Event Map

| Target | Event | Action Taken | UI Response |
|---|---|---|---|
| **Node** | `tap` (Click) | Selects node, opens Entity Inspector | Dims non-neighborhood elements to `opacity: 0.15`, highlights neighborhood with `#3B82F6` 4px border & drop-shadow. |
| **Node** | `mouseover` (Hover) | Triggers local focus | Dims other elements, adds `hovered-focus` class to node & connected edges, displays floating tooltip card. |
| **Node** | `mouseout` | Clears local focus | Restores default state (unless persistent node selection is active). |
| **Canvas** | `tap` (Background) | Deselects active node | Removes `.highlighted`, `.dimmed`, `.hovered-focus`, closes Entity Inspector, returns ActionPanel to Overview mode. |
| **HUD Button** | Zoom In / Out | `cy.zoom(level * 1.25)` | Scales viewport relative to screen center. |
| **HUD Button** | Fit View | `cy.fit(elements, 40)` | Re-centers and fits entire network with 40px padding. |
| **HUD Button** | Reset Layout | `runLayout(cy, true)` | Re-computes Dagre hierarchical layout with 400ms ease-out animation. |

---

## 2. Neighborhood Highlighting Implementation

In `GraphCanvas.jsx`:

```javascript
cy.on('tap', 'node', (evt) => {
  const node = evt.target;
  const neighborhood = node.neighborhood().add(node);
  cy.elements().removeClass('highlighted dimmed');
  cy.elements().not(neighborhood).addClass('dimmed');
  neighborhood.addClass('highlighted');
  
  const nodeData = {
    id: node.id(),
    status: node.data('status'),
    type: node.data('type'),
    risk_score: node.data('type') === 'mule' ? 98 : node.data('type') === 'victim' ? 25 : 85,
    inflow: '₹80,852',
    outflow: '₹79,235',
    layer: node.data('layer'),
    ...node.data()
  };
  setHoveredNodeData(nodeData);
  onNodeClickRef.current?.(nodeData);
});
```
