# API Endpoints Quick Reference

## Base URL

```
http://localhost:5000/api
```

## Authentication Endpoints

### Login

```
POST /auth/login
Body: { email, password }
Response: { user, token }
```

### Get Current User

```
GET /auth/me
Headers: Authorization: Bearer <token>
Response: { user }
```

---

## Institution Management

### List All Institutions

```
GET /institutions
Response: { data: Institution[] }
```

### Get Institution Details

```
GET /institutions/:id
Response: { data: Institution }
```

### Create Institution (Admin only)

```
POST /institutions
Headers: Authorization: Bearer <token>
Body: { name, code, address, phone, email }
Response: { data: Institution }
```

### Update Institution (Admin only)

```
PUT /institutions/:id
Headers: Authorization: Bearer <token>
Body: { name, code, address, phone, email }
Response: { success: true, message }
```

### Delete Institution (Admin only)

```
DELETE /institutions/:id
Headers: Authorization: Bearer <token>
Response: { success: true, message }
```

---

## Campus Management

### List All Campuses

```
GET /campuses
Response: { data: Campus[] }
```

### List Campuses by Institution

```
GET /campuses/institution/:institutionId
Response: { data: Campus[] }
```

### Create Campus (Admin only)

```
POST /campuses
Headers: Authorization: Bearer <token>
Body: { institutionId, name, code, location }
Response: { data: Campus }
```

### Update Campus (Admin only)

```
PUT /campuses/:id
Headers: Authorization: Bearer <token>
Body: { name, code, location }
Response: { success: true, message }
```

### Delete Campus (Admin only)

```
DELETE /campuses/:id
Headers: Authorization: Bearer <token>
Response: { success: true, message }
```

---

## Department Management

### List All Departments

```
GET /departments
Response: { data: Department[] }
```

### List Departments by Campus

```
GET /departments/campus/:campusId
Response: { data: Department[] }
```

### Create Department (Admin only)

```
POST /departments
Headers: Authorization: Bearer <token>
Body: { campusId, name, code }
Response: { data: Department }
```

### Update Department (Admin only)

```
PUT /departments/:id
Headers: Authorization: Bearer <token>
Body: { name, code }
Response: { success: true, message }
```

### Delete Department (Admin only)

```
DELETE /departments/:id
Headers: Authorization: Bearer <token>
Response: { success: true, message }
```

---

## Academic Year Management

### List All Academic Years

```
GET /academic-years
Response: { data: AcademicYear[] }
```

### Get Active Academic Year

```
GET /academic-years/active
Response: { data: AcademicYear }
```

### Create Academic Year (Admin only)

```
POST /academic-years
Headers: Authorization: Bearer <token>
Body: { year, startDate, endDate, isActive }
Response: { data: AcademicYear }
```

### Update Academic Year (Admin only)

```
PUT /academic-years/:id
Headers: Authorization: Bearer <token>
Body: { year, startDate, endDate, isActive }
Response: { success: true, message }
```

---

## Program Management

### List All Programs

```
GET /programs
Response: { data: Program[] }
```

### List Programs by Department

```
GET /programs/department/:departmentId
Response: { data: Program[] }
```

### Get Program with Quotas

```
GET /programs/:id/quotas
Response: { data: { ...Program, quotas: Quota[] } }
```

### Create Program (Admin only)

```
POST /programs
Headers: Authorization: Bearer <token>
Body: { departmentId, academicYearId, name, code, courseType, duration, totalIntake }
Response: { data: Program }
```

### Update Program (Admin only)

```
PUT /programs/:id
Headers: Authorization: Bearer <token>
Body: { name, code, courseType, duration, totalIntake }
Response: { success: true, message }
```

---

## Quota Management

### List All Quotas

```
GET /quotas
Response: { data: Quota[] }
```

### List Quotas by Program

```
GET /quotas/program/:programId
Response: { data: Quota[] }
```

### Create Quota (Admin only)

```
POST /quotas
Headers: Authorization: Bearer <token>
Body: { programId, quotaType, seats, isSupernumerary }
Validations:
  - Total quota seats cannot exceed program intake
  - Each program-quotaType combination is unique
Response: { data: Quota }
```

### Update Quota (Admin only)

```
PUT /quotas/:id
Headers: Authorization: Bearer <token>
Body: { seats }
Response: { success: true, message }
```

---

## Applicant Management

### List All Applicants

```
GET /applicants
Response: { data: Applicant[] }
```

### List Applicants by Program

```
GET /applicants/program/:programId
Response: { data: Applicant[] }
```

### Get Applicant Details

```
GET /applicants/:id
Response: { data: { ...Applicant, documents: Document[] } }
```

### Create Applicant (Admin, Admission Officer)

