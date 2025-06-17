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
  category: 'social' | 'industry' | 'analytics' | 'email'
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
    cacheTime: 1000 * 60 * 30, // 30 minutes
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

  const insights: Insight[] = [
    ...(data.social.tiktokTrends || []).map((trend: any) => ({
      id: trend.id,
      title: `TikTok Trend: ${trend.title}`,
      summary: `Trending with ${trend.views} views`,
      source: 'TikTok',
      confidence: 0.8,
      data: trend,
      category: 'social',
    })),
    ...(data.social.metaAds || []).map((ad: any) => ({
      id: ad.id,
      title: `Meta Ad: ${ad.advertiser}`,
      summary: `Active on ${ad.platform}`,
      source: 'Meta',
      confidence: 0.9,
      data: ad,
      category: 'social',
    })),
    ...(data.industry.appleUpdates || []).map((update: any) => ({
      id: update.id,
      title: `Apple Update: ${update.title}`,
      summary: update.content.substring(0, 100),
      source: 'Apple Developer News',
      confidence: 0.95,
      data: update,
      category: 'industry',
    })),
    ...(data.analytics.trafficData ? [{
      id: 'traffic',
      title: 'Traffic Analysis',
      summary: `${data.analytics.trafficData.totalVisits.toLocaleString()} total visits`,
      source: 'SimilarWeb',
      confidence: 0.9,
      data: data.analytics.trafficData,
      category: 'analytics',
    }] : []),
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {insights.map((insight) => (
        <InsightCard key={insight.id} {...insight} />
      ))}
    </div>
  )
} 