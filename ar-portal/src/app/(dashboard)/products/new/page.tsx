'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/forms/product-form';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { ProductFormInput } from '@/lib/validations/product';

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ProductFormInput) => {
    try {
      setIsLoading(true);

      // Note: The ProductForm schema doesn't match the API schema
      // We need to transform the data to match the API expectations
      const apiData = {
        name: data.name,
        // We need manufacturerId - this should come from session or be selected
        manufacturerId: 'temp-manufacturer-id', // TODO: Get from session or form
        udiDi: data.sku, // Map SKU to UDI-DI for now
        deviceType: null,
        classification: data.category, // Map category to classification
        applicableRegulation: null,
        intendedPurpose: data.description,
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
      }

      const product = await response.json();

      toast({
        title: 'Success',
        description: 'Product created successfully',
      });

      // Redirect to product detail page
      router.push(`/products/${product.id}`);
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create product',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Create Product"
        description="Add a new medical device product to the system"
      />

      <Card>
        <CardContent className="pt-6">
          <ProductForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Create Product"
          />
        </CardContent>
      </Card>
    </div>
  );
}
