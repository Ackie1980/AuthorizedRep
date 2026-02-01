'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];

  for (let i = 0; i < segments.length; i++) {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const label = segments[i].charAt(0).toUpperCase() + segments[i].slice(1);
    breadcrumbs.push({ label, href });
  }

  return breadcrumbs;
}

export function Header({ title, user }: HeaderProps) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  // Extract page title from pathname or use provided title
  const pageTitle =
    title ||
    (breadcrumbs.length > 0
      ? breadcrumbs[breadcrumbs.length - 1].label
      : 'Dashboard');

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex flex-col gap-1">
          {/* Breadcrumb */}
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1 text-sm text-gray-500">
              {breadcrumbs.map((crumb, index) => (
                <Fragment key={crumb.href}>
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-gray-900">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="hover:text-gray-900 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </Fragment>
              ))}
            </nav>
          )}

          {/* Page Title */}
          <h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>
        </div>

        {/* User Avatar with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email || ''}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
