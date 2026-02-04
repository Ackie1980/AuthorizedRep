'use client'

import { trpc } from '@/lib/trpc'
import { User } from '@/types'
import { StatsCard } from './stats-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, FileText, Award, Building2, AlertCircle, TrendingUp } from 'lucide-react'
import { isQBDStaff } from '@/server/auth/permissions'

interface DashboardContentProps {
  user: User
}

export function DashboardContent({ user }: DashboardContentProps) {
  const isStaff = isQBDStaff(user.role)

  // Fetch product stats
  const { data: productStats, isLoading: loadingProducts } = trpc.product.stats.useQuery()

  // Fetch manufacturer stats (QBD staff only)
  const { data: manufacturerStats, isLoading: loadingManufacturers } = trpc.manufacturer.stats.useQuery(
    undefined,
    { enabled: isStaff }
  )

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.name || user.email}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isStaff
            ? "Here's an overview of the system activity"
            : "Here's an overview of your products and documents"}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Products Stats */}
        {loadingProducts ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ) : (
          <StatsCard
            title="Total Products"
            value={productStats?.total || 0}
            description={`${productStats?.registered || 0} registered, ${productStats?.draft || 0} draft`}
            icon={Package}
            variant="primary"
          />
        )}

        {/* Documents Stats (Placeholder) */}
        <StatsCard
          title="Documents"
          value="12"
          description="3 pending review"
          icon={FileText}
          variant="warning"
        />

        {/* Certificates Stats (Placeholder) */}
        <StatsCard
          title="Certificates"
          value="8"
          description="2 expiring soon"
          icon={Award}
          variant="success"
        />

        {/* Manufacturers Stats (QBD Staff Only) */}
        {isStaff && (
          loadingManufacturers ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ) : (
            <StatsCard
              title="Manufacturers"
              value={manufacturerStats?.total || 0}
              description={`${manufacturerStats?.active || 0} active`}
              icon={Building2}
              variant="default"
            />
          )
        )}

        {/* Under Review Stats (replace manufacturers for customers) */}
        {!isStaff && (
          <StatsCard
            title="Under Review"
            value={productStats?.underReview || 0}
            description="Products being reviewed"
            icon={TrendingUp}
            variant="default"
          />
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
            <CardDescription>
              Latest products added to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentProducts isStaff={isStaff} manufacturerId={user.manufacturerId} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>
              Product status breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductStatusBreakdown stats={productStats} loading={loadingProducts} />
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {!loadingProducts && productStats && productStats.underReview > 0 && (
        <Card className="border-yellow-500/20 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-900 dark:text-yellow-100">
              <AlertCircle className="h-5 w-5 mr-2" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              You have {productStats.underReview} product{productStats.underReview !== 1 ? 's' : ''} under review.
              {isStaff
                ? ' Please review them as soon as possible.'
                : ' We will notify you once the review is complete.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function RecentProducts({ isStaff, manufacturerId }: { isStaff: boolean; manufacturerId: string | null }) {
  const { data, isLoading } = trpc.product.list.useQuery({
    page: 1,
    limit: 5,
    manufacturerId: !isStaff && manufacturerId ? manufacturerId : undefined,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (!data?.products.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No products yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data.products.map((product) => (
        <div key={product.id} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-medium text-sm">{product.name}</p>
            <p className="text-xs text-muted-foreground">
              {isStaff && product.manufacturer && `${product.manufacturer.name} • `}
              {product.deviceType || 'No device type'}
            </p>
          </div>
          <div className="flex items-center">
            <StatusBadge status={product.status} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ProductStatusBreakdown({
  stats,
  loading
}: {
  stats: { total: number; draft: number; underReview: number; registered: number } | undefined
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No products to display</p>
      </div>
    )
  }

  const statusItems = [
    { label: 'Draft', value: stats.draft, color: 'bg-gray-500' },
    { label: 'Under Review', value: stats.underReview, color: 'bg-yellow-500' },
    { label: 'Registered', value: stats.registered, color: 'bg-green-500' },
    { label: 'Total', value: stats.total, color: 'bg-blue-500' },
  ]

  return (
    <div className="space-y-4">
      {statusItems.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${item.color} transition-all`}
              style={{ width: `${(item.value / stats.total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    under_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    registered: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    discontinued: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  }

  const labels: Record<string, string> = {
    draft: 'Draft',
    under_review: 'Under Review',
    registered: 'Registered',
    discontinued: 'Discontinued',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        variants[status] || variants.draft
      }`}
    >
      {labels[status] || status}
    </span>
  )
}
