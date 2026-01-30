'use client'

import { useState } from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import type { User } from '@/types'

interface DashboardLayoutProps {
  user: User
  children: React.ReactNode
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMenuClick = () => {
    setSidebarOpen(true)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="relative min-h-screen">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={handleSidebarClose} />

      <div className="lg:pl-64">
        <Header user={user} onMenuClick={handleMenuClick} />

        <main className="flex-1">
          <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
