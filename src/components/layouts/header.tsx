'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserNav } from './user-nav'
import type { User } from '@/types'

interface HeaderProps {
  user: User
  onMenuClick: () => void
}

export function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex-1" />

        <UserNav user={user} />
      </div>
    </header>
  )
}
