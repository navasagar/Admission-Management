# Complete Project Structure - Admission Management System

## Overall Project Layout

```
Admission Management System/
│
├── Backend API (Node.js + Express.js)
│   └── backend/
│       ├── src/
│       │   ├── app.ts                         # Express server entry point
│       │   ├── config/
│       │   │   └── database.ts                # MySQL connection & initialization
│       │   ├── middleware/
│       │   │   ├── auth.ts                    # JWT auth & role-based access
│       │   │   └── errorHandler.ts            # Error handling middleware
│       │   ├── routes/                        # All API routes
│       │   │   ├── auth.ts                    # POST /api/auth/login, GET /api/auth/me
│       │   │   ├── institution.ts             # CRUD /api/institutions
│       │   │   ├── campus.ts                  # CRUD /api/campuses
│       │   │   ├── department.ts              # CRUD /api/departments
│       │   │   ├── academicYear.ts            # CRUD /api/academic-years
│       │   │   ├── program.ts                 # CRUD /api/programs
│       │   │   ├── quota.ts                   # CRUD /api/quotas (with validation)
│       │   │   ├── applicant.ts               # CRUD /api/applicants
│       │   │   ├── seatAllocation.ts          # POST allocate, confirm /api/seat-allocations
│       │   │   ├── document.ts                # PUT status, POST fee /api/documents
│       │   │   └── dashboard.ts               # GET /api/dashboard
│       │   ├── types/
│       │   │   └── index.ts                   # All TypeScript interfaces
│       │   └── utils/
│       │       └── admissionNumberGenerator.ts # Utilities (validators, generators)
│       ├── package.json                       # Dependencies
│       ├── tsconfig.json                      # TypeScript configuration
│       ├── .env                               # Environment variables (local)
│       ├── .env.example                       # Environment template
│       ├── .gitignore                         # Git ignore rules
│       └── README.md                          # Backend documentation
│
├── Frontend Application (React + TypeScript)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── routes.tsx
│   │   │   ├── api/
│   │   │   │   └── client.ts                  # API client for all endpoints
│   │   │   ├── components/
│   │   │   │   ├── DemoNotice.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── figma/
│   │   │   │   │   └── ImageWithFallback.tsx
│   │   │   │   └── ui/                        # shadcn/ui components
│   │   │   │       ├── accordion.tsx
│   │   │   │       ├── button.tsx
│   │   │   │       ├── form.tsx
│   │   │   │       ├── table.tsx
│   │   │   │       ├── tabs.tsx
│   │   │   │       └── ... (30+ UI components)
│   │   │   ├── contexts/
│   │   │   │   └── AppContext.tsx             # Global state management
│   │   │   ├── data/
│   │   │   │   └── mockData.ts                # Mock data for demo
│   │   │   ├── layouts/
│   │   │   │   └── RootLayout.tsx             # Main layout & navigation
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   ├── MasterSetupPage.tsx
│   │   │   │   ├── ApplicantsPage.tsx
│   │   │   │   ├── ApplicantFormPage.tsx
│   │   │   │   ├── ApplicantDetailPage.tsx
│   │   │   │   ├── SeatAllocationPage.tsx
│   │   │   │   ├── ReportsPage.tsx
│   │   │   │   └── NotFoundPage.tsx
│   │   │   └── types/
│   │   │       └── index.ts                   # TypeScript interfaces
│   │   └── styles/
│   │       ├── fonts.css
│   │       ├── index.css
│   │       ├── tailwind.css
│   │       └── theme.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── postcss.config.mjs
│
├── Documentation Files
│   ├── README.md                              # Main project README
│   ├── SETUP_GUIDE.md                         # Frontend setup instructions
│   ├── ARCHITECTURE.md                        # System architecture
│   ├── ATTRIBUTIONS.md                        # Credits & attributions
│   ├── PROJECT_SUMMARY.md                     # Project overview
│   ├── CHECKLIST.md                           # Project checklist
│   ├── guidelines/Guidelines.md               # Development guidelines
│   ├── BACKEND_SETUP_CHECKLIST.md             # Backend setup quick checklist
│   ├── BACKEND_INTEGRATION_GUIDE.md           # Complete integration guide
│   └── API_ENDPOINTS_REFERENCE.md             # All endpoints reference

```

