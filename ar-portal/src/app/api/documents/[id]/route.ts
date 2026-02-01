import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/auth/session';
import { canReviewDocuments } from '@/lib/permissions';
import { deleteFile } from '@/lib/storage';
import { UserRole, DocumentType, AuditAction } from '@prisma/client';

// Validation schema for updating document
const updateDocumentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  documentType: z.nativeEnum(DocumentType).optional(),
  version: z.string().max(50).optional().nullable(),
});

/**
 * GET /api/documents/[id] - Get document details
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

    const documentId = params.id;

    // Fetch document with relations
    const document = await db.document.findUnique({
      where: { id: documentId },
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
        versions: {
          orderBy: {
            versionNumber: 'desc',
          },
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // For CUSTOMER role: check access to manufacturer
    if (user.role === UserRole.CUSTOMER) {
      if (!user.manufacturerId) {
        return NextResponse.json(
          { error: 'Customer has no associated manufacturer' },
          { status: 400 }
        );
      }
      if (document.product.manufacturerId !== user.manufacturerId) {
        return NextResponse.json(
          { error: 'Forbidden: Cannot access documents from other manufacturers' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/documents/[id] - Update document metadata
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
    if (!hasPermission(user.role, 'documents:write')) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const documentId = params.id;

    // Fetch existing document
    const existingDocument = await db.document.findUnique({
      where: { id: documentId },
      include: {
        product: {
          select: {
            manufacturerId: true,
          },
        },
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // For CUSTOMER role: check access to manufacturer
    if (user.role === UserRole.CUSTOMER) {
      if (!user.manufacturerId) {
        return NextResponse.json(
          { error: 'Customer has no associated manufacturer' },
          { status: 400 }
        );
      }
      if (existingDocument.product.manufacturerId !== user.manufacturerId) {
        return NextResponse.json(
          { error: 'Forbidden: Cannot update documents from other manufacturers' },
          { status: 403 }
        );
      }
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateDocumentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Update document
    const updatedDocument = await db.document.update({
      where: { id: documentId },
      data: {
        name: data.name,
        documentType: data.documentType,
        version: data.version,
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
        reviewedBy: {
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
        entityId: documentId,
        action: AuditAction.UPDATE,
        userId: user.id,
        oldValues: {
          name: existingDocument.name,
          documentType: existingDocument.documentType,
          version: existingDocument.version,
        },
        newValues: {
          name: updatedDocument.name,
          documentType: updatedDocument.documentType,
          version: updatedDocument.version,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id] - Delete document
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

    // Only EC_REP_EXPERT and above can delete documents
    if (!canReviewDocuments(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to delete documents' },
        { status: 403 }
      );
    }

    const documentId = params.id;

    // Fetch document
    const document = await db.document.findUnique({
      where: { id: documentId },
      include: {
        product: {
          select: {
            manufacturerId: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete file from storage
    try {
      await deleteFile(document.fileUrl);
    } catch (error) {
      console.error('Error deleting file from storage:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete document from database (cascade will delete versions)
    await db.document.delete({
      where: { id: documentId },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        entityType: 'Document',
        entityId: documentId,
        action: AuditAction.DELETE,
        userId: user.id,
        oldValues: {
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

    return NextResponse.json(
      { message: 'Document deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
