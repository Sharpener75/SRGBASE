import { Link } from 'react-router-dom'
import HenDiagram from '../components/HenDiagram/HenDiagram'
import PieChart from '../components/PieChart'
import overviewData from '../data/overview.json'
import type { OverviewData } from '../types'

const overview = overviewData as OverviewData

const PIE_COLORS = ['#1B4F72', '#1ABC9C', '#E67E22', '#8E44AD']
const TYPE_KEYS = ['miRNA', 'piRNA', 'tsRNA', 'rsRNA'] as const

// Read distribution percentages from overview data
const typeTotals = TYPE_KEYS.map(type => ({
  name: type,
  value: overview.readDistribution[type],
}))

const statCards = [
  {
    value: overview.totalSncRNAs.toLocaleString(),
    label: 'Total sncRNAs Detected',
    icon: '🧬',
    color: 'border-primary',
  },
  {
    value: overview.tissues.toString(),
    label: 'Tissues Profiled',
    icon: '🔬',
    color: 'border-accent',
  },
  {
    value: overview.timepoints.toString(),
    label: 'Time Points',
    icon: '⏱',
    color: 'border-ovary',
  },
  {
    value: overview.libraries.toString(),
    label: 'Sequencing Libraries',
    icon: '📊',
    color: 'border-hypo',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-[#1a6090] to-[#0e8f76] text-white py-16 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="max-w-2xl">
            <span className="inline-block bg-white/15 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
              Gallus gallus sncRNA Database
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold leading-tight mb-4">
              Decoding Small Non-Coding RNAs in the Laying Hen Reproductive Axis
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-8">
              PingBase provides a comprehensive atlas of small non-coding RNA expression across the hypothalamus–pituitary–ovary (HPO) axis in <em>Gallus gallus</em> at key reproductive stages.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/categories/miRNA"
                className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                Browse sncRNAs
              </Link>
              <Link
                to="/diff-expression/miRNA"
                className="bg-white/15 hover:bg-white/25 text-white px-5 py-2.5 rounded-lg font-medium transition-colors border border-white/30"
              >
                View Differential Expression
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stat Cards */}
      <section className="max-w-screen-xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(card => (
            <div
              key={card.label}
              className={`bg-white rounded-xl shadow-sm border-l-4 ${card.color} p-5 flex items-center gap-4`}
            >
              <span className="text-3xl">{card.icon}</span>
              <div>
                <p className="text-2xl font-bold font-heading text-primary">{card.value}</p>
                <p className="text-xs text-gray-500 font-body mt-0.5">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Site description */}
      <section className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-3xl">
          <h2 className="font-heading text-2xl font-semibold text-primary mb-4">About PingBase</h2>
          <p className="text-text-main leading-relaxed mb-3">
            This database presents comprehensive profiling of four classes of small non-coding RNAs — miRNA, piRNA, tsRNA, and rsRNA — across three critical tissues of the hypothalamus–pituitary–ovary (HPO) axis in laying hens (<em>Gallus gallus</em>).
          </p>
          <p className="text-text-main leading-relaxed mb-3">
            Samples were collected at two key reproductive stages: pre-laying (16 weeks) and peak-laying (35 weeks), enabling comparative analysis of sncRNA dynamics during the onset of egg production.
          </p>
          <p className="text-text-main leading-relaxed">
            PingBase provides tools for exploring expression profiles, differential regulation, and predicted target gene interactions, supporting research into reproductive biology and epigenetic regulation in avian species.
          </p>
        </div>
      </section>

      {/* HPO Axis Diagram */}
      <section className="max-w-screen-xl mx-auto px-6 pb-16">
        <h2 className="font-heading text-2xl font-semibold text-primary mb-2">
          HPO Axis sncRNA Expression Overview
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Detected sncRNA counts per tissue and time point. Dashed lines indicate callout data cards for each tissue region.
        </p>
        <div className="grid md:grid-cols-[2fr_1fr] gap-4 items-start">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <HenDiagram data={overview} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <PieChart
              data={typeTotals}
              title="sncRNA Type Composition (all tissues & timepoints)"
              colors={PIE_COLORS}
            />
          </div>
        </div>

        {/* Tissue legend */}
        <div className="flex flex-wrap gap-6 mt-4 px-2">
          {[
            { label: 'Hypothalamus', color: '#7D3C98' },
            { label: 'Pituitary', color: '#2E86C1' },
            { label: 'Ovary', color: '#D4AC0D' },
          ].map(t => (
            <div key={t.label} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-3 h-3 rounded-full" style={{ background: t.color }} />
              {t.label}
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm text-gray-600 ml-auto">
            <span className="text-xs text-gray-400">Bar charts show sncRNA count per type</span>
          </div>
        </div>
      </section>
    </div>
  )
}
