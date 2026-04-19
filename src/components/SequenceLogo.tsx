import { useMemo } from 'react'

interface SequenceLogoProps {
  sequences: string[]
  title?: string
  maxWidth?: number
  height?: number
}

// Nucleotide colors (colorblind-friendly, not red/green)
const NUC_COLORS: Record<string, string> = {
  A: '#1ABC9C',  // teal
  U: '#E67E22',  // orange
  G: '#F1C40F',  // yellow
  C: '#1B4F72',  // navy
  T: '#E67E22',  // same as U
}

const NUCS = ['A', 'U', 'G', 'C']

function computePWM(sequences: string[], seqLen: number) {
  const positions: Array<Record<string, number>> = []

  for (let pos = 0; pos < seqLen; pos++) {
    const counts: Record<string, number> = { A: 0, U: 0, G: 0, C: 0 }
    let total = 0
    for (const seq of sequences) {
      const nuc = seq[pos]?.toUpperCase().replace('T', 'U')
      if (nuc && counts[nuc] !== undefined) {
        counts[nuc]++
        total++
      }
    }
    if (total === 0) {
      positions.push({ A: 0.25, U: 0.25, G: 0.25, C: 0.25 })
    } else {
      const freqs: Record<string, number> = {}
      for (const n of NUCS) {
        freqs[n] = counts[n] / total
      }
      positions.push(freqs)
    }
  }
  return positions
}

export default function SequenceLogo({ sequences, title, maxWidth = 400, height = 120 }: SequenceLogoProps) {
  const seqLen = useMemo(() => {
    if (sequences.length === 0) return 0
    return Math.min(...sequences.map(s => s.length))
  }, [sequences])

  const pwm = useMemo(() => {
    if (sequences.length === 0 || seqLen === 0) return []
    return computePWM(sequences, seqLen)
  }, [sequences, seqLen])

  if (sequences.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-400 text-sm" style={{ height }}>
        No sequences to display
      </div>
    )
  }

  const colW = Math.floor(maxWidth / seqLen)
  const svgW = colW * seqLen
  const letterH = height - 24 // reserve bottom for position numbers

  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-gray-600 mb-2">{title}</h3>}
      <div className="bg-white rounded-lg border border-gray-100 p-3 overflow-x-auto">
        <svg width={svgW} height={height} style={{ display: 'block' }}>
          {pwm.map((pos, i) => {
            const x = i * colW

            // Sort nucleotides by frequency ascending (smallest at bottom)
            const sorted = NUCS.map(n => ({ n, f: pos[n] as number }))
              .filter(d => d.f > 0.001)
              .sort((a, b) => a.f - b.f)

            let yOffset = letterH
            return (
              <g key={i}>
                {sorted.map(({ n, f }) => {
                  const h = f * letterH
                  yOffset -= h
                  const y = yOffset
                  return (
                    <text
                      key={n}
                      x={x + colW / 2}
                      y={y + h}
                      textAnchor="middle"
                      fontSize={Math.max(8, h - 1)}
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill={NUC_COLORS[n] || '#666'}
                      transform={`scale(1, ${h / Math.max(1, h)})`}
                      style={{ transformOrigin: `${x + colW / 2}px ${y}px` }}
                    >
                      {n}
                    </text>
                  )
                })}
                {/* Position label */}
                <text
                  x={x + colW / 2}
                  y={height - 4}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#999"
                  fontFamily="IBM Plex Sans"
                >
                  {i + 1}
                </text>
              </g>
            )
          })}
          {/* Y-axis label */}
          <text
            x={-letterH / 2}
            y={10}
            textAnchor="middle"
            fontSize={9}
            fill="#999"
            transform="rotate(-90)"
            fontFamily="IBM Plex Sans"
          >
            freq
          </text>
        </svg>
        <p className="text-xs text-gray-400 mt-1">n={sequences.length} sequences</p>
      </div>
    </div>
  )
}
