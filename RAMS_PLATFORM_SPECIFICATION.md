# RAMS Generation Platform – Complete Technical Specification
## For UK Steel & Construction Industry

---

## EXECUTIVE SUMMARY

This document specifies a modern, cloud-based **RAMS Generation Platform** designed specifically for UK steel fabricators, installers, and construction contractors. The platform automates the creation of compliant Risk Assessment & Method Statements (RAMS) for steelwork and construction projects.

**Key Benefits:**
- **Speed**: Generate complete RAMS in minutes instead of hours
- **Compliance**: Built-in UK standards and HSE guidance integration
- **Consistency**: Branded templates ensure professional, uniform output
- **Knowledge Reuse**: Learn from previous projects to accelerate future work
- **Safety**: Automatic nearest hospital lookup and emergency arrangements

**Core Capabilities:**
- Structured RAMS builder with guided hazard identification and controls
- Per-organization knowledge base of previous RAMS and standard controls
- Export to branded DOCX and PDF templates
- Automatic nearest A&E lookup based on job location
- Integration with UK HSE and industry guidance for best-practice controls
- Multi-tenant architecture with role-based access control

**Target Users:** Steel fabricators, erectors, construction contractors, and main contractors operating across the UK requiring compliant RAMS for site works including working at height, lifting operations, hot works, and steel erection.

---

## 1. PRODUCT SUMMARY

### What is it?
A **RAMS Generation Platform** purpose-built for UK steel fabrication, installation, and construction contractors. The system transforms the time-consuming process of creating Risk Assessment & Method Statements into a guided, intelligent workflow that produces compliant, professional documentation in minutes.

### Who is it for?
- **Steel Fabricators & Erectors**: Companies installing structural steelwork on construction sites
- **Construction Contractors**: Main contractors and subcontractors requiring RAMS for building works
- **Project Managers**: Site teams responsible for safety documentation and compliance
- **Health & Safety Teams**: H&S professionals managing RAMS review and approval

### Core Outcomes

#### 1. Rapid, Compliant RAMS Generation
- Structured workflow guides users through all required sections
- Auto-population from previous similar jobs reduces data entry
- Built-in UK HSE standards and steelwork guidance

#### 2. Consistent Formatting & Branding
- Per-organization DOCX and PDF templates
- Professional output with company logos, colors, and formatting
- Standardized structure ensures nothing is missed

#### 3. Reduced Manual Effort
- No more copy-paste between Word documents
- Clone and adapt previous RAMS for similar jobs
- Reusable hazard and control libraries

#### 4. Organizational Knowledge Base
- Every RAMS contributes to organization-wide knowledge
- Search previous jobs by type, location, hazards, controls
- Continuous improvement through learning from past work

### High-Level Features List

| Feature | Description |
|---------|-------------|
| **Job Setup** | Capture project details, client info, site location, scope of works |
| **RAMS Builder** | Structured sections: hazards, controls, PPE, plant, COSHH, method statements, risk matrices |
| **Knowledge Reuse** | Search and import from previous RAMS; suggest hazards and controls |
| **Hospital Lookup** | Automatic nearest A&E/Emergency Department based on site postcode |
| **UK Standards** | Import relevant HSE and industry guidance summaries |
| **Templates** | Configure branded DOCX and PDF templates per organization |
| **Export** | Download RAMS as DOCX or PDF; email to clients/contractors |
| **Versions** | Track changes, compare versions, audit trail of edits |
| **Multi-Tenant** | Secure separation between organizations; role-based access |

---

## 2. USERS & CORE FLOWS

### User Roles

**Organization Admin**
- Manage organization settings, templates, users
- Configure branding and integrations
- View all RAMS in organization

**Standard User / RAMS Author**
- Create, edit, export RAMS
- Search knowledge base
- Share RAMS with clients

**Read-Only / Client View**
- View assigned RAMS only
- Download PDF only

### Core User Journeys

**Journey 1: Create New RAMS**
1. Select project type  2. Enter job details  3. Define scope  4. Build RAMS (hazards, controls, method statement)  5. AI suggestions  6. Review & approve  7. Export

