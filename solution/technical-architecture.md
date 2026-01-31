# Technical Architecture: AR Services Portal

## Platform Overview

Extending IFUcare to support AR Services requires careful architectural decisions to maintain platform stability while adding significant new functionality.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  Customer       │  │  QBD Staff      │  │  Admin          │             │
│  │  Portal         │  │  Portal         │  │  Portal         │             │
│  │                 │  │                 │  │                 │             │
│  │  React/Next.js  │  │  React/Next.js  │  │  React/Next.js  │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
│                    (Authentication, Rate Limiting, Routing)                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            APPLICATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Product    │  │  Document   │  │  Workflow   │  │ Certificate │        │
│  │  Service    │  │  Service    │  │  Service    │  │  Service    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Submission  │  │Notification │  │  Reporting  │  │   Export    │        │
│  │  Service    │  │  Service    │  │  Service    │  │  Service    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ PostgreSQL  │  │    Redis    │  │ Blob/S3     │  │ Elasticsearch│       │
│  │ (Primary)   │  │  (Cache)    │  │ (Documents) │  │  (Search)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INTEGRATION LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ EUDAMED  │  │Swissdamed│  │   MHRA   │  │  Email   │  │   SSO    │     │
│  │  Export  │  │  Export  │  │  Export  │  │  (SMTP)  │  │(Azure AD)│     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Recommended Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14 + React | SSR, excellent DX, IFUcare alignment |
| **UI Library** | Tailwind CSS + shadcn/ui | Rapid development, consistent design |
| **API** | Node.js + TypeScript + Fastify | Performance, type safety |
| **Database** | PostgreSQL 15 | Reliability, JSON support, full-text search |
| **Cache** | Redis | Session management, caching |
| **File Storage** | Azure Blob Storage | Scalable, cost-effective |
| **Search** | PostgreSQL FTS (Phase 1-2), Elasticsearch (Phase 3+) | Document and product search |
| **Queue** | Redis + BullMQ | Background jobs, notifications |
| **Email** | SendGrid or Azure Communication Services | Transactional email |
| **Hosting** | Azure App Service or AKS | Matches IFUcare infrastructure |

### Search Technology Decision

**Phase 1-2:** Use PostgreSQL Full-Text Search (FTS) for MVP simplicity
- No additional infrastructure required
- Sufficient for initial scale (50-100 manufacturers, 500-1000 products)
- Reduces operational complexity during launch

**Phase 3+:** Evaluate Elasticsearch if search performance becomes a bottleneck
- Consider when: >1000 products, complex faceted search needed, or performance issues
- Migration path: Index existing data, run parallel, cutover

### Alternative: Low-Code Approach

If IFUcare uses or could adopt low-code:

| Component | Low-Code Option |
|-----------|----------------|
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Workflows | n8n or Temporal |
| Frontend | Next.js with Supabase client |
| Admin | Retool or Appsmith |

---

## Data Model

### Core Entities

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ENTITY RELATIONSHIP DIAGRAM                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│ Manufacturer│       │   Product   │       │  Document   │
│             │ 1───N │             │ 1───N │             │
│ • id        │       │ • id        │       │ • id        │
│ • name      │       │ • mfr_id    │       │ • product_id│
│ • contact   │       │ • name      │       │ • type      │
│ • address   │       │ • udi_di    │       │ • version   │
│ • services  │       │ • device_type│      │ • status    │
│             │       │ • class     │       │ • file_url  │
└─────────────┘       │ • regulation│       │ • uploaded_by│
      │               │ • status    │       │ • reviewed_by│
      │               └─────────────┘       └─────────────┘
      │                     │
      │                     │ 1
      │                     │
      │               ┌─────┴─────┐
      │               │           │
      │               N           N
      │         ┌───────────┐ ┌───────────┐
      │         │Submission │ │Certificate│
      │         │           │ │           │
      │         │ • id      │ │ • id      │
      │         │ • product │ │ • mfr_id  │
      │         │ • authority│ │ • type   │
      │         │ • status  │ │ • issuer  │
      │         │ • reg_number│ │ • expiry │
      │         │ • submitted│ │ • file_url│
      │         └───────────┘ └───────────┘
      │
      │ 1
      │
      N
