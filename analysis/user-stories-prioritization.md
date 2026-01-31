# User Stories Prioritization Framework

## Overview

The case study mentions 70 user stories. This document provides a framework for prioritizing and phasing these requirements.

## Prioritization Methodology: MoSCoW + WSJF

### MoSCoW Categories

| Category | Definition | Criteria |
|----------|------------|----------|
| **Must Have** | Non-negotiable for MVP | Regulatory requirement OR core functionality |
| **Should Have** | Important but not critical | High value, can launch without |
| **Could Have** | Desirable enhancements | Nice-to-have, low urgency |
| **Won't Have** | Out of scope for now | Future consideration |

### WSJF (Weighted Shortest Job First)

For prioritizing within categories:

```
WSJF Score = (Business Value + Time Criticality + Risk Reduction) / Job Size
```

| Factor | Scale | Description |
|--------|-------|-------------|
| Business Value | 1-10 | Revenue, customer satisfaction, efficiency |
| Time Criticality | 1-10 | Urgency, regulatory deadlines |
| Risk Reduction | 1-10 | Compliance, operational risk |
| Job Size | 1-10 | Development effort (1=small, 10=large) |

---

## User Stories by Category

### Must Have (Phase 1) - ~20 Stories

#### Product Management

| ID | User Story | As a... | WSJF |
|----|------------|---------|------|
| M01 | Create new product record | EC Rep Assistant | 8.5 |
| M02 | Update product details | EC Rep Assistant | 8.0 |
| M03 | Delete/archive product | EC Rep Expert | 6.0 |
| M04 | View product list with filters | All users | 9.0 |
| M05 | Assign UDI-DI to product | EC Rep Assistant | 7.5 |
| M06 | Categorize by device type (IVD, MD) | EC Rep Assistant | 7.0 |
| M07 | Set product classification | EC Rep Expert | 7.0 |
| M08 | Link product to applicable regulation | EC Rep Expert | 7.5 |

#### Document Management

| ID | User Story | As a... | WSJF |
|----|------------|---------|------|
| M09 | Upload document to product | Customer | 9.5 |
| M10 | Download document | All users | 9.0 |
| M11 | View document list per product | All users | 8.5 |
| M12 | Set document type (DoC, IFU, etc.) | EC Rep Assistant | 7.0 |
| M13 | View document version history | EC Rep Expert | 6.5 |
| M14 | Replace document (new version) | Customer | 8.0 |

#### User & Access Management

| ID | User Story | As a... | WSJF |
|----|------------|---------|------|
| M15 | Login with SSO (QBD employees) | QBD User | 9.0 |
| M16 | Login with username/password (customers) | Customer | 9.0 |
| M17 | View only my manufacturer's data | Customer | 10.0 |
| M18 | Assign EC Rep to manufacturer | EC Rep Manager | 7.0 |

#### Basic Workflows

| ID | User Story | As a... | WSJF |
|----|------------|---------|------|
| M19 | Set document status (under review, approved) | EC Rep Expert | 8.5 |
| M20 | Receive notification on document upload | EC Rep Assistant | 8.0 |

---

### Should Have (Phase 2) - ~25 Stories

#### Workflow Automation

| ID | User Story | As a... | WSJF |
|----|------------|---------|------|
| S01 | Configure status workflow transitions | EC Rep Manager | 7.5 |
| S02 | Auto-assign documents to reviewer | EC Rep Manager | 7.0 |
| S03 | Add comments to documents | EC Rep Expert | 6.5 |
| S04 | Request document revision from customer | EC Rep Expert | 7.0 |
| S05 | Track SLA per document review | EC Rep Manager | 6.0 |

#### Certificate & Expiry Tracking

| ID | User Story | As a... | WSJF |
|----|------------|---------|------|
| S06 | Add certificate with expiry date | EC Rep Assistant | 9.0 |
| S07 | Receive alert 4 weeks before expiry | All users | 9.5 |
| S08 | Receive alert 1 week before expiry | All users | 9.0 |
| S09 | View all expiring certificates dashboard | EC Rep Manager | 8.0 |
| S10 | Configure alert timing preferences | Administrator | 5.0 |
| S11 | Send daily digest instead of individual alerts | Administrator | 5.5 |

#### Regulatory Submissions

| ID | User Story | As a... | WSJF |
|----|------------|---------|------|
| S12 | Set submission status per product | EC Rep Expert | 7.5 |
| S13 | Record registration number from authority | EC Rep Expert | 8.0 |
| S14 | Export EUDAMED-compatible XML | EC Rep Expert | 7.0 |
| S15 | Export Swissdamed-compatible XML | EC Rep Expert | 6.5 |
| S16 | Track submission history | EC Rep Expert | 6.0 |

#### Customer Communication

| ID | User Story | As a... | WSJF |
|----|------------|---------|------|
| S17 | Customer receives status change notification | Customer | 8.0 |
| S18 | Customer views submission status | Customer | 8.5 |
| S19 | Customer sees registration numbers | Customer | 7.5 |
| S20 | Customer views document comments | Customer | 6.5 |

#### Project Management

