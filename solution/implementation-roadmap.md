# Implementation Roadmap

## Overview

**Total Duration:** 6 months (with Claude-assisted development)
**Approach:** Extend IFUcare platform with AR Services module

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Phase 1: Foundation     │  Phase 2: Automation    │  Phase 3: Enhancement  │
│  (Months 1-2)            │  (Months 3-4)           │  (Months 5-6)          │
│                          │                          │                        │
│  • Customer workspaces   │  • Certificate tracking  │  • CoFS workflow       │
│  • Product management    │  • Expiry alerts         │  • Bulk operations     │
│  • Document upload       │  • EUDAMED export        │  • Analytics           │
│  • Basic notifications   │  • Submission tracking   │  • Advanced reporting  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation (Months 1-2)

### Objective
Enable customer self-service with core product and document management.

### Sprint 0: Setup (Week 1-2)

| Task | Owner | Deliverable |
|------|-------|-------------|
| Technical assessment of IFUcare | Tech Lead | Architecture compatibility report |
| Development environment setup | DevOps | Local + staging environments |
| Database schema design | Developer | Approved ERD and migrations |
| UI/UX wireframes | Designer | Customer portal mockups |
| Security requirements | Security | Auth and access control spec |

### Sprint 1: Authentication & Workspaces (Week 3-4)

| Task | Owner | Deliverable |
|------|-------|-------------|
| Customer login (extend IFUcare auth) | Developer | Working login |
| Customer workspace isolation | Developer | Tenant data filtering |
| QBD staff SSO integration | Developer | Azure AD SSO |
| Role-based permission system | Developer | RBAC middleware |
| Basic navigation/layout | Developer | Portal shell |

### Sprint 2: Product Management (Week 5-6)

| Task | Owner | Deliverable |
|------|-------|-------------|
| Product CRUD API | Developer | REST endpoints |
| Product list view (customer) | Developer | Filterable table |
| Product detail view | Developer | Product page |
| Product creation form | Developer | Create/edit forms |
| UDI-DI assignment | Developer | UDI field + validation |

### Sprint 3: Document Management (Week 7-8)

| Task | Owner | Deliverable |
|------|-------|-------------|
| Document upload API | Developer | File upload endpoint |
| Document storage (Azure Blob) | Developer | Secure storage |
| Document list per product | Developer | Document table |
| Document download | Developer | Secure download |
| Document status workflow (basic) | Developer | Status field + transitions |

### Phase 1 Deliverables

- [ ] Customer portal with login
- [ ] Product CRUD (create, read, update, archive)
- [ ] Document upload and download
- [ ] Basic status tracking
- [ ] QBD staff access to all data

### Phase 1 Success Criteria

| Metric | Target |
|--------|--------|
| Customers can login | 100% |
| Products can be created | Yes |
| Documents can be uploaded | Yes |
| Data isolation working | 100% |
| Page load time | <2 seconds |

### Phase 1 Quick Win
**Customer self-service** - Customers can upload documents 24/7

---

## Phase 2: Automation (Months 3-4)

### Objective
Automate certificate tracking, expiry alerts, and regulatory submissions.

### Sprint 4: Certificate Tracking (Week 9-10)

| Task | Owner | Deliverable |
|------|-------|-------------|
| Certificate entity + API | Developer | CRUD for certificates |
| Certificate list view | Developer | Expiry-sorted table |
| Certificate upload | Developer | File attachment |
| Expiry date tracking | Developer | Date field + calculation |

### Sprint 5: Expiry Alerts (Week 11-12)

| Task | Owner | Deliverable |
|------|-------|-------------|
| Alert scheduling (cron job) | Developer | Daily alert check |
| 4-week expiry alerts | Developer | Email notifications |
| 1-week expiry alerts | Developer | Email + in-app |
| Expired certificate alerts | Developer | Weekly digest |
| Expiry dashboard | Developer | Portfolio expiry view |

### Sprint 6: EUDAMED Export (Week 13-14)

| Task | Owner | Deliverable |
|------|-------|-------------|
| EUDAMED XML schema | Developer | Schema compliance |
| Device XML generator | Developer | Export function |
| Validation rules | Developer | Pre-export checks |
| Export UI | Developer | Download button |
| Swissdamed export (similar) | Developer | Swiss format |

### Sprint 7: Submission Tracking (Week 15-16)

| Task | Owner | Deliverable |
|------|-------|-------------|
| Submission entity + API | Developer | CRUD for submissions |
| Submission workflow | Developer | Status state machine |
| Registration number capture | Developer | Field + history |
| Customer submission view | Developer | Status visibility |
| Notifications on status change | Developer | Email + in-app |

### Phase 2 Deliverables

- [ ] Certificate tracking with expiry dates
- [ ] Automated expiry alerts (4w, 1w, expired)
- [ ] EUDAMED XML export
- [ ] Swissdamed XML export
- [ ] Submission status tracking
- [ ] Customer visibility into submissions

### Phase 2 Success Criteria

| Metric | Target |
|--------|--------|
| Certificates tracked | 100% migrated |
| Expiry alerts working | 100% |
| XML export valid | Passes EUDAMED validation |
| Customer visibility | Can see all submissions |

### Phase 2 Quick Win
**Zero missed expirations** - Automated alerts prevent compliance gaps

---

