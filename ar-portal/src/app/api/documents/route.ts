import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/auth/session';
import { saveFile, generateUniqueFilename, isAllowedFileType, isValidFileSize } from '@/lib/storage';
import { UserRole, DocumentType, DocumentStatus, AuditAction } from '@prisma/client';

// Validation schema for query params
const querySchema = z.object({
  productId: z.string().uuid().optional(),
  status: z.nativeEnum(DocumentStatus).optional(),
  documentType: z.nativeEnum(DocumentType).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * GET /api/documents - List all documents with filtering
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
    if (!hasPermission(user.role, 'documents:read')) {
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

    const { productId, status, documentType, page, limit } = validation.data;

    // Build where clause
    const where: any = {};

    // For CUSTOMER role: auto-filter by their manufacturer's products
    if (user.role === UserRole.CUSTOMER) {
      if (!user.manufacturerId) {
        return NextResponse.json(
          { error: 'Customer has no associated manufacturer' },
          { status: 400 }
        );
      }
      where.product = {
        manufacturerId: user.manufacturerId,
      };
    }

    // Apply filters
    if (productId) {
      where.productId = productId;
    }
    if (status) {
      where.status = status;
    }
    if (documentType) {
      where.documentType = documentType;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [documents, total] = await Promise.all([
      db.document.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              manufacturerId: true,
              manufacturer: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      db.document.count({ where }),
    ]);

    return NextResponse.json({
      documents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents - Upload a new document
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
    if (!hasPermission(user.role, 'documents:write')) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse multipart/form-data
    const formData = await request.formData();
    const productId = formData.get('productId') as string;
    const documentType = formData.get('documentType') as string;
    const name = formData.get('name') as string;
    const version = formData.get('version') as string | null;
    const file = formData.get('file') as File;

    // Validate required fields
    if (!productId || !documentType || !name || !file) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, documentType, name, file' },
        { status: 400 }
      );
    }

    // Validate UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productId)) {
      return NextResponse.json(
        { error: 'Invalid productId format' },
        { status: 400 }
      );
    }

    // Validate document type
    if (!Object.values(DocumentType).includes(documentType as DocumentType)) {
      return NextResponse.json(
        { error: 'Invalid documentType' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isAllowedFileType(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Allowed types: PDF, DOC, DOCX, XLS, XLSX, images' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    if (!isValidFileSize(file.size)) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 50MB' },
        { status: 400 }
      );
    }

    // Verify product exists and check access
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        manufacturer: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // For CUSTOMER role: ensure they can only upload for their manufacturer
    if (user.role === UserRole.CUSTOMER) {
      if (!user.manufacturerId) {
        return NextResponse.json(
          { error: 'Customer has no associated manufacturer' },
          { status: 400 }
        );
      }
      if (product.manufacturerId !== user.manufacturerId) {
        return NextResponse.json(
          { error: 'Forbidden: Cannot upload documents for other manufacturers' },
          { status: 403 }
        );
      }
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    const relativePath = `${product.manufacturerId}/${productId}/${uniqueFilename}`;

    // Save file to storage
    await saveFile(file, relativePath);

    // Create document record
    const document = await db.document.create({
      data: {
        productId,
        documentType: documentType as DocumentType,
        name,
        version: version || undefined,
        fileUrl: relativePath,
        fileSize: file.size,
        mimeType: file.type,
        status: DocumentStatus.PENDING_REVIEW,
        uploadedById: user.id,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            manufacturer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        entityType: 'Document',
        entityId: document.id,
        action: AuditAction.CREATE,
        userId: user.id,
        newValues: {
          id: document.id,
          productId: document.productId,
          documentType: document.documentType,
          name: document.name,
          status: document.status,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