**Journey 2: Clone from Previous**
1. Search knowledge base  2. Select RAMS to clone  3. Update job details  4. Modify as needed  5. Export

**Journey 3: Search Knowledge Base**
1. Filter by job type, hazards, location  2. View results  3. Extract reusable content

**Journey 4: Configure Templates**
1. Upload DOCX template  2. Set branding (logo, colors, fonts)  3. Preview  4. Save

---
## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Job & Scope Capture

**Inputs Required:**
- Project name, reference, client, main contractor
- Site address, postcode (validated)
- Scope of works: tasks, steel type, height, access method, plant
- Dates, hours, site contacts

**Behavior:**
-Address validation via postcode lookup
- Save drafts at any time
- Required fields validation before proceeding

### 3.2 RAMS Builder Engine

**Structured Sections** (UK RAMS Standard):
1. Project details & responsibilities
2. Training & competence requirements
3. Plant & equipment
4. Materials & COSHH assessments
5. Sequence of works (method statement)
6. Hazard identification
7. Risk assessment matrix (likelihood  severity)
8. Control measures & residual risk
9. PPE requirements
10. Emergency arrangements (includes nearest hospital)
11. Welfare facilities
12. Environmental & waste management

**AI-Powered Suggestions:**
- Propose hazards based on scope + job type
- Suggest controls from knowledge base + UK standards
- Calculate risk ratings (before/after controls)
- All content user-editable

### 3.3 Template & Output System

**Template Management:**
- Per-organization DOCX templates with placeholders
- Visual branding: logo, colors, fonts, header/footer
- Configurable section order

**Export Options:**
- Generate DOCX using template engine (e.g., docxtemplater)
- Convert to PDF (HTML  PDF or DOCX  PDF)
- Store generated files linked to job record
- Email directly to recipients

### 3.4 Knowledge Base

**Content:**
- All historical RAMS (full text + metadata)
- Metadata tags: job type, hazards, controls, plant, location type, height category
- Reusable hazard & control snippets

**Functionality:**
- Semantic search across documents
- Auto-suggest similar jobs when creating new RAMS
- Extract and save standard controls to library
- Vector embeddings for similarity matching (optional)

### 3.5 Nearest Hospital Lookup

**Process:**
1. User enters site postcode
2. System geocodes postcode  coordinates
3. Query Maps API for nearest "A&E" or "Emergency Department"
4. Retrieve: name, address, phone number
5. Auto-populate "Emergency Arrangements" section
6. Allow manual override/edit

**API Options:**
- Google Maps Places API
- NHS API (if available)
- UK postcode  hospital database

### 3.6 UK Standards & Guidance Integration

**Sources:**
- HSE website (working at height, lifting, COSHH, etc.)
- UK steelwork standards (BCSA, SCI)
- Construction industry guidance

**Mechanism:**
- Background jobs fetch/update guidance summaries
- Cache in database with source URL and last-updated timestamp
- Use to suggest control measures
- Optional: include guidance references in RAMS output

---

## 4. NON-FUNCTIONAL REQUIREMENTS

**Security & Compliance:**
- Multi-tenant data separation by organization
- Role-based access control (RBAC)
- Data encrypted at rest (AES-256) and in transit (TLS)
- Audit logs: who created/edited RAMS, when
- GDPR-compliant data handling

**Performance:**
- Page load < 2 seconds
- RAMS export generation < 5 seconds
- Async processing for heavy jobs (PDF generation, AI suggestions)

**Audit & Versioning:**
- Full version history per RAMS
- Diff view between versions
- Restore previous versions
- Audit trail with timestamps and user attribution

**Reliability:**
- 99.9% uptime SLA target
- Automated backups (daily minimum)
- Disaster recovery plan

**Logging & Monitoring:**
- Centralized logging (errors, warnings, info)
- Metrics: RAMS created, exports, user activity
- Alerts for system failures or performance degradation

---

## 5. TECH STACK & ARCHITECTURE

### 5.1 Frontend

**Framework:** React with Next.js 14+ (TypeScript)
- Server-side rendering for performance
- App Router for modern routing
- TypeScript for type safety

