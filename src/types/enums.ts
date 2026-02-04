export const UserRole = {
  CUSTOMER: 'customer',
  EC_REP_ASSISTANT: 'ec_rep_assistant',
  EC_REP_EXPERT: 'ec_rep_expert',
  EC_REP_MANAGER: 'ec_rep_manager',
  ADMIN: 'admin',
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const DeviceType = {
  MD: 'MD',
  IVD: 'IVD',
} as const
export type DeviceType = (typeof DeviceType)[keyof typeof DeviceType]

export const Classification = {
  I: 'I',
  IIa: 'IIa',
  IIb: 'IIb',
  III: 'III',
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
} as const
export type Classification = (typeof Classification)[keyof typeof Classification]

export const Regulation = {
  MDR: 'MDR',
  IVDR: 'IVDR',
  MDD: 'MDD',
  IVDD: 'IVDD',
} as const
export type Regulation = (typeof Regulation)[keyof typeof Regulation]

export const ProductStatus = {
  DRAFT: 'draft',
  UNDER_REVIEW: 'under_review',
  REGISTERED: 'registered',
  DISCONTINUED: 'discontinued',
} as const
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus]

export const DocumentType = {
  DOC: 'DoC',
  IFU: 'IFU',
  LABEL: 'Label',
  TECHNICAL_DOC: 'TechnicalDoc',
  CERTIFICATE: 'Certificate',
} as const
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType]

export const DocumentStatus = {
  PENDING_REVIEW: 'pending_review',
  UNDER_REVIEW: 'under_review',
  NEEDS_REVISION: 'needs_revision',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus]

export const CertificateType = {
  ISO_13485: 'ISO_13485',
  NB_CERTIFICATE: 'NB_Certificate',
  INSURANCE: 'Insurance',
  DOC: 'DoC',
} as const
export type CertificateType = (typeof CertificateType)[keyof typeof CertificateType]

export const CertificateStatus = {
  VALID: 'valid',
  EXPIRING_SOON: 'expiring_soon',
  EXPIRED: 'expired',
} as const
export type CertificateStatus = (typeof CertificateStatus)[keyof typeof CertificateStatus]

export const Authority = {
  EUDAMED: 'EUDAMED',
  SWISSDAMED: 'Swissdamed',
  MHRA: 'MHRA',
} as const
export type Authority = (typeof Authority)[keyof typeof Authority]
