import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/auth/session';
import { UserRole, ProductStatus, DocumentStatus } from '@prisma/client';

/**
 * GET /api/dashboard/stats - Get dashboard statistics
 * Returns counts, grouped data, and recent items
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user;

    // Build where clauses based on user role
    const productWhere: any = {};
    const documentWhere: any = {};

    // For CUSTOMER role: filter by their manufacturerId
    if (user.role === UserRole.CUSTOMER) {
      if (!user.manufacturerId) {
        return NextResponse.json(
          { error: 'Customer has no associated manufacturer' },
          { status: 400 }
        );
      }
      productWhere.manufacturerId = user.manufacturerId;

      // For documents, filter by products belonging to their manufacturer
      documentWhere.product = {
        manufacturerId: user.manufacturerId,
      };
    }

    // Execute all queries in parallel
    const [
      totalProducts,
      productsByStatus,
      totalDocuments,
      documentsPendingReview,
      recentProducts,
      recentDocuments,
    ] = await Promise.all([
      // Total products count
      db.product.count({ where: productWhere }),

      // Products grouped by status
      db.product.groupBy({
        by: ['status'],
        where: productWhere,
        _count: {
          status: true,
        },
      }),

      // Total documents count
      db.document.count({ where: documentWhere }),

      // Documents pending review count
      db.document.count({
        where: {
          ...documentWhere,
          status: DocumentStatus.PENDING_REVIEW,
        },
      }),

      // Recent products (last 5)
      db.product.findMany({
        where: productWhere,
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          manufacturer: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              documents: true,
            },
          },
        },
      }),

      // Recent documents (last 5)
      db.document.findMany({
        where: documentWhere,
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    // Transform productsByStatus into a more usable format
    const statusCounts = productsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<ProductStatus, number>);

    return NextResponse.json({
      totalProducts,
      productsByStatus: statusCounts,
      totalDocuments,
      documentsPendingReview,
      recentProducts,
      recentDocuments,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
