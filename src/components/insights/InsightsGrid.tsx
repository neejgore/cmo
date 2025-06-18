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

// Simple bar chart for top 10 or bottom 10 DMAs
function BarChart({ dmas, title }: { dmas: { dma: string; value: number }[]; title: string }) {
  const max = Math.max(...dmas.map(r => r.value), 1)
  return (
    <div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <svg width={400} height={dmas.length * 18 + 20}>
        {dmas.map((region, i) => (
          <g key={region.dma}>
            <rect
              x={100}
              y={20 + i * 15}
              width={(region.value / max) * 250}
              height={12}
              fill="#2563eb"
              rx={3}
            />
            <text x={95} y={30 + i * 15} fontSize={12} textAnchor="end">{region.dma}</text>
            <text x={110 + (region.value / max) * 250} y={30 + i * 15} fontSize={12} fill="#222">{region.value}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// Multi-series line graph component
const COLORS = ['#2563eb', '#eab308', '#ef4444', '#10b981'];
function MultiLineGraph({ series }: { series: { name: string; data: { timestamp: string; interest: number }[] }[] }) {
  if (!series.length || !series[0].data.length) return <div>No data</div>;
  const width = 400, height = 160;
  const allPoints = series.flatMap(s => s.data);
  const maxInterest = Math.max(...allPoints.map(d => d.interest), 1);
  const minInterest = Math.min(...allPoints.map(d => d.interest), 0);
  const n = series[0].data.length;
  return (
    <div>
      <svg width={width} height={height}>
        {/* Axes */}
        <line x1={40} y1={height-30} x2={width-10} y2={height-30} stroke="#888" />
        <line x1={40} y1={20} x2={40} y2={height-30} stroke="#888" />
        {/* Lines */}
        {series.map((s, idx) => {
          const points = s.data.map((d, i) => [
            40 + (i / (n - 1)) * (width - 60),
            height - 30 - ((d.interest - minInterest) / (maxInterest - minInterest || 1)) * (height - 50)
          ]);
          return (
            <polyline
              key={s.name}
              fill="none"
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={2}
              points={points.map(p => p.join(",")).join(" ")}
            />
          );
        })}
        {/* Dots */}
        {series.map((s, idx) => s.data.map((d, i) => {
          const x = 40 + (i / (n - 1)) * (width - 60);
          const y = height - 30 - ((d.interest - minInterest) / (maxInterest - minInterest || 1)) * (height - 50);
          return <circle key={s.name + i} cx={x} cy={y} r={2} fill={COLORS[idx % COLORS.length]} />;
        }))}
        {/* Y axis labels */}
        <text x={5} y={height-30} fontSize={10} fill="#888">{minInterest}</text>
        <text x={5} y={30} fontSize={10} fill="#888">{maxInterest}</text>
        {/* X axis label */}
        <text x={width/2-30} y={height-5} fontSize={12} fill="#888">Time (last 30 days)</text>
      </svg>
      <div className="flex space-x-4 mt-2">
        {series.map((s, idx) => (
          <div key={s.name} className="flex items-center space-x-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLORS[idx % COLORS.length] }}></span>
            <span className="text-xs text-gray-700">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
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

  const top10DMAs: { dma: string; geoCode: string; value: number }[] = Array.isArray(data?.top10DMAs) ? data.top10DMAs : []
  const bottom10DMAs: { dma: string; geoCode: string; value: number }[] = Array.isArray(data?.bottom10DMAs) ? data.bottom10DMAs : []
  const trendingSearches: { title: string; traffic: string }[] = Array.isArray(data?.trendingSearches) ? data.trendingSearches : []

  const top10States: { state: string; geoCode: string; value: number }[] = Array.isArray(data?.top10States) ? data.top10States : []

  const realTimeTrends = Array.isArray(data?.realTimeTrends) ? data.realTimeTrends : [];

  const trendsSeries = Array.isArray(data?.trendsSeries) ? data.trendsSeries : [];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold mb-2">Interest Over Time (US, Brand vs. Top Competitors)</h3>
        <MultiLineGraph series={trendsSeries} />
      </div>
      <div>
        <BarChart dmas={top10States.map(s => ({ dma: s.state, value: s.value }))} title="Top 10 States by Interest" />
      </div>
      <div>
        <BarChart dmas={top10DMAs} title="Top 10 DMAs by Interest" />
      </div>
      <div>
        <BarChart dmas={bottom10DMAs} title="Bottom 10 DMAs by Interest" />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Real-Time Trends (Category)</h3>
        {realTimeTrends.length > 0 ? (
          <ul className="space-y-2">
            {realTimeTrends.map((story: any, i: number) => (
              <li key={i} className="flex items-center space-x-4 border-b pb-2">
                {story.image && (
                  <img src={story.image} alt="story" className="w-12 h-12 object-cover rounded" />
                )}
                <div className="flex-1">
                  <a href={story.shareUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline">
                    {story.title}
                  </a>
                  {story.entityNames && story.entityNames.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">{story.entityNames.join(', ')}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">No real-time trends found.</div>
        )}
      </div>
    </div>
  )
} 