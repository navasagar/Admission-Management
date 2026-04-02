// Type definitions for the Admission Management System

export type UserRole = 'admin' | 'admission_officer' | 'management';

export type CourseType = 'UG' | 'PG';
export type EntryType = 'Regular' | 'Lateral';
export type AdmissionMode = 'Government' | 'Management';
export type QuotaType = 'KCET' | 'COMEDK' | 'Management';
export type Category = 'GM' | 'SC' | 'ST' | 'OBC' | '2A' | '2B' | '3A' | '3B';
export type DocumentStatus = 'Pending' | 'Submitted' | 'Verified';
export type FeeStatus = 'Pending' | 'Paid';
export type ApplicationStatus = 'Draft' | 'Submitted' | 'Allocated' | 'Confirmed' | 'Rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Campus {
  id: string;
  institutionId: string;
  name: string;
  code: string;
  location: string;
  createdAt: string;
}

export interface Department {
  id: string;
  campusId: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface AcademicYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface Program {
  id: string;
  departmentId: string;
  academicYearId: string;
  name: string;
  code: string;
  courseType: CourseType;
  duration: number; // in years
  totalIntake: number;
  createdAt: string;
}

export interface Quota {
  id: string;
  programId: string;
  quotaType: QuotaType;
  seats: number;
  filledSeats: number;
  isSupernumerary: boolean;
  createdAt: string;
}

export interface Applicant {
  id: string;
  applicationNumber: string;
  programId: string;
  academicYearId: string;
  
  // Personal Details
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  
  // Academic Details
  category: Category;
  entryType: EntryType;
  admissionMode: AdmissionMode;
  quotaType: QuotaType;
  qualifyingExam: string;
  marks: number;
  rank?: string;
  allotmentNumber?: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  // Status
  applicationStatus: ApplicationStatus;
  documentStatus: DocumentStatus;
  feeStatus: FeeStatus;
  
  // Admission Details
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
}

export interface Document {
  id: string;
  applicantId: string;
  documentType: string;
  status: DocumentStatus;
  uploadedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  remarks?: string;
}

export interface DashboardStats {
  totalIntake: number;
  totalAdmitted: number;
  totalAllocated: number;
  totalPending: number;
  quotaWiseStats: {
    quotaType: QuotaType;
    total: number;
    filled: number;
    remaining: number;
  }[];
  pendingDocuments: number;
  pendingFees: number;
  applicantsByStatus: {
    status: ApplicationStatus;
    count: number;
  }[];
}
