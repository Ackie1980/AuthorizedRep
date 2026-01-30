export const APP_NAME = 'AR Portal'
export const APP_DESCRIPTION = 'Authorized Representative Services Portal'

export const ROLES_DISPLAY = {
  customer: 'Customer',
  ec_rep_assistant: 'EC Rep Assistant',
  ec_rep_expert: 'EC Rep Expert',
  ec_rep_manager: 'EC Rep Manager',
  admin: 'Administrator',
} as const

export const PRODUCT_STATUS_DISPLAY = {
  draft: 'Draft',
  under_review: 'Under Review',
  registered: 'Registered',
  discontinued: 'Discontinued',
} as const

export const DOCUMENT_STATUS_DISPLAY = {
  pending_review: 'Pending Review',
  under_review: 'Under Review',
  needs_revision: 'Needs Revision',
  approved: 'Approved',
  rejected: 'Rejected',
} as const

export const DEVICE_TYPE_DISPLAY = {
  MD: 'Medical Device',
  IVD: 'In Vitro Diagnostic',
} as const

export const CLASSIFICATION_DISPLAY = {
  I: 'Class I',
  IIa: 'Class IIa',
  IIb: 'Class IIb',
  III: 'Class III',
  A: 'Class A',
  B: 'Class B',
  C: 'Class C',
  D: 'Class D',
} as const

export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
]
