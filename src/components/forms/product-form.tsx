'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  udiDi: z.string().max(100).optional().or(z.literal('')),
  deviceType: z.enum(['MD', 'IVD']).optional(),
  classification: z.enum(['I', 'IIa', 'IIb', 'III', 'A', 'B', 'C', 'D']).optional(),
  applicableRegulation: z.enum(['MDR', 'IVDR', 'MDD', 'IVDD']).optional(),
  intendedPurpose: z.string().optional().or(z.literal('')),
  status: z.enum(['draft', 'under_review', 'registered', 'discontinued']).optional(),
})

export type ProductFormData = z.infer<typeof productFormSchema>

interface ProductFormProps {
  defaultValues?: Partial<ProductFormData>
  onSubmit: (data: ProductFormData) => void
  isLoading?: boolean
  submitLabel?: string
  showStatusField?: boolean
}

export function ProductForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Product',
  showStatusField = false,
}: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      udiDi: '',
      deviceType: undefined,
      classification: undefined,
      applicableRegulation: undefined,
      intendedPurpose: '',
      status: undefined,
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter product name"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                The official name of the medical device
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="udiDi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UDI-DI</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter UDI-DI"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Unique Device Identifier - Device Identifier
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="deviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Device Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MD">Medical Device (MD)</SelectItem>
                    <SelectItem value="IVD">In Vitro Diagnostic (IVD)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Type of medical device
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="classification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Classification</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="I">Class I</SelectItem>
                    <SelectItem value="IIa">Class IIa</SelectItem>
                    <SelectItem value="IIb">Class IIb</SelectItem>
                    <SelectItem value="III">Class III</SelectItem>
                    <SelectItem value="A">Class A</SelectItem>
                    <SelectItem value="B">Class B</SelectItem>
                    <SelectItem value="C">Class C</SelectItem>
                    <SelectItem value="D">Class D</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Risk classification
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applicableRegulation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Applicable Regulation</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select regulation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MDR">MDR (EU 2017/745)</SelectItem>
                    <SelectItem value="IVDR">IVDR (EU 2017/746)</SelectItem>
                    <SelectItem value="MDD">MDD (93/42/EEC)</SelectItem>
                    <SelectItem value="IVDD">IVDD (98/79/EC)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Applicable EU regulation
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {showStatusField && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="registered">Registered</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Current product status
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="intendedPurpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intended Purpose</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the intended purpose of the device..."
                  className="min-h-[120px]"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                The intended use and clinical benefit of the device
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
