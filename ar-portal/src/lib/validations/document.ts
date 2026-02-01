import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
];

export const documentUploadSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  category: z
    .string()
    .min(1, 'Category is required'),
  productId: z
    .string()
    .uuid('Invalid product ID')
    .optional()
    .nullable(),
  file: z
    .custom<File>()
    .refine((file) => file instanceof File, 'File is required')
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    )
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      'File type not supported. Accepted types: PDF, Word, Excel, Text, and Images'
    ),
  tags: z
    .array(z.string())
    .optional()
    .default([]),
  metadata: z
    .record(z.string())
    .optional()
    .default({}),
});

export const documentUpdateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  category: z
    .string()
    .min(1, 'Category is required')
    .optional(),
  productId: z
    .string()
    .uuid('Invalid product ID')
    .optional()
    .nullable(),
  tags: z
    .array(z.string())
    .optional(),
  metadata: z
    .record(z.string())
    .optional(),
});

export type DocumentUploadData = z.infer<typeof documentUploadSchema>;
export type DocumentUpdateData = z.infer<typeof documentUpdateSchema>;
