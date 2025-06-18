'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface InsightCardProps {
  title: string
  summary: string
  source: string
  confidence: number
  data: any
  category: 'social' | 'industry' | 'analytics' | 'email' | 'trends'
}

const categoryColors = {
  social: 'bg-blue-50 border-blue-200',
  industry: 'bg-purple-50 border-purple-200',
  analytics: 'bg-green-50 border-green-200',
  email: 'bg-yellow-50 border-yellow-200',
  trends: 'bg-orange-50 border-orange-200',
}

const categoryIcons = {
  social: '👥',
  industry: '📰',
  analytics: '📊',
  email: '📧',
  trends: '📈',
}

export default function InsightCard({
  title,
  summary,
  source,
  confidence,
  data,
  category,
}: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${categoryColors[category]} shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{categoryIcons[category]}</span>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <span className="text-sm text-gray-500">{source}</span>
      </div>
      
      <p className="mt-2 text-gray-600">{summary}</p>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-500">
            {Math.round(confidence * 100)}% confidence
          </span>
        </div>
        
        <button
          onClick={() => console.log('View details:', data)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View Details
        </button>
      </div>
    </motion.div>
  )
} 