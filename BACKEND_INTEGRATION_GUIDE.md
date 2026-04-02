# Complete Setup Guide - Backend to Frontend Integration

## Quick Start (5 minutes)

### Step 1: Start Backend Server

```bash
cd backend
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

### Step 2: Update Frontend Configuration

The frontend API client is already configured in:

```
src/app/api/client.ts
```

It automatically points to `http://localhost:5000/api`

### Step 3: Start Frontend

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Step 4: Login

- Email: `admin@edumerge.com` (or any email)
- Password: Any password

## Detailed Setup Instructions

### Backend Setup

#### 1. Database Setup

**Option A: Using MySQL Command Line**

```bash
mysql -u root -p
```

```sql
CREATE DATABASE admission_management;
```

**Option B: Using MySQL Workbench**

1. Open MySQL Workbench
2. Create new connection to localhost:3306
3. Execute this script:

```sql
CREATE DATABASE admission_management;
USE admission_management;
```

#### 2. Environment Configuration

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=admission_management
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

#### 3. Install Dependencies

```bash
cd backend
npm install
```

#### 4. Start Server

```bash
npm run dev
```

Expected output:

```
✓ Database connected successfully
✓ Database tables initialized successfully
✓ Server running on port 5000
✓ API available at http://localhost:5000/api
✓ Health check: http://localhost:5000/api/health
```

### Frontend Setup

#### 1. API Client Configuration

File: `src/app/api/client.ts`

The client is already configured with:

- Automatic token management from localStorage
- JWT token in Authorization header
- CORS-enabled requests

#### 2. Update AppContext Integration (Optional)

If you want to replace the mock data with real backend calls, modify:

```
src/app/contexts/AppContext.tsx
```

Replace mock operations with API calls:

```typescript
const addInstitution = async (data) => {
  const result = await institutionAPI.create(data);
  // Update state with result
};
```

#### 3. Start Frontend

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

## API Integration Guide

### Using the API Client in Components

```typescript
import { applicantAPI, authAPI } from "@/app/api/client";

// Login
const handleLogin = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    authAPI.setToken(response.data.token);
    // Save user to state/context
  } catch (error) {
    console.error("Login failed:", error);
  }
};

// Fetch applicants
const fetchApplicants = async () => {
  try {
    const response = await applicantAPI.getAll();
    // Update state with response.data
  } catch (error) {
    console.error("Failed to fetch applicants:", error);
  }
};

// Create applicant
const createApplicant = async (data) => {
  try {
    const response = await applicantAPI.create(data);
    // Handle response
  } catch (error) {
    console.error("Failed to create applicant:", error);
  }
};
```

## Testing the API

### Using Curl

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@edumerge.com","password":"password"}'

# Get all institutions (with token)
curl http://localhost:5000/api/institutions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Download Postman
2. Import API endpoints
3. Set `Authorization` header to `Bearer {{token}}`
4. Test all endpoints

## Workflow Example: Complete Admission Flow

### 1. Admin Setup (Credentials: admin@edumerge.com)

#### Create Institution

```javascript
POST /api/institutions
{
  "name": "Karnataka Institute of Technology",
  "code": "KIT",
  "address": "123 Tech Road",
  "phone": "+91 8012345678",
  "email": "info@kit.edu"
}
```

#### Create Campus

```javascript
POST /api/campuses
{
  "institutionId": "inst-1",
  "name": "Main Campus",
  "code": "MC",
  "location": "Bangalore"
}
```

#### Create Department

```javascript
POST /api/departments
{
  "campusId": "campus-1",
  "name": "Computer Science",
  "code": "CSE"
}
```

#### Create Academic Year

```javascript
POST /api/academic-years
{
  "year": "2026-2027",
  "startDate": "2026-07-01",
  "endDate": "2027-06-30",
  "isActive": true
}
```

#### Create Program

```javascript
POST /api/programs
{
  "departmentId": "dept-1",
  "academicYearId": "year-1",
  "name": "B.E. Computer Science",
  "code": "CSE",
  "courseType": "UG",
  "duration": 4,
  "totalIntake": 120
}
```

#### Create Quotas

