# EduMerge - Admission Management & CRM System

A comprehensive web-based Admission Management system built for educational institutions to manage programs, quotas, applicants, and seat allocations.

## 🎯 Project Overview

This system enables colleges to:
- Configure programs and seat quotas
- Manage applicant applications
- Allocate seats without quota violations
- Generate unique admission numbers
- Track documents and fee status
- View comprehensive dashboards and reports

## 🚀 Features

### 1. Master Setup
- **Institution Management**: Create and manage institution details
- **Campus Management**: Add multiple campuses per institution
- **Department Management**: Organize departments under campuses
- **Academic Year**: Configure academic years
- **Program Management**: Set up programs with intake capacity
- **Quota Configuration**: Define quotas (KCET, COMEDK, Management) with seat limits

### 2. Applicant Management
- Create applicant profiles with 15 essential fields
- Track application status: Draft → Submitted → Allocated → Confirmed
- Support for both Government and Management quota flows
- Category-wise classification (GM, SC, ST, OBC, etc.)

### 3. Seat Allocation
- Real-time seat availability tracking
- Quota-wise seat allocation with validation
- Prevents overbooking and quota violations
- Visual indicators for quota fill status

### 4. Admission Confirmation
- Document verification workflow
- Fee status tracking
- Auto-generation of unique admission numbers
- Format: `INST/YEAR/COURSE/PROGRAM/QUOTA/SEQUENCE`
- Immutable admission numbers

### 5. Reports & Dashboard
- Total intake vs admitted statistics
- Quota-wise filled seats analysis
- Program-wise admission reports
- Pending documents and fees tracking
- Real-time status updates

### 6. User Roles
- **Admin**: Full system access, master setup, quota configuration
- **Admission Officer**: Create applicants, allocate seats, verify documents
- **Management**: View-only access to dashboards and reports

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **React Router 7** - Navigation and routing
- **Tailwind CSS v4** - Styling
- **Radix UI** - Accessible UI components
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### State Management
- React Context API for global state
- Local storage for data persistence (demo)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or pnpm package manager

## 🔧 Installation & Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd edumerge-admission-crm
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Start the development server**
```bash
npm run dev
# or
pnpm dev
```

4. **Build for production**
```bash
npm run build
# or
pnpm build
```

## 🔑 Demo Credentials

The system includes pre-configured demo users for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edumerge.com | any password |
| Admission Officer | officer@edumerge.com | any password |
| Management | management@edumerge.com | any password |

## 📖 User Journeys

### Journey 1: System Setup (Admin)
1. Login as Admin
2. Navigate to Master Setup
3. Create Institution → Campus → Department
4. Add Academic Year
5. Create Programs with intake capacity
6. Configure Quotas for each program

### Journey 2: Government Admission (Admission Officer)
1. Navigate to Applicants → New Applicant
2. Fill applicant details with government allotment number
3. Submit application
4. Go to Seat Allocation
5. Select program and applicant
6. Choose quota (system validates availability)
7. Allocate seat
8. View applicant details
9. Verify documents
10. Mark fee as paid
11. Confirm admission (generates admission number)

### Journey 3: Management Admission (Admission Officer)
1. Create applicant with Management quota
2. Skip allotment number requirement
3. Follow seat allocation process
4. Complete document verification
5. Confirm fee payment
6. Generate admission number

### Journey 4: Monitoring (Management)
1. Login as Management user
2. View Dashboard for overview
3. Check quota-wise filling status
4. Navigate to Reports
5. Review program-wise statistics
6. Monitor pending documents and fees

## 🎨 Key System Rules Implemented

✅ **Quota Validation**: Seats cannot exceed program intake  
✅ **No Overbooking**: System prevents allocation when quota is full  
✅ **Unique Admission Numbers**: Generated only once, immutable  
✅ **Confirmation Guards**: Admission confirmed only after:
  - Documents verified
  - Fee paid
  - Seat allocated  
✅ **Real-time Updates**: Seat counters update immediately  
✅ **Role-based Access**: Features restricted by user role

## 📊 Data Models

### Core Entities
- Institution
- Campus
- Department
- Academic Year
- Program
- Quota
- Applicant
- Seat Allocation
- Document
- User

### Key Relationships
```
Institution → Campus → Department → Program
Program → Quota (1:many)
Program → Applicant (1:many)
Applicant → SeatAllocation (1:1)
Applicant → Document (1:many)
```

## 🎯 Business Logic Highlights

### Admission Number Format
```
KIT/2026/UG/CSE/KCET/0001
│   │    │  │   │    │
│   │    │  │   │    └─ Sequence number (4 digits)
│   │    │  │   └────── Quota type
│   │    │  └────────── Program code
│   │    └───────────── Course type (UG/PG)
│   └────────────────── Academic year
└────────────────────── Institution code
```

### Seat Allocation Logic
1. Check if applicant already has allocation
2. Verify quota availability
3. Validate program configuration
4. Lock seat in selected quota
5. Update applicant status to 'Allocated'
6. Increment quota filled seats counter

### Confirmation Workflow
```
Submitted → (Allocate) → Allocated → (Verify + Pay) → Confirmed
```

## 🚫 Out of Scope (As Per Requirements)

- Payment gateway integration
- SMS/WhatsApp notifications
- Advanced CRM features
- AI prediction models
- Multi-college complexity
- Marketing automation

## 🤖 AI Assistance Disclosure

This project was developed with assistance from AI tools:
- **Tool Used**: Claude AI (Anthropic)
- **AI-Assisted Components**:
  - Initial project structure and architecture
  - React component scaffolding
  - TypeScript type definitions
  - Business logic implementation
  - UI component composition
  - Documentation generation

**Human Contributions**:
- System requirements analysis
- Business rule validation
- User journey design
- Testing and refinement
- Architecture decisions

## 📝 Notes

- This is a **frontend-only demo** with mock data
- For production use, integrate with a real backend (Node.js + PostgreSQL/MongoDB)
- Add proper authentication and authorization
- Implement data validation and sanitization
- Add error boundaries and loading states
- Consider adding PDF generation for admission letters
- Implement proper logging and audit trails

## 🐛 Known Limitations

- No persistent data storage (refreshing resets to mock data)
- No file upload functionality for documents
- No email notifications
- No PDF report generation
- No data export features
- Basic responsive design (optimize for mobile)

## 🔮 Future Enhancements

- Backend API integration
- Database persistence (PostgreSQL/MongoDB)
- File upload for documents
- Email notifications
- PDF report generation
- Advanced search and filtering
- Bulk operations
- Data export (Excel/CSV)
- Audit log tracking
- Multi-language support

## 📞 Contact

For any queries regarding this assignment:
- Email: deepak@edumerge.com
- Subject: Assignment for Junior Software Developer

## 📄 License

This project is created as part of a job application assignment for EduMerge.

---

**Developed by**: [Your Name]  
**Date**: April 1, 2026  
**Assignment**: Junior Software Developer - EduMerge
