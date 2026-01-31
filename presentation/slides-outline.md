# AR Services Portal Presentation Outline (10 Minutes)

## Slide 1: Executive Summary (1 min)

**Key Message:** Recommend extending IFUcare platform to create an integrated AR Services Portal, leveraging existing infrastructure and customer relationships.

### Talking Points:
- Recommend **Extend IFUcare** approach - maximize existing investment
- Phased delivery over **6 months** with early customer value
- Self-service portal reduces operational burden by **40%**
- Regulatory compliance built-in (EUDAMED, Swissdamed, MHRA)
- **ROI positive** within 18 months

---

## Slide 2: Current State Understanding (1.5 min)

**Key Message:** Demonstrate understanding of the regulatory complexity and operational challenges.

### Visual: Service Scope Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  Legal Manufacturers                         │
│            (Medical Device Companies Worldwide)              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    QBD AR Services                           │
├─────────────────┬─────────────────┬─────────────────────────┤
│     EC-REP      │     CH-REP      │        UKRP             │
│   (EU Market)   │  (Swiss Market) │     (UK Market)         │
├─────────────────┼─────────────────┼─────────────────────────┤
│      FAGG       │   Swissmedic    │        MHRA             │
│   (Belgium)     │  (Switzerland)  │        (UK)             │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### Talking Points:
- Managing product portfolios for multiple manufacturers
- Excel-based "AR logs" - manual, error-prone, doesn't scale
- Complex documentation: DoC, IFU, labels, certificates, technical files
- Multiple regulatory databases: EUDAMED, Swissdamed, MHRA
- Certificate tracking: ISO, Notified Body, Insurance - all with expiry dates

---

## Slide 3: Pain Point Prioritization (1.5 min)

**Key Message:** Focus on customer experience and operational efficiency.

### Priority Matrix:

| Priority | Pain Point | Business Impact |
|----------|-----------|-----------------|
| P1 | No customer self-service | High support burden, poor CX |
| P1 | Manual certificate expiry tracking | Compliance risk, reactive work |
| P2 | Excel-based AR logs | Scalability, accuracy, audit |
| P2 | No EUDAMED integration | Manual data entry, errors |
| P3 | Email-based CoFS requests | Tracking, SLA compliance |

### Key Insight:
- 70 user stories → Need prioritization framework
- Focus on **MoSCoW** method for phased delivery

---

## Slide 4: Strategic Decision - Extend IFUcare (2 min)

**Key Message:** Extending IFUcare maximizes ROI and accelerates time-to-value.

### Decision Matrix:

| Factor | Build New | Buy | Extend IFUcare |
|--------|-----------|-----|----------------|
| Time to Value | 12-18 months | 6-9 months | 6-9 months |
| Customer Migration | Complex | Complex | Seamless |
| Brand Consistency | New brand | Vendor brand | IFUcare brand |
| Integration Effort | High | Medium | Low |
| Domain Expertise | Build from scratch | Generic | Already embedded |
| Total Cost (3yr) | €400-500K | €300-400K | €200-300K |

### Why Extend IFUcare:

1. **Existing Customer Base** - Manufacturers already use IFUcare
2. **Regulatory DNA** - Platform built for medical device compliance
3. **Technical Foundation** - Document management, user auth exists
4. **Brand Recognition** - IFUcare known in the industry
5. **Shared Infrastructure** - Reduce operational complexity

---

## Slide 5: Solution Architecture (1.5 min)

**Key Message:** Modular extension to IFUcare with clear separation of concerns.

### Architecture Overview:

