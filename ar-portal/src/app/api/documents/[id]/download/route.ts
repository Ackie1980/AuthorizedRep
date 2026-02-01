import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/auth/session';
import { getFilePath, fileExists } from '@/lib/storage';
import { UserRole } from '@prisma/client';
import fs from 'fs/promises';

/**
 * GET /api/documents/[id]/download - Download document file
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
          { error: 'Forbidden: Cannot download documents from other manufacturers' },
          { status: 403 }
        );
      }
    }

    // Check if file exists
    const exists = await fileExists(document.fileUrl);
    if (!exists) {
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      );
    }

    // Get file path and read file
    const filePath = getFilePath(document.fileUrl);
    const fileBuffer = await fs.readFile(filePath);

    // Determine file extension for Content-Disposition
    const fileName = document.name;
    const fileExtension = document.fileUrl.split('.').pop() || '';
    const downloadFileName = fileName.includes('.') ? fileName : `${fileName}.${fileExtension}`;

    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', document.mimeType || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${downloadFileName}"`);
    headers.set('Content-Length', fileBuffer.length.toString());

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
