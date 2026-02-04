'use client'

import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { toast } from '@/hooks/use-toast'
import { ProductForm, type ProductFormData } from '@/components/forms/product-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewProductPage() {
  const router = useRouter()
  const utils = trpc.useUtils()

  // Get current user's manufacturer
  const { data: manufacturer } = trpc.manufacturer.current.useQuery()

  const createProduct = trpc.product.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Product created successfully',
      })
      utils.product.list.invalidate()
      router.push('/products')
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (data: ProductFormData) => {
    if (!manufacturer?.id) {
      toast({
        title: 'Error',
        description: 'No manufacturer assigned to your account',
        variant: 'destructive',
      })
      return
    }

    createProduct.mutate({
      manufacturerId: manufacturer.id,
      name: data.name,
      udiDi: data.udiDi || undefined,
      deviceType: data.deviceType,
      classification: data.classification,
      applicableRegulation: data.applicableRegulation,
      intendedPurpose: data.intendedPurpose || undefined,
    })
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <Link href="/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
          <CardDescription>
            Add a new medical device product to your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            onSubmit={handleSubmit}
            isLoading={createProduct.isPending}
            submitLabel="Create Product"
          />
        </CardContent>
      </Card>
    </div>
  )
}
