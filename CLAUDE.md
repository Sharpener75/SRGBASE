# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Type-check (tsc) then bundle with Vite
npm run preview    # Serve the production build locally
```

No test runner or linter is configured.

## Architecture

**SRGBASE** is a static single-page React + TypeScript app for visualizing small non-coding RNA (sncRNA) sequencing data from laying hen (*Gallus gallus*) research. There is no backend — all data is static mock JSON in `src/data/`.

### Routing & Pages

`src/App.tsx` defines 8 routes, each mapping to a page in `src/pages/`:

| Route | Page | Purpose |
|---|---|---|
| `/` | Home | Hero stats + interactive hen SVG diagram |
| `/categories` | Categories | Stacked bar & pie charts of sncRNA composition |
| `/top50` | Top50 | Top-expressed sncRNAs + sequence logos |
| `/diff-expression` | DiffExpression | D3 volcano plot + threshold sliders |
| `/targets` | Targets | Predicted target gene table |
| `/raw-data` | RawData | Sequencing library metadata + SRA links |
| `/contact` | Contact | PI contact info |

### Data Flow

- JSON datasets in `src/data/` are imported directly into pages.
- Filters are serialized as URL query params (`?tissue=...&timepoint=...&subclass=...`) via `src/utils/filterUtils.ts`.
- The volcano plot (`VolcanoPlot.tsx`) uses D3 v7 for rendering and shares a `hoveredId` state with the adjacent `DataTable` for bidirectional hover highlighting.

### Key Components

- `DataTable.tsx` — generic sortable, paginated, searchable table
- `FilterSidebar.tsx` — reusable filter controls that sync with URL params
- `VolcanoPlot.tsx` — D3 scatter plot with Log₂FC / adj. p-value threshold sliders
- `SequenceLogo.tsx` — SVG sequence logo computed from a position-weight matrix
- `HenDiagram/` — custom SVG anatomical illustration with interactive callouts

### Styling

Tailwind CSS v3 with custom tokens in `tailwind.config.js`:
- Primary: `#1B4F72` (dark navy), Accent: `#1ABC9C` (teal)
- Fonts: **Source Serif 4** (headings), **IBM Plex Sans** (body) — loaded from Google Fonts in `index.html`
- Up-regulated color: red-ish (`up-color`), Down-regulated: blue-ish (`down-color`)

### Types

All shared TypeScript interfaces live in `src/types/index.ts`. Add new data-shape types here rather than inlining them.

## Working Style

- Share plan and reasoning before making any edits; wait for confirmation.
- Ask clarifying questions rather than guessing at unclear requirements.
