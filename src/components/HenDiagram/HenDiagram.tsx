import type { OverviewData, Timepoint } from '../../types'
import TissueCallout from './TissueCallout'

interface HenDiagramProps {
  data: OverviewData
  activeTimepoint?: Timepoint
}

// Simplified hen body path (viewBox relative, single hen centered around ~200,260)
// Head at top, body below, tail to right, legs at bottom
function HenBody({ x = 0, y = 0, scale = 1, label }: {
  x?: number; y?: number; scale?: number; label: string
}) {
  const s = scale
  // Hen silhouette as a series of path segments, centered around (0,0)
  const bodyPath = `
    M ${x + 10 * s} ${y - 100 * s}
    C ${x + 30 * s} ${y - 130 * s}, ${x + 60 * s} ${y - 140 * s}, ${x + 70 * s} ${y - 120 * s}
    C ${x + 80 * s} ${y - 100 * s}, ${x + 65 * s} ${y - 85 * s}, ${x + 55 * s} ${y - 80 * s}
    C ${x + 80 * s} ${y - 75 * s}, ${x + 100 * s} ${y - 60 * s}, ${x + 110 * s} ${y - 30 * s}
    C ${x + 120 * s} ${y}, ${x + 115 * s} ${y + 40 * s}, ${x + 100 * s} ${y + 60 * s}
    C ${x + 85 * s} ${y + 80 * s}, ${x + 60 * s} ${y + 90 * s}, ${x + 30 * s} ${y + 88 * s}
    C ${x + 10 * s} ${y + 88 * s}, ${x - 20 * s} ${y + 85 * s}, ${x - 40 * s} ${y + 70 * s}
    C ${x - 60 * s} ${y + 55 * s}, ${x - 65 * s} ${y + 30 * s}, ${x - 60 * s} ${y}
    C ${x - 55 * s} ${y - 30 * s}, ${x - 40 * s} ${y - 55 * s}, ${x - 20 * s} ${y - 70 * s}
    C ${x} ${y - 85 * s}, ${x} ${y - 95 * s}, ${x + 10 * s} ${y - 100 * s}
    Z
  `

  // Head
  const headPath = `
    M ${x + 30 * s} ${y - 125 * s}
    C ${x + 35 * s} ${y - 160 * s}, ${x + 65 * s} ${y - 175 * s}, ${x + 80 * s} ${y - 165 * s}
    C ${x + 95 * s} ${y - 155 * s}, ${x + 95 * s} ${y - 140 * s}, ${x + 85 * s} ${y - 128 * s}
    C ${x + 75 * s} ${y - 116 * s}, ${x + 55 * s} ${y - 113 * s}, ${x + 40 * s} ${y - 118 * s}
    C ${x + 30 * s} ${y - 122 * s}, ${x + 28 * s} ${y - 122 * s}, ${x + 30 * s} ${y - 125 * s}
    Z
  `

  // Tail
  const tailPath = `
    M ${x + 100 * s} ${y + 40 * s}
    C ${x + 130 * s} ${y + 20 * s}, ${x + 155 * s} ${y}, ${x + 145 * s} ${y - 20 * s}
    C ${x + 135 * s} ${y - 10 * s}, ${x + 115 * s} ${y + 10 * s}, ${x + 105 * s} ${y + 35 * s}
    Z
  `

  // Comb
  const combPath = `
    M ${x + 60 * s} ${y - 170 * s}
    C ${x + 62 * s} ${y - 188 * s}, ${x + 68 * s} ${y - 188 * s}, ${x + 70 * s} ${y - 170 * s}
    M ${x + 70 * s} ${y - 170 * s}
    C ${x + 72 * s} ${y - 185 * s}, ${x + 78 * s} ${y - 185 * s}, ${x + 80 * s} ${y - 168 * s}
    M ${x + 80 * s} ${y - 168 * s}
    C ${x + 82 * s} ${y - 182 * s}, ${x + 87 * s} ${y - 180 * s}, ${x + 88 * s} ${y - 165 * s}
  `

  // Legs
  const leg1 = `M ${x + 10 * s} ${y + 88 * s} L ${x + 5 * s} ${y + 130 * s} L ${x - 15 * s} ${y + 135 * s} M ${x + 5 * s} ${y + 130 * s} L ${x + 20 * s} ${y + 135 * s}`
  const leg2 = `M ${x + 35 * s} ${y + 88 * s} L ${x + 30 * s} ${y + 130 * s} L ${x + 10 * s} ${y + 135 * s} M ${x + 30 * s} ${y + 130 * s} L ${x + 45 * s} ${y + 135 * s}`

  // Wing
  const wingPath = `
    M ${x + 15 * s} ${y - 20 * s}
    C ${x + 40 * s} ${y - 35 * s}, ${x + 75 * s} ${y - 25 * s}, ${x + 80 * s} ${y + 10 * s}
    C ${x + 75 * s} ${y + 30 * s}, ${x + 50 * s} ${y + 45 * s}, ${x + 20 * s} ${y + 40 * s}
    C ${x + 10 * s} ${y + 20 * s}, ${x + 5 * s} ${y}, ${x + 15 * s} ${y - 20 * s}
    Z
  `

  return (
    <g>
      {/* Body */}
      <path d={bodyPath} fill="#F5E6C8" stroke="#C9956A" strokeWidth={2} />
      {/* Wing overlay */}
      <path d={wingPath} fill="#E8D0A0" stroke="#C9956A" strokeWidth={1.5} opacity={0.6} />
      {/* Head */}
      <path d={headPath} fill="#F5E6C8" stroke="#C9956A" strokeWidth={2} />
      {/* Comb */}
      <path d={combPath} fill="none" stroke="#E74C3C" strokeWidth={3} strokeLinecap="round" />
      {/* Tail */}
      <path d={tailPath} fill="#E8D0A0" stroke="#C9956A" strokeWidth={1.5} />
      {/* Legs */}
      <path d={leg1} fill="none" stroke="#C9956A" strokeWidth={3} strokeLinecap="round" />
      <path d={leg2} fill="none" stroke="#C9956A" strokeWidth={3} strokeLinecap="round" />
      {/* Eye */}
      <circle cx={x + 72 * s} cy={y - 148 * s} r={3 * s} fill="#2C3E50" />
      <circle cx={x + 73 * s} cy={y - 149 * s} r={1 * s} fill="white" />
      {/* Beak */}
      <path d={`M ${x + 90 * s} ${y - 152 * s} L ${x + 105 * s} ${y - 148 * s} L ${x + 90 * s} ${y - 144 * s} Z`}
        fill="#F39C12" />
      {/* Age label */}
      <text x={x + 30 * s} y={y + 155 * s} textAnchor="middle" fontSize={12}
        fontFamily="IBM Plex Sans" fontWeight="600" fill="#2C3E50">
        {label}
      </text>
    </g>
  )
}

