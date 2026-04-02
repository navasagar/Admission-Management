// Database Models
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'admission_officer' | 'management';
  createdAt: string;
  updatedAt: string;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campus {
  id: string;
  institutionId: string;
  name: string;
  code: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  campusId: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Program {
  id: string;
  departmentId: string;
  academicYearId: string;
  name: string;
  code: string;
  courseType: 'UG' | 'PG';
  duration: number;
  totalIntake: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quota {
  id: string;
  programId: string;
  quotaType: 'KCET' | 'COMEDK' | 'Management';
  seats: number;
  filledSeats: number;
  isSupernumerary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Applicant {
  id: string;
  applicationNumber: string;
  programId: string;
  academicYearId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  category: 'GM' | 'SC' | 'ST' | 'OBC' | '2A' | '2B' | '3A' | '3B';
  entryType: 'Regular' | 'Lateral';
  admissionMode: 'Government' | 'Management';
  quotaType: 'KCET' | 'COMEDK' | 'Management';
  qualifyingExam: string;
  marks: number;
  rank?: string;
  allotmentNumber?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  applicationStatus: 'Draft' | 'Submitted' | 'Allocated' | 'Confirmed' | 'Rejected';
  documentStatus: 'Pending' | 'Submitted' | 'Verified';
  feeStatus: 'Pending' | 'Paid';
  admissionNumber?: string;
  admissionDate?: string;
  allocatedSeatId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeatAllocation {
  id: string;
  applicantId: string;
  programId: string;
  quotaId: string;
  allocationDate: string;
  isConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  applicantId: string;
  documentType: string;
  status: 'Pending' | 'Submitted' | 'Verified';
  uploadedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalIntake: number;
  totalAdmitted: number;
  totalAllocated: number;
  totalPending: number;
  quotaWiseStats: {
    quotaType: 'KCET' | 'COMEDK' | 'Management';
    total: number;
    filled: number;
    remaining: number;
  }[];
  pendingDocuments: number;
  pendingFees: number;
  applicantsByStatus: {
    status: 'Draft' | 'Submitted' | 'Allocated' | 'Confirmed' | 'Rejected';
    count: number;
  }[];
}

// Request/Response Types
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