| ID | User Story | As a... | WSJF |
|----|------------|---------|------|
| S21 | Assign EC Rep team member as main contact | EC Rep Manager | 6.0 |
| S22 | View workload per team member | EC Rep Manager | 5.5 |
| S23 | Filter products by assigned EC Rep | EC Rep Manager | 5.0 |
| S24 | Set manufacturer priority level | EC Rep Manager | 4.5 |
| S25 | Track time spent per manufacturer | EC Rep Manager | 4.0 |

---

### Could Have (Phase 3) - ~15 Stories

#### Advanced Features

| ID | User Story | As a... | WSJF |
|----|------------|---------|------|
| C01 | Bulk upload documents | Customer | 6.0 |
| C02 | Bulk update product status | EC Rep Assistant | 5.5 |
| C03 | Bulk export products to Excel | EC Rep Manager | 5.0 |
| C04 | Compare document versions side-by-side | EC Rep Expert | 4.5 |
| C05 | Template-based document generation | EC Rep Expert | 4.0 |

#### CoFS Workflow

| ID | User Story | As a... | WSJF |
|----|------------|---------|------|
| C06 | Request Certificate of Free Sales | Customer | 6.5 |
| C07 | Track CoFS request status | Customer | 6.0 |
| C08 | Generate CoFS from template | EC Rep Assistant | 5.5 |
| C09 | Download completed CoFS | Customer | 6.0 |
| C10 | Set CoFS SLA tracking | EC Rep Manager | 4.0 |

#### Analytics & Reporting

| ID | User Story | As a... | WSJF |
|----|------------|---------|------|
| C11 | View portfolio overview dashboard | EC Rep Manager | 5.5 |
| C12 | Generate compliance report | EC Rep Manager | 5.0 |
| C13 | Export audit log | Administrator | 4.5 |
| C14 | View customer activity report | EC Rep Manager | 4.0 |
| C15 | Custom report builder | Administrator | 3.0 |

---

### Won't Have (Backlog) - ~10 Stories

| ID | User Story | Rationale for Deferral |
|----|------------|----------------------|
| W01 | AI-powered document review | Complex, uncertain value |
| W02 | Mobile app for customers | Web-first approach |
| W03 | Direct EUDAMED API integration | API still evolving |
| W04 | Automated translation of documents | Out of scope |
| W05 | Integration with customer ERP | Customer-specific |
| W06 | Predictive certificate renewal | Advanced analytics |
| W07 | Customer self-registration | Security considerations |
| W08 | Multi-language portal UI | English-first |
| W09 | Chatbot for customer support | Premature optimization |
| W10 | Blockchain audit trail | Overkill for requirements |

---

## Phase Mapping

### Phase 1: Foundation (Months 1-2)
- **Stories:** M01-M20 (Must Have)
- **Theme:** Core platform, customer workspaces, document management
- **Exit Criteria:** Customers can login, view products, upload documents

### Phase 2: Automation (Months 3-4)
- **Stories:** S01-S25 (Should Have)
- **Theme:** Workflows, alerts, regulatory preparation
- **Exit Criteria:** Automated expiry alerts, submission tracking, EUDAMED export

### Phase 3: Enhancement (Months 5-6)
- **Stories:** C01-C15 (Could Have)
- **Theme:** Efficiency, analytics, advanced workflows
- **Exit Criteria:** Bulk operations, CoFS workflow, dashboards

---

## Stakeholder Input Matrix

| Stakeholder | Priority Focus | Stories to Validate |
|-------------|---------------|---------------------|
| Customers | Self-service, visibility | M09, M17, S17-S20, C06-C09 |
| EC Rep Assistants | Efficiency, reduce manual work | M01-M08, S06-S11 |
| EC Rep Experts | Regulatory accuracy | M19, S12-S16, C04 |
| EC Rep Manager | Oversight, reporting | S21-S25, C11-C15 |
| IT/Admin | Security, maintenance | M15-M16, S10-S11 |

---

## Validation Checklist

Before finalizing priorities, validate with stakeholders:

- [ ] Customer interviews (3-5 key manufacturers)
- [ ] EC Rep team workshop
- [ ] EC Rep Manager signoff
- [ ] IT security review
- [ ] Regulatory compliance check
- [ ] IFUcare technical assessment

## Iteration Approach

```
Sprint 0 (2 weeks)
├── Technical setup
├── Architecture decisions
└── UI/UX wireframes

Sprints 1-4 (Phase 1)
├── Sprint 1: Auth + Customer workspace
├── Sprint 2: Product CRUD
├── Sprint 3: Document upload/download
└── Sprint 4: Document status workflow + Basic notifications

MVP Launch

Sprints 5-8 (Phase 2)
├── Sprint 5: Certificate tracking
├── Sprint 6: Expiry alerts
├── Sprint 7: EUDAMED export
└── Sprint 8: Submission tracking + Customer notifications

Sprints 9-12 (Phase 3)
├── Sprint 9: Bulk operations
├── Sprint 10: CoFS workflow
├── Sprint 11: Analytics
└── Sprint 12: Optimization + Final testing
```