export default function HenDiagram({ data, activeTimepoint = '16w' }: HenDiagramProps) {
  const { hpoCallouts } = data

  // Layout: two hens side by side in a 900×460 viewBox
  // Left hen: 16w (pre-laying) at center (200, 260)
  // Right hen: 35w (peak-laying) at center (650, 260)

  const HEN_16W = { x: 200, y: 270 }
  const HEN_35W = { x: 650, y: 270 }

  // Tissue overlay positions (relative to hen body center)
  const tissues16w = {
    Hypothalamus: { dx: 40, dy: -165, rx: 20, ry: 12 },
    Pituitary:    { dx: 40, dy: -148, rx: 14, ry: 9 },
    Ovary:        { dx: 10, dy: 20,   rx: 35, ry: 28 },
  }
  const tissues35w = {
    Hypothalamus: { dx: 40, dy: -165, rx: 20, ry: 12 },
    Pituitary:    { dx: 40, dy: -148, rx: 14, ry: 9 },
    Ovary:        { dx: 10, dy: 20,   rx: 42, ry: 34 }, // Larger ovary at 35w
  }

  const tissueColors = {
    Hypothalamus: '#7D3C98',
    Pituitary:    '#2E86C1',
    Ovary:        '#D4AC0D',
  }

  // Follicle circles in ovary region
  const follicles16w = [
    { dx: 0, dy: 15, r: 10 },
    { dx: 18, dy: 5, r: 7 },
    { dx: -15, dy: 10, r: 6 },
  ]
  const follicles35w = [
    { dx: 0, dy: 10, r: 14 },
    { dx: 22, dy: 0, r: 10 },
    { dx: -20, dy: 8, r: 8 },
    { dx: 10, dy: -15, r: 7 },
    { dx: -8, dy: -12, r: 6 },
  ]

  // Callout card positions (cx, cy = top-left of card)
  const callouts16w = {
    Hypothalamus: { cx: 20, cy: 40 },
    Pituitary:    { cx: 20, cy: 165 },
    Ovary:        { cx: 20, cy: 295 },
  }
  const callouts35w = {
    Hypothalamus: { cx: 730, cy: 40 },
    Pituitary:    { cx: 730, cy: 165 },
    Ovary:        { cx: 730, cy: 295 },
  }

  const tissueKeys = ['Hypothalamus', 'Pituitary', 'Ovary'] as const

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="0 0 900 460"
        className="w-full"
        style={{ maxHeight: 460, minWidth: 700 }}
      >
        {/* Background */}
        <rect width="900" height="460" fill="#F8FAFB" rx={12} />

        {/* Section labels */}
        <text x="200" y="30" textAnchor="middle" fontSize={13} fontWeight="600"
          fill="#1B4F72" fontFamily="Source Serif 4">
          16 weeks (Pre-laying)
        </text>
        <text x="650" y="30" textAnchor="middle" fontSize={13} fontWeight="600"
          fill="#1B4F72" fontFamily="Source Serif 4">
          35 weeks (Peak-laying)
        </text>

        {/* Divider */}
        <line x1="450" y1="20" x2="450" y2="440" stroke="#E0E0E0" strokeWidth={1} strokeDasharray="4 4" />

        {/* 16w Hen */}
        <HenBody x={HEN_16W.x} y={HEN_16W.y} scale={1} label="" />

        {/* 16w Tissue overlays */}
        {tissueKeys.map(tissue => {
          const t = tissues16w[tissue]
          const color = tissueColors[tissue]
          return (
            <ellipse
              key={tissue}
              cx={HEN_16W.x + t.dx}
              cy={HEN_16W.y + t.dy}
              rx={t.rx}
              ry={t.ry}
              fill={color}
              opacity={0.45}
              stroke={color}
              strokeWidth={1.5}
            />
          )
        })}

        {/* 16w Ovary follicles */}
        {follicles16w.map((f, i) => (
          <circle
            key={i}
            cx={HEN_16W.x + tissues16w.Ovary.dx + f.dx}
            cy={HEN_16W.y + tissues16w.Ovary.dy + f.dy}
            r={f.r}
            fill="#F9E79F"
            stroke="#D4AC0D"
            strokeWidth={1}
            opacity={0.9}
          />
        ))}

        {/* 35w Hen */}
        <HenBody x={HEN_35W.x} y={HEN_35W.y} scale={1} label="" />

        {/* 35w Tissue overlays */}
        {tissueKeys.map(tissue => {
          const t = tissues35w[tissue]
          const color = tissueColors[tissue]
          return (
            <ellipse
              key={tissue}
              cx={HEN_35W.x + t.dx}
              cy={HEN_35W.y + t.dy}
              rx={t.rx}
              ry={t.ry}
              fill={color}
              opacity={0.45}
              stroke={color}
              strokeWidth={1.5}
            />
          )
        })}

        {/* 35w Ovary follicles */}
        {follicles35w.map((f, i) => (
          <circle
            key={i}
            cx={HEN_35W.x + tissues35w.Ovary.dx + f.dx}
            cy={HEN_35W.y + tissues35w.Ovary.dy + f.dy}
            r={f.r}
            fill="#F9E79F"
            stroke="#D4AC0D"
            strokeWidth={1}
            opacity={0.9}
          />
        ))}

        {/* 16w Callout cards */}
        {tissueKeys.map(tissue => {
          const t = tissues16w[tissue]
          const card = callouts16w[tissue]
          const color = tissueColors[tissue]
          return (
            <TissueCallout
              key={tissue}
              x1={HEN_16W.x + t.dx}
              y1={HEN_16W.y + t.dy}
              cx={card.cx}
              cy={card.cy}
              tissue={tissue}
              color={color}
              data16w={hpoCallouts[tissue]['16w']}
              data35w={hpoCallouts[tissue]['35w']}
              timepoint="16w"
            />
          )
        })}

        {/* 35w Callout cards */}
        {tissueKeys.map(tissue => {
          const t = tissues35w[tissue]
          const card = callouts35w[tissue]
          const color = tissueColors[tissue]
          return (
            <TissueCallout
              key={tissue}
              x1={HEN_35W.x + t.dx}
              y1={HEN_35W.y + t.dy}
              cx={card.cx}
              cy={card.cy}
              tissue={tissue}
              color={color}
              data16w={hpoCallouts[tissue]['16w']}
              data35w={hpoCallouts[tissue]['35w']}
              timepoint="35w"
            />
          )
        })}

        {/* Tissue legend */}
        <g transform="translate(375, 410)">
          {tissueKeys.map((tissue, i) => (
            <g key={tissue} transform={`translate(${i * 80}, 0)`}>
              <circle cx={6} cy={6} r={5} fill={tissueColors[tissue]} opacity={0.7} />
              <text x={14} y={10} fontSize={10} fill="#555" fontFamily="IBM Plex Sans">{tissue}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
