'use client'

import { Badge } from '@/components/ui/badge'
import { ProductStatus } from '@/types/enums'
import { cn } from '@/lib/utils'

interface ProductStatusBadgeProps {
  status: ProductStatus
  className?: string
}

const statusConfig = {
  [ProductStatus.DRAFT]: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-800 border-gray-300',
  },
  [ProductStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  [ProductStatus.REGISTERED]: {
    label: 'Registered',
    className: 'bg-green-100 text-green-800 border-green-300',
  },
  [ProductStatus.DISCONTINUED]: {
    label: 'Discontinued',
    className: 'bg-red-100 text-red-800 border-red-300',
  },
}

export function ProductStatusBadge({ status, className }: ProductStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
