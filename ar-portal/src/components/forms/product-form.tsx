'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productFormSchema, type ProductFormInput } from '@/lib/validations/product';
import { FormField } from './form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProductFormProps {
  defaultValues?: Partial<ProductFormInput>;
  onSubmit: (data: ProductFormInput) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

const categories = [
  { value: 'CLASS_I', label: 'Class I' },
  { value: 'CLASS_IIA', label: 'Class IIa' },
  { value: 'CLASS_IIB', label: 'Class IIb' },
  { value: 'CLASS_III', label: 'Class III' },
];

const statuses = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'DISCONTINUED', label: 'Discontinued' },
];

export function ProductForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Product',
}: ProductFormProps) {
  const methods = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues || {
      name: '',
      description: '',
      category: '',
      price: '',
      stockQuantity: '',
      sku: '',
      status: 'ACTIVE',
      specifications: {},
      tags: [],
    },
  });

  const handleSubmit = async (data: ProductFormInput) => {
    await onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField name="name" label="Product Name" required>
            <Input placeholder="Enter product name" />
          </FormField>

          <FormField name="sku" label="SKU" required>
            <Input placeholder="PROD-001" />
          </FormField>

          <FormField name="category" label="Category" required className="md:col-span-2">
            <Select
              onValueChange={(value) => methods.setValue('category', value)}
              defaultValue={defaultValues?.category}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            name="description"
            label="Description"
            required
            className="md:col-span-2"
          >
            <Textarea
              placeholder="Enter product description"
              rows={4}
            />
          </FormField>

          <FormField name="price" label="Price" required>
            <Input type="text" placeholder="0.00" />
          </FormField>

          <FormField name="stockQuantity" label="Stock Quantity" required>
            <Input type="text" placeholder="0" />
          </FormField>

          <FormField name="status" label="Status" required>
            <Select
              onValueChange={(value) => methods.setValue('status', value as any)}
              defaultValue={defaultValues?.status || 'ACTIVE'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => methods.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
