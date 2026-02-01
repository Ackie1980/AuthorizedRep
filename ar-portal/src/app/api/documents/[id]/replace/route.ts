import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/auth/session';
import { saveFile, generateUniqueFilename, isAllowedFileType, isValidFileSize } from '@/lib/storage';
import { UserRole, DocumentStatus, AuditAction } from '@prisma/client';

/**
 * POST /api/documents/[id]/replace - Replace document with new version
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
            id: true,
            manufacturerId: true,
          },
        },
        versions: true,
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
          { error: 'Forbidden: Cannot replace documents from other manufacturers' },
          { status: 403 }
        );
      }
    }

    // Parse multipart/form-data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const changesSummary = formData.get('changesSummary') as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'Missing required field: file' },
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

    // Calculate next version number
    const versionNumber = existingDocument.versions.length + 1;

    // Create DocumentVersion record to archive current version
    await db.documentVersion.create({
      data: {
        documentId: existingDocument.id,
        versionNumber,
        fileUrl: existingDocument.fileUrl,
        changesSummary: changesSummary || undefined,
        createdById: user.id,
      },
    });

    // Generate unique filename for new file
    const uniqueFilename = generateUniqueFilename(file.name);
    const relativePath = `${existingDocument.product.manufacturerId}/${existingDocument.productId}/${uniqueFilename}`;

    // Save new file to storage
    await saveFile(file, relativePath);

    // Update document with new file
    const updatedDocument = await db.document.update({
      where: { id: documentId },
      data: {
        fileUrl: relativePath,
        fileSize: file.size,
        mimeType: file.type,
        status: DocumentStatus.PENDING_REVIEW,
        version: `v${versionNumber + 1}`,
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

    // Create audit log
    await db.auditLog.create({
      data: {
        entityType: 'Document',
        entityId: documentId,
        action: AuditAction.STATUS_CHANGE,
        userId: user.id,
        oldValues: {
          fileUrl: existingDocument.fileUrl,
          fileSize: existingDocument.fileSize,
          mimeType: existingDocument.mimeType,
          status: existingDocument.status,
          version: existingDocument.version,
        },
        newValues: {
          fileUrl: updatedDocument.fileUrl,
          fileSize: updatedDocument.fileSize,
          mimeType: updatedDocument.mimeType,
          status: updatedDocument.status,
          version: updatedDocument.version,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error replacing document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
