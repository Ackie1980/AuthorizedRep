import { z } from 'zod'
import { router, protectedProcedure } from '../index'
import { TRPCError } from '@trpc/server'
import { isQBDStaff } from '@/server/auth/permissions'
import { Prisma } from '@prisma/client'

export const manufacturerRouter = router({
  // List all manufacturers (QBD staff only)
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(['active', 'inactive']).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx

      if (!isQBDStaff(user.role)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const { search, status, page, limit } = input
      const where: Prisma.ManufacturerWhereInput = {}

      if (status) where.status = status
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { legalName: { contains: search, mode: 'insensitive' } },
        ]
      }

      const [manufacturers, total] = await Promise.all([
        ctx.prisma.manufacturer.findMany({
          where,
          include: {
            _count: { select: { products: true, users: true, certificates: true } },
            assignedEcRep: { select: { id: true, name: true, email: true } },
          },
          orderBy: { name: 'asc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.prisma.manufacturer.count({ where }),
      ])

      return {
        manufacturers,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      }
    }),

  // Get single manufacturer
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx

      const manufacturer = await ctx.prisma.manufacturer.findUnique({
        where: { id: input.id },
        include: {
          assignedEcRep: { select: { id: true, name: true, email: true } },
          _count: { select: { products: true, users: true, certificates: true } },
        },
      })

      if (!manufacturer) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      // Customers can only view their own manufacturer
      if (!isQBDStaff(user.role) && manufacturer.id !== user.manufacturerId) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      return manufacturer
    }),

  // Get current user's manufacturer (for customers)
  current: protectedProcedure
    .query(async ({ ctx }) => {
      const { user } = ctx

      if (!user.manufacturerId) {
        return null
      }

      return ctx.prisma.manufacturer.findUnique({
        where: { id: user.manufacturerId },
        include: {
          assignedEcRep: { select: { id: true, name: true, email: true } },
        },
      })
    }),

  // Stats for dashboard
  stats: protectedProcedure
    .query(async ({ ctx }) => {
      const { user } = ctx

      if (!isQBDStaff(user.role)) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const [total, active] = await Promise.all([
        ctx.prisma.manufacturer.count(),
        ctx.prisma.manufacturer.count({ where: { status: 'active' } }),
      ])

      return { total, active }
    }),
})
