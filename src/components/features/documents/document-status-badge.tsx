import { Badge } from '@/components/ui/badge'
import { DocumentStatus } from '@/types'
import { cn } from '@/lib/utils'

interface DocumentStatusBadgeProps {
  status: DocumentStatus
  className?: string
}

export function DocumentStatusBadge({ status, className }: DocumentStatusBadgeProps) {
  const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
    pending_review: {
      label: 'Pending Review',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    },
    under_review: {
      label: 'Under Review',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    },
    needs_revision: {
      label: 'Needs Revision',
      className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    },
    approved: {
      label: 'Approved',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800',
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800',
    },
  }

  const config = statusConfig[status] || statusConfig.pending_review

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
