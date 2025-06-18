'use client'

import React, { useState } from 'react'
import InsightCard from './InsightCard'
import { useQuery } from '@tanstack/react-query'

// Simple SVG word cloud component
function WordCloud({ queries }: { queries: { query: string; value: number }[] }) {
  // Scale font size by value
  const max = Math.max(...queries.map(q => q.value), 1)
  return (
    <svg width={400} height={120}>
      {queries.map((q, i) => (
        <text
          key={q.query}
          x={30 + i * 70}
          y={60 + (i % 2 === 0 ? -20 : 20)}
          fontSize={16 + (q.value / max) * 24}
          fill="#2563eb"
          style={{ fontWeight: 600 }}
        >
          {q.query}
        </text>
      ))}
    </svg>
  )
}

// Simple line graph component
function LineGraph({ data }: { data: { timestamp: string; interest: number }[] }) {
  if (!data.length) return <div>No data</div>
  // SVG line graph (simple, not responsive)
  const width = 400, height = 120
  const maxInterest = Math.max(...data.map(d => d.interest), 1)
  const minInterest = Math.min(...data.map(d => d.interest), 0)
  const points = data.map((d, i) => [
    (i / (data.length - 1)) * (width - 40) + 20,
    height - 20 - ((d.interest - minInterest) / (maxInterest - minInterest || 1)) * (height - 40)
  ])
  return (
    <svg width={width} height={height}>
      <polyline
        fill="none"
        stroke="#2563eb"
        strokeWidth={2}
        points={points.map(p => p.join(",")).join(" ")}
      />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2} fill="#2563eb" />
      ))}
      {/* X axis */}
      <line x1={20} y1={height-20} x2={width-20} y2={height-20} stroke="#888" />
      {/* Y axis */}
      <line x1={20} y1={20} x2={20} y2={height-20} stroke="#888" />
    </svg>
  )
}

async function fetchInsights(brandName: string, domain: string) {
  const response = await fetch(
    `/api/insights?brand=${encodeURIComponent(brandName)}&domain=${encodeURIComponent(domain)}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch insights')
  }
  return response.json()
}

export default function InsightsGrid({ brandName, domain }: { brandName: string; domain: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['insights', brandName, domain],
    queryFn: () => fetchInsights(brandName, domain),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
  const [selectedState, setSelectedState] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg border bg-gray-50 animate-pulse h-48"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load insights</p>
      </div>
    )
  }

  // Regions (states)
  const regions: { state: string; geoCode: string; value: number }[] = Array.isArray(data?.regions) ? data.regions : []
  const topState = regions.length ? regions.reduce((a, b) => (a.value > b.value ? a : b)) : null
  const stateToShow = selectedState || (topState && topState.geoCode)

  // Trends (filter by state if possible, but Google Trends API for US states is aggregate, not per-state over time)
  // So we just show the overall trend for now
  const trendsArray = Array.isArray(data?.trends) ? data.trends : []

  // Related queries
  const relatedQueries = Array.isArray(data?.relatedQueries) ? data.relatedQueries : []

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold mb-2">Interest Over Time (US)</h3>
        {/* State dropdown (for future per-state trends) */}
        <div className="mb-2">
          <label htmlFor="state-select" className="mr-2">State:</label>
          <select
            id="state-select"
            value={stateToShow || ''}
            onChange={e => setSelectedState(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {regions.map((region: { geoCode: string; state: string }) => (
              <option key={region.geoCode} value={region.geoCode}>{region.state}</option>
            ))}
          </select>
        </div>
        <LineGraph data={trendsArray} />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Top Related Queries (Word Cloud)</h3>
        <WordCloud queries={relatedQueries} />
      </div>
    </div>
  )
} 