## Phase 3: Enhancement (Months 5-6)

### Objective
Add efficiency features, analytics, and advanced workflows.

### Sprint 8: CoFS Workflow (Week 17-18)

| Task | Owner | Deliverable |
|------|-------|-------------|
| CoFS request entity + API | Developer | Request management |
| Customer CoFS request form | Developer | Self-service request |
| QBD CoFS queue | Developer | Request list |
| CoFS document generation | Developer | Template-based |
| CoFS delivery notification | Developer | Email to customer |

### Sprint 9: Bulk Operations (Week 19-20)

| Task | Owner | Deliverable |
|------|-------|-------------|
| Bulk document upload | Developer | Multi-file upload |
| Bulk status update | Developer | Batch operations |
| Bulk export to Excel | Developer | Report download |
| Import from Excel | Developer | Migration support |

### Sprint 10: Analytics & Dashboards (Week 21-22)

| Task | Owner | Deliverable |
|------|-------|-------------|
| QBD portfolio dashboard | Developer | All-customer view |
| Customer dashboard | Developer | My-portfolio view |
| Compliance status report | Developer | Color-coded status |
| Activity report | Developer | User activity log |
| Custom filters | Developer | Advanced filtering |

### Sprint 11: Polish & Launch (Week 23-24)

| Task | Owner | Deliverable |
|------|-------|-------------|
| Performance optimization | Developer | <1s page loads |
| Security audit | Security | Penetration test |
| User acceptance testing | QA | UAT signoff |
| Documentation | Developer | User guides |
| Training materials | PM | Training deck |
| Production deployment | DevOps | Go-live |

### Phase 3 Deliverables

- [ ] CoFS request workflow
- [ ] Bulk upload/export
- [ ] Portfolio analytics dashboard
- [ ] Customer dashboard
- [ ] Compliance reporting
- [ ] Production deployment

### Phase 3 Success Criteria

| Metric | Target |
|--------|--------|
| CoFS turnaround | <48 hours |
| Bulk upload working | Up to 50 files |
| Dashboard load time | <3 seconds |
| User satisfaction | >4.0/5 |

### Phase 3 Quick Win
**Full visibility** - Complete portfolio overview for management

---

## Migration Strategy

### Excel to Portal Migration

```
Week 1-2: Data Preparation
├── Export AR logs to CSV
├── Data cleansing scripts
├── Validate data quality
└── Create mapping document

Week 3: Test Migration
├── Import to staging environment
├── Validate counts and data
├── Fix data issues
└── Re-import if needed

Week 4: Parallel Running
├── Use both Excel and Portal
├── New data in Portal only
├── Compare results daily
└── Train users

Week 5: Cutover
├── Final data sync
├── Disable Excel write access
├── Portal as primary
└── Excel read-only archive

Week 6+: Monitoring
├── Support ticket tracking
├── Data quality checks
├── User feedback collection
└── Iterate on issues
```

### Migration Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Data quality issues | High | Cleansing scripts, validation |
| User resistance | Medium | Training, early involvement |
| Missing data | Medium | Reconciliation process |
| Downtime | Low | Parallel running period |

---

## Resource Plan

### Team Structure

| Role | Allocation | Phase 1 | Phase 2 | Phase 3 |
|------|------------|---------|---------|---------|
| Project Manager | 30% | ✓ | ✓ | ✓ |
| Senior Developer | 100% | ✓ | ✓ | ✓ |
| Mid Developer | 100% | ✓ | ✓ | ✓ |
| UI/UX Designer | 30% | ✓ | | |
| QA Tester | 20% | | ✓ | ✓ |
| EC Rep Expert (SME) | 10% | ✓ | ✓ | ✓ |

### Claude Code Integration

| Task | Claude Contribution | Human Review |
|------|---------------------|--------------|
| Database migrations | Generate SQL | Verify constraints |
| API endpoints | Full implementation | Security review |
| React components | Generate code | UX review |
| Unit tests | Generate tests | Coverage review |
| Documentation | Generate docs | Accuracy review |

---

## Go-Live Checklist

### Pre-Launch (Week before)

- [ ] All Phase 1-3 features complete
- [ ] Security audit passed
- [ ] Performance testing passed
- [ ] Data migration validated
- [ ] User training complete
- [ ] Support documentation ready
- [ ] Rollback plan documented

### Launch Day

- [ ] Final data sync from Excel
- [ ] DNS/routing updates
- [ ] Monitoring dashboards active
- [ ] Support team briefed
- [ ] Customer communication sent
- [ ] Executive notification

### Post-Launch (Week after)

- [ ] Daily health checks
- [ ] User feedback collection
- [ ] Bug triage and fixes
- [ ] Performance monitoring
- [ ] Success metrics review

---

## Budget Summary

| Category | Phase 1 | Phase 2 | Phase 3 | Total |
|----------|---------|---------|---------|-------|
| Development | €35,000 | €30,000 | €25,000 | €90,000 |
| Tools (Claude, etc.) | €800 | €800 | €800 | €2,400 |
| Infrastructure | €2,000 | €2,500 | €2,500 | €7,000 |
| QA & Testing | €2,000 | €2,000 | €4,000 | €8,000 |
| Contingency | €4,000 | €3,500 | €3,200 | €10,700 |
| **Total** | **€43,800** | **€38,800** | **€35,500** | **€118,100** |
