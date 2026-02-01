'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/tables/data-table';
import { columns, type Product } from './columns';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { EmptyState } from '@/components/ui/empty-state';
import { useSession } from 'next-auth/react';

export default function ProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/products');

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const canCreateProduct = session?.user?.role && ['EC_REP_ASSISTANT', 'EC_REP_EXPERT', 'EC_REP_MANAGER', 'ADMIN'].includes(session.user.role);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Products"
          description="Manage medical device products and registrations"
        />
        <ErrorMessage message={error} />
      </div>
    );
  }

  const filterColumns = [
    {
      id: 'status',
      title: 'Status',
      options: [
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Under Review', value: 'UNDER_REVIEW' },
        { label: 'Needs Revision', value: 'NEEDS_REVISION' },
        { label: 'Ready for Submission', value: 'READY_FOR_SUBMISSION' },
        { label: 'Submitted', value: 'SUBMITTED' },
        { label: 'Registered', value: 'REGISTERED' },
        { label: 'Rejected', value: 'REJECTED' },
        { label: 'Discontinued', value: 'DISCONTINUED' },
      ],
    },
    {
      id: 'deviceType',
      title: 'Device Type',
      options: [
        { label: 'IVD', value: 'IVD' },
        { label: 'MD', value: 'MD' },
      ],
    },
    {
      id: 'classification',
      title: 'Classification',
      options: [
        { label: 'Class I', value: 'CLASS_I' },
        { label: 'Class IIa', value: 'CLASS_IIA' },
        { label: 'Class IIb', value: 'CLASS_IIB' },
        { label: 'Class III', value: 'CLASS_III' },
        { label: 'Class A', value: 'CLASS_A' },
        { label: 'Class B', value: 'CLASS_B' },
        { label: 'Class C', value: 'CLASS_C' },
        { label: 'Class D', value: 'CLASS_D' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Products"
          description="Manage medical device products and registrations"
        />
        {canCreateProduct && (
          <Link href="/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Product
            </Button>
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Get started by creating your first product."
          action={
            canCreateProduct
              ? {
                  label: 'Create Product',
                  onClick: () => window.location.href = '/products/new',
                }
              : undefined
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={products}
          searchKey="name"
          searchPlaceholder="Search products..."
          filterColumns={filterColumns}
        />
      )}
    </div>
  );
}