```
┌─────────────────────────────────────────────────────────────┐
│                    IFUcare Platform                          │
│                  (Extended for AR Services)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   eIFU      │  │ AR Services │  │   Shared    │         │
│  │   Module    │  │   Module    │  │   Services  │         │
│  │  (existing) │  │   (NEW)     │  │             │         │
│  │             │  │             │  │ • Auth/SSO  │         │
│  │ • eIFU mgmt │  │ • Products  │  │ • Documents │         │
│  │ • QR codes  │  │ • Dossiers  │  │ • Workflow  │         │
│  │ • Analytics │  │ • Certs     │  │ • Alerts    │         │
│  │             │  │ • Reg Submit│  │ • Audit     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                  Integration Layer                           │
│   EUDAMED API  │  Swissdamed  │  MHRA  │  Email/SMTP       │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions:
- **Modular architecture** - AR module independent but integrated
- **Shared services** - Reuse auth, document storage, workflows
- **Customer workspace** - Each manufacturer has isolated view
- **Role-based access** - Customer upload, QBD review/approve

---

## Slide 6: Customer Experience Design (1 min)

**Key Message:** Balance self-service with managed service for premium customer experience.

### Self-Service vs Managed Service:

| Capability | Self-Service | QBD Managed |
|------------|--------------|-------------|
| Document upload | Customer | - |
| Product registration | Customer (draft) | QBD (finalize) |
| Status tracking | Customer | - |
| Certificate alerts | Automated | - |
| Regulatory submission | - | QBD |
| EUDAMED filing | - | QBD |
| CoFS requests | Customer (initiate) | QBD (fulfill) |
| Technical review | - | QBD |

### Customer Dashboard Wireframe:

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] IFUcare AR Portal          Welcome, Acme Devices    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Products   │  │  Documents  │  │   Alerts    │         │
│  │     47      │  │    Pending  │  │     3       │         │
│  │  Registered │  │      12     │  │  Expiring   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  Recent Activity                        Upcoming Expirations │
│  ─────────────────                      ──────────────────── │
│  • Product X submitted (2h ago)         • ISO Cert (14 days) │
│  • DoC approved (yesterday)             • NB Cert (28 days)  │
│  • New comment on Product Y             • Insurance (45 days)│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Slide 7: Implementation Roadmap (1 min)

**Key Message:** Phased approach with early customer value.

### 3-Phase Implementation:

```
Phase 1 (Months 1-2)     Phase 2 (Months 3-4)     Phase 3 (Months 5-6)
─────────────────────    ─────────────────────    ─────────────────────
FOUNDATION               AUTOMATION               INTELLIGENCE

• Customer workspaces    • EUDAMED integration    • Analytics dashboards
• Product management     • Automated alerts       • CoFS workflow
• Document upload        • Status workflows       • Bulk operations
• Basic notifications    • Certificate tracking   • Advanced reporting

Quick Win:               Quick Win:               Quick Win:
Customer self-service    No missed expirations    Full visibility
```

### Migration Strategy:
1. **Parallel Run** - New system alongside Excel for 1 month
2. **Pilot Customers** - 5 key customers first
3. **Gradual Rollout** - Remaining customers over 4 weeks
4. **Excel Sunset** - Archive Excel logs, read-only

---

## Slide 8: User Story Prioritization Framework (0.5 min)

**Key Message:** Structured approach to managing 70 requirements.

### MoSCoW Prioritization:

| Category | Count | Phase | Examples |
|----------|-------|-------|----------|
| **Must Have** | ~20 | Phase 1 | Product CRUD, document upload, basic auth |
| **Should Have** | ~25 | Phase 2 | EUDAMED export, automated alerts, workflows |
| **Could Have** | ~15 | Phase 3 | Advanced analytics, bulk operations |
| **Won't Have** | ~10 | Backlog | AI document review, mobile app |

### Prioritization Criteria:
1. **Regulatory Compliance** - Required for market access
2. **Customer Value** - Reduces friction, improves experience
3. **Operational Efficiency** - Reduces QBD team workload
4. **Technical Dependencies** - Foundation before features

---

## Slide 9: Success Metrics (0.5 min)

**Key Message:** Measurable outcomes tied to business value.

### Key Performance Indicators:

| Metric | Baseline | Target (12mo) |
|--------|----------|---------------|
| Customer self-service rate | 0% | 60% |
| Certificate expiry misses | ~5/year | 0 |
| Document processing time | 48 hours | 24 hours |
| Customer support tickets | ~50/month | 30/month (-40%) |
| EUDAMED submission errors | ~10% | <2% |

### ROI Indicators:
- **Operational savings:** 1 FTE equivalent (~€60K/year)
- **Risk reduction:** Avoided compliance penalties
- **Customer retention:** Improved NPS, reduced churn
- **Scalability:** Handle 2x customers without additional staff

---

## Q&A Preparation

### Anticipated Questions:

1. **"Why not buy a dedicated regulatory platform?"**
   - Regulatory platforms (Rimsys, Veeva) are expensive and complex
   - IFUcare already has regulatory DNA
   - Build on strength rather than start over

2. **"How do you handle the 70 user stories?"**
   - MoSCoW prioritization with stakeholder input
   - Iterative delivery - MVP first, enhance based on feedback
   - Regular sprint reviews with customer involvement

3. **"What about EUDAMED complexity?"**
   - Phase 2 focus - not critical for MVP
   - Start with XML export, evolve to API integration
   - Partner with EUDAMED experts if needed

4. **"Migration risk from Excel?"**
   - Data validation scripts before migration
   - Parallel running period
   - Rollback plan if issues

5. **"How do you ensure customer adoption?"**
   - Involve pilot customers in design
   - Training and onboarding program
   - Incentivize self-service (faster processing)
