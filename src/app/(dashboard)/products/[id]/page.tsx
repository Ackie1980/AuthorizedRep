'use client'

import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, FileText } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

const statusColors = {
  draft: 'bg-gray-500',
  under_review: 'bg-yellow-500',
  registered: 'bg-green-500',
  discontinued: 'bg-red-500',
} as const

const deviceTypeLabels = {
  MD: 'Medical Device',
  IVD: 'In Vitro Diagnostic',
} as const

const regulationLabels = {
  MDR: 'MDR (EU 2017/745)',
  IVDR: 'IVDR (EU 2017/746)',
  MDD: 'MDD (93/42/EEC)',
  IVDD: 'IVDD (98/79/EC)',
} as const

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const { data: product, isLoading, error } = trpc.product.byId.useQuery(
    { id: productId },
    { enabled: !!productId }
  )

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-destructive mb-4">
              {error?.message || 'Product not found'}
            </p>
            <Link href="/products">
              <Button variant="outline">Back to Products</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
        <Link href={`/products/${productId}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Product
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                <CardDescription className="mt-2">
                  {product.manufacturer.name}
                </CardDescription>
              </div>
              <Badge className={statusColors[product.status as keyof typeof statusColors]}>
                {product.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  UDI-DI
                </h3>
                <p className="text-sm">{product.udiDi || 'Not specified'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Device Type
                </h3>
                <p className="text-sm">
                  {product.deviceType
                    ? deviceTypeLabels[product.deviceType as keyof typeof deviceTypeLabels]
                    : 'Not specified'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Classification
                </h3>
                <p className="text-sm">
                  {product.classification
                    ? `Class ${product.classification}`
                    : 'Not specified'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Applicable Regulation
                </h3>
                <p className="text-sm">
                  {product.applicableRegulation
                    ? regulationLabels[product.applicableRegulation as keyof typeof regulationLabels]
                    : 'Not specified'}
                </p>
              </div>
            </div>

            {product.intendedPurpose && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Intended Purpose
                </h3>
                <p className="text-sm whitespace-pre-wrap">
                  {product.intendedPurpose}
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Created
                </h3>
                <p className="text-sm">
                  {new Date(product.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Last Updated
                </h3>
                <p className="text-sm">
                  {new Date(product.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documents</CardTitle>
            <CardDescription>
              Technical documentation for this product
            </CardDescription>
          </CardHeader>
          <CardContent>
            {product.documents && product.documents.length > 0 ? (
              <div className="space-y-2">
                {product.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.documentType} • {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{doc.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No documents uploaded yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
