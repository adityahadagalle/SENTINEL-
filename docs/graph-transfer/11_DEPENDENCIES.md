# SENTINEL Graph Dependencies & Package Manifest

## 1. Production NPM Dependencies

From [`frontend/package.json`](file:///frontend/package.json):

```json
{
  "dependencies": {
    "cytoscape": "^3.28.1",
    "cytoscape-dagre": "^4.0.1",
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.2",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1"
  }
}
```

---

## 2. Dev Dependencies & Build Tools

```json
{
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "vite": "^5.1.4"
  }
}
```

---

## 3. Installation Command

```bash
npm install cytoscape cytoscape-dagre lucide-react clsx tailwind-merge
```