## Database Schema (MySQL)

```sql
-- Users Table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'admission_officer', 'management'),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- Institutions Table
CREATE TABLE institutions (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  address VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(255),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- Campuses Table
CREATE TABLE campuses (
  id VARCHAR(36) PRIMARY KEY,
  institutionId VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (institutionId) REFERENCES institutions(id)
);

-- Departments Table
CREATE TABLE departments (
  id VARCHAR(36) PRIMARY KEY,
  campusId VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (campusId) REFERENCES campuses(id)
);

-- Academic Years Table
CREATE TABLE academic_years (
  id VARCHAR(36) PRIMARY KEY,
  year VARCHAR(20) NOT NULL UNIQUE,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- Programs Table
CREATE TABLE programs (
  id VARCHAR(36) PRIMARY KEY,
  departmentId VARCHAR(36) NOT NULL,
  academicYearId VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  courseType ENUM('UG', 'PG') NOT NULL,
  duration INT NOT NULL,
  totalIntake INT NOT NULL,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (departmentId) REFERENCES departments(id),
  FOREIGN KEY (academicYearId) REFERENCES academic_years(id)
);

-- Quotas Table (Core Business Logic)
CREATE TABLE quotas (
  id VARCHAR(36) PRIMARY KEY,
  programId VARCHAR(36) NOT NULL,
  quotaType ENUM('KCET', 'COMEDK', 'Management') NOT NULL,
  seats INT NOT NULL,
  filledSeats INT DEFAULT 0,            -- Real-time counter
  isSupernumerary BOOLEAN DEFAULT false,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (programId) REFERENCES programs(id),
  UNIQUE KEY (programId, quotaType)     -- One quota per program
);

-- Applicants Table
CREATE TABLE applicants (
  id VARCHAR(36) PRIMARY KEY,
  applicationNumber VARCHAR(50) NOT NULL UNIQUE,
  programId VARCHAR(36) NOT NULL,
  academicYearId VARCHAR(36) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  dateOfBirth DATE NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  category ENUM('GM', 'SC', 'ST', 'OBC', '2A', '2B', '3A', '3B'),
  entryType ENUM('Regular', 'Lateral') NOT NULL,
  admissionMode ENUM('Government', 'Management') NOT NULL,
  quotaType ENUM('KCET', 'COMEDK', 'Management') NOT NULL,
  qualifyingExam VARCHAR(100),
  marks DECIMAL(5,2),
  rank VARCHAR(50),
  allotmentNumber VARCHAR(50),
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  applicationStatus ENUM('Draft', 'Submitted', 'Allocated', 'Confirmed', 'Rejected'),
  documentStatus ENUM('Pending', 'Submitted', 'Verified'),
  feeStatus ENUM('Pending', 'Paid'),
  admissionNumber VARCHAR(100) UNIQUE,  -- Generated on confirmation
  admissionDate DATETIME,
  allocatedSeatId VARCHAR(36),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (programId) REFERENCES programs(id),
  FOREIGN KEY (academicYearId) REFERENCES academic_years(id)
);

-- Seat Allocations Table
CREATE TABLE seat_allocations (
  id VARCHAR(36) PRIMARY KEY,
  applicantId VARCHAR(36) NOT NULL UNIQUE,
  programId VARCHAR(36) NOT NULL,
  quotaId VARCHAR(36) NOT NULL,
  allocationDate DATETIME NOT NULL,
  isConfirmed BOOLEAN DEFAULT false,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (applicantId) REFERENCES applicants(id),
  FOREIGN KEY (programId) REFERENCES programs(id),
  FOREIGN KEY (quotaId) REFERENCES quotas(id)
);

-- Documents Table
CREATE TABLE documents (
  id VARCHAR(36) PRIMARY KEY,
  applicantId VARCHAR(36) NOT NULL,
  documentType VARCHAR(100) NOT NULL,
  status ENUM('Pending', 'Submitted', 'Verified') DEFAULT 'Pending',
  uploadedAt DATETIME,
  verifiedAt DATETIME,
  verifiedBy VARCHAR(36),
  remarks VARCHAR(500),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (applicantId) REFERENCES applicants(id),
  UNIQUE KEY (applicantId, documentType)
);
```

