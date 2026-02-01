import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/auth/session';
import { UserRole, DeviceType, Classification, Regulation, ProductStatus, AuditAction } from '@prisma/client';

// Validation schema for creating a product
const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  manufacturerId: z.string().uuid('Invalid manufacturer ID'),
  udiDi: z.string().max(100).optional().nullable(),
  deviceType: z.nativeEnum(DeviceType).optional().nullable(),
  classification: z.nativeEnum(Classification).optional().nullable(),
  applicableRegulation: z.nativeEnum(Regulation).optional().nullable(),
  intendedPurpose: z.string().optional().nullable(),
});

// Validation schema for query params
const querySchema = z.object({
  manufacturerId: z.string().uuid().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  deviceType: z.nativeEnum(DeviceType).optional(),
  classification: z.nativeEnum(Classification).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * GET /api/products - List products with pagination and filtering
 */
export async function GET(request: NextRequest) {
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = querySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { manufacturerId, status, deviceType, classification, search, page, limit } = validation.data;

    // Build where clause
    const where: any = {};

    // For CUSTOMER role: auto-filter by their manufacturerId
    if (user.role === UserRole.CUSTOMER) {
      if (!user.manufacturerId) {
        return NextResponse.json(
          { error: 'Customer has no associated manufacturer' },
          { status: 400 }
        );
      }
      where.manufacturerId = user.manufacturerId;
    } else if (manufacturerId) {
      // For staff roles: allow filtering by any manufacturerId
      where.manufacturerId = manufacturerId;
    }

    // Apply additional filters
    if (status) {
      where.status = status;
    }
    if (deviceType) {
      where.deviceType = deviceType;
    }
    if (classification) {
      where.classification = classification;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { udiDi: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          manufacturer: {
            select: {
              id: true,
              name: true,
              legalName: true,
            },
          },
          _count: {
            select: {
              documents: true,
              submissions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products - Create a new product
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validation = createProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // For CUSTOMER role: ensure they can only create products for their manufacturer
    if (user.role === UserRole.CUSTOMER) {
      if (!user.manufacturerId) {
        return NextResponse.json(
          { error: 'Customer has no associated manufacturer' },
          { status: 400 }
        );
      }
      if (data.manufacturerId !== user.manufacturerId) {
        return NextResponse.json(
          { error: 'Forbidden: Cannot create products for other manufacturers' },
          { status: 403 }
        );
      }
    }

    // Verify manufacturer exists
    const manufacturer = await db.manufacturer.findUnique({
      where: { id: data.manufacturerId },
    });

    if (!manufacturer) {
      return NextResponse.json(
        { error: 'Manufacturer not found' },
        { status: 404 }
      );
    }

    // Create product
    const product = await db.product.create({
      data: {
        name: data.name,
        manufacturerId: data.manufacturerId,
        udiDi: data.udiDi,
        deviceType: data.deviceType,
        classification: data.classification,
        applicableRegulation: data.applicableRegulation,
        intendedPurpose: data.intendedPurpose,
        status: ProductStatus.DRAFT,
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
        entityId: product.id,
        action: AuditAction.CREATE,
        userId: user.id,
        newValues: product,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
