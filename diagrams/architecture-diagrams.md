# Architecture Diagrams

## 1. Solution Overview

```mermaid
flowchart TB
    subgraph Customers["Legal Manufacturers (Customers)"]
        C1[Customer A]
        C2[Customer B]
        C3[Customer C]
    end

    subgraph Portal["IFUcare AR Portal"]
        subgraph Modules["Application Modules"]
            eIFU[eIFU Module<br/>Existing]
            AR[AR Services Module<br/>NEW]
        end
        subgraph Shared["Shared Services"]
            Auth[Authentication]
            Docs[Document Storage]
            Notify[Notifications]
            Audit[Audit Log]
        end
    end

    subgraph QBD["QBD Team"]
        Assistant[EC Rep Assistant]
        Expert[EC Rep Expert]
        Manager[EC Rep Manager]
    end

    subgraph Regulators["Regulatory Authorities"]
        EUDAMED[EUDAMED<br/>EU]
        Swiss[Swissdamed<br/>Switzerland]
        MHRA[MHRA<br/>UK]
    end

    Customers --> Portal
    QBD --> Portal
    Portal --> Regulators

    style AR fill:#90EE90
    style eIFU fill:#87CEEB
```

## 2. Customer Journey Flow

```mermaid
flowchart LR
    subgraph Onboarding
        A[Contract Signed] --> B[Account Created]
        B --> C[Login Credentials]
        C --> D[First Login]
    end

    subgraph DailyUse["Daily Operations"]
        D --> E[Upload Documents]
        E --> F[Track Status]
        F --> G[View Registrations]
        G --> H[Receive Alerts]
    end

    subgraph Ongoing
        H --> I[Renew Certificates]
        I --> J[Request CoFS]
        J --> K[Update Products]
        K --> E
    end

    style D fill:#90EE90
    style E fill:#90EE90
    style F fill:#90EE90
```

## 3. Document Workflow

```mermaid
stateDiagram-v2
    [*] --> Uploaded: Customer uploads

    Uploaded --> PendingReview: Auto-assign
    PendingReview --> UnderReview: EC Rep claims

    UnderReview --> Approved: Pass review
    UnderReview --> NeedsRevision: Issues found

    NeedsRevision --> Uploaded: Customer resubmits

    Approved --> ReadyForSubmission: All docs approved
    ReadyForSubmission --> Submitted: EC Rep submits to authority
    Submitted --> Registered: Authority confirms
    Submitted --> Rejected: Authority rejects

    Rejected --> Uploaded: Customer fixes

    Registered --> [*]
```

## 4. Product Registration Flow

```mermaid
flowchart TB
    subgraph Customer["Customer Actions"]
        A[Create Product] --> B[Enter Details]
        B --> C[Upload Documents]
        C --> D[Submit for Review]
    end

    subgraph QBD["QBD Review"]
        D --> E{Documents Complete?}
        E -->|No| F[Request Missing Docs]
        F --> C
        E -->|Yes| G[Technical Review]
        G --> H{Approved?}
        H -->|No| I[Request Changes]
        I --> C
        H -->|Yes| J[Prepare Submission]
    end

    subgraph Submission["Regulatory Submission"]
        J --> K[Generate EUDAMED XML]
        K --> L[Submit to Authority]
        L --> M{Accepted?}
        M -->|No| N[Fix Issues]
        N --> J
        M -->|Yes| O[Registration Number Received]
    end

    subgraph Complete["Completion"]
        O --> P[Update Product Status]
        P --> Q[Notify Customer]
        Q --> R[Product Registered]
    end

    style R fill:#90EE90
```

## 5. Certificate Expiry Alert Flow

```mermaid
flowchart TB
    A[Daily Cron Job<br/>6:00 AM] --> B[Query Certificates]
    B --> C{Check Expiry Dates}

    C --> D[4+ Weeks Away]
    C --> E[4 Weeks Away]
    C --> F[1 Week Away]
    C --> G[Expired]

    D --> H[No Action]

    E --> I{Alert Sent?}
    I -->|No| J[Send 4-Week Alert]
    J --> K[Mark Alert Sent]
    I -->|Yes| H

    F --> L{Alert Sent?}
    L -->|No| M[Send 1-Week Alert<br/>URGENT]
    M --> N[Mark Alert Sent]
    L -->|Yes| H

    G --> O{Weekly Alert Due?}
    O -->|Yes| P[Send Expired Alert]
    O -->|No| H

    subgraph Recipients
        J --> Q[Customer + EC Rep]
        M --> R[Customer + EC Rep + Manager]
        P --> S[All + Management]
    end

    style M fill:#FFB6C1
    style P fill:#FF6B6B
```

## 6. System Architecture

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph CDN["Edge Layer"]
        FD[Azure Front Door<br/>CDN + WAF]
    end

    subgraph App["Application Layer"]
        FE[Frontend<br/>Next.js]
        API[API Server<br/>Node.js]
        Worker[Background Worker<br/>BullMQ]
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL)]
        Redis[(Redis)]
        Blob[(Azure Blob)]
        Search[(Elasticsearch)]
    end

    subgraph External["External Services"]
        Email[SendGrid<br/>Email]
        AAD[Azure AD<br/>SSO]
    end

    Client --> FD
    FD --> FE
    FE --> API
    API --> Worker

    API --> PG
    API --> Redis
    API --> Blob
    API --> Search

    Worker --> Email
    API --> AAD

    style FE fill:#61DAFB
    style API fill:#68A063
    style PG fill:#336791
