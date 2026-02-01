import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { canReviewDocuments } from '@/lib/permissions';
import { UserRole, DocumentStatus, AuditAction } from '@prisma/client';

// Validation schema for status update
const updateStatusSchema = z.object({
  status: z.nativeEnum(DocumentStatus),
  reviewNotes: z.string().optional().nullable(),
});

/**
 * POST /api/documents/[id]/status - Update document status
 */
export async function POST(
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

    // Only EC_REP_EXPERT and above can change document status
    if (!canReviewDocuments(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only EC REP Experts and above can update document status' },
        { status: 403 }
      );
    }

    const documentId = params.id;

    // Fetch existing document
    const existingDocument = await db.document.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { status, reviewNotes } = validation.data;

    // Update document status
    const updatedDocument = await db.document.update({
      where: { id: documentId },
      data: {
        status,
        reviewNotes: reviewNotes || undefined,
        reviewedById: user.id,
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

    // Create audit log for status change
    await db.auditLog.create({
      data: {
        entityType: 'Document',
        entityId: documentId,
        action: AuditAction.STATUS_CHANGE,
        userId: user.id,
        oldValues: {
          status: existingDocument.status,
          reviewNotes: existingDocument.reviewNotes,
          reviewedById: existingDocument.reviewedById,
        },
        newValues: {
          status: updatedDocument.status,
          reviewNotes: updatedDocument.reviewNotes,
          reviewedById: updatedDocument.reviewedById,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
