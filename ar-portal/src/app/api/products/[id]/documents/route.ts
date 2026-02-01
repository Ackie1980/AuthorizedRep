import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/auth/session';
import { UserRole } from '@prisma/client';

/**
 * GET /api/products/[id]/documents - List documents for a product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user;

    // Check permission
    if (!hasPermission(user.role, 'documents:read')) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id: productId } = params;

    // Fetch product to check tenant access
    const product = await db.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        manufacturerId: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check tenant access - CUSTOMER can only see their own manufacturer's products
    if (user.role === UserRole.CUSTOMER) {
      if (!user.manufacturerId || product.manufacturerId !== user.manufacturerId) {
        return NextResponse.json(
          { error: 'Forbidden: Cannot access documents from other manufacturers' },
          { status: 403 }
        );
      }
    }

    // Fetch documents with uploader and reviewer info
    const documents = await db.document.findMany({
      where: { productId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        versions: {
          select: {
            id: true,
            versionNumber: true,
            changesSummary: true,
            createdAt: true,
            createdBy: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            versionNumber: 'desc',
          },
        },
      },
      orderBy: [
        { documentType: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      productId,
      documents,
      total: documents.length,
    });
  } catch (error) {
    console.error('Error fetching product documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