```
POST /applicants
Headers: Authorization: Bearer <token>
Body: {
  programId, academicYearId, firstName, lastName, dateOfBirth, gender,
  email, phone, category, entryType, admissionMode, quotaType,
  qualifyingExam, marks, address, city, state, pincode
}
Validations:
  - Email format validation
  - Phone number validation (10 digits)
  - Pincode validation (6 digits)
  - Default documents created automatically
Response: { data: Applicant, applicationNumber }
```

### Update Applicant (Admin, Admission Officer)

```
PUT /applicants/:id
Headers: Authorization: Bearer <token>
Body: { firstName, lastName, email, phone, ... all fields }
Response: { success: true, message }
```

---

## Seat Allocation

### List All Allocations

```
GET /seat-allocations
Response: { data: SeatAllocation[] }
```

### List Allocations by Program

```
GET /seat-allocations/program/:programId
Response: { data: SeatAllocation[] }
```

### Allocate Seat (Admin, Admission Officer)

```
POST /seat-allocations/allocate
Headers: Authorization: Bearer <token>
Body: { applicantId, programId, quotaType }
Validations:
  - Applicant exists
  - Quota exists and has available seats
  - Applicant not already allocated
Response: { data: SeatAllocation, message: "Seat allocated successfully" }
Side Effects:
  - Quota filledSeats incremented
  - Applicant status changed to "Allocated"
```

### Confirm Admission (Admin, Admission Officer)

```
POST /seat-allocations/:allocationId/confirm
Headers: Authorization: Bearer <token>
Validations:
  - All documents verified
  - Fee must be paid
  - These conditions are mandatory
Response: { data: { admissionNumber, admissionDate } }
Side Effects:
  - Admission number generated (format: INST/YEAR/UG/DEPT/QUOTA/SEQUENCE)
  - Applicant status changed to "Confirmed"
  - Allocation marked as confirmed
```

---

## Document Management

### Get Applicant Documents

```
GET /documents/applicant/:applicantId
Response: { data: Document[] }
```

### Update Document Status (Admin, Admission Officer)

```
PUT /documents/:applicantId/:documentType
Headers: Authorization: Bearer <token>
Body: { status, remarks }
Status Values: "Pending" | "Submitted" | "Verified"
Response: { success: true, message }
Side Effects:
  - Document verified timestamp updated
  - Applicant documentStatus auto-calculated
```

### Mark Fee as Paid (Admin, Admission Officer)

```
POST /documents/fee/:applicantId
Headers: Authorization: Bearer <token>
Response: { success: true, message: "Fee marked as paid" }
Side Effects:
  - Applicant feeStatus changed to "Paid"
```

---

## Dashboard & Reports

### Get Overall Dashboard Statistics

```
GET /dashboard
Headers: Authorization: Bearer <token>
Response: {
  totalIntake,
  totalAdmitted,
  totalAllocated,
  totalPending,
  quotaWiseStats: [
    { quotaType, total, filled, remaining }
  ],
  pendingDocuments,
  pendingFees,
  applicantsByStatus: [
    { status, count }
  ]
}
```

### Get Program-Specific Dashboard

```
GET /dashboard/program/:programId
Headers: Authorization: Bearer <token>
Response: {
  totalIntake,
  totalAdmitted,
  totalAllocated,
  quotaWiseStats: [...]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Stack trace (development only)"
}
```

Common HTTP Status Codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## Request/Response Examples

### Login Example

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@edumerge.com",
    "password": "password123"
  }'

# Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-123",
      "name": "Admin User",
      "email": "admin@edumerge.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create Applicant Example

```bash
curl -X POST http://localhost:5000/api/applicants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
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
  }'

# Response
{
  "success": true,
  "message": "Applicant created successfully",
  "data": {
    "id": "appl-1",
    "applicationNumber": "APP/2026/0401/00001",
    "programId": "prog-1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "applicationStatus": "Submitted"
  }
}
```

---

## Frontend Integration

All endpoints can be called using the provided API client:

```typescript
// src/app/api/client.ts

import { applicantAPI, seatAllocationAPI, authAPI } from "@/app/api/client";

// Login
const response = await authAPI.login(email, password);
authAPI.setToken(response.data.token);

// Create applicant
const result = await applicantAPI.create(applicantData);

// Allocate seat
const allocation = await seatAllocationAPI.allocate({
  applicantId,
  programId,
  quotaType,
});

// Confirm admission
const confirmed = await seatAllocationAPI.confirm(allocationId);

// Get dashboard stats
const stats = await dashboardAPI.getStats();
```

---

## Rate Limiting (Future Enhancement)

Currently not implemented. Recommended for production:

- 100 requests per minute per IP
- 10 requests per second for authentication

---

## Pagination (Future Enhancement)

Currently returns all records. Recommended for large datasets:

```
GET /applicants?page=1&limit=20&sortBy=createdAt&order=DESC
```

---

Last Updated: April 2026