**UI Library:** Tailwind CSS + shadcn/ui components
- Responsive design (mobile, tablet, desktop)
- Form wizard for RAMS creation
- Rich text editor for method statements
- Template configuration UI
- Knowledge base search interface

**State Management:** React Context + TanStack Query (React Query)
- Server state caching
- Optimistic updates

**Authentication:** NextAuth.js
- Secure session management
- MFA support (optional)

### 5.2 Backend

**Framework:** Node.js + TypeScript + NestJS
- Modular architecture
- Dependency injection
- Built-in validation pipes

**API:** RESTful APIs + GraphQL (optional)

**Key Services:**
- AuthService: Authentication & authorization
- RAMSService: RAMS CRUD operations
- JobService: Job/project management
- TemplateService: Template management
- KnowledgeBaseService: Search & similarity
- DocumentGenerationService: DOCX/PDF creation
- HospitalLookupService: Maps API integration
- GuidanceService: Fetch UK standards content

**Background Jobs:** BullMQ + Redis
- Document generation queue
- Guidance fetching/updating
- Vector index rebuilding
- Email notifications

### 5.3 Database & Storage

**Primary Database:** PostgreSQL 15+
- ACID compliance for critical data
- Full-text search capabilities
- JSON columns for flexible metadata

**Key Tables:**
- organizations, users, roles, permissions
- jobs, rams_documents, rams_versions
- templates (metadata)
- knowledge_base_items
- guidance_summaries
- hospital_contacts

**Vector Search:** pgvector extension
- Store embeddings of RAMS text
- Semantic similarity search
- Find similar jobs/hazards

**File Storage:** AWS S3 or compatible (MinIO for self-hosted)
- Template files (DOCX)
- Generated RAMS outputs (DOCX, PDF)
- Uploaded site plans/drawings
- Organization logos

### 5.4 Integrations

**Maps/Hospital Lookup:**
- Google Maps Places API
- Geocoding API for postcode  coordinates
- Alternative: NHS API or UK-specific services

**Document Generation:**
- DOCX: docxtemplater library
- PDF: Playwright/Puppeteer for HTML  PDF OR libreoffice headless for DOCX  PDF

**Guidance Fetching:**
- HTTP client (axios/fetch)
- Cheerio for HTML parsing
- Scheduled cron jobs for updates

### 5.5 AI/ML (Optional Enhancement)

**Use Cases:**
- Suggest hazards from scope description
- Recommend controls based on hazards
- Summarize guidance documents
- Semantic search in knowledge base

**Implementation:**
- OpenAI API (GPT-4) for text generation
- Embedding models for vector search (OpenAI embeddings or open-source alternatives)
- Langchain for prompt engineering

**Safety:**
- Human-in-the-loop for all AI suggestions
- Compliance review for legal/safety content
- Clear labeling of AI-generated vs. user-created content

---

## 6. DATA MODEL & SCHEMA (High-Level)

### Entity: Organization
**Purpose:** Multi-tenant isolation

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Company name |
| logo_url | VARCHAR | S3 path to logo |
| created_at | TIMESTAMP | |
| settings | JSONB | Branding config, API keys |

**Relationships:**
- Has many: Users, Jobs, RAMS, Templates

---

### Entity: User
**Purpose:** Authentication & authorization

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | FK to organizations |
| email | VARCHAR | Unique login |
| password_hash | VARCHAR | Hashed password |
| first_name | VARCHAR | |
| last_name | VARCHAR | |
| role_id | UUID | FK to roles |
| is_active | BOOLEAN | Account status |
| created_at | TIMESTAMP | |

**Relationships:**
- Belongs to: Organization, Role
- Has many: RAMS (as author)

---

### Entity: Role
**Purpose:** RBAC

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | FK to organizations |
| name | VARCHAR | "Admin", "Standard", "ReadOnly" |
| permissions | JSONB | Array of permission strings |

**Permissions Examples:**
- ams.create, ams.edit, ams.delete, ams.export
- 	emplates.manage, users.manage, org.settings

---

