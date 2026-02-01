// Re-export Prisma UserRole to maintain consistency
export { UserRole } from '@prisma/client';
export type { UserRole as UserRoleType } from '@prisma/client';

// Client status
export const ClientStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export type ClientStatus = (typeof ClientStatus)[keyof typeof ClientStatus];

// Case/Matter status
export const CaseStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_REVIEW: 'PENDING_REVIEW',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type CaseStatus = (typeof CaseStatus)[keyof typeof CaseStatus];

// Document status
export const DocumentStatus = {
  DRAFT: 'DRAFT',
  PENDING_SIGNATURE: 'PENDING_SIGNATURE',
  SIGNED: 'SIGNED',
  EXPIRED: 'EXPIRED',
  REJECTED: 'REJECTED',
} as const;

export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

// Task priority
export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

// Task status
export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

// Notification types
export const NotificationType = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

// File upload limits
export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// Role permissions mapping (using Prisma UserRole enum)
export const ROLE_PERMISSIONS = {
  ADMIN: ['*'],
  EC_REP_MANAGER: [
    'users:read',
    'users:write',
    'manufacturers:read',
    'manufacturers:write',
    'products:read',
    'products:write',
    'documents:read',
    'documents:write',
    'reports:read',
    'settings:read',
    'settings:write',
  ],
  EC_REP_EXPERT: [
    'manufacturers:read',
    'products:read',
    'products:write',
    'documents:read',
    'documents:write',
    'tasks:read',
    'tasks:write',
  ],
  EC_REP_ASSISTANT: [
    'manufacturers:read',
    'products:read',
    'documents:read',
    'documents:write',
    'tasks:read',
    'tasks:write',
  ],
  CUSTOMER: [
    'profile:read',
    'profile:write',
    'products:read',
    'documents:read',
  ],
} as const;
