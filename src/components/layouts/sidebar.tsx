'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, FileText, Award, Building2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { User } from '@/types'

interface SidebarProps {
  user: User
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  roles?: string[]
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    href: '/products',
    icon: Package,
  },
  {
    title: 'Certificates',
    href: '/certificates',
    icon: Award,
  },
  {
    title: 'Manufacturers',
    href: '/manufacturers',
    icon: Building2,
    roles: ['admin', 'ec_rep_manager', 'ec_rep_expert', 'ec_rep_assistant'],
  },
]

function isActiveLink(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/'
  }
  return pathname.startsWith(href)
}

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(user.role)
  })

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-background transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo and close button */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link href="/" className="flex items-center space-x-2" onClick={onClose}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">AR</span>
              </div>
              <span className="text-lg font-semibold">AR Portal</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveLink(pathname, item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer info */}
          <div className="border-t p-4">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground">Logged in as</p>
              <p className="mt-1 text-sm font-medium">{user.name || user.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