### Entity: Job
**Purpose:** Project/job details

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | FK to organizations |
| project_name | VARCHAR | |
| reference_number | VARCHAR | |
| client_name | VARCHAR | |
| main_contractor | VARCHAR | |
| site_address | TEXT | |
| site_postcode | VARCHAR | Validated UK postcode |
| site_coordinates | GEOGRAPHY | Lat/lon for hospital lookup |
| start_date | DATE | |
| end_date | DATE | |
| scope_of_works | TEXT | Free text description |
| tags | JSONB | Structured: job type, height, access, plant |
| created_by | UUID | FK to users |
| created_at | TIMESTAMP | |

**Relationships:**
- Belongs to: Organization, User (creator)
- Has many: RAMS

---

### Entity: RAMS_Document
**Purpose:** Main RAMS record

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| job_id | UUID | FK to jobs |
| organization_id | UUID | FK to organizations |
| title | VARCHAR | RAMS document title |
| version | INTEGER | Current version number |
| status | ENUM | 'draft', 'review', 'approved' |
| content | JSONB | Structured RAMS sections |
| created_by | UUID | FK to users |
| approved_by | UUID | FK to users (nullable) |
| approved_at | TIMESTAMP | (nullable) |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Content JSONB Structure:**
`json
{
  "responsibilities": {...},
  "plant_equipment": [...],
  "coshh": [...],
  "method_statement": "...",
  "hazards": [...],
  "risk_assessments": [...],
  "controls": [...],
  "ppe": [...],
  "emergency": {...},
  "welfare": {...}
}
`

**Relationships:**
- Belongs to: Job, Organization, User (creator)
- Has many: RAMS_Versions, Generated_Files

---

### Entity: RAMS_Version
**Purpose:** Version history & audit trail

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| rams_id | UUID | FK to rams_documents |
| version_number | INTEGER | Sequential version |
| content | JSONB | Full RAMS content at this version |
| changed_by | UUID | FK to users |
| change_summary | TEXT | What changed |
| created_at | TIMESTAMP | |

**Relationships:**
- Belongs to: RAMS_Document, User

---

### Entity: Template
**Purpose:** DOCX/PDF output templates

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | FK to organizations |
| name | VARCHAR | Template name |
| description | TEXT | |
| file_url | VARCHAR | S3 path to DOCX template |
| is_default | BOOLEAN | Default for this org |
| settings | JSONB | Branding, section order |
| created_at | TIMESTAMP | |

**Relationships:**
- Belongs to: Organization

---

### Entity: KnowledgeBase_Item
**Purpose:** Searchable RAMS library

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | FK to organizations |
| rams_id | UUID | FK to rams_documents (nullable) |
| item_type | ENUM | 'full_rams', 'hazard', 'control' |
| title | VARCHAR | |
| content | TEXT | Searchable text |
| embedding | VECTOR | Vector embedding for similarity |
| metadata | JSONB | Tags: job type, hazards, etc. |
| created_at | TIMESTAMP | |

**Relationships:**
- Belongs to: Organization
- Optional: RAMS_Document (if extracted from one)

---

### Entity: Hospital_Contact
**Purpose:** Cached hospital/A&E lookups

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| postcode | VARCHAR | UK postcode |
| hospital_name | VARCHAR | |
| address | TEXT | |
| phone | VARCHAR | |
| coordinates | GEOGRAPHY | Lat/lon |
| last_verified | TIMESTAMP | When checked |

**Relationships:**
- Referenced by Jobs (many-to-one)

---

### Entity: Guidance_Summary
**Purpose:** UK standards & guidance cache

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR | e.g., "Working at Height Regs 2005" |
| source_url | VARCHAR | HSE or industry URL |
| summary | TEXT | Key points |
| category | VARCHAR | 'height', 'lifting', 'hot_works', etc. |
| last_updated | TIMESTAMP | When fetched |

**Relationships:**
- Referenced by RAMS via tags/metadata

---

### Entity: Generated_File
**Purpose:** Track exported RAMS files

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| rams_id | UUID | FK to rams_documents |
| file_type | ENUM | 'docx', 'pdf' |
| file_url | VARCHAR | S3 path |
| template_id | UUID | FK to templates |
| generated_at | TIMESTAMP | |
| generated_by | UUID | FK to users |

**Relationships:**
- Belongs to: RAMS_Document, Template, User

---

