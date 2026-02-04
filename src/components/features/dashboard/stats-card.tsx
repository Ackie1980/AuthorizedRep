import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number | string
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  className?: string
}

const variantStyles = {
  default: 'border-border',
  primary: 'border-primary/20 bg-primary/5',
  success: 'border-green-500/20 bg-green-50 dark:bg-green-950/20',
  warning: 'border-yellow-500/20 bg-yellow-50 dark:bg-yellow-950/20',
  danger: 'border-red-500/20 bg-red-50 dark:bg-red-950/20',
}

const iconVariantStyles = {
  default: 'text-muted-foreground',
  primary: 'text-primary',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  danger: 'text-red-600 dark:text-red-400',
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) {
  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn('h-4 w-4', iconVariantStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center text-xs mt-2">
            <span
              className={cn(
                'font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