```javascript
POST /
  api /
  quotas[
    ({
      programId: "prog-1",
      quotaType: "KCET",
      seats: 60,
      isSupernumerary: false,
    },
    {
      programId: "prog-1",
      quotaType: "COMEDK",
      seats: 30,
      isSupernumerary: false,
    },
    {
      programId: "prog-1",
      quotaType: "Management",
      seats: 30,
      isSupernumerary: false,
    })
  ];
```

### 2. Admission Officer Flow (Credentials: officer@edumerge.com)

#### Create Applicant

```javascript
POST /api/applicants
{
  "programId": "prog-1",
  "academicYearId": "year-1",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2008-05-15",
  "gender": "Male",
  "email": "john@example.com",
  "phone": "9876543210",
  "category": "GM",
  "entryType": "Regular",
  "admissionMode": "Government",
  "quotaType": "KCET",
  "qualifyingExam": "JEE Main",
  "marks": 95,
  "address": "123 Main St",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001"
}
```

#### Allocate Seat

```javascript
POST /api/seat-allocations/allocate
{
  "applicantId": "appl-1",
  "programId": "prog-1",
  "quotaType": "KCET"
}
```

#### Verify Documents

```javascript
PUT /api/documents/appl-1/10th Certificate
{
  "status": "Verified"
}
```

#### Mark Fee as Paid

```javascript
POST / api / documents / fee / appl - 1;
```

#### Confirm Admission

```javascript
POST / api / seat - allocations / alloc - 1 / confirm;
```

Response includes generated admission number:

```json
{
  "success": true,
  "data": {
    "applicantId": "appl-1",
    "admissionNumber": "KIT/2026/UG/CSE/KCET/0001",
    "admissionDate": "2026-04-01T10:30:00Z"
  }
}
```

### 3. Management View (Credentials: management@edumerge.com)

#### Get Dashboard Stats

```javascript
GET /api/dashboard

Response:
{
  "totalIntake": 240,
  "totalAdmitted": 15,
  "totalAllocated": 25,
  "totalPending": 10,
  "quotaWiseStats": [
    { "quotaType": "KCET", "total": 60, "filled": 10, "remaining": 50 },
    { "quotaType": "COMEDK", "total": 30, "filled": 5, "remaining": 25 },
    { "quotaType": "Management", "total": 30, "filled": 0, "remaining": 30 }
  ],
  "pendingDocuments": 8,
  "pendingFees": 12,
  "applicantsByStatus": [...]
}
```

## Troubleshooting

### Issue: Database Connection Failed

**Solution:**

1. Verify MySQL is running: `mysql -u root -p`
2. Check `.env` credentials
3. Ensure database exists: `SHOW DATABASES;`

### Issue: Port 5000 Already in Use

**Solution:**

```bash
# Change port in .env
PORT=5001

# Or kill process using port
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Issue: CORS Error

**Solution:**
Check `.env` CORS_ORIGIN matches your frontend URL:

```env
CORS_ORIGIN=http://localhost:5173
```

### Issue: Token Expired

The frontend automatically handles token refresh. If needed, login again.

### Issue: Frontend Still Using Mock Data

The frontend has both mock and API data layers. To fully switch to backend:

1. Update each page to use API instead of context
2. Example for ApplicantsPage:

```typescript
import { applicantAPI } from "@/app/api/client";

// Replace context call with API call
useEffect(() => {
  applicantAPI
    .getByProgram(programId)
    .then((res) => setApplicants(res.data))
    .catch((err) => console.error(err));
}, [programId]);
```

## Production Deployment

### Before Deploying:

1. **Change JWT Secret**

   ```env
   JWT_SECRET=generate_strong_random_key
   ```

2. **Use Production Database**
   - Use hosted MySQL (AWS RDS, Azure Database, etc.)
   - Update DB credentials in `.env`

3. **Enable HTTPS**
   - Update CORS_ORIGIN to HTTPS URL
   - Configure SSL certificates

4. **Set NODE_ENV**

   ```env
   NODE_ENV=production
   ```

5. **Optimize Build**

   ```bash
   npm run build
   ```

6. **Use Process Manager** (PM2)
   ```bash
   npm install -g pm2
   pm2 start dist/app.js --name "admission-api"
   pm2 save
   pm2 startup
   ```

## Support & Contact

- Email: deepak@edumerge.com
- Subject: Assignment for Junior Software Developer - Backend Integration
