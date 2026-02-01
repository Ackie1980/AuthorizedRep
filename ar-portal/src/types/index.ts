// Re-export constants as types
export type {
  UserRole,
  ClientStatus,
  CaseStatus,
  DocumentStatus,
  TaskPriority,
  TaskStatus,
  NotificationType,
} from '@/lib/constants';

// Generic API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search/filter params
export interface SearchParams extends PaginationParams {
  search?: string;
  filters?: Record<string, string | string[] | boolean | number>;
}

// Form state types
export interface FormState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
  children?: NavItem[];
}

// Breadcrumb types
export interface BreadcrumbItem {
  title: string;
  href?: string;
}

// Table column definition
export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

// Action menu item
export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}
