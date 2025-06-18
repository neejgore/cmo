'use client'

import React from 'react'
import InsightCard from './InsightCard'
import { useQuery } from '@tanstack/react-query'

interface Insight {
  id: string
  title: string
  summary: string
  source: string
  confidence: number
  data: any
  category: 'trends'
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

  const trendsArray = Array.isArray(data?.trends) ? data.trends : [];
  const insights: Insight[] = trendsArray.map((trend: any, i: number) => ({
    id: `${trend.keyword}-${trend.timestamp || i}`,
    title: `Trend: ${trend.keyword}`,
    summary: `Interest: ${trend.interest} at ${trend.timestamp ? new Date(trend.timestamp).toLocaleDateString() : ''}`,
    source: 'Google Trends',
    confidence: 0.8,
    data: trend,
    category: 'trends',
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {insights.map((insight) => (
        <InsightCard key={insight.id} {...insight} />
      ))}
    </div>
  )
} 