┌─────────────┐
│    User     │
│             │
│ • id        │
│ • mfr_id    │
│ • email     │
│ • role      │
│ • last_login│
└─────────────┘
```

### Database Schema

```sql
-- Manufacturers (Customers)
CREATE TABLE manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    address JSONB,
    primary_contact JSONB,
    services TEXT[] DEFAULT '{}', -- ['EC-REP', 'CH-REP', 'UKRP']
    assigned_ec_rep UUID REFERENCES users(id),
    contract_start DATE,
    contract_end DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    udi_di VARCHAR(100),
    device_type VARCHAR(50), -- 'IVD', 'MD'
    classification VARCHAR(20), -- 'I', 'IIa', 'IIb', 'III', 'A', 'B', 'C', 'D'
    applicable_regulation VARCHAR(50), -- 'MDR', 'IVDR', 'MDD', 'IVDD'
    intended_purpose TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- draft, under_review, registered, discontinued
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'DoC', 'IFU', 'Label', 'TechnicalDoc', 'Certificate'
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending_review',
    uploaded_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document versions (for history)
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    changes_summary TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificates
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE CASCADE,
    certificate_type VARCHAR(50) NOT NULL, -- 'ISO_13485', 'NB_Certificate', 'Insurance', 'DoC'
    issuer VARCHAR(255),
    certificate_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE NOT NULL,
    file_url TEXT,
    status VARCHAR(50) DEFAULT 'valid', -- valid, expiring_soon, expired
    alert_sent_4w BOOLEAN DEFAULT FALSE,
    alert_sent_1w BOOLEAN DEFAULT FALSE,
    alert_sent_expired BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regulatory Submissions
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    authority VARCHAR(50) NOT NULL, -- 'EUDAMED', 'Swissdamed', 'MHRA'
    submission_type VARCHAR(50), -- 'initial', 'update', 'cancellation'
    status VARCHAR(50) DEFAULT 'draft', -- draft, ready, submitted, registered, rejected
    registration_number VARCHAR(100),
    submitted_at TIMESTAMPTZ,
    registered_at TIMESTAMPTZ,
    submitted_by UUID REFERENCES users(id),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'status_change'
    user_id UUID REFERENCES users(id),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_manufacturer ON products(manufacturer_id);
