'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Brand Insights', href: '/dashboard/insights' },
  { name: 'Social Signals', href: '/dashboard/social' },
  { name: 'Market Trends', href: '/dashboard/trends' },
  { name: 'Competitor Analysis', href: '/dashboard/competitors' },
  { name: 'Settings', href: '/dashboard/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow">
      <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
} 