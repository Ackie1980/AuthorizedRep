'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ProductStatus, DocumentStatus } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';

interface DashboardStats {
  totalProducts: number;
  productsByStatus: Record<ProductStatus, number>;
  totalDocuments: number;
  documentsPendingReview: number;
  recentProducts: Array<{
    id: string;
    name: string;
    status: ProductStatus;
    createdAt: string;
    manufacturer: {
      id: string;
      name: string;
    };
    _count: {
      documents: number;
    };
  }>;
  recentDocuments: Array<{
    id: string;
    name: string;
    documentType: string;
    status: DocumentStatus;
    createdAt: string;
    product: {
      id: string;
      name: string;
    };
    uploadedBy: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}


function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getStatusVariant(status: ProductStatus | DocumentStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === ProductStatus.DRAFT || status === DocumentStatus.PENDING_REVIEW) {
    return 'secondary';
  }
  if (status === ProductStatus.REJECTED || status === DocumentStatus.NEEDS_REVISION) {
    return 'destructive';
  }
  if (status === ProductStatus.REGISTERED || status === DocumentStatus.APPROVED) {
    return 'default';
  }
  return 'outline';
}

function formatStatusLabel(status: string): string {
  return status.split('_').map(word =>
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ');
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/dashboard/stats');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!stats) {
    return <ErrorMessage message="No data available" />;
  }

  // Extract first name from full name
  const firstName = session?.user?.name?.split(' ')[0] || 'User';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your products and documents.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documentsPendingReview}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Documents awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              {Object.entries(stats.productsByStatus).slice(0, 3).map(([status, count]) => (
                <div key={status} className="flex justify-between">
                  <span className="text-muted-foreground">{formatStatusLabel(status)}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
            <CardDescription>Your latest product entries</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="block hover:bg-accent rounded-lg p-3 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <p className="font-medium text-sm leading-none">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.manufacturer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product._count.documents} document{product._count.documents !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={getStatusVariant(product.status)} className="text-xs">
                          {formatStatusLabel(product.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(product.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Latest document uploads</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentDocuments.map((document) => (
                  <Link
                    key={document.id}
                    href={`/documents/${document.id}`}
                    className="block hover:bg-accent rounded-lg p-3 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <p className="font-medium text-sm leading-none">
                          {document.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {document.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          By {document.uploadedBy.firstName} {document.uploadedBy.lastName}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={getStatusVariant(document.status)} className="text-xs">
                          {formatStatusLabel(document.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(document.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
