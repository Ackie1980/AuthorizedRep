import { z } from 'zod'
import { router, protectedProcedure } from '../index'
import { TRPCError } from '@trpc/server'
import { isQBDStaff } from '@/server/auth/permissions'
import { Prisma } from '@prisma/client'

const productCreateSchema = z.object({
  manufacturerId: z.string().uuid(),
  name: z.string().min(1).max(255),
  udiDi: z.string().max(100).optional(),
  deviceType: z.enum(['MD', 'IVD']).optional(),
  classification: z.enum(['I', 'IIa', 'IIb', 'III', 'A', 'B', 'C', 'D']).optional(),
  applicableRegulation: z.enum(['MDR', 'IVDR', 'MDD', 'IVDD']).optional(),
  intendedPurpose: z.string().optional(),
})

const productUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  udiDi: z.string().max(100).optional().nullable(),
  deviceType: z.enum(['MD', 'IVD']).optional().nullable(),
  classification: z.enum(['I', 'IIa', 'IIb', 'III', 'A', 'B', 'C', 'D']).optional().nullable(),
  applicableRegulation: z.enum(['MDR', 'IVDR', 'MDD', 'IVDD']).optional().nullable(),
  intendedPurpose: z.string().optional().nullable(),
  status: z.enum(['draft', 'under_review', 'registered', 'discontinued']).optional(),
})

export const productRouter = router({
  // List products with filters and pagination
  list: protectedProcedure
    .input(z.object({
      manufacturerId: z.string().uuid().optional(),
      status: z.enum(['draft', 'under_review', 'registered', 'discontinued']).optional(),
      deviceType: z.enum(['MD', 'IVD']).optional(),
      search: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx
      const { manufacturerId, status, deviceType, search, page, limit } = input

      // Build where clause
      const where: Prisma.ProductWhereInput = {}

      // Customers can only see their own manufacturer's products
      if (!isQBDStaff(user.role)) {
        if (!user.manufacturerId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'No manufacturer assigned' })
        }
        where.manufacturerId = user.manufacturerId
      } else if (manufacturerId) {
        where.manufacturerId = manufacturerId
      }

      if (status) where.status = status
      if (deviceType) where.deviceType = deviceType
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { udiDi: { contains: search, mode: 'insensitive' } },
        ]
      }

      const [products, total] = await Promise.all([
        ctx.prisma.product.findMany({
          where,
          include: {
            manufacturer: { select: { id: true, name: true } },
            _count: { select: { documents: true } },
          },
          orderBy: { updatedAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.prisma.product.count({ where }),
      ])

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    }),

  // Get single product by ID
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx

      const product = await ctx.prisma.product.findUnique({
        where: { id: input.id },
        include: {
          manufacturer: true,
          documents: {
            orderBy: { createdAt: 'desc' },
          },
          submissions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!product) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' })
      }

      // Check access
      if (!isQBDStaff(user.role) && product.manufacturerId !== user.manufacturerId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      return product
    }),

  // Create product
  create: protectedProcedure
    .input(productCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx

      // Verify manufacturer access
      if (!isQBDStaff(user.role)) {
        if (input.manufacturerId !== user.manufacturerId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot create product for another manufacturer' })
        }
      }

      const product = await ctx.prisma.product.create({
        data: {
          ...input,
          status: 'draft',
        },
        include: {
          manufacturer: { select: { id: true, name: true } },
        },
      })

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          entityType: 'product',
          entityId: product.id,
          action: 'create',
          userId: user.id,
          newValues: product,
        },
      })

      return product
    }),

  // Update product
  update: protectedProcedure
    .input(productUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { id, ...data } = input

      const existing = await ctx.prisma.product.findUnique({ where: { id } })
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' })
      }

      // Check access
      if (!isQBDStaff(user.role) && existing.manufacturerId !== user.manufacturerId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const product = await ctx.prisma.product.update({
        where: { id },
        data,
        include: {
          manufacturer: { select: { id: true, name: true } },
        },
      })

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          entityType: 'product',
          entityId: product.id,
          action: 'update',
          userId: user.id,
          oldValues: existing,
          newValues: product,
        },
      })

      return product
    }),

  // Archive product (soft delete by setting status)
  archive: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx

      const existing = await ctx.prisma.product.findUnique({ where: { id: input.id } })
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' })
      }

      // Only QBD staff can archive
      if (!isQBDStaff(user.role)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only QBD staff can archive products' })
      }

      const product = await ctx.prisma.product.update({
        where: { id: input.id },
        data: { status: 'discontinued' },
      })

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          entityType: 'product',
          entityId: product.id,
          action: 'archive',
          userId: user.id,
          oldValues: existing,
          newValues: product,
        },
      })

      return product
    }),

  // Get stats for dashboard
  stats: protectedProcedure
    .query(async ({ ctx }) => {
      const { user } = ctx

      const where: Prisma.ProductWhereInput = {}
      if (!isQBDStaff(user.role) && user.manufacturerId) {
        where.manufacturerId = user.manufacturerId
      }

      const [total, draft, underReview, registered] = await Promise.all([
        ctx.prisma.product.count({ where }),
        ctx.prisma.product.count({ where: { ...where, status: 'draft' } }),
        ctx.prisma.product.count({ where: { ...where, status: 'under_review' } }),
        ctx.prisma.product.count({ where: { ...where, status: 'registered' } }),
      ])

      return { total, draft, underReview, registered }
    }),
})
