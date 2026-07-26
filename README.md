# SRGBASE

A public bioinformatics database for small non-coding RNA (sncRNA) sequencing data from laying hen (*Gallus gallus*) research. Built as a full-stack scientific data visualization platform, modeled after academic portals such as piRBase.

**Live site:** https://sharpener75.github.io/SRGBASE/

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
git clone https://github.com/Sharpener75/SRGBASE.git
cd SRGBASE
npm install
```

### Launch development server

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

### Build for production

```bash
npm run build
npm run preview
```

---

## Deployment

The site is hosted on **GitHub Pages** at https://sharpener75.github.io/SRGBASE/ and deploys
automatically: any push to `main` triggers `.github/workflows/deploy.yml`, which runs
`npm ci && npm run build` and publishes `dist/`. The build runs `tsc` in strict mode, so a
type error fails the deploy rather than shipping a broken site. Deploys can also be
re-run by hand from the repository's **Actions** tab (*Deploy to GitHub Pages* →
*Run workflow*).

One-time setup, already done: in **Settings → Pages**, the build source is set to
**GitHub Actions**.

### Base path

The site lives at a project path, not a domain root, so `vite.config.ts` sets
`base: '/SRGBASE/'`. This must match the repository name **including its
capitalisation** — GitHub Pages paths are case-sensitive, so `/srgbase/` would 404.

`base` is the single source of truth: `src/App.tsx` passes it to React Router via
`import.meta.env.BASE_URL`, so moving the site means changing one line.

| Destination | `base` value |
|---|---|
| `https://<user>.github.io/SRGBASE/` (current) | `'/SRGBASE/'` |
| Repository renamed | `'/<new-name>/'` |
| Custom domain, or a `<user>.github.io` repo | `'/'` |

For a custom domain, also add a `public/CNAME` file containing the bare domain and
point a DNS `CNAME` record at `<user>.github.io`.

### Deep links

GitHub Pages only serves static files, so a shared or refreshed link such as
`/SRGBASE/diff-expression/miRNA` has no file on disk. `public/404.html` catches those
requests, encodes the path into a query string, and redirects to `index.html`, where a
small inline script restores the real URL before React Router mounts. This keeps clean,
citable URLs instead of falling back to `#`-prefixed ones.

If the site is ever moved to a domain root, set `pathSegmentsToKeep = 0` in
`public/404.html` (it is `1` for a project path).

---

## Features

### Pages

| Page | Route | Description |
|------|-------|-------------|
| **Home** | `/` | Hero section, summary statistics, and interactive hen anatomical diagram |
| **Categories** | `/categories/:subclass` | sncRNA composition by tissue and timepoint with stacked bar and pie charts |
| **Top 50** | `/top50/:subclass` | Top expressed sncRNAs with read counts, sequence logos, and sortable table |
| **Differential Expression** | `/diff-expression/:subclass` | Interactive volcano plot with bidirectional hover linking to data table |
| **Targets** | `/targets/:subclass` | Predicted target genes with binding scores and gene annotations |
| **Raw Data** | `/raw-data` | Sequencing library metadata with links to NCBI SRA accessions |
| **Contact** | `/contact` | PI information and contact form |

### Interactive Components

- **Volcano Plot** — D3.js-powered scatter plot with threshold sliders; hovering a point highlights the corresponding row in the data table and vice versa
- **Hen Anatomical Diagram** — Custom SVG illustration of two laying hens (16-week pre-laying vs. 35-week peak-laying) with tissue overlays and expression callout cards
- **Sequence Logo** — Pure SVG sequence logo computed from position-weight matrix and information content
- **Data Tables** — Sortable, searchable, and paginated; scroll-synced with chart hover state
- **Filter Sidebar** — URL query parameter-based filters for tissue, timepoint, and sncRNA subclass (shareable links)

### sncRNA Types Covered

- miRNA (microRNA)
- piRNA (PIWI-interacting RNA)
- tsRNA (tRNA-derived small RNA)
- rsRNA (rRNA-derived small RNA)

### Tissues

- Hypothalamus
- Pituitary
- Ovary

### Timepoints

- 16 weeks (pre-laying)
- 35 weeks (peak-laying)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Charts | Recharts (bar, pie) + D3.js v7 (volcano plot) |
| Data | Static JSON bundled at build time (no backend) |
| Hosting | GitHub Pages, deployed by GitHub Actions |

---

## Project Structure

```
SRGBASE/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx              # App entry point
    ├── App.tsx               # Router and route definitions
    ├── index.css             # Global styles
    ├── types/
    │   └── index.ts          # All TypeScript interfaces
    ├── utils/
    │   ├── filterUtils.ts    # URL filter state serialization
    │   └── formatters.ts     # Number/scientific notation formatters
    ├── data/
    │   ├── overview.json         # Summary statistics
    │   ├── sncRNA_categories.json # Category distributions
    │   ├── top50.json            # Top expressed sncRNAs
    │   ├── diff_expression.json  # Differential expression records
    │   ├── targets.json          # Predicted target genes
    │   └── raw_data.json         # Sequencing library metadata
    ├── components/
    │   ├── NavBar.tsx            # Sticky navigation with dropdowns
    │   ├── DataTable.tsx         # Generic sortable/searchable table
    │   ├── FilterSidebar.tsx     # Filter controls
    │   ├── LoadingSkeleton.tsx   # Pulse skeleton loaders
    │   ├── StackedBarChart.tsx   # Recharts stacked bar
    │   ├── PieChart.tsx          # Recharts pie chart
    │   ├── SequenceLogo.tsx      # SVG sequence logo
    │   ├── VolcanoPlot.tsx       # D3 volcano plot
    │   └── HenDiagram/
    │       ├── HenDiagram.tsx    # Main SVG illustration
    │       ├── TissueCallout.tsx # SVG callout cards
    │       └── MiniBarChart.tsx  # Small bar charts inside callouts
    └── pages/
        ├── Home.tsx
        ├── Categories.tsx
        ├── Top50.tsx
        ├── DiffExpression.tsx
        ├── Targets.tsx
        ├── RawData.tsx
        └── Contact.tsx
```

---

## Data

The database is built from real sequencing results, converted from the source Excel
workbooks into the JSON in `src/data/` by `scripts/excel_to_json.py` (run from the repo
root; idempotent, so it is safe to re-run when the source data is updated). The dataset
covers:

- **769,306** total sncRNAs
- **18** sequencing libraries (3 tissues × 2 timepoints × 3 replicates)
- **25,080** significant differential expression records (miRNA 88, piRNA 15,934, tsRNA 7,275, rsRNA 1,783)
- **21,566** predicted target gene entries

---

## Contact

**PI:** Ping Xiao
**Email:** ping.xiao@swfu.edu.cn
**Institution:** Southwest Forestry University
