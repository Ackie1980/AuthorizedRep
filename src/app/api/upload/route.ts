import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/config'
import { saveFile } from '@/server/services/file-storage'
import { prisma } from '@/lib/prisma'

// Allowed MIME types for document uploads
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/zip',
  'application/x-zip-compressed',
]

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = session.user

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const productId = formData.get('productId') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, ZIP' },
        { status: 400 }
      )
    }

    // Get product and check access
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        manufacturer: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check access control
    const isQbdStaff = [
      'ec_rep_assistant',
      'ec_rep_expert',
      'ec_rep_manager',
      'admin',
    ].includes(user.role)

    const isOwnProduct =
      user.role === 'customer' && user.manufacturerId === product.manufacturerId

    if (!isQbdStaff && !isOwnProduct) {
      return NextResponse.json(
        { error: 'You do not have access to upload files to this product' },
        { status: 403 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Sanitize filename
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')

    // Save file to disk
    const fileMetadata = await saveFile({
      fileName: sanitizedFileName,
      fileBuffer: buffer,
      manufacturerId: product.manufacturerId,
      productId: product.id,
    })

    // Return file metadata
    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: fileMetadata.fileSize,
        mimeType: file.type,
        url: fileMetadata.fileUrl,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// Configure API route
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
