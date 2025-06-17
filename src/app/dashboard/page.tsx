'use client'

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import InsightsGrid from '../../components/insights/InsightsGrid';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const dynamic = "force-dynamic";

const queryClient = new QueryClient();

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const brandName = searchParams.get('brand') || '';
  const domain = searchParams.get('domain') || '';

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Brand Insights
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['insights'] })}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Key Insights
            </h2>
            <InsightsGrid brandName={brandName} domain={domain} />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
} 