## 7. WORK PLAN & BUILD PHASES

### Phase 1: Discovery & Detailed PRD
**Duration:** 2-3 weeks

**Tasks:**
- Interview stakeholders (steel fabricators, H&S managers, site teams)
- Document UK RAMS structure requirements (specific to steel industry)
- Define user roles, permissions, workflows
- Confirm hospital lookup provider (Google Maps vs. NHS API)
- Define template requirements and branding needs
- Create detailed user stories

**Deliverables:**
- Final PRD document
- User personas and journey maps
- UK RAMS section checklist
- Wireframes for key screens

**Dependencies:** None

---

### Phase 2: Architecture & Data Design
**Duration:** 2 weeks

**Tasks:**
- Finalize technical architecture (frontend, backend, database)
- Design database schema and entity relationships
- Define API contracts (REST endpoints or GraphQL schema)
- Security architecture (auth, RBAC, data encryption)
- Integration design (Maps API, document generation, guidance fetching)
- Choose AI/ML approach (if applicable)

**Deliverables:**
- Architecture diagrams
- Database ERD
- API specification (OpenAPI/Swagger)
- Security design document

**Dependencies:** Phase 1 complete

---

### Phase 3: Core Backend & Frontend Skeleton
**Duration:** 4 weeks

**Tasks:**
- Set up development environment & CI/CD
- Initialize Next.js frontend + NestJS backend
- Implement authentication (NextAuth.js)
- Database setup (PostgreSQL + migrations)
- CRUD APIs for: Organizations, Users, Roles
- Basic UI: Login, signup, dashboard shell
- CRUD APIs for: Jobs, RAMS (basic)
- Simple RAMS creation form (no AI, no templates yet)

**Deliverables:**
- Working auth system
- User can create account, log in
- Organization admin can add users
- Basic job and RAMS creation (no export)

**Dependencies:** Phase 2 complete

---

### Phase 4: Template & Document Generation
**Duration:** 3 weeks

**Tasks:**
- Implement DOCX template engine (docxtemplater)
- Create default UK RAMS DOCX template
- Template upload and management UI
- Branding configuration (logo, colors, fonts)
- HTML to PDF rendering (Playwright/Puppeteer)
- File storage integration (S3 or MinIO)
- Export UI: select template, generate DOCX/PDF
- Download and view generated files

**Deliverables:**
- Users can configure branded templates
- RAMS export to DOCX and PDF
- Generated files stored and linked to RAMS

**Dependencies:** Phase 3 complete

---

### Phase 5: Knowledge Base & Reuse Logic
**Duration:** 4 weeks

**Tasks:**
- Build knowledge base data model and APIs
- Index all RAMS as they are created
- Implement full-text search (PostgreSQL FTS)
- Optional: Vector embeddings + pgvector for semantic search
- "Clone RAMS" functionality
- Knowledge base search UI with filters (job type, hazards, plant)
- Extract and save reusable hazard/control snippets
- Auto-suggest hazards and controls when creating new RAMS

**Deliverables:**
- Searchable knowledge base of all org RAMS
- Clone previous RAMS feature
- Suggestions from previous jobs

**Dependencies:** Phase 4 complete

---

### Phase 6: Hospital Lookup & Guidance Integration
**Duration:** 3 weeks

**Tasks:**
- Integrate Google Maps Geocoding + Places API
- Postcode validation and geocoding
- Nearest A&E/hospital lookup service
- Auto-populate emergency arrangements section
- Manual override of hospital details
- Build guidance fetching service (HSE, BCSA, SCI)
- Web scraping + summarization (with human review)
- Cache guidance summaries in database
- UI to view/insert guidance into RAMS

**Deliverables:**
- Automatic hospital lookup working
- Guidance library populated
- Users can reference guidance in RAMS

**Dependencies:** Phase 5 complete

---

### Phase 7: AI Enhancements (Optional)
**Duration:** 3-4 weeks

**Tasks:**
- Integrate OpenAI API (or alternative LLM)
- Prompt engineering for hazard/control suggestions
- Guidance summarization automation
- Semantic search improvements
- Human-in-the-loop review UI for AI suggestions
- Compliance and safety review process