## Key Implementation Details

### Authentication & Authorization

- JWT-based authentication
- Roles: Admin, Admission Officer, Management
- Role-based access control on all protected endpoints
- Auto-user creation on first login (demo mode)

### Business Logic Implementation

1. **Quota Validation**
   - Total quota seats ≤ program intake
   - Cannot allocate if quota is full
   - Real-time seat counter updates

2. **Admission Confirmation Guards**
   - All documents must be verified
   - Fee must be paid
   - Both conditions mandatory

3. **Admission Number Generation**
   - Format: INST/YEAR/UG/DEPT/QUOTA/SEQUENCE
   - Automatically generated on confirmation
   - Unique and immutable

4. **Real-time Updates**
   - Quota counters update immediately
   - Applicant status auto-updated
   - Document status aggregation

### API Design

- RESTful endpoints
- Consistent error responses
- JSON request/response format
- Bearer token in Authorization header

### Database Design

- Normalized schema
- Foreign key constraints
- Unique constraints on critical fields
- Indexes on frequently queried fields
- Automatic timestamps

## Technology Stack Summary

### Backend (New)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL
- **Database Driver**: mysql2/promise
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs
- **CORS**: cors
- **Environment**: dotenv

### Frontend (Existing)

- **Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + PostCSS
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **State Management**: React Context API
- **Notifications**: Sonner

## Development Workflow

### Backend Development

```bash
cd backend
npm run dev          # Start dev server with hot reload
npm run typecheck    # Check TypeScript errors
npm run build        # Build for production
npm start            # Run production build
```

### Frontend Development

```bash
npm run dev          # Start dev server on http://localhost:5173
npm run build        # Build for production
npm run preview      # Preview production build
```

## Deployment Architecture

### Development

```
Frontend (localhost:5173) ←→ Backend (localhost:5000) ←→ MySQL (localhost:3306)
```

### Production

```
Frontend (CDN/Netlify) ←→ Backend (Heroku/AWS) ←→ MySQL (RDS/Cloud SQL)
```

## Key Features by Module

### Master Setup

- Hierarchical structure: Institution → Campus → Department → Program
- Academic year management with activation
- Quota management with seat limits
- Prevents quota overbooking at database level

### Applicant Management

- Form with 15 fields maximum
- Automatic application number generation
- Document tracking with verification status
- Fee payment tracking

### Seat Allocation

- Quota-aware seat assignment
- Real-time availability checking
- Allocation & confirmation workflow
- Automatic admission number generation

### Dashboard & Reports

- Overall statistics (total, allocated, admitted, pending)
- Quota-wise seat status
- Document & fee pending lists
- Applicants by status breakdown
- Program-specific views

## Security Considerations

### Implemented

- JWT authentication
- Password hashing with bcryptjs
- Role-based access control
- Input validation
- SQL injection prevention (parameterized queries)
- CORS configuration

### Recommended for Production

- HTTPS/SSL
- Environment variable management
- Rate limiting
- Request validation with Zod/Yup
- Error boundary components
- Monitoring & logging
- Audit logging
- Database backups

## File Statistics

```
Backend:
  - Configuration files: 5
  - Source files: 12
  - Database: 1
  - Routes: 11
  - Middleware: 2
  - Utils: 1
  Total lines of code: ~3000+

Frontend:
  - Component files: 50+
  - Page files: 9
  - API integration: 1
  - Type definitions: 2
  Total lines of code: ~5000+
```

## Estimated Time to Setup

- **Backend Setup**: 5-10 minutes
- **Database Creation**: 2-3 minutes
- **Frontend Configuration**: 1-2 minutes
- **Total**: ~10-15 minutes

## Next Steps After Setup

1. Test login with provided credentials
2. Create master data (institution, program, quotas)
3. Create test applicant
4. Test seat allocation workflow
5. Verify admission confirmation flow
6. Review dashboard statistics

---

**Created**: April 2026
**Last Updated**: April 2026
**Status**: Complete & Ready for Testing
