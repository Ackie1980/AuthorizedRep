import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';

const streamPipeline = promisify(pipeline);

// Base upload directory
const UPLOAD_BASE_DIR = path.join(process.cwd(), 'uploads');

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error('Error creating directory:', error);
    throw error;
  }
}

/**
 * Save a file to the specified path
 * @param file - The file to save
 * @param relativePath - Relative path from uploads directory (e.g., "manufacturerId/productId/filename.pdf")
 * @returns The relative path where the file was saved
 */
export async function saveFile(file: File, relativePath: string): Promise<string> {
  const fullPath = path.join(UPLOAD_BASE_DIR, relativePath);

  // Validate path to prevent directory traversal
  const normalizedPath = path.normalize(fullPath);
  if (!normalizedPath.startsWith(path.normalize(UPLOAD_BASE_DIR))) {
    throw new Error('Invalid file path');
  }

  const dir = path.dirname(fullPath);

  // Ensure directory exists
  await ensureDir(dir);

  // Convert File to Buffer and write
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(fullPath, buffer);

  return relativePath;
}

/**
 * Delete a file
 * @param relativePath - Relative path from uploads directory
 */
export async function deleteFile(relativePath: string): Promise<void> {
  const fullPath = path.join(UPLOAD_BASE_DIR, relativePath);

  // Validate path to prevent directory traversal
  const normalizedPath = path.normalize(fullPath);
  if (!normalizedPath.startsWith(path.normalize(UPLOAD_BASE_DIR))) {
    throw new Error('Invalid file path');
  }

  try {
    await fs.unlink(fullPath);
  } catch (error: any) {
    // Ignore if file doesn't exist
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Get full file path for a relative path
 * @param relativePath - Relative path from uploads directory
 * @returns Full absolute path
 */
export function getFilePath(relativePath: string): string {
  const fullPath = path.join(UPLOAD_BASE_DIR, relativePath);

  // Validate path to prevent directory traversal
  const normalizedPath = path.normalize(fullPath);
  if (!normalizedPath.startsWith(path.normalize(UPLOAD_BASE_DIR))) {
    throw new Error('Invalid file path');
  }

  return fullPath;
}

/**
 * Check if file exists
 * @param relativePath - Relative path from uploads directory
 * @returns true if file exists, false otherwise
 */
export async function fileExists(relativePath: string): Promise<boolean> {
  const fullPath = path.join(UPLOAD_BASE_DIR, relativePath);

  // Validate path to prevent directory traversal
  const normalizedPath = path.normalize(fullPath);
  if (!normalizedPath.startsWith(path.normalize(UPLOAD_BASE_DIR))) {
    throw new Error('Invalid file path');
  }

  try {
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file size in bytes
 * @param relativePath - Relative path from uploads directory
 * @returns File size in bytes
 */
export async function getFileSize(relativePath: string): Promise<number> {
  const fullPath = path.join(UPLOAD_BASE_DIR, relativePath);

  // Validate path to prevent directory traversal
  const normalizedPath = path.normalize(fullPath);
  if (!normalizedPath.startsWith(path.normalize(UPLOAD_BASE_DIR))) {
    throw new Error('Invalid file path');
  }

  const stats = await fs.stat(fullPath);
  return stats.size;
}

/**
 * Generate a unique filename
 * @param originalName - Original file name
 * @returns Unique filename with timestamp
 */
export function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return `${nameWithoutExt}-${timestamp}-${random}${ext}`;
}

/**
 * Validate file type
 * @param mimeType - MIME type of the file
 * @returns true if allowed, false otherwise
 */
export function isAllowedFileType(mimeType: string): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  return allowedTypes.includes(mimeType);
}

/**
 * Validate file size (max 50MB)
 * @param size - File size in bytes
 * @returns true if within limit, false otherwise
 */
export function isValidFileSize(size: number): boolean {
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  return size <= MAX_SIZE;
}
