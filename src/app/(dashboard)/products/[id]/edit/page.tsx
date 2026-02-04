'use client'

import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { toast } from '@/hooks/use-toast'
import { ProductForm, type ProductFormData } from '@/components/forms/product-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const utils = trpc.useUtils()

  const { data: product, isLoading, error } = trpc.product.byId.useQuery(
    { id: productId },
    { enabled: !!productId }
  )

  const updateProduct = trpc.product.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      })
      utils.product.byId.invalidate({ id: productId })
      utils.product.list.invalidate()
      router.push(`/products/${productId}`)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (data: ProductFormData) => {
    updateProduct.mutate({
      id: productId,
      name: data.name,
      udiDi: data.udiDi || null,
      deviceType: data.deviceType || null,
      classification: data.classification || null,
      applicableRegulation: data.applicableRegulation || null,
      intendedPurpose: data.intendedPurpose || null,
      status: data.status,
    })
  }

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
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <Link href={`/products/${productId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
          <CardDescription>
            Update the details of {product.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            defaultValues={{
              name: product.name,
              udiDi: product.udiDi || '',
              deviceType: (product.deviceType as 'MD' | 'IVD' | undefined) || undefined,
              classification: (product.classification as 'I' | 'IIa' | 'IIb' | 'III' | 'A' | 'B' | 'C' | 'D' | undefined) || undefined,
              applicableRegulation: (product.applicableRegulation as 'MDR' | 'IVDR' | 'MDD' | 'IVDD' | undefined) || undefined,
              intendedPurpose: product.intendedPurpose || '',
              status: product.status as 'draft' | 'under_review' | 'registered' | 'discontinued' | undefined,
            }}
            onSubmit={handleSubmit}
            isLoading={updateProduct.isPending}
            submitLabel="Update Product"
            showStatusField={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
