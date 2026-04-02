# Setup Guide - EduMerge Admission CRM

## Quick Start

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is occupied).

## First Time Setup

### 1. Login
- Navigate to the application
- You'll be redirected to `/login`
- Use any of these credentials:
  - **Admin**: admin@edumerge.com (any password)
  - **Officer**: officer@edumerge.com (any password)
  - **Management**: management@edumerge.com (any password)

### 2. Explore Pre-loaded Data
The system comes with sample data:
- 1 Institution (Karnataka Institute of Technology)
- 1 Campus (Main Campus)
- 3 Departments (CSE, ECE, ME)
- 1 Academic Year (2026-2027)
- 3 Programs (B.E. in CSE, ECE, ME)
- 9 Quotas (3 per program: KCET, COMEDK, Management)
- 5 Sample Applicants with various statuses

### 3. Test Workflows

#### Admin Workflow
1. Login as admin@edumerge.com
2. Go to **Master Setup**
3. Try adding:
   - New institution
   - New campus
   - New department
   - New program
   - New quota

#### Admission Officer Workflow
1. Login as officer@edumerge.com
2. Go to **Applicants** → Click "New Applicant"
3. Fill in applicant details
4. Submit application
5. Go to **Seat Allocation**
6. Allocate a seat to the new applicant
7. Click on the applicant to view details
8. Verify documents (click check marks)
9. Mark fee as paid
10. Click "Confirm Admission" to generate admission number

#### Management Workflow
1. Login as management@edumerge.com
2. View **Dashboard** for overview
3. Check **Reports** for detailed analytics

## Features to Test

### 1. Quota Validation
- Try allocating more seats than available in a quota
- System should show error: "No seats available"

### 2. Admission Confirmation Guards
- Try confirming admission before:
  - Documents are verified → Should fail
  - Fee is paid → Should fail
- System enforces both conditions

### 3. Quota Management
- In Master Setup → Quota tab
- Try adding quota that exceeds program intake
- System should prevent this

### 4. Real-time Updates
- Allocate a seat
- Check dashboard immediately
- Numbers should update in real-time

### 5. Role-based Access
- Login as Management user
- Note: "Master Setup", "Applicants", and "Seat Allocation" are hidden
- Only Dashboard and Reports are accessible

## Data Flow Example

### Complete Admission Flow
1. **Admin creates structure**:
   ```
   Institution → Campus → Department → Program (Intake: 120)
   → Quotas (KCET: 60, COMEDK: 30, Management: 30)
   ```

2. **Officer creates applicant**:
   ```
   Personal details + Academic details + Address
   Status: Submitted
   ```

3. **Officer allocates seat**:
   ```
   Select Program → Select Applicant → Choose Quota
   Check availability → Allocate
   Status: Allocated
   Quota counter: Filled +1
   ```

4. **Officer verifies documents**:
   ```
   Click checkmarks for each document
   Document Status: Verified
   ```

5. **Officer confirms fee**:
   ```
   Mark as Paid
   Fee Status: Paid
   ```

6. **Officer confirms admission**:
   ```
   Click "Confirm Admission"
   System generates: KIT/2026/UG/CSE/KCET/0046
   Status: Confirmed
   ```

## Common Issues & Solutions

### Issue: Port already in use
**Solution**: 
```bash
# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
# Or use a different port
npm run dev -- --port 3000
```

### Issue: Module not found errors
**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Data resets on refresh
**Expected Behavior**: This is a frontend-only demo with in-memory state. Data resets on page refresh. For persistence, integrate with a backend database.

### Issue: Can't create applicant
**Check**:
- Ensure Academic Year exists
- Ensure Programs exist
- Ensure you're logged in as Admin or Admission Officer

### Issue: Can't confirm admission
**Check**:
- Seat must be allocated first
- Documents must be verified
- Fee must be paid
- All three conditions are required

## Understanding the Code Structure

```
src/
├── app/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   └── LoadingSpinner.tsx
│   ├── contexts/         # Global state management
│   │   └── AppContext.tsx
│   ├── data/             # Mock data
│   │   └── mockData.ts
│   ├── layouts/          # Layout components
│   │   └── RootLayout.tsx
│   ├── pages/            # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── MasterSetupPage.tsx
│   │   ├── ApplicantsPage.tsx
│   │   ├── ApplicantFormPage.tsx
│   │   ├── ApplicantDetailPage.tsx
│   │   ├── SeatAllocationPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── types/            # TypeScript definitions
│   │   └── index.ts
│   ├── App.tsx           # Main app component
│   └── routes.tsx        # Route configuration
└── styles/              # Global styles
```

## Key Files to Review

### For Understanding Business Logic:
- `src/app/contexts/AppContext.tsx` - All business logic
- `src/app/types/index.ts` - Data structures

### For Understanding UI:
- `src/app/layouts/RootLayout.tsx` - Main layout with navigation
- `src/app/pages/*` - Individual page implementations

### For Understanding Data:
- `src/app/data/mockData.ts` - Sample data structure

## Extending the System

### Add a New Field to Applicant
1. Update type in `src/app/types/index.ts`
2. Update form in `src/app/pages/ApplicantFormPage.tsx`
3. Display in `src/app/pages/ApplicantDetailPage.tsx`

### Add a New User Role
1. Update `UserRole` type in `src/app/types/index.ts`
2. Add mock user in `AppContext.tsx` login function
3. Update navigation permissions in `RootLayout.tsx`

### Add a New Report
1. Create new card in `src/app/pages/ReportsPage.tsx`
2. Calculate statistics in `getDashboardStats`
3. Display data in table or chart format

## Production Checklist

Before deploying to production:

- [ ] Replace mock data with real API calls
- [ ] Implement proper authentication (JWT/OAuth)
- [ ] Add form validation (Zod/Yup)
- [ ] Add error boundaries
- [ ] Implement proper error handling
- [ ] Add loading states for all async operations
- [ ] Add confirmation dialogs for destructive actions
- [ ] Implement data persistence (backend + database)
- [ ] Add file upload for documents
- [ ] Add PDF generation for admission letters
- [ ] Implement email notifications
- [ ] Add audit logging
- [ ] Add data backup mechanism
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Set up monitoring and alerts
- [ ] Add comprehensive testing
- [ ] Optimize bundle size
- [ ] Add service worker for offline support
- [ ] Implement proper SEO
- [ ] Add analytics tracking

## Support

For technical issues or questions about the assignment:
- Email: deepak@edumerge.com
- Subject: Assignment for Junior Software Developer - Technical Query

---

**Happy Testing! 🚀**
