import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission, isEcRepOrHigher } from '@/lib/auth/session';
import { UserRole, DeviceType, Classification, Regulation, ProductStatus, AuditAction } from '@prisma/client';

// Validation schema for updating a product
const updateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  udiDi: z.string().max(100).optional().nullable(),
  deviceType: z.nativeEnum(DeviceType).optional().nullable(),
  classification: z.nativeEnum(Classification).optional().nullable(),
  applicableRegulation: z.nativeEnum(Regulation).optional().nullable(),
  intendedPurpose: z.string().optional().nullable(),
  status: z.nativeEnum(ProductStatus).optional(),
});

/**
 * GET /api/products/[id] - Get product by ID
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
    if (!hasPermission(user.role, 'products:read')) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Fetch product with related data
    const product = await db.product.findUnique({
      where: { id },
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            legalName: true,
            address: true,
            primaryContact: true,
            services: true,
          },
        },
        documents: {
          select: {
            id: true,
            documentType: true,
            name: true,
            version: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        submissions: {
          select: {
            id: true,
            authority: true,
            status: true,
            registrationNumber: true,
            submittedAt: true,
            registeredAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
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
          { error: 'Forbidden: Cannot access products from other manufacturers' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id] - Update product
 */
export async function PUT(
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
    if (!hasPermission(user.role, 'products:write')) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Parse and validate request body
    const body = await request.json();
    const validation = updateProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Fetch existing product
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check tenant access - CUSTOMER can only update their own manufacturer's products
    if (user.role === UserRole.CUSTOMER) {
      if (!user.manufacturerId || existingProduct.manufacturerId !== user.manufacturerId) {
        return NextResponse.json(
          { error: 'Forbidden: Cannot update products from other manufacturers' },
          { status: 403 }
        );
      }
    }

    // Update product
    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.udiDi !== undefined && { udiDi: data.udiDi }),
        ...(data.deviceType !== undefined && { deviceType: data.deviceType }),
        ...(data.classification !== undefined && { classification: data.classification }),
        ...(data.applicableRegulation !== undefined && { applicableRegulation: data.applicableRegulation }),
        ...(data.intendedPurpose !== undefined && { intendedPurpose: data.intendedPurpose }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            legalName: true,
          },
        },
      },
    });

    // Create audit log with old/new values
    await db.auditLog.create({
      data: {
        entityType: 'Product',
        entityId: id,
        action: AuditAction.UPDATE,
        userId: user.id,
        oldValues: existingProduct,
        newValues: updatedProduct,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id] - Archive product (soft delete)
 */
export async function DELETE(
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

    // Only EC_REP_EXPERT or higher can delete products
    if (!isEcRepOrHigher(user.role) || user.role === UserRole.EC_REP_ASSISTANT) {
      return NextResponse.json(
        { error: 'Forbidden: Requires EC_REP_EXPERT or higher permissions' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Fetch existing product
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Archive product by setting status to DISCONTINUED (soft delete)
    const archivedProduct = await db.product.update({
      where: { id },
      data: {
        status: ProductStatus.DISCONTINUED,
      },
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            legalName: true,
          },
        },
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        entityType: 'Product',
        entityId: id,
        action: AuditAction.DELETE,
        userId: user.id,
        oldValues: existingProduct,
        newValues: archivedProduct,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    return NextResponse.json({
      message: 'Product archived successfully',
      product: archivedProduct,
    });
  } catch (error) {
    console.error('Error archiving product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
