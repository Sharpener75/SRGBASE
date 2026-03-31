# PingBase

A public bioinformatics database for small non-coding RNA (sncRNA) sequencing data from laying hen (*Gallus gallus*) research. Built as a full-stack scientific data visualization platform, modeled after academic portals such as piRBase.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/pingbase.git
cd pingbase
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
| Data | Static mock JSON (gallus gallus naming conventions) |

---

## Project Structure

```
pingbase/
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

All data is mock-generated using *Gallus gallus* naming conventions (e.g. `gga-miR-21-5p`, `gga-piR-014823`, `gga-tsRNA-Gly-GCC-5p`). The dataset covers:

- **4,821** total sncRNAs
- **12** sequencing libraries (3 tissues × 2 timepoints × 2 replicates)
- **200** differential expression records (~15% up-regulated, ~12% down-regulated)
- **150** predicted target gene entries

---

## Contact

**PI:** Ping Xiao
**Email:** ping.xiao@swfu.edu.cn
**Institution:** Southwest Forestry University
