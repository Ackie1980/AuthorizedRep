import { z } from 'zod'
import { router, protectedProcedure } from '../index'
import { TRPCError } from '@trpc/server'
import { deleteFile } from '@/server/services/file-storage'
import { isQBDStaff } from '@/server/auth/permissions'
import { Prisma } from '@prisma/client'

const documentStatusEnum = z.enum([
  'pending_review',
  'under_review',
  'needs_revision',
  'approved',
  'rejected',
])

const documentTypeEnum = z.enum([
  'DoC',
  'IFU',
  'Label',
  'TechnicalDoc',
  'Certificate',
])

export const documentRouter = router({
  /**
   * List documents for a product
   * - Customers can see their own products' documents
   * - QBD staff can see all documents
   */
  listByProduct: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx

      // Get product to check access
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.productId },
        include: { manufacturer: true },
      })

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        })
      }

      // Check access control
      const isQbdStaff = isQBDStaff(user.role)

      const isOwnProduct =
        user.role === 'customer' &&
        user.manufacturerId === product.manufacturerId

      if (!isQbdStaff && !isOwnProduct) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to these documents',
        })
      }

      // Fetch documents
      const documents = await ctx.prisma.document.findMany({
        where: { productId: input.productId },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return documents
    }),

  /**
   * Get single document by ID
   * - Customers can see their own products' documents
   * - QBD staff can see all documents
   */
  byId: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx

      const document = await ctx.prisma.document.findUnique({
        where: { id: input.id },
        include: {
          product: {
            include: {
              manufacturer: true,
            },
          },
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          versions: {
            orderBy: { versionNumber: 'desc' },
          },
        },
      })

      if (!document) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document not found',
        })
      }

      // Check access control
      const isQbdStaff = isQBDStaff(user.role)

      const isOwnProduct =
        user.role === 'customer' &&
        user.manufacturerId === document.product.manufacturerId

      if (!isQbdStaff && !isOwnProduct) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this document',
        })
      }

      return document
    }),

  /**
   * Create document record (after file upload)
   * - Customers can create documents for their own products
   * - QBD staff can create documents for any product
   */
  create: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        documentType: documentTypeEnum,
        name: z.string().min(1),
        version: z.string().optional(),
        fileUrl: z.string(),
        fileSize: z.number().int().positive(),
        mimeType: z.string(),
        metadata: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx

      // Get product to check access
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.productId },
      })

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        })
      }

      // Check access control
      const isQbdStaff = isQBDStaff(user.role)

      const isOwnProduct =
        user.role === 'customer' && user.manufacturerId === product.manufacturerId

      if (!isQbdStaff && !isOwnProduct) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot upload documents to this product',
        })
      }

      // Create document
      const document = await ctx.prisma.document.create({
        data: {
          productId: input.productId,
          documentType: input.documentType,
          name: input.name,
          version: input.version,
          fileUrl: input.fileUrl,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          status: 'pending_review',
          uploadedById: user.id,
          metadata: (input.metadata || {}) as Prisma.InputJsonValue,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          entityType: 'document',
          entityId: document.id,
          action: 'create',
          userId: user.id,
          newValues: {
            name: document.name,
            documentType: document.documentType,
            status: document.status,
          },
        },
      })

      return document
    }),

  /**
   * Update document status (review workflow)
   * - Only QBD staff can update document status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: documentStatusEnum,
        reviewNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx

      // Only QBD staff can review documents
      const isQbdStaff = isQBDStaff(user.role)

      if (!isQbdStaff) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only QBD staff can review documents',
        })
      }

      // Get existing document
      const existingDocument = await ctx.prisma.document.findUnique({
        where: { id: input.id },
      })

      if (!existingDocument) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document not found',
        })
      }

      // Update document
      const document = await ctx.prisma.document.update({
        where: { id: input.id },
        data: {
          status: input.status,
          reviewNotes: input.reviewNotes,
          reviewedById: user.id,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          entityType: 'document',
          entityId: document.id,
          action: 'status_change',
          userId: user.id,
          oldValues: {
            status: existingDocument.status,
            reviewNotes: existingDocument.reviewNotes,
          },
          newValues: {
            status: document.status,
            reviewNotes: document.reviewNotes,
          },
        },
      })

      return document
    }),

  /**
   * Delete document
   * - Customers can delete their own pending documents
   * - QBD staff can delete any document
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx

      const document = await ctx.prisma.document.findUnique({
        where: { id: input.id },
        include: {
          product: true,
        },
      })

      if (!document) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document not found',
        })
      }

      // Check access control
      const isQbdStaff = isQBDStaff(user.role)

      const isOwnDocument =
        user.role === 'customer' &&
        user.manufacturerId === document.product.manufacturerId &&
        document.status === 'pending_review'

      if (!isQbdStaff && !isOwnDocument) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot delete this document',
        })
      }

      // Delete file from disk
      try {
        await deleteFile(document.fileUrl)
      } catch (error) {
        console.error('Failed to delete file from disk:', error)
        // Continue with database deletion even if file deletion fails
      }

      // Delete document from database
      await ctx.prisma.document.delete({
        where: { id: input.id },
      })

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          entityType: 'document',
          entityId: document.id,
          action: 'delete',
          userId: user.id,
          oldValues: {
            name: document.name,
            documentType: document.documentType,
            status: document.status,
          },
        },
      })

      return { success: true }
    }),
})
