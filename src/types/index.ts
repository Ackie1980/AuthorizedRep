export * from './enums'
import type {
  UserRole,
  DeviceType,
  Classification,
  Regulation,
  ProductStatus,
  DocumentType,
  DocumentStatus,
  CertificateType,
  CertificateStatus,
} from './enums'

// User types
export interface User {
  id: string
  email: string
  name: string | null
  role: UserRole
  manufacturerId: string | null
}

export interface SessionUser extends User {}

// Manufacturer types
export interface Manufacturer {
  id: string
  name: string
  legalName: string | null
  services: string[]
  status: string
}

// Product types
export interface Product {
  id: string
  manufacturerId: string
  name: string
  udiDi: string | null
  deviceType: DeviceType | null
  classification: Classification | null
  applicableRegulation: Regulation | null
  intendedPurpose: string | null
  status: ProductStatus
  createdAt: Date
  updatedAt: Date
}

// Document types
export interface Document {
  id: string
  productId: string
  documentType: DocumentType
  name: string
  version: string | null
  fileUrl: string
  fileSize: number | null
  mimeType: string | null
  status: DocumentStatus
  uploadedById: string | null
  reviewedById: string | null
  reviewNotes: string | null
  createdAt: Date
  updatedAt: Date
}

// Certificate types
export interface Certificate {
  id: string
  manufacturerId: string
  certificateType: CertificateType
  issuer: string | null
  certificateNumber: string | null
  issueDate: Date | null
  expiryDate: Date
  status: CertificateStatus
}
