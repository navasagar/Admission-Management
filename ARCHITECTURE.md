# Technical Architecture - EduMerge Admission CRM

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │              React Application                     │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  │  │
│  │  │  Routing   │  │   State    │  │    UI      │  │  │
│  │  │  (Router)  │  │  (Context) │  │ (Components)│  │  │
│  │  └────────────┘  └────────────┘  └────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Current Implementation (Frontend-only)
```
┌──────────────────────────────────────────────────────────┐
│                    React App (SPA)                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │  React Router - Navigation & Route Management      │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Context API - Global State Management             │  │
│  │  • AppContext: All business logic                  │  │
│  │  • In-memory state (resets on refresh)             │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Mock Data - Sample data for demo                  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Recommended Production Architecture
```
┌──────────────────────────────────────────────────────────┐
│                    React Frontend (Next.js)               │
│  ┌────────────────────────────────────────────────────┐  │
│  │  React Router / Next.js Router                     │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  State Management (Context + React Query)          │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────┬───────────────────────────────────────────┘
               │ REST API / GraphQL
               ↓
┌──────────────────────────────────────────────────────────┐
│                    Node.js Backend                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Express.js / Fastify API Server                   │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Business Logic Layer                              │  │
│  │  • Validation                                      │  │
│  │  • Authorization                                   │  │
│  │  • Quota Management                                │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────┬───────────────────────────────────────────┘
               │ SQL Queries
               ↓
┌──────────────────────────────────────────────────────────┐
│              Database (PostgreSQL)                        │
│  • Institutions, Campuses, Departments                   │
│  • Programs, Quotas, Applicants                          │
│  • Seat Allocations, Documents                           │
│  • Users, Audit Logs                                     │
└──────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow
```
User → Login Page → AppContext.login() 
  → Mock Validation → Set currentUser
  → Navigate to Dashboard
```

### 2. Seat Allocation Flow
```
Officer selects applicant + program + quota
  ↓
AppContext.allocateSeat()
  ↓
Validate: Check quota availability
  ↓
Create SeatAllocation record
  ↓
Update Quota.filledSeats (+1)
  ↓
Update Applicant.status → "Allocated"
  ↓
UI updates automatically (Context triggers re-render)
```

### 3. Admission Confirmation Flow
```
Officer clicks "Confirm Admission"
  ↓
AppContext.confirmAdmission()
  ↓
Validate: Documents verified? Fee paid?
  ↓
Generate admission number
  ↓
Update Applicant.admissionNumber
  ↓
Update Applicant.status → "Confirmed"
  ↓
Update SeatAllocation.isConfirmed → true
  ↓
Display success message with admission number
```

## State Management

### AppContext Structure
```typescript
AppContext {
  // Authentication
  currentUser: User | null
  login: (email, password) => Promise<boolean>
  logout: () => void
  
  // Master Data (Read)
  institutions: Institution[]
  campuses: Campus[]
  departments: Department[]
  academicYears: AcademicYear[]
  programs: Program[]
  quotas: Quota[]
  
  // Master Data (Write)
  addInstitution: (data) => void
  addCampus: (data) => void
  addDepartment: (data) => void
  addProgram: (data) => void
  addQuota: (data) => void
  
  // Applicants
  applicants: Applicant[]
  addApplicant: (data) => string
  updateApplicant: (id, data) => void
  getApplicant: (id) => Applicant
  
  // Seat Operations
  allocateSeat: (applicantId, programId, quotaType) => Result
  confirmAdmission: (applicantId) => Result
  
  // Documents
  updateDocumentStatus: (applicantId, type, status) => void
  
  // Analytics
  getDashboardStats: (programId?) => DashboardStats
}
```

## Database Schema (Recommended for Production)

### Tables

