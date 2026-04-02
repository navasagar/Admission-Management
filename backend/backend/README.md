# Admission Management System - Backend API

A Node.js + Express.js REST API for managing college admissions with quotas, applicants, and seat allocation.

## Features

- ✅ User authentication (Admin, Admission Officer, Management)
- ✅ Master data setup (Institutions, Campuses, Departments, Programs)
- ✅ Academic year management
- ✅ Quota management with seat validation
- ✅ Applicant management
- ✅ Seat allocation with quota enforcement
- ✅ Document verification tracking
- ✅ Fee status management
- ✅ Admission confirmation with auto-generated admission numbers
- ✅ Dashboard with real-time statistics
- ✅ Role-based access control (RBAC)

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE admission_management;
```

Or check the `src/config/database.ts` file for creation query.

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=admission_management

JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:5173
```

## Running the Server

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Institutions

- `GET /api/institutions` - List all institutions
- `POST /api/institutions` - Create institution (admin only)
- `GET /api/institutions/:id` - Get institution details
- `PUT /api/institutions/:id` - Update institution (admin only)
- `DELETE /api/institutions/:id` - Delete institution (admin only)

### Campuses

- `GET /api/campuses` - List all campuses
- `GET /api/campuses/institution/:institutionId` - Get campuses by institution
- `POST /api/campuses` - Create campus (admin only)
- `PUT /api/campuses/:id` - Update campus (admin only)
- `DELETE /api/campuses/:id` - Delete campus (admin only)

### Departments

- `GET /api/departments` - List all departments
- `GET /api/departments/campus/:campusId` - Get departments by campus
- `POST /api/departments` - Create department (admin only)
- `PUT /api/departments/:id` - Update department (admin only)
- `DELETE /api/departments/:id` - Delete department (admin only)

### Academic Years

- `GET /api/academic-years` - List academic years
- `GET /api/academic-years/active` - Get active academic year
- `POST /api/academic-years` - Create academic year (admin only)
- `PUT /api/academic-years/:id` - Update academic year (admin only)

### Programs

- `GET /api/programs` - List all programs
- `GET /api/programs/department/:departmentId` - Get programs by department
- `GET /api/programs/:id/quotas` - Get program with quotas
- `POST /api/programs` - Create program (admin only)
- `PUT /api/programs/:id` - Update program (admin only)

### Quotas

- `GET /api/quotas` - List all quotas
- `GET /api/quotas/program/:programId` - Get quotas by program
- `POST /api/quotas` - Create quota (admin only)
- `PUT /api/quotas/:id` - Update quota (admin only)

### Applicants

- `GET /api/applicants` - List all applicants
- `GET /api/applicants/program/:programId` - Get applicants by program
- `GET /api/applicants/:id` - Get applicant details
- `POST /api/applicants` - Create applicant (admin, admission officer)
- `PUT /api/applicants/:id` - Update applicant (admin, admission officer)

### Seat Allocation

- `GET /api/seat-allocations` - List all allocations
- `GET /api/seat-allocations/program/:programId` - Get allocations by program
- `POST /api/seat-allocations/allocate` - Allocate seat (admin, admission officer)
- `POST /api/seat-allocations/:allocationId/confirm` - Confirm admission (admin, admission officer)

### Documents

- `GET /api/documents/applicant/:applicantId` - Get applicant documents
- `PUT /api/documents/:applicantId/:documentType` - Update document status (admin, admission officer)
- `POST /api/documents/fee/:applicantId` - Mark fee as paid (admin, admission officer)

### Dashboard

- `GET /api/dashboard` - Get overall dashboard statistics (requires auth)
- `GET /api/dashboard/program/:programId` - Get program-specific statistics (requires auth)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Flow

1. Send credentials to `/api/auth/login`
2. Receive JWT token in response
3. Include token in Authorization header for protected routes:
   ```
   Authorization: Bearer <token>
   ```

### Test Users

```
Email: admin@edumerge.com (Role: admin)
Email: officer@edumerge.com (Role: admission_officer)
Email: management@edumerge.com (Role: management)
Password: Any password (demo mode)
```

## Database Schema

### Key Tables

- **users** - User accounts with roles
- **institutions** - College/Institution information
- **campuses** - Campus locations
- **departments** - Academic departments
- **academic_years** - Academic year records
- **programs** - Degree programs
- **quotas** - Quota and seat information
- **applicants** - Student applicants
- **seat_allocations** - Seat allocation records
- **documents** - Document verification tracking

## Key Business Rules

1. **Quota Validation**: Total quota seats for a program cannot exceed program intake
2. **Seat Availability**: Cannot allocate seat if quota is full
3. **Admission Confirmation**: Requires:
   - All documents verified
   - Fee must be paid
4. **Unique Admission Number**: Generated automatically in format: `INST/YEAR/UG/DEPT/QUOTA/SEQUENCE`
5. **Real-time Updates**: Quota counters update immediately upon allocation

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Stack trace (development only)"
}
```

## Development Workflow

### TypeScript Checking

```bash
npm run typecheck
```

### Build for Production

```bash
npm run build
```

Output files go to `dist/` directory.

## Connecting Frontend

Update your frontend API client to point to the backend:

```typescript
const API_BASE_URL = "http://localhost:5000/api";

// Example
const response = await fetch(`${API_BASE_URL}/institutions`);
const data = await response.json();
```

## Security Notes

- ⚠️ Change `JWT_SECRET` in production
- ⚠️ Use environment variables for sensitive data
- ⚠️ Never commit `.env` to version control
- ⚠️ Validate all input data
- ⚠️ Use HTTPS in production
- ⚠️ Implement rate limiting in production

## Troubleshooting

### Database Connection Error

- Check MySQL is running
- Verify DB credentials in `.env`
- Ensure database exists

### Port Already in Use

```bash
# Change port in .env or use different port
npm run dev -- --port 3001
```

### CORS Issues

- Check `CORS_ORIGIN` in `.env`
- Ensure frontend URL matches

## License

MIT License

## Support

For technical issues or questions:

- Email: deepak@edumerge.com
- Subject: Assignment for Junior Software Developer - Backend Support