**Deliverables:**
- AI-powered suggestions improve speed
- Guidance auto-summarization (reviewed by humans)

**Dependencies:** Phase 6 complete

---

### Phase 8: Testing, Compliance Review & Hardening
**Duration:** 3 weeks

**Tasks:**
- Unit tests for all backend services
- Integration tests for APIs
- End-to-end tests for key user journeys (Playwright)
- Performance testing (load, stress)
- Security testing (penetration testing, vulnerability scan)
- Compliance review of default RAMS content (legal/H&S expert)
- Accessibility audit (WCAG 2.1 AA)
- Bug fixes and refinements

**Deliverables:**
- Test coverage >80%
- Security audit report + fixes
- Compliance sign-off

**Dependencies:** Phase 7 complete (or Phase 6 if skipping AI)

---

### Phase 9: Deployment & Monitoring
**Duration:** 2 weeks

**Tasks:**
- Set up production environment (AWS/Azure/GCP or on-premise)
- CI/CD pipeline (GitHub Actions, GitLab CI)
- Database backups and disaster recovery
- Logging setup (ELK stack or cloud equivalent)
- Monitoring and alerting (Grafana, Sentry, etc.)
- User onboarding documentation and training videos
- Go-live and initial user support

**Deliverables:**
- Production system live
- Monitoring dashboards
- User documentation

**Dependencies:** Phase 8 complete

---

## 8. IMPLEMENTATION CHECKLIST

### Foundation Setup
- [ ] Initialize Git repository
- [ ] Set up Next.js 14+ project with TypeScript
- [ ] Set up NestJS backend with TypeScript
- [ ] Configure PostgreSQL database
- [ ] Set up S3 or MinIO for file storage
- [ ] Set up Redis for background jobs
- [ ] Create CI/CD pipeline (GitHub Actions)

### Authentication & Users
- [ ] Implement NextAuth.js authentication
- [ ] User registration and login
- [ ] Password reset flow
- [ ] Multi-tenant organization setup
- [ ] Role-based access control (Admin, Standard, ReadOnly)
- [ ] User management UI (create, edit, deactivate users)

### Core Data Models
- [ ] Create database migrations for all entities
- [ ] Organizations table
- [ ] Users and Roles tables
- [ ] Jobs table with postcode validation
- [ ] RAMS_Documents table with JSONB content
- [ ] RAMS_Versions table for audit trail
- [ ] Templates table
- [ ] KnowledgeBase_Items table
- [ ] Hospital_Contacts cache table
- [ ] Guidance_Summaries table
- [ ] Generated_Files table

### Job & RAMS Management
- [ ] Job creation API and UI
- [ ] Job listing and filtering
- [ ] RAMS creation wizard UI (multi-step form)
- [ ] RAMS Builder: Project details section
- [ ] RAMS Builder: Scope of works section
- [ ] RAMS Builder: Responsibilities section
- [ ] RAMS Builder: Plant & equipment section
- [ ] RAMS Builder: Materials & COSHH section
- [ ] RAMS Builder: Method statement (rich text editor)
- [ ] RAMS Builder: Hazard identification
- [ ] RAMS Builder: Risk assessment matrix (likelihood  severity)
- [ ] RAMS Builder: Control measures
- [ ] RAMS Builder: PPE requirements
- [ ] RAMS Builder: Emergency arrangements
- [ ] RAMS Builder: Welfare & environmental
- [ ] RAMS versioning system
- [ ] RAMS approval workflow
- [ ] RAMS listing and search

### Template System
- [ ] Template upload (DOCX files)
- [ ] Template management UI (create, edit, delete)
- [ ] Branding configuration (logo, colors, fonts)
- [ ] Default template per organization
- [ ] Template preview functionality

### Document Generation
- [ ] DOCX generation using docxtemplater
- [ ] Placeholder mapping for all RAMS sections
- [ ] PDF generation from HTML (Playwright/Puppeteer)
- [ ] Alternative: DOCX to PDF conversion (LibreOffice headless)
- [ ] File storage in S3/MinIO
- [ ] Download DOCX/PDF functionality
- [ ] Email RAMS to recipients

