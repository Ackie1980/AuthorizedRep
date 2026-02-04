import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.auditLog.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.documentVersion.deleteMany()
  await prisma.document.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()
  await prisma.manufacturer.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 10)

  // Create QBD Staff users first (no manufacturer)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@qbd.com',
      passwordHash,
      name: 'Admin User',
      role: 'admin',
    },
  })

  const manager = await prisma.user.create({
    data: {
      email: 'manager@qbd.com',
      passwordHash,
      name: 'Sarah Manager',
      role: 'ec_rep_manager',
    },
  })

  const expert = await prisma.user.create({
    data: {
      email: 'expert@qbd.com',
      passwordHash,
      name: 'John Expert',
      role: 'ec_rep_expert',
    },
  })

  const assistant = await prisma.user.create({
    data: {
      email: 'assistant@qbd.com',
      passwordHash,
      name: 'Emily Assistant',
      role: 'ec_rep_assistant',
    },
  })

  // Create Manufacturer 1: Acme Medical Devices
  const acme = await prisma.manufacturer.create({
    data: {
      name: 'Acme Medical Devices',
      legalName: 'Acme Medical Devices GmbH',
      address: {
        street: '123 Innovation Way',
        city: 'Munich',
        country: 'Germany',
        postalCode: '80331',
      },
      primaryContact: {
        name: 'Hans Mueller',
        email: 'hans@acme-medical.com',
        phone: '+49 89 1234567',
      },
      services: ['EC-REP', 'CH-REP'],
      assignedEcRepId: expert.id,
      contractStart: new Date('2024-01-01'),
      contractEnd: new Date('2026-12-31'),
      status: 'active',
    },
  })

  // Create Manufacturer 2: BioTech Instruments
  const biotech = await prisma.manufacturer.create({
    data: {
      name: 'BioTech Instruments',
      legalName: 'BioTech Instruments Inc.',
      address: {
        street: '456 Science Park',
        city: 'Boston',
        state: 'MA',
        country: 'USA',
        postalCode: '02108',
      },
      primaryContact: {
        name: 'Jennifer Smith',
        email: 'jsmith@biotech-inst.com',
        phone: '+1 617 555 1234',
      },
      services: ['EC-REP', 'UKRP'],
      assignedEcRepId: assistant.id,
      contractStart: new Date('2024-06-01'),
      contractEnd: new Date('2027-05-31'),
      status: 'active',
    },
  })

  // Create customer users
  const acmeCustomer = await prisma.user.create({
    data: {
      email: 'customer@acme-medical.com',
      passwordHash,
      name: 'Hans Mueller',
      role: 'customer',
      manufacturerId: acme.id,
    },
  })

  const biotechCustomer = await prisma.user.create({
    data: {
      email: 'customer@biotech-inst.com',
      passwordHash,
      name: 'Jennifer Smith',
      role: 'customer',
      manufacturerId: biotech.id,
    },
  })

  // Create Products for Acme
  const cardioMonitor = await prisma.product.create({
    data: {
      manufacturerId: acme.id,
      name: 'CardioMonitor X1',
      udiDi: '4260456789012',
      deviceType: 'MD',
      classification: 'IIa',
      applicableRegulation: 'MDR',
      intendedPurpose: 'Continuous cardiac monitoring for hospital use',
      status: 'registered',
    },
  })

  const cardioMonitor2 = await prisma.product.create({
    data: {
      manufacturerId: acme.id,
      name: 'CardioMonitor X2 Pro',
      udiDi: '4260456789029',
      deviceType: 'MD',
      classification: 'IIa',
      applicableRegulation: 'MDR',
      intendedPurpose: 'Advanced cardiac monitoring with AI-assisted analysis',
      status: 'under_review',
    },
  })

  const surgicalKit = await prisma.product.create({
    data: {
      manufacturerId: acme.id,
      name: 'SurgicalKit Pro',
      udiDi: '4260456789036',
      deviceType: 'MD',
      classification: 'IIb',
      applicableRegulation: 'MDR',
      intendedPurpose: 'Sterile surgical instrument kit for general surgery',
      status: 'draft',
    },
  })

  // Create Products for BioTech
  const bloodAnalyzer = await prisma.product.create({
    data: {
      manufacturerId: biotech.id,
      name: 'BloodAnalyzer Pro',
      udiDi: '0860123456789',
      deviceType: 'IVD',
      classification: 'B',
      applicableRegulation: 'IVDR',
      intendedPurpose: 'In vitro diagnostic device for blood cell analysis',
      status: 'draft',
    },
  })

  // Create Documents for CardioMonitor X1
  await prisma.document.create({
    data: {
      productId: cardioMonitor.id,
      documentType: 'DoC',
      name: 'Declaration of Conformity - CardioMonitor X1',
      version: '1.0',
      fileUrl: '/uploads/acme/doc-cardio-x1.pdf',
      fileSize: 245000,
      mimeType: 'application/pdf',
      status: 'approved',
      uploadedById: acmeCustomer.id,
      reviewedById: expert.id,
      reviewNotes: 'Compliant with MDR requirements',
    },
  })

  await prisma.document.create({
    data: {
      productId: cardioMonitor.id,
      documentType: 'IFU',
      name: 'Instructions for Use - CardioMonitor X1',
      version: '2.1',
      fileUrl: '/uploads/acme/ifu-cardio-x1.pdf',
      fileSize: 1245000,
      mimeType: 'application/pdf',
      status: 'approved',
      uploadedById: acmeCustomer.id,
      reviewedById: expert.id,
    },
  })

  // Create Documents for CardioMonitor X2 (under review)
  await prisma.document.create({
    data: {
      productId: cardioMonitor2.id,
      documentType: 'DoC',
      name: 'Declaration of Conformity - CardioMonitor X2',
      version: '1.0',
      fileUrl: '/uploads/acme/doc-cardio-x2.pdf',
      fileSize: 256000,
      mimeType: 'application/pdf',
      status: 'pending_review',
      uploadedById: acmeCustomer.id,
    },
  })

  await prisma.document.create({
    data: {
      productId: cardioMonitor2.id,
      documentType: 'IFU',
      name: 'Instructions for Use - CardioMonitor X2',
      version: '1.0',
      fileUrl: '/uploads/acme/ifu-cardio-x2.pdf',
      fileSize: 1567000,
      mimeType: 'application/pdf',
      status: 'needs_revision',
      uploadedById: acmeCustomer.id,
      reviewedById: expert.id,
      reviewNotes: 'Missing CE marking on page 3. Please update and resubmit.',
    },
  })

  // Create Certificates for Acme
  const today = new Date()
  const in4Weeks = new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000)
  const in1Week = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const expired = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  await prisma.certificate.create({
    data: {
      manufacturerId: acme.id,
      certificateType: 'ISO_13485',
      issuer: 'TÜV SÜD',
      certificateNumber: 'Q1 123456',
      issueDate: new Date('2023-06-15'),
      expiryDate: in4Weeks, // Expiring soon for demo
      fileUrl: '/uploads/acme/iso-cert.pdf',
      status: 'expiring_soon',
    },
  })

  await prisma.certificate.create({
    data: {
      manufacturerId: acme.id,
      certificateType: 'NB_Certificate',
      issuer: 'BSI',
      certificateNumber: 'CE 123456',
      issueDate: new Date('2024-01-10'),
      expiryDate: new Date('2029-01-09'),
      fileUrl: '/uploads/acme/nb-cert.pdf',
      status: 'valid',
    },
  })

  await prisma.certificate.create({
    data: {
      manufacturerId: acme.id,
      certificateType: 'Insurance',
      issuer: 'Allianz',
      certificateNumber: 'INS-2024-78901',
      issueDate: new Date('2024-01-01'),
      expiryDate: expired, // Already expired for demo
      fileUrl: '/uploads/acme/insurance.pdf',
      status: 'expired',
      alertSentExpired: true,
    },
  })

  // Create Certificate for BioTech
  await prisma.certificate.create({
    data: {
      manufacturerId: biotech.id,
      certificateType: 'ISO_13485',
      issuer: 'SGS',
      certificateNumber: 'US-456789',
      issueDate: new Date('2024-03-01'),
      expiryDate: new Date('2027-02-28'),
      fileUrl: '/uploads/biotech/iso-cert.pdf',
      status: 'valid',
    },
  })

  // Create Submissions
  await prisma.submission.create({
    data: {
      productId: cardioMonitor.id,
      authority: 'EUDAMED',
      submissionType: 'initial',
      status: 'registered',
      registrationNumber: 'EU-MD-2024-001234',
      submittedAt: new Date('2024-02-15'),
      registeredAt: new Date('2024-03-01'),
      submittedById: expert.id,
    },
  })

  console.log('Seed completed successfully!')
  console.log('')
  console.log('Demo Accounts:')
  console.log('─────────────────────────────────────')
  console.log('Admin:      admin@qbd.com / password123')
  console.log('Manager:    manager@qbd.com / password123')
  console.log('Expert:     expert@qbd.com / password123')
  console.log('Assistant:  assistant@qbd.com / password123')
  console.log('Customer:   customer@acme-medical.com / password123')
  console.log('Customer:   customer@biotech-inst.com / password123')
  console.log('─────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
