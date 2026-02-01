import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

const statusColors: Record<string, string> = {
  // Product statuses
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
  DISCONTINUED: 'bg-red-100 text-red-800 border-red-200',
  DRAFT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800 border-blue-200',
  NEEDS_REVISION: 'bg-orange-100 text-orange-800 border-orange-200',
  READY_FOR_SUBMISSION: 'bg-purple-100 text-purple-800 border-purple-200',
  SUBMITTED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  REGISTERED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',

  // Document statuses
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED_DOC: 'bg-red-100 text-red-800 border-red-200',
  ARCHIVED: 'bg-gray-100 text-gray-800 border-gray-200',

  // Manufacturer statuses
  SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  DISCONTINUED: 'Discontinued',
  DRAFT: 'Draft',
  UNDER_REVIEW: 'Under Review',
  NEEDS_REVISION: 'Needs Revision',
  READY_FOR_SUBMISSION: 'Ready for Submission',
  SUBMITTED: 'Submitted',
  REGISTERED: 'Registered',
  REJECTED: 'Rejected',
  PENDING_REVIEW: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED_DOC: 'Rejected',
  ARCHIVED: 'Archived',
  SUSPENDED: 'Suspended',
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  const label = statusLabels[status] || status;

  return (
    <Badge
      variant={variant || 'outline'}
      className={cn(
        'font-medium',
        !variant && colorClass,
        className
      )}
    >
      {label}
    </Badge>
  );
}