#### institutions
```sql
CREATE TABLE institutions (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### campuses
```sql
CREATE TABLE campuses (
  id UUID PRIMARY KEY,
  institution_id UUID REFERENCES institutions(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### departments
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY,
  campus_id UUID REFERENCES campuses(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### academic_years
```sql
CREATE TABLE academic_years (
  id UUID PRIMARY KEY,
  year VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### programs
```sql
CREATE TABLE programs (
  id UUID PRIMARY KEY,
  department_id UUID REFERENCES departments(id),
  academic_year_id UUID REFERENCES academic_years(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  course_type VARCHAR(10) CHECK (course_type IN ('UG', 'PG')),
  duration INTEGER NOT NULL,
  total_intake INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### quotas
```sql
CREATE TABLE quotas (
  id UUID PRIMARY KEY,
  program_id UUID REFERENCES programs(id),
  quota_type VARCHAR(50) CHECK (quota_type IN ('KCET', 'COMEDK', 'Management')),
  seats INTEGER NOT NULL,
  filled_seats INTEGER DEFAULT 0,
  is_supernumerary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_filled CHECK (filled_seats <= seats)
);
```

#### applicants
```sql
CREATE TABLE applicants (
  id UUID PRIMARY KEY,
  application_number VARCHAR(50) UNIQUE NOT NULL,
  program_id UUID REFERENCES programs(id),
  academic_year_id UUID REFERENCES academic_years(id),
  
  -- Personal details
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  
  -- Academic details
  category VARCHAR(10) NOT NULL,
  entry_type VARCHAR(20) NOT NULL,
  admission_mode VARCHAR(20) NOT NULL,
  quota_type VARCHAR(50) NOT NULL,
  qualifying_exam VARCHAR(100) NOT NULL,
  marks DECIMAL(5,2) NOT NULL,
  rank VARCHAR(50),
  allotment_number VARCHAR(100),
  
  -- Address
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  
  -- Status
  application_status VARCHAR(20) NOT NULL,
  document_status VARCHAR(20) NOT NULL,
  fee_status VARCHAR(20) NOT NULL,
  
  -- Admission
  admission_number VARCHAR(100) UNIQUE,
  admission_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### seat_allocations
```sql
CREATE TABLE seat_allocations (
  id UUID PRIMARY KEY,
  applicant_id UUID REFERENCES applicants(id),
  program_id UUID REFERENCES programs(id),
  quota_id UUID REFERENCES quotas(id),
  allocation_date TIMESTAMP NOT NULL,
  is_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### documents
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  applicant_id UUID REFERENCES applicants(id),
  document_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  file_path VARCHAR(255),
  uploaded_at TIMESTAMP,
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES users(id),
  remarks TEXT
);
```

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'admission_officer', 'management')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  changes JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints (Recommended)

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Master Data
- `GET /api/institutions` - List institutions
- `POST /api/institutions` - Create institution
- `GET /api/campuses?institutionId=` - List campuses
- `POST /api/campuses` - Create campus
- `GET /api/departments?campusId=` - List departments
- `POST /api/departments` - Create department
- `GET /api/programs?departmentId=` - List programs
- `POST /api/programs` - Create program
- `GET /api/quotas?programId=` - List quotas
- `POST /api/quotas` - Create quota

### Applicants
- `GET /api/applicants` - List applicants
- `POST /api/applicants` - Create applicant
- `GET /api/applicants/:id` - Get applicant details
- `PUT /api/applicants/:id` - Update applicant
- `DELETE /api/applicants/:id` - Delete applicant

### Seat Allocation
- `POST /api/allocations/allocate` - Allocate seat
- `POST /api/allocations/confirm` - Confirm admission
- `GET /api/allocations/available?programId=` - Check availability

### Documents
- `POST /api/documents/upload` - Upload document
- `PUT /api/documents/:id/verify` - Verify document
- `GET /api/documents?applicantId=` - List documents

### Reports
- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/quota-wise` - Quota-wise report
- `GET /api/reports/program-wise` - Program-wise report
- `GET /api/reports/pending-documents` - Pending documents list
- `GET /api/reports/pending-fees` - Pending fees list

## Security Considerations

### Current Implementation
- ⚠️ No real authentication (demo only)
- ⚠️ No authorization checks
- ⚠️ No data validation
- ⚠️ No input sanitization
- ⚠️ Client-side only (no backend security)

### Production Requirements
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Input validation using Zod/Yup
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection
- ✅ CSRF tokens
- ✅ Rate limiting
- ✅ Password hashing (bcrypt)
- ✅ Secure session management
- ✅ HTTPS enforcement
- ✅ Security headers (helmet.js)
- ✅ Audit logging

## Performance Optimizations

### Current Implementation
- React Context for state management
- Component-level memoization where needed
- Lazy loading not implemented

### Recommended Optimizations
1. **Frontend**:
   - Code splitting with React.lazy()
   - Memoization (React.memo, useMemo, useCallback)
   - Virtual scrolling for large lists
   - Image optimization
   - Bundle size optimization
   - Service worker for offline support

2. **Backend**:
   - Database indexing on frequently queried fields
   - Query optimization
   - Caching (Redis) for frequently accessed data
   - Connection pooling
   - Load balancing
   - CDN for static assets

3. **Database**:
   ```sql
   -- Indexes for performance
   CREATE INDEX idx_applicants_program ON applicants(program_id);
   CREATE INDEX idx_applicants_status ON applicants(application_status);
   CREATE INDEX idx_quotas_program ON quotas(program_id);
   CREATE INDEX idx_seat_allocations_applicant ON seat_allocations(applicant_id);
   ```

## Testing Strategy

### Unit Tests
- Business logic in AppContext
- Utility functions
- Individual components

### Integration Tests
- User workflows (login → create → allocate → confirm)
- API endpoints (when implemented)
- Database operations

### E2E Tests
- Complete admission workflow
- Master data setup flow
- Report generation

### Test Tools
- Jest for unit tests
- React Testing Library for component tests
- Cypress/Playwright for E2E tests
- Supertest for API tests

## Deployment

### Frontend
- **Platform**: Vercel, Netlify, or AWS S3 + CloudFront
- **Build**: `npm run build`
- **Environment Variables**: API URL, Auth config

### Backend (When Implemented)
- **Platform**: Heroku, AWS EC2/ECS, DigitalOcean
- **Database**: AWS RDS, Heroku Postgres, or managed PostgreSQL
- **Environment**: Node.js v18+

### CI/CD Pipeline
```yaml
# Example GitHub Actions workflow
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
      - run: deploy to production
```

## Monitoring & Observability

### Recommended Tools
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics / Mixpanel
- **Logging**: Winston / Pino
- **Monitoring**: New Relic / DataDog
- **Uptime**: UptimeRobot

### Key Metrics to Track
- Application errors
- API response times
- Database query performance
- User actions (seat allocations, confirmations)
- System availability
- User engagement

## Scalability Considerations

### Current Limitations
- In-memory state (not scalable)
- Single instance only
- No caching layer

### Scalability Improvements
1. **Horizontal Scaling**: Multiple backend instances
2. **Database**: Read replicas for reporting
3. **Caching**: Redis for session management
4. **Queue System**: Bull/BullMQ for background jobs
5. **Microservices**: Separate services for different domains

---

**Document Version**: 1.0  
**Last Updated**: April 1, 2026  
**Author**: [Your Name]
