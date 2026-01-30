# Current State Assessment

## Service Overview

### Authorized Representative Services

QBD Group provides market access services for medical device manufacturers:

| Service | Market | Regulatory Authority | Database |
|---------|--------|---------------------|----------|
| **EC-REP** | European Union | FAGG (Belgium) | EUDAMED |
| **CH-REP** | Switzerland | Swissmedic | Swissdamed |
| **UKRP** | United Kingdom | MHRA | MHRA Registration |

### Regulatory Context

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Medical Device Manufacturer                          │
│                    (Legal Manufacturer - Non-EU)                         │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  │ Appoints
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    QBD Group (Authorized Representative)                 │
│                                                                          │
│  Responsibilities:                                                       │
│  • Maintain technical documentation                                      │
│  • Register products with competent authorities                         │
│  • Handle vigilance reporting                                           │
│  • Respond to authority requests                                        │
│  • Maintain traceability (UDI)                                          │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
      ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
      │    FAGG     │     │  Swissmedic │     │    MHRA     │
      │  (Belgium)  │     │(Switzerland)│     │    (UK)     │
      │             │     │             │     │             │
      │  EUDAMED    │     │  Swissdamed │     │   MHRA DB   │
      └─────────────┘     └─────────────┘     └─────────────┘
```

## Current Tools & Processes

### AR Logs (Excel Spreadsheets)

The EC-Rep team manages everything in Excel workbooks:

**AR Log Structure:**

| Sheet | Content | Update Frequency |
|-------|---------|------------------|
| Manufacturers | Customer info, contacts, contract details | As needed |
| Products | Device portfolio, UDI-DIs, classifications | Weekly |
| Documents | DoC, IFU, labels, certificates | Daily |
| Submissions | Regulatory submissions, status | Weekly |
| Certificates | ISO, NB certs, insurance, expiry dates | Monthly |
| Registration Numbers | Authority-assigned numbers | As received |

**Sample AR Log Columns (Products Sheet):**

```
| Manufacturer | Product Name | UDI-DI | Device Type | Class | Regulation |
|--------------|--------------|--------|-------------|-------|------------|
| Acme Devices | CardioMonitor X1 | 123456789 | IVD | Class B | IVDR |
| Acme Devices | CardioMonitor X2 | 123456790 | IVD | Class B | IVDR |
| BioTech Inc | SurgicalKit Pro | 987654321 | MD | Class IIa | MDR |
```

### Document Management

**Current State:**
- Documents stored in SharePoint/Teams folders
- Folder structure by manufacturer → product → document type
- No version control beyond filename conventions
- Manual tracking of document status

**Document Types Managed:**

| Document | Description | Source | Expiry |
|----------|-------------|--------|--------|
| DoC (Declaration of Conformity) | Manufacturer declaration | Manufacturer | Per cert renewal |
| IFU (Instructions for Use) | User instructions | Manufacturer | Per revision |
| Labels | Product labeling | Manufacturer | Per revision |
| Technical Documentation | Full device dossier | Manufacturer | Ongoing |
| ISO Certificate | Quality management cert | Notified Body | 3 years |
| NB Certificate | Conformity certificate | Notified Body | 5 years |
| Insurance Certificate | Product liability | Insurer | Annual |

### Regulatory Submissions

**Process Flow:**

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Manufacturer│    │  QBD Team    │    │   QBD Team   │    │  Authority   │
│  Provides    │───▶│  Reviews     │───▶│   Submits    │───▶│  Processes   │
│  Documents   │    │  Documents   │    │  to Authority│    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │                   │
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
   Via Email          Manual Check        EUDAMED/Portal      Registration
   or Portal          in Excel            Manual Entry        Number Issued
```

### Certificate of Free Sales (CoFS) Requests

**Current Process:**
1. Customer sends email request
2. EC Rep team logs in Excel
3. Team prepares CoFS document
4. Document sent to customer via email
5. No centralized tracking of requests/fulfillment

## User Types & Responsibilities

### Customer (Legal Manufacturer)

| Capability | Current | Desired |
|------------|---------|---------|
| View product portfolio | Email request | Self-service |
| Upload documents | Email attachment | Portal upload |
| Track submission status | Email inquiry | Dashboard |
| Request CoFS | Email | Portal request |
| View expiring certificates | Email notification | Dashboard |

### EC Rep Assistant

| Responsibility | Current Tool | Pain Point |
|----------------|--------------|------------|
| Receive documents | Email/Teams | No tracking |
| Update AR logs | Excel | Manual, error-prone |
| Track deadlines | Excel + calendar | Easy to miss |
| Communicate with customers | Email | No history |

### EC Rep Expert

| Responsibility | Current Tool | Pain Point |
|----------------|--------------|------------|
| Review technical documentation | Manual | Time-consuming |
| Submit to authorities | EUDAMED portal | Double entry |
| Manage manufacturer workspace | Excel | Limited visibility |
| Handle complex queries | Email | No knowledge base |

### EC Rep Manager

| Responsibility | Current Tool | Pain Point |
|----------------|--------------|------------|
| Oversee all manufacturers | Excel | No dashboard |
| Assign work | Verbal/email | No tracking |
| Monitor compliance | Excel | Reactive |
| Report to management | Manual compilation | Time-consuming |

## Integration Points

### Current Integrations

| System | Integration | Status |
|--------|------------|--------|
| EUDAMED | Manual data entry | None |
| Swissdamed | Manual data entry | None |
| MHRA | Manual data entry | None |
| IFUcare | None | Separate platform |
| Email (Outlook) | Manual | Native |

### EUDAMED Requirements

EUDAMED (European Database on Medical Devices) requires:

- Actor registration (manufacturer, AR)
- UDI/Device registration
- Certificate registration
- Vigilance reporting
- Clinical investigation registration

**XML Export Format Required:**
- Structured data export
- Specific schema compliance
- Validation before submission

## Volume Metrics (Estimated)

| Metric | Current Volume |
|--------|---------------|
| Manufacturers (customers) | 50-100 |
| Products under management | 500-1000 |
| Documents per product | 5-15 |
| Certificates tracked | 200-400 |
| CoFS requests/month | 20-40 |
| New registrations/month | 10-20 |
| Document updates/month | 50-100 |

## Compliance Requirements

### Regulatory Requirements

| Requirement | Regulation | Implication |
|-------------|------------|-------------|
| Traceability | MDR/IVDR Art. 25 | Full audit trail |
| Document retention | MDR/IVDR | 10+ years |
| Authority access | MDR/IVDR Art. 11 | Immediate availability |
| UDI compliance | MDR/IVDR | UDI-DI tracking |
| Vigilance | MDR/IVDR | Incident reporting |

### Data Protection

| Requirement | Standard | Status |
|-------------|----------|--------|
| GDPR compliance | EU GDPR | Required |
| Data encryption | Industry standard | Required |
| Access controls | ISO 27001 | Required |
| Audit logging | Regulatory | Required |
| Data residency | EU | Required |
