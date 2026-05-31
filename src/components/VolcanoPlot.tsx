import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import type { DEVolcanoRecord } from '../types'

interface VolcanoPlotProps {
  data: DEVolcanoRecord[]
  hoveredId: string | null
  onHoverChange: (id: string | null) => void
}

interface TooltipState {
  x: number
  y: number
  record: DEVolcanoRecord
}

const UP_COLOR = '#E67E22'
const DOWN_COLOR = '#2980B9'
const NS_COLOR = '#BDC3C7'
const MARGIN = { top: 20, right: 30, bottom: 50, left: 60 }

// Fixed significance criterion — matches the precomputed Up/Down regulation in the data.
const LOG2FC_THRESHOLD = 0.585
const PVALUE_THRESHOLD = 0.05

function getColor(d: DEVolcanoRecord) {
  if (d.regulation === 'Up') return UP_COLOR
  if (d.regulation === 'Down') return DOWN_COLOR
  return NS_COLOR
}

export default function VolcanoPlot({
  data, hoveredId, onHoverChange
}: VolcanoPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [dims, setDims] = useState({ width: 500, height: 380 })

  // Observe container size
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect
      setDims({ width: Math.max(300, width), height: 380 })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Effect 1: Full render (redraws on data/threshold change)
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const W = dims.width - MARGIN.left - MARGIN.right
    const H = dims.height - MARGIN.top - MARGIN.bottom

    const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)

    const xExtent = d3.extent(data, d => d.log2FC) as [number, number]
    const yExtent = [0, d3.max(data, d => -Math.log10(d.pvalue))! * 1.1] as [number, number]
    const xPad = Math.max(Math.abs(xExtent[0]), Math.abs(xExtent[1])) * 1.1

    const xScale = d3.scaleLinear().domain([-xPad, xPad]).range([0, W])
    const yScale = d3.scaleLinear().domain(yExtent).range([H, 0])

    // Grid lines
    g.append('g').attr('class', 'grid')
      .call(d3.axisLeft(yScale).tickSize(-W).tickFormat(() => ''))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', '#f0f0f0'))

    // Axes
    g.append('g').attr('transform', `translate(0,${H})`)
      .call(d3.axisBottom(xScale).ticks(8).tickFormat(d => `${(d as number) > 0 ? '+' : ''}${(d as number).toFixed(1)}`))
      .call(g => g.selectAll('text').style('font-size', '11px').style('font-family', 'IBM Plex Sans'))

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(6))
      .call(g => g.selectAll('text').style('font-size', '11px').style('font-family', 'IBM Plex Sans'))

    // Axis labels
    g.append('text')
      .attr('x', W / 2).attr('y', H + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px').style('font-family', 'IBM Plex Sans').style('fill', '#555')
      .text('Log₂ Fold Change')

    g.append('text')
      .attr('x', -H / 2).attr('y', -45)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .style('font-size', '12px').style('font-family', 'IBM Plex Sans').style('fill', '#555')
      .text('-log₁₀(p-value)')

    // Fixed reference lines at the significance criterion
    const pvalueLine = -Math.log10(PVALUE_THRESHOLD)
    g.append('line')
      .attr('x1', 0).attr('x2', W)
      .attr('y1', yScale(pvalueLine)).attr('y2', yScale(pvalueLine))
      .attr('stroke', '#999').attr('stroke-dasharray', '4 3').attr('stroke-width', 1)
    g.append('text')
      .attr('x', 4).attr('y', yScale(pvalueLine) - 4)
      .style('font-size', '9px').style('font-family', 'IBM Plex Sans').style('fill', '#999')
      .text(`p = ${PVALUE_THRESHOLD}`)

    g.append('line')
      .attr('x1', xScale(-LOG2FC_THRESHOLD)).attr('x2', xScale(-LOG2FC_THRESHOLD))
      .attr('y1', 0).attr('y2', H)
      .attr('stroke', '#999').attr('stroke-dasharray', '4 3').attr('stroke-width', 1)

    g.append('line')
      .attr('x1', xScale(LOG2FC_THRESHOLD)).attr('x2', xScale(LOG2FC_THRESHOLD))
      .attr('y1', 0).attr('y2', H)
      .attr('stroke', '#999').attr('stroke-dasharray', '4 3').attr('stroke-width', 1)
    g.append('text')
      .attr('x', xScale(LOG2FC_THRESHOLD) + 3).attr('y', H - 4)
      .style('font-size', '9px').style('font-family', 'IBM Plex Sans').style('fill', '#999')
      .text(`|Log₂FC| = ${LOG2FC_THRESHOLD}`)

    // Legend
    const legData = [
      { label: 'Up-regulated', color: UP_COLOR },
      { label: 'Down-regulated', color: DOWN_COLOR },
      { label: 'Not significant', color: NS_COLOR },
    ]
    const leg = g.append('g').attr('transform', `translate(${W - 130}, 5)`)
    legData.forEach((d, i) => {
      leg.append('circle').attr('cx', 6).attr('cy', i * 18 + 6).attr('r', 4).attr('fill', d.color)
      leg.append('text').attr('x', 14).attr('y', i * 18 + 10)
        .text(d.label).style('font-size', '10px').style('font-family', 'IBM Plex Sans').style('fill', '#555')
    })

    // Data points
    g.append('g').attr('class', 'points')
      .selectAll<SVGCircleElement, DEVolcanoRecord>('circle')
      .data(data, d => d.id)
      .join('circle')
      .attr('class', 'point')
      .attr('data-id', d => d.id)
      .attr('cx', d => xScale(d.log2FC))
      .attr('cy', d => yScale(-Math.log10(d.pvalue)))
      .attr('r', 4)
      .attr('fill', d => getColor(d))
      .attr('opacity', 0.75)
      .attr('stroke', 'none')
      .on('mouseover', function(event: MouseEvent, d: DEVolcanoRecord) {
        const rect = containerRef.current!.getBoundingClientRect()
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          record: d,
        })
        onHoverChange(d.id)
      })
      .on('mouseout', function() {
        setTooltip(null)
        onHoverChange(null)
      })

    // Count labels
    const upCount = data.filter(d => d.regulation === 'Up').length
    const downCount = data.filter(d => d.regulation === 'Down').length

    g.append('text').attr('x', W - 5).attr('y', 15)
      .attr('text-anchor', 'end').style('font-size', '11px').style('fill', UP_COLOR).style('font-family', 'IBM Plex Sans')
      .text(`↑ ${upCount}`)
    g.append('text').attr('x', 5).attr('y', 15)
      .style('font-size', '11px').style('fill', DOWN_COLOR).style('font-family', 'IBM Plex Sans')
      .text(`↓ ${downCount}`)
  }, [data, dims, onHoverChange])

  // Effect 2: Hover-only update (lightweight, no redraw)
  useEffect(() => {
    if (!svgRef.current) return
    d3.select(svgRef.current)
      .selectAll<SVGCircleElement, DEVolcanoRecord>('circle.point')
      .attr('r', d => d.id === hoveredId ? 8 : 4)
      .attr('opacity', d => hoveredId && d.id !== hoveredId ? 0.15 : 0.75)
      .attr('stroke', d => d.id === hoveredId ? '#2C3E50' : 'none')
      .attr('stroke-width', d => d.id === hoveredId ? 2 : 0)
      .filter(d => d.id === hoveredId)
      .raise()
  }, [hoveredId])

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        ref={svgRef}
        width={dims.width}
        height={dims.height}
        style={{ display: 'block' }}
      />
      {/* Tooltip overlay */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs font-body"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            minWidth: 160,
          }}
        >
          <p className="font-semibold text-text-main mb-1">{tooltip.record.id}</p>
          <p>Log₂FC: <span className="font-medium" style={{ color: getColor(tooltip.record) }}>
            {tooltip.record.log2FC > 0 ? '+' : ''}{tooltip.record.log2FC.toFixed(3)}
          </span></p>
          <p>p-value: <span className="font-medium">{tooltip.record.pvalue < 0.001 ? tooltip.record.pvalue.toExponential(2) : tooltip.record.pvalue.toFixed(4)}</span></p>
          <p>Tissue: <span className="font-medium">{tooltip.record.tissue}</span></p>
          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-white text-[10px] ${
            tooltip.record.regulation === 'Up' ? 'bg-up-color' :
            tooltip.record.regulation === 'Down' ? 'bg-down-color' : 'bg-gray-400'
          }`}>
            {tooltip.record.regulation}
          </span>
        </div>
      )}
    </div>
  )
}