CREATE INDEX idx_documents_product ON documents(product_id);
CREATE INDEX idx_certificates_expiry ON certificates(expiry_date);
CREATE INDEX idx_certificates_manufacturer ON certificates(manufacturer_id);
CREATE INDEX idx_submissions_product ON submissions(product_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
```

---

## API Design

### RESTful API Structure

```
/api/v1
├── /auth
│   ├── POST   /login
│   ├── POST   /logout
│   └── GET    /me
│
├── /manufacturers
│   ├── GET    /                    # List (QBD only)
│   ├── GET    /:id                 # Get details
│   ├── POST   /                    # Create (QBD only)
│   ├── PUT    /:id                 # Update (QBD only)
│   └── GET    /:id/dashboard       # Dashboard data
│
├── /products
│   ├── GET    /                    # List (filtered by manufacturer)
│   ├── GET    /:id                 # Get details
│   ├── POST   /                    # Create
│   ├── PUT    /:id                 # Update
│   ├── DELETE /:id                 # Archive
│   └── GET    /:id/documents       # List documents
│
├── /documents
│   ├── GET    /                    # List
│   ├── GET    /:id                 # Get details
│   ├── POST   /                    # Upload
│   ├── PUT    /:id                 # Update metadata
│   ├── DELETE /:id                 # Delete
│   ├── GET    /:id/download        # Download file
│   ├── GET    /:id/versions        # Version history
│   └── POST   /:id/review          # Submit review decision
│
├── /certificates
│   ├── GET    /                    # List
│   ├── GET    /expiring            # Expiring soon
│   ├── POST   /                    # Create
│   ├── PUT    /:id                 # Update
│   └── DELETE /:id                 # Delete
│
├── /submissions
│   ├── GET    /                    # List
│   ├── POST   /                    # Create
│   ├── PUT    /:id                 # Update
│   └── POST   /:id/export          # Generate XML export
│
├── /cofs
│   ├── GET    /                    # List requests
│   ├── POST   /                    # Create request
│   └── PUT    /:id                 # Update status
│
└── /reports
    ├── GET    /portfolio           # Portfolio overview
    ├── GET    /compliance          # Compliance status
    └── GET    /activity            # Activity report
```

---

## Workflow State Machine

### Product Status Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCT STATUS STATE MACHINE                         │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────┐
                              │  DRAFT  │◄─────────────────────────────────┐
                              └────┬────┘                                  │
                                   │ submit_for_review                     │
                                   ▼                                       │
                         ┌─────────────────┐                               │
                         │  UNDER_REVIEW   │                               │
                         └────────┬────────┘                               │
                                  │                                        │
                    ┌─────────────┼─────────────┐                          │
                    │ approve     │ reject      │ request_changes          │
                    ▼             │             ▼                          │
        ┌───────────────────┐    │    ┌─────────────────┐                 │
        │ READY_FOR_SUBMIT  │    │    │ NEEDS_REVISION  │─────────────────┘
        └─────────┬─────────┘    │    └─────────────────┘
                  │ submit       │
                  ▼              │
           ┌────────────┐        │
           │ SUBMITTED  │        │
           └──────┬─────┘        │
                  │              │
         ┌────────┴────────┐     │
         │ register        │ reject
         ▼                 ▼     │
   ┌────────────┐    ┌──────────┴┐
   │ REGISTERED │    │ REJECTED  │───────────────────────────────────────┘
   └──────┬─────┘    └───────────┘
          │ discontinue
          ▼
   ┌──────────────┐
   │ DISCONTINUED │
   └──────────────┘
```

### State Definitions

| State | Description | Allowed Actions |
|-------|-------------|-----------------|
| `draft` | Initial state, product being set up | Edit, Delete, Submit for Review |
| `under_review` | QBD team reviewing product data | Approve, Reject, Request Changes |
| `needs_revision` | Customer must update product/docs | Edit, Resubmit |
| `ready_for_submission` | Approved, ready for regulatory submit | Submit to Authority |
| `submitted` | Submitted to EUDAMED/Swissdamed/MHRA | (Awaiting authority response) |
| `registered` | Successfully registered with authority | Discontinue, Update (creates new version) |
| `rejected` | Authority rejected submission | Return to Draft for correction |
| `discontinued` | Product no longer on market | (Terminal state) |

### State Transitions

```typescript
const productTransitions: Record<ProductStatus, Transition[]> = {
  draft: [
    { to: 'under_review', action: 'submit_for_review', actor: 'customer' }
  ],
  under_review: [
    { to: 'ready_for_submission', action: 'approve', actor: 'ec_rep_expert' },
    { to: 'needs_revision', action: 'request_changes', actor: 'ec_rep_expert' },
    { to: 'draft', action: 'reject', actor: 'ec_rep_expert' }
  ],
  needs_revision: [
    { to: 'under_review', action: 'resubmit', actor: 'customer' }
  ],
  ready_for_submission: [
    { to: 'submitted', action: 'submit', actor: 'ec_rep_expert' },
    { to: 'draft', action: 'cancel', actor: 'ec_rep_manager' }
  ],
  submitted: [
    { to: 'registered', action: 'register', actor: 'system' },
    { to: 'rejected', action: 'reject', actor: 'system' }
  ],
  registered: [
    { to: 'discontinued', action: 'discontinue', actor: 'ec_rep_manager' }
  ],
  rejected: [
    { to: 'draft', action: 'return_to_draft', actor: 'ec_rep_expert' }
  ],
  discontinued: []
};
```

### Document Status Workflow

| State | Description | Next States |
|-------|-------------|-------------|
| `pending_review` | Uploaded, awaiting review | `under_review` |
| `under_review` | Being reviewed by EC Rep | `approved`, `needs_revision` |
| `needs_revision` | Customer must reupload | `pending_review` |
| `approved` | Document accepted | (Terminal for this version) |
| `superseded` | Replaced by newer version | (Terminal) |

### Workflow Events & Notifications

| Event | Trigger | Recipients | Channel |
|-------|---------|------------|---------|
| `product.submitted` | Customer submits for review | Assigned EC Rep | Email + In-app |
| `product.approved` | EC Rep approves | Customer | Email + In-app |
| `product.needs_revision` | EC Rep requests changes | Customer | Email + In-app |
| `product.registered` | Authority confirms | Customer + EC Rep | Email |
| `document.uploaded` | Customer uploads document | Assigned EC Rep | In-app |
| `document.approved` | EC Rep approves document | Customer | Email |

---

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AUTHENTICATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

QBD Staff (SSO)                           Customer (Password)
     │                                           │
     ▼                                           ▼
┌─────────────┐                          ┌─────────────┐
│  Azure AD   │                          │   IFUcare   │
│    SSO      │                          │   Auth DB   │
└──────┬──────┘                          └──────┬──────┘
       │                                        │
       └──────────────┬─────────────────────────┘
                      ▼
              ┌─────────────┐
              │   JWT       │
              │   Token     │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │   RBAC      │
              │   Check     │
              └─────────────┘
```

### Role-Based Access Control

```typescript
// Permission definitions
const permissions = {
  'customer': [
    'products:read:own',
    'products:create',
    'documents:read:own',
    'documents:upload',
    'certificates:read:own',
    'submissions:read:own',
    'cofs:request',
  ],
  'ec_rep_assistant': [
    'products:read:all',
    'products:update',
    'documents:read:all',
    'documents:review',
    'certificates:read:all',
    'certificates:create',
  ],
  'ec_rep_expert': [
    '...all assistant permissions',
    'products:create',
    'products:delete',
    'documents:approve',
    'submissions:create',
    'submissions:submit',
  ],
  'ec_rep_manager': [
    '...all expert permissions',
    'manufacturers:manage',
    'users:manage',
    'reports:all',
    'config:workflow',
  ],
  'admin': [
    '*', // Full access
  ],
};
```

### Data Isolation

```
Customer A Login
       │
       ▼
┌─────────────────────────────────────────────┐
│         Middleware: Tenant Filter            │
│                                              │
│  SELECT * FROM products                      │
│  WHERE manufacturer_id = {customer_a_id}     │
│                                              │
└─────────────────────────────────────────────┘
       │
       ▼
  Only Customer A's data visible
```

---

## Integration Details

### EUDAMED XML Export

```typescript
// EUDAMED XML Generator
interface EudamedExporter {
  generateDeviceXML(product: Product): string;
  generateActorXML(manufacturer: Manufacturer): string;
  validateXML(xml: string): ValidationResult;
  exportPackage(products: Product[]): Buffer; // ZIP file
}

// Example output structure
const eudamedXML = `
<?xml version="1.0" encoding="UTF-8"?>
<device xmlns="http://ec.europa.eu/eudamed">
  <basicUDI>
    <issuingEntityCode>GS1</issuingEntityCode>
    <deviceIdentifier>${product.udi_di}</deviceIdentifier>
  </basicUDI>
  <deviceName>${product.name}</deviceName>
  <manufacturerSRN>${manufacturer.srn}</manufacturerSRN>
  <authorisedRepSRN>${qbd.srn}</authorisedRepSRN>
  <riskClass>${product.classification}</riskClass>
  <!-- ... more fields -->
</device>
`;
```

### Notification Service

```typescript
// Notification triggers
const notificationTriggers = {
  'document.uploaded': {
    recipients: ['assigned_ec_rep', 'ec_rep_manager'],
    template: 'document_uploaded',
    channel: ['email', 'in_app'],
  },
  'document.approved': {
    recipients: ['customer'],
    template: 'document_approved',
    channel: ['email', 'in_app'],
  },
  'certificate.expiring_4w': {
    recipients: ['customer', 'assigned_ec_rep'],
    template: 'certificate_expiring',
    channel: ['email'],
  },
  'certificate.expiring_1w': {
    recipients: ['customer', 'assigned_ec_rep', 'ec_rep_manager'],
    template: 'certificate_expiring_urgent',
    channel: ['email', 'in_app'],
  },
  'submission.registered': {
    recipients: ['customer'],
    template: 'product_registered',
    channel: ['email', 'in_app'],
  },
};
```

---

## Deployment Architecture

### Azure Deployment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Azure Subscription                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Resource Group: ifucare-prod-eu                                            │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ App Service     │  │ App Service     │  │ Azure Functions │             │
│  │ (Frontend)      │  │ (API)           │  │ (Background)    │             │
│  │                 │  │                 │  │                 │             │
│  │ P1v2 (Prod)     │  │ P2v2 (Prod)     │  │ Consumption     │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ Azure Database  │  │ Azure Cache     │  │ Blob Storage    │             │
│  │ for PostgreSQL  │  │ for Redis       │  │                 │             │
│  │                 │  │                 │  │ Hot + Cool tier │             │
│  │ Flexible Server │  │ Basic C1        │  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ Azure Front Door│  │ Key Vault       │  │ Application     │             │
│  │ (CDN + WAF)     │  │ (Secrets)       │  │ Insights        │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Infrastructure Cost Estimate

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| App Service (Frontend) | P1v2 | €75 |
| App Service (API) | P2v2 | €150 |
| Azure Functions | Consumption | €20 |
| PostgreSQL Flexible | GP, 2 vCores | €150 |
| Redis Cache | Basic C1 | €40 |
| Blob Storage (1TB) | Hot + Cool | €50 |
| Azure Front Door | Standard | €35 |
| Application Insights | | €30 |
| **Total** | | **~€550/month** |
| **Annual** | | **~€6,600** |

---

## Disaster Recovery & Business Continuity

### Backup Strategy

| Component | Backup Method | Frequency | Retention |
|-----------|--------------|-----------|-----------|
| **PostgreSQL Database** | Azure automated backup | Continuous (PITR) | 35 days |
| **Blob Storage (Documents)** | Geo-redundant storage (GRS) | Real-time | Indefinite |
| **Application Config** | Git repository | On change | Indefinite |
| **Secrets (Key Vault)** | Azure managed backup | Daily | 90 days |

### Recovery Point Objective (RPO) & Recovery Time Objective (RTO)

| Scenario | RPO | RTO | Strategy |
|----------|-----|-----|----------|
| **Database corruption** | 5 minutes | 1 hour | Point-in-time restore |
| **Region failure** | 1 hour | 4 hours | Geo-restore to paired region |
| **Accidental deletion** | 0 (soft delete) | 15 minutes | Restore from soft delete |
| **Application failure** | 0 | 30 minutes | Redeploy from Git |

### Regulatory Compliance

Per MDR/IVDR requirements, technical documentation must be retained for **10+ years** after the last device is placed on the market:

- **Document Storage:** Azure Blob with LRS (locally redundant) + archive tier for long-term
- **Audit Logs:** Retained indefinitely, archived after 2 years
- **Database Backups:** Long-term retention policy (yearly backups kept 10 years)

### Disaster Recovery Procedures

```
1. DETECTION
   └── Azure Monitor alerts trigger on:
       • App Service health check failures
       • Database connectivity issues
       • Storage availability <99.9%

2. ASSESSMENT (15 min)
   └── On-call engineer:
       • Identifies affected components
       • Determines scope (partial vs full)
       • Initiates communication

3. RECOVERY
   ├── Database Issue:
   │   └── Point-in-time restore to new server
   │   └── Update connection strings
   │   └── Verify data integrity
   │
   ├── Application Issue:
   │   └── Rollback to previous deployment
   │   └── Or redeploy from Git main branch
   │
   └── Region Failure:
       └── Activate geo-secondary database
       └── Deploy app to backup region
       └── Update DNS/Front Door routing

4. VERIFICATION
   └── Run health checks
   └── Verify critical workflows
   └── Confirm data integrity

5. POST-INCIDENT
   └── Root cause analysis
   └── Update runbooks if needed
   └── Customer communication
```

### Annual DR Testing

| Test | Frequency | Duration | Success Criteria |
|------|-----------|----------|------------------|
| Database restore | Quarterly | 2 hours | Data integrity verified |
| Full region failover | Annually | 4 hours | All services operational |
| Backup verification | Monthly | 1 hour | Backups readable |
