import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.product.deleteMany();
  await prisma.manufacturer.deleteMany();
  await prisma.user.deleteMany();

  // Create password hash
  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@arservices.eu',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('Created admin user:', admin.email);

  // Create EC Rep Expert user
  const ecRep = await prisma.user.create({
    data: {
      email: 'expert@arservices.eu',
      passwordHash,
      firstName: 'Maria',
      lastName: 'Schmidt',
      role: 'EC_REP_EXPERT',
      isActive: true,
    },
  });
  console.log('Created EC Rep Expert:', ecRep.email);

  // Create Manufacturer 1: Acme Medical
  const acmeMedical = await prisma.manufacturer.create({
    data: {
      name: 'Acme Medical',
      legalName: 'Acme Medical Devices Inc.',
      address: {
        street: '123 Innovation Drive',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'United States',
      },
      primaryContact: {
        name: 'John Smith',
        email: 'john.smith@acmemedical.com',
        phone: '+1 415 555 0100',
      },
      services: ['EC_REP', 'UKRP'],
      assignedEcRepId: ecRep.id,
      contractStart: new Date('2024-01-01'),
      contractEnd: new Date('2026-12-31'),
      status: 'ACTIVE',
    },
  });
  console.log('Created manufacturer:', acmeMedical.name);

  // Create Manufacturer 2: BioTech Devices
  const bioTechDevices = await prisma.manufacturer.create({
    data: {
      name: 'BioTech Devices',
      legalName: 'BioTech Devices GmbH',
      address: {
        street: 'Industriestrasse 42',
        city: 'Munich',
        state: 'Bavaria',
        postalCode: '80331',
        country: 'Germany',
      },
      primaryContact: {
        name: 'Hans Mueller',
        email: 'h.mueller@biotechdevices.de',
        phone: '+49 89 555 0200',
      },
      services: ['EC_REP', 'CH_REP'],
      assignedEcRepId: ecRep.id,
      contractStart: new Date('2023-06-01'),
      contractEnd: new Date('2025-05-31'),
      status: 'ACTIVE',
    },
  });
  console.log('Created manufacturer:', bioTechDevices.name);

  // Create Customer 1 (Acme Medical)
  const customer1 = await prisma.user.create({
    data: {
      email: 'john.smith@acmemedical.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Smith',
      role: 'CUSTOMER',
      manufacturerId: acmeMedical.id,
      isActive: true,
    },
  });
  console.log('Created customer:', customer1.email);

  // Create Customer 2 (BioTech Devices)
  const customer2 = await prisma.user.create({
    data: {
      email: 'h.mueller@biotechdevices.de',
      passwordHash,
      firstName: 'Hans',
      lastName: 'Mueller',
      role: 'CUSTOMER',
      manufacturerId: bioTechDevices.id,
      isActive: true,
    },
  });
  console.log('Created customer:', customer2.email);

  // Create Products for Acme Medical
  const acmeProducts = await Promise.all([
    prisma.product.create({
      data: {
        manufacturerId: acmeMedical.id,
        name: 'CardioMonitor Pro X1',
        udiDi: '00844588001234',
        deviceType: 'MD',
        classification: 'CLASS_IIB',
        applicableRegulation: 'MDR',
        intendedPurpose: 'Continuous cardiac monitoring for hospital use',
        status: 'REGISTERED',
        metadata: { modelNumber: 'CMX1-2024', version: '2.1' },
      },
    }),
    prisma.product.create({
      data: {
        manufacturerId: acmeMedical.id,
        name: 'PulseOx Sensor S3',
        udiDi: '00844588002345',
        deviceType: 'MD',
        classification: 'CLASS_IIA',
        applicableRegulation: 'MDR',
        intendedPurpose: 'Non-invasive blood oxygen saturation measurement',
        status: 'SUBMITTED',
        metadata: { modelNumber: 'POS3-2024', version: '1.0' },
      },
    }),
    prisma.product.create({
      data: {
        manufacturerId: acmeMedical.id,
        name: 'TempTrack Thermometer',
        udiDi: '00844588003456',
        deviceType: 'MD',
        classification: 'CLASS_I',
        applicableRegulation: 'MDR',
        intendedPurpose: 'Non-contact infrared temperature measurement',
        status: 'UNDER_REVIEW',
        metadata: { modelNumber: 'TTT-2024', version: '1.2' },
      },
    }),
  ]);
  console.log('Created', acmeProducts.length, 'products for Acme Medical');

  // Create Products for BioTech Devices
  const bioTechProducts = await Promise.all([
    prisma.product.create({
      data: {
        manufacturerId: bioTechDevices.id,
        name: 'GlucoTest Rapid Kit',
        udiDi: '40123456001234',
        deviceType: 'IVD',
        classification: 'CLASS_B',
        applicableRegulation: 'IVDR',
        intendedPurpose: 'In vitro diagnostic for blood glucose monitoring',
        status: 'REGISTERED',
        metadata: { modelNumber: 'GTR-100', version: '3.0' },
      },
    }),
    prisma.product.create({
      data: {
        manufacturerId: bioTechDevices.id,
        name: 'CovidScreen PCR',
        udiDi: '40123456002345',
        deviceType: 'IVD',
        classification: 'CLASS_C',
        applicableRegulation: 'IVDR',
        intendedPurpose: 'PCR-based detection of SARS-CoV-2',
        status: 'READY_FOR_SUBMISSION',
        metadata: { modelNumber: 'CSP-200', version: '2.0' },
      },
    }),
    prisma.product.create({
      data: {
        manufacturerId: bioTechDevices.id,
        name: 'HemoCheck Analyzer',
        udiDi: '40123456003456',
        deviceType: 'IVD',
        classification: 'CLASS_B',
        applicableRegulation: 'IVDR',
        intendedPurpose: 'Complete blood count analysis',
        status: 'DRAFT',
        metadata: { modelNumber: 'HCA-50', version: '1.0' },
      },
    }),
  ]);
  console.log('Created', bioTechProducts.length, 'products for BioTech Devices');

  // Create Documents for first Acme product
  const doc1 = await prisma.document.create({
    data: {
      productId: acmeProducts[0].id,
      documentType: 'DOC',
      name: 'Declaration of Conformity - CardioMonitor Pro X1',
      version: '1.0',
      fileUrl: '/documents/acme/cardiox1-doc-v1.pdf',
      fileSize: 245000,
      mimeType: 'application/pdf',
      status: 'APPROVED',
      uploadedById: customer1.id,
      reviewedById: ecRep.id,
      reviewNotes: 'All requirements met. Approved for EUDAMED submission.',
      metadata: { reviewDate: '2024-01-15' },
    },
  });

  await prisma.document.create({
    data: {
      productId: acmeProducts[0].id,
      documentType: 'IFU',
      name: 'Instructions for Use - CardioMonitor Pro X1',
      version: '2.1',
      fileUrl: '/documents/acme/cardiox1-ifu-v2.1.pdf',
      fileSize: 1250000,
      mimeType: 'application/pdf',
      status: 'APPROVED',
      uploadedById: customer1.id,
      reviewedById: ecRep.id,
      metadata: {},
    },
  });

  // Create Documents for BioTech product
  await prisma.document.create({
    data: {
      productId: bioTechProducts[0].id,
      documentType: 'TECHNICAL_DOC',
      name: 'Technical Documentation - GlucoTest Rapid Kit',
      version: '3.0',
      fileUrl: '/documents/biotech/glucotest-td-v3.pdf',
      fileSize: 5400000,
      mimeType: 'application/pdf',
      status: 'APPROVED',
      uploadedById: customer2.id,
      reviewedById: ecRep.id,
      metadata: {},
    },
  });

  await prisma.document.create({
    data: {
      productId: bioTechProducts[1].id,
      documentType: 'DOC',
      name: 'Declaration of Conformity - CovidScreen PCR',
      version: '1.0',
      fileUrl: '/documents/biotech/covidscreen-doc-v1.pdf',
      fileSize: 180000,
      mimeType: 'application/pdf',
      status: 'PENDING_REVIEW',
      uploadedById: customer2.id,
      metadata: {},
    },
  });

  console.log('Created sample documents');

  // Create Document Version
  await prisma.documentVersion.create({
    data: {
      documentId: doc1.id,
      versionNumber: 1,
      fileUrl: '/documents/acme/cardiox1-doc-v1.pdf',
      changesSummary: 'Initial version',
      createdById: customer1.id,
    },
  });

  // Create Certificates for Acme Medical
  await prisma.certificate.create({
    data: {
      manufacturerId: acmeMedical.id,
      certificateType: 'ISO_13485',
      issuer: 'TUV SUD',
      certificateNumber: 'ISO13485-2023-ACME-001',
      issueDate: new Date('2023-03-15'),
      expiryDate: new Date('2026-03-14'),
      fileUrl: '/certificates/acme/iso13485-2023.pdf',
      status: 'VALID',
    },
  });

  await prisma.certificate.create({
    data: {
      manufacturerId: acmeMedical.id,
      certificateType: 'NB_CERTIFICATE',
      issuer: 'BSI Group',
      certificateNumber: 'CE-2024-ACME-CMX1',
      issueDate: new Date('2024-01-20'),
      expiryDate: new Date('2029-01-19'),
      fileUrl: '/certificates/acme/nb-cert-cmx1.pdf',
      status: 'VALID',
    },
  });

  // Create Certificates for BioTech Devices
  await prisma.certificate.create({
    data: {
      manufacturerId: bioTechDevices.id,
      certificateType: 'ISO_13485',
      issuer: 'Dekra',
      certificateNumber: 'ISO13485-2022-BTD-001',
      issueDate: new Date('2022-06-01'),
      expiryDate: new Date('2025-05-31'),
      fileUrl: '/certificates/biotech/iso13485-2022.pdf',
      status: 'EXPIRING_SOON',
    },
  });

  await prisma.certificate.create({
    data: {
      manufacturerId: bioTechDevices.id,
      certificateType: 'INSURANCE',
      issuer: 'Allianz',
      certificateNumber: 'PLI-2024-BTD-500K',
      issueDate: new Date('2024-01-01'),
      expiryDate: new Date('2025-01-01'),
      fileUrl: '/certificates/biotech/insurance-2024.pdf',
      status: 'VALID',
    },
  });

  console.log('Created sample certificates');

  // Create Submissions
  await prisma.submission.create({
    data: {
      productId: acmeProducts[0].id,
      authority: 'EUDAMED',
      status: 'REGISTERED',
      registrationNumber: 'EU-MDR-2024-00012345',
      submittedAt: new Date('2024-01-25'),
      registeredAt: new Date('2024-02-10'),
      submittedById: ecRep.id,
      notes: 'Successfully registered in EUDAMED',
      metadata: { actorId: 'ACT-2024-ACME-001' },
    },
  });

  await prisma.submission.create({
    data: {
      productId: acmeProducts[1].id,
      authority: 'EUDAMED',
      status: 'SUBMITTED',
      submittedAt: new Date('2024-02-01'),
      submittedById: ecRep.id,
      notes: 'Awaiting registration confirmation',
      metadata: {},
    },
  });

  await prisma.submission.create({
    data: {
      productId: bioTechProducts[0].id,
      authority: 'EUDAMED',
      status: 'REGISTERED',
      registrationNumber: 'EU-IVDR-2023-00054321',
      submittedAt: new Date('2023-08-15'),
      registeredAt: new Date('2023-09-01'),
      submittedById: ecRep.id,
      metadata: {},
    },
  });

  await prisma.submission.create({
    data: {
      productId: bioTechProducts[0].id,
      authority: 'SWISSDAMED',
      status: 'REGISTERED',
      registrationNumber: 'CH-IVD-2023-001234',
      submittedAt: new Date('2023-09-10'),
      registeredAt: new Date('2023-10-05'),
      submittedById: ecRep.id,
      metadata: {},
    },
  });

  console.log('Created sample submissions');

  // Create Audit Logs
  await prisma.auditLog.create({
    data: {
      entityType: 'Product',
      entityId: acmeProducts[0].id,
      action: 'STATUS_CHANGE',
      userId: ecRep.id,
      oldValues: { status: 'SUBMITTED' },
      newValues: { status: 'REGISTERED' },
      ipAddress: '192.168.1.100',
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'User',
      entityId: admin.id,
      action: 'LOGIN',
      userId: admin.id,
      ipAddress: '10.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });

  console.log('Created sample audit logs');

  console.log('\n--- Seed Summary ---');
  console.log('Users: 4 (admin, ec_rep, customer1, customer2)');
  console.log('Manufacturers: 2 (Acme Medical, BioTech Devices)');
  console.log('Products: 6 (3 per manufacturer)');
  console.log('Documents: 4');
  console.log('Certificates: 4');
  console.log('Submissions: 4');
  console.log('Audit Logs: 2');
  console.log('\nLogin credentials for all users:');
  console.log('Password: password123');
  console.log('\nSeeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
