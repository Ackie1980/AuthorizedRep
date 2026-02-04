'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductFilters } from '@/components/features/products/product-filters'
import { ProductTable } from '@/components/features/products/product-table'
import { trpc } from '@/lib/trpc'
import { Plus } from 'lucide-react'
import { ProductStatus } from '@/types/enums'

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data, isLoading, error } = trpc.product.list.useQuery({
    search: search || undefined,
    status: statusFilter !== 'all' ? (statusFilter as ProductStatus) : undefined,
    page: 1,
    limit: 50,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your medical device products and registrations
          </p>
        </div>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProductFilters
            search={search}
            onSearchChange={setSearch}
            status={statusFilter}
            onStatusChange={setStatusFilter}
          />

          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-sm text-muted-foreground">Loading products...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-destructive">
                  Error loading products: {error.message}
                </p>
              </div>
            </div>
          ) : (
            <ProductTable products={data?.products || []} />
          )}

          {data && data.pagination.total > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>
                Showing {data.products.length} of {data.pagination.total} products
              </p>
              {data.pagination.totalPages > 1 && (
                <p>
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
