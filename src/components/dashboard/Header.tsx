'use client'

import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <span className="text-2xl font-bold text-blue-600">CMO Command</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {session?.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 