```

## 7. Data Model

```mermaid
erDiagram
    MANUFACTURER ||--o{ PRODUCT : has
    MANUFACTURER ||--o{ CERTIFICATE : has
    MANUFACTURER ||--o{ USER : has
    PRODUCT ||--o{ DOCUMENT : has
    PRODUCT ||--o{ SUBMISSION : has

    MANUFACTURER {
        uuid id PK
        string name
        string legal_name
        jsonb address
        string[] services
        uuid assigned_ec_rep FK
        date contract_start
        date contract_end
    }

    PRODUCT {
        uuid id PK
        uuid manufacturer_id FK
        string name
        string udi_di
        string device_type
        string classification
        string regulation
        string status
    }

    DOCUMENT {
        uuid id PK
        uuid product_id FK
        string document_type
        string name
        string version
        string file_url
        string status
        uuid uploaded_by FK
        uuid reviewed_by FK
    }

    CERTIFICATE {
        uuid id PK
        uuid manufacturer_id FK
        string certificate_type
        string issuer
        date expiry_date
        string file_url
        string status
    }

    SUBMISSION {
        uuid id PK
        uuid product_id FK
        string authority
        string status
        string registration_number
        timestamp submitted_at
    }

    USER {
        uuid id PK
        uuid manufacturer_id FK
        string email
        string role
        timestamp last_login
    }
```

## 8. User Roles & Permissions

```mermaid
flowchart TB
    subgraph Roles["User Roles"]
        Customer[Customer<br/>Legal Manufacturer]
        Assistant[EC Rep Assistant]
        Expert[EC Rep Expert]
        Manager[EC Rep Manager]
        Admin[Administrator]
    end

    subgraph Permissions["Permissions"]
        ViewOwn[View Own Data]
        ViewAll[View All Data]
        Upload[Upload Documents]
        Review[Review Documents]
        Approve[Approve Documents]
        Submit[Submit to Authorities]
        Configure[Configure System]
        ManageUsers[Manage Users]
    end

    Customer --> ViewOwn
    Customer --> Upload

    Assistant --> ViewAll
    Assistant --> Review

    Expert --> ViewAll
    Expert --> Review
    Expert --> Approve
    Expert --> Submit

    Manager --> ViewAll
    Manager --> Approve
    Manager --> ManageUsers
    Manager --> Configure

    Admin --> Configure
    Admin --> ManageUsers

    style Customer fill:#E6F3FF
    style Assistant fill:#FFF3E6
    style Expert fill:#E6FFE6
    style Manager fill:#FFE6E6
    style Admin fill:#F0E6FF
```

## 9. Implementation Timeline

```mermaid
gantt
    title AR Portal Implementation (6 Months)
    dateFormat  YYYY-MM-DD

    section Phase 1
    Setup & Planning        :p1a, 2026-02-01, 14d
    Authentication          :p1b, after p1a, 14d
    Product Management      :p1c, after p1b, 14d
    Document Management     :p1d, after p1c, 14d

    section Phase 2
    Certificate Tracking    :p2a, after p1d, 14d
    Expiry Alerts          :p2b, after p2a, 14d
    EUDAMED Export         :p2c, after p2b, 14d
    Submission Tracking    :p2d, after p2c, 14d

    section Phase 3
    CoFS Workflow          :p3a, after p2d, 14d
    Bulk Operations        :p3b, after p3a, 14d
    Analytics              :p3c, after p3b, 14d
    Launch Preparation     :p3d, after p3c, 14d

    section Milestones
    Phase 1 Complete       :milestone, m1, after p1d, 0d
    Phase 2 Complete       :milestone, m2, after p2d, 0d
    Go Live                :milestone, m3, after p3d, 0d
```

## 10. Integration Architecture

```mermaid
flowchart LR
    subgraph Portal["AR Portal"]
        API[API Server]
        Export[Export Service]
        Notify[Notification Service]
    end

    subgraph Regulatory["Regulatory Databases"]
        EU[EUDAMED<br/>XML Export]
        CH[Swissdamed<br/>XML Export]
        UK[MHRA<br/>Manual]
    end

    subgraph Comms["Communications"]
        Email[Email<br/>SendGrid]
        InApp[In-App<br/>Notifications]
    end

    subgraph Auth["Authentication"]
        AAD[Azure AD<br/>QBD Staff]
        Local[Local Auth<br/>Customers]
    end

    API --> Export
    Export --> EU
    Export --> CH
    Export -.->|Future| UK

    API --> Notify
    Notify --> Email
    Notify --> InApp

    AAD --> API
    Local --> API

    style EU fill:#003399,color:#fff
    style CH fill:#FF0000,color:#fff
    style UK fill:#00247D,color:#fff
```

## Notes for Presentations

### Exporting Diagrams

1. Copy Mermaid code to [Mermaid Live Editor](https://mermaid.live/)
2. Export as PNG or SVG
3. Import into PowerPoint/Google Slides

### Color Scheme

| Color | Usage |
|-------|-------|
| Green (#90EE90) | New/Success |
| Blue (#87CEEB) | Existing |
| Red (#FFB6C1) | Urgent/Warning |
| Yellow (#FFFACD) | In Progress |
| Gray | External systems |
