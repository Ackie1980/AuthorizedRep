import { z } from 'zod';

// Input schema for forms (accepts strings)
export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be less than 255 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  category: z
    .string()
    .min(1, 'Category is required'),
  price: z
    .string()
    .min(1, 'Price is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number with up to 2 decimal places'),
  stockQuantity: z
    .string()
    .min(1, 'Stock quantity is required')
    .regex(/^\d+$/, 'Stock quantity must be a valid integer'),
  sku: z
    .string()
    .min(1, 'SKU is required')
    .max(100, 'SKU must be less than 100 characters')
    .regex(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED'], {
    required_error: 'Status is required',
  }),
  specifications: z
    .record(z.string())
    .optional()
    .default({}),
  tags: z
    .array(z.string())
    .optional()
    .default([]),
});

// API schema (transforms to numbers for database)
export const productSchema = productFormSchema.extend({
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number')
    .transform((val) => parseFloat(val))
    .refine((val) => val > 0, 'Price must be greater than 0'),
  stockQuantity: z
    .string()
    .regex(/^\d+$/, 'Stock quantity must be a valid integer')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 0, 'Stock quantity must be 0 or greater'),
});

export const productUpdateSchema = productFormSchema.partial();

export type ProductFormInput = z.infer<typeof productFormSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type ProductUpdateData = z.infer<typeof productUpdateSchema>;
