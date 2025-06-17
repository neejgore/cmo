'use client'

import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <span className="text-blue-600">
            CMO Command
          </span>
        </h1>

        <p className="mt-3 text-2xl">
          Your personalized analytics and insights workspace
        </p>

        <div className="mt-8 w-full max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={e => {
              e.preventDefault();
              const brand = (e.target as any).brand.value.trim();
              const domain = (e.target as any).domain.value.trim();
              if (brand && domain) {
                window.location.href = `/dashboard?brand=${encodeURIComponent(brand)}&domain=${encodeURIComponent(domain)}`;
              }
            }}>
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                  Brand Name
                </label>
                <div className="mt-1">
                  <input
                    id="brand"
                    name="brand"
                    type="text"
                    required
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="BrandX"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                  Brand Domain
                </label>
                <div className="mt-1">
                  <input
                    id="domain"
                    name="domain"
                    type="text"
                    required
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="brandx.com"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Generate Report
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    For CMOs and senior marketers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t">
        <a
          className="flex items-center justify-center gap-2"
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Next.js
        </a>
      </footer>
    </div>
  )
} 