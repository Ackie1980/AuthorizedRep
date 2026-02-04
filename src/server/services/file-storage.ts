import fs from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export interface SaveFileOptions {
  fileName: string
  fileBuffer: Buffer
  manufacturerId: string
  productId: string
}

export interface FileMetadata {
  filePath: string
  fileUrl: string
  fileSize: number
}

/**
 * Validates that a file path is within the uploads directory
 * to prevent path traversal attacks
 */
function isPathWithinUploads(filePath: string): boolean {
  const uploadsDir = path.resolve(process.cwd(), 'uploads')
  const resolvedPath = path.resolve(filePath)
  return resolvedPath.startsWith(uploadsDir + path.sep) || resolvedPath === uploadsDir
}

/**
 * Get the full file system path for a document
 */
export function getFilePath(
  manufacturerId: string,
  productId: string,
  fileName: string
): string {
  const uploadDir = path.join(
    process.cwd(),
    'uploads',
    manufacturerId,
    productId
  )
  return path.join(uploadDir, fileName)
}

/**
 * Get the public URL for a document
 */
export function getFileUrl(
  manufacturerId: string,
  productId: string,
  fileName: string
): string {
  return `/uploads/${manufacturerId}/${productId}/${fileName}`
}

/**
 * Save an uploaded file to disk
 */
export async function saveFile(
  options: SaveFileOptions
): Promise<FileMetadata> {
  const { fileName, fileBuffer, manufacturerId, productId } = options

  // Create upload directory if it doesn't exist
  const uploadDir = path.join(
    process.cwd(),
    'uploads',
    manufacturerId,
    productId
  )

  await fs.mkdir(uploadDir, { recursive: true })

  // Generate unique filename if file already exists
  let finalFileName = fileName
  let filePath = path.join(uploadDir, finalFileName)
  let counter = 1

  while (existsSync(filePath)) {
    const ext = path.extname(fileName)
    const nameWithoutExt = path.basename(fileName, ext)
    finalFileName = `${nameWithoutExt}_${counter}${ext}`
    filePath = path.join(uploadDir, finalFileName)
    counter++
  }

  // Write file to disk
  await fs.writeFile(filePath, fileBuffer)

  return {
    filePath,
    fileUrl: getFileUrl(manufacturerId, productId, finalFileName),
    fileSize: fileBuffer.length,
  }
}

/**
 * Delete a file from disk
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // Convert URL to file path
    // Expected format: /uploads/{manufacturerId}/{productId}/{fileName}
    const urlPath = fileUrl.replace('/uploads/', '')
    const filePath = path.join(process.cwd(), 'uploads', urlPath)

    // Validate path to prevent traversal attacks
    if (!isPathWithinUploads(filePath)) {
      throw new Error('Invalid file path')
    }

    if (existsSync(filePath)) {
      await fs.unlink(filePath)
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    throw new Error('Failed to delete file')
  }
}

/**
 * Check if file exists
 */
export async function fileExists(fileUrl: string): Promise<boolean> {
  try {
    const urlPath = fileUrl.replace('/uploads/', '')
    const filePath = path.join(process.cwd(), 'uploads', urlPath)

    // Validate path to prevent traversal attacks
    if (!isPathWithinUploads(filePath)) {
      return false
    }

    return existsSync(filePath)
  } catch {
    return false
  }
}

/**
 * Get file size in bytes
 */
export async function getFileSize(fileUrl: string): Promise<number> {
  try {
    const urlPath = fileUrl.replace('/uploads/', '')
    const filePath = path.join(process.cwd(), 'uploads', urlPath)

    // Validate path to prevent traversal attacks
    if (!isPathWithinUploads(filePath)) {
      throw new Error('Invalid file path')
    }

    const stats = await fs.stat(filePath)
    return stats.size
  } catch (error) {
    console.error('Error getting file size:', error)
    throw new Error('Failed to get file size')
  }
}