### Knowledge Base
- [ ] Index RAMS as knowledge base items on creation
- [ ] Full-text search implementation (PostgreSQL FTS)
- [ ] Optional: Vector embeddings (OpenAI or open-source)
- [ ] Optional: pgvector extension for semantic search
- [ ] Knowledge base search UI with filters
- [ ] Clone RAMS functionality
- [ ] Extract hazard/control snippets to library
- [ ] Suggest hazards/controls from knowledge base

### Hospital & Emergency Lookup
- [ ] Google Maps API integration (Geocoding + Places)
- [ ] UK postcode validation
- [ ] Nearest A&E lookup service
- [ ] Cache hospital results in database
- [ ] Auto-populate emergency section in RAMS
- [ ] Manual override of hospital details

### UK Guidance Integration
- [ ] Identify guidance sources (HSE, BCSA, SCI, etc.)
- [ ] Build web scraping service (Cheerio/Puppeteer)
- [ ] Guidance summarization (manual or AI-assisted)
- [ ] Cache guidance in database with source URL and timestamp
- [ ] Scheduled job to update guidance (cron)
- [ ] UI to browse guidance library
- [ ] Insert guidance references into RAMS

### AI Enhancements (Optional)
- [ ] Integrate OpenAI API or alternative LLM
- [ ] Prompt engineering for hazard suggestions
- [ ] Prompt engineering for control measure suggestions
- [ ] Guidance auto-summarization with human review
- [ ] Semantic search with vector embeddings
- [ ] Human-in-the-loop review UI
- [ ] Compliance labeling (AI vs. user content)

### Background Jobs & Queue
- [ ] Set up BullMQ with Redis
- [ ] Document generation queue
- [ ] Guidance fetching queue
- [ ] Vector index rebuild queue (if using AI)
- [ ] Email notification queue

### Testing
- [ ] Unit tests for all backend services (Jest)
- [ ] API integration tests (Supertest)
- [ ] Frontend component tests (React Testing Library)
- [ ] End-to-end tests for critical user journeys (Playwright)
- [ ] Performance testing (load, stress)
- [ ] Security testing (OWASP Top 10)

### Security & Compliance
- [ ] Data encryption at rest (database)
- [ ] TLS/HTTPS for data in transit
- [ ] Role-based access control enforcement
- [ ] Audit logging (who, what, when)
- [ ] GDPR compliance review
- [ ] Legal review of default RAMS content
- [ ] Penetration testing

### Deployment & Operations
- [ ] Set up staging environment
- [ ] Set up production environment
- [ ] Database backup automation
- [ ] Disaster recovery plan
- [ ] Centralized logging (ELK, CloudWatch, etc.)
- [ ] Monitoring dashboards (Grafana, Datadog, etc.)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (New Relic, APM)
- [ ] Alerting for critical failures

### Documentation & Training
- [ ] User documentation (how to create RAMS, templates, etc.)
- [ ] Admin documentation (user management, settings)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Training videos for end users
- [ ] Onboarding guide for new organizations

### Go-Live
- [ ] Beta testing with pilot organization
- [ ] Gather feedback and iterate
- [ ] Public launch
- [ ] Ongoing support and maintenance plan

---

## CONCLUSION

This specification provides a complete blueprint for building a RAMS Generation Platform tailored to the UK steel and construction industry. The system will:

1. **Accelerate RAMS creation** from hours to minutes through guided workflows and knowledge reuse
2. **Ensure compliance** with UK HSE standards and industry best practices
3. **Maintain consistency** through branded templates and standardized processes
4. **Improve safety** with automatic hospital lookup and integrated guidance
5. **Enable continuous learning** through an organization-wide knowledge base

The modular architecture allows for phased delivery, starting with core RAMS creation and progressively adding knowledge base, AI suggestions, and integrations. This approach minimizes risk and allows for early user feedback.

**Recommended Next Steps:**
1. Validate this specification with steel industry stakeholders
2. Prioritize features for MVP (suggest Phases 1-4 for initial release)
3. Create detailed user stories and acceptance criteria
4. Begin Phase 1: Discovery & Detailed PRD

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-29  
**Author:** Antigravity AI Assistant  
**Status:** Ready for Review

