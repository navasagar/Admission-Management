import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  User,
  Institution,
  Campus,
  Department,
  AcademicYear,
  Program,
  Quota,
  Applicant,
  SeatAllocation,
  Document,
  DashboardStats,
  QuotaType,
  ApplicationStatus,
  FeeStatus,
  DocumentStatus,
} from '../types';
import { generateMockData } from '../data/mockData';

interface AppContextType {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Master Data
  institutions: Institution[];
  campuses: Campus[];
  departments: Department[];
  academicYears: AcademicYear[];
  programs: Program[];
  quotas: Quota[];
  
  // Master Data Actions
  addInstitution: (data: Omit<Institution, 'id' | 'createdAt'>) => void;
  addCampus: (data: Omit<Campus, 'id' | 'createdAt'>) => void;
  addDepartment: (data: Omit<Department, 'id' | 'createdAt'>) => void;
  addAcademicYear: (data: Omit<AcademicYear, 'id' | 'createdAt'>) => void;
  addProgram: (data: Omit<Program, 'id' | 'createdAt'>) => void;
  addQuota: (data: Omit<Quota, 'id' | 'createdAt' | 'filledSeats'>) => void;
  updateQuota: (id: string, data: Partial<Quota>) => void;
  
  // Applicants
  applicants: Applicant[];
  addApplicant: (data: Omit<Applicant, 'id' | 'applicationNumber' | 'createdAt' | 'updatedAt'>) => string;
  updateApplicant: (id: string, data: Partial<Applicant>) => void;
  getApplicant: (id: string) => Applicant | undefined;
  
  // Seat Allocation
  seatAllocations: SeatAllocation[];
  allocateSeat: (applicantId: string, programId: string, quotaType: QuotaType) => { success: boolean; message: string; admissionNumber?: string };
  confirmAdmission: (applicantId: string) => { success: boolean; message: string };
  
  // Documents
  documents: Document[];
  updateDocumentStatus: (applicantId: string, documentType: string, status: DocumentStatus) => void;
  
  // Dashboard
  getDashboardStats: (programId?: string) => DashboardStats;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [seatAllocations, setSeatAllocations] = useState<SeatAllocation[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Initialize with mock data
  useEffect(() => {
    const mockData = generateMockData();
    setInstitutions(mockData.institutions);
    setCampuses(mockData.campuses);
    setDepartments(mockData.departments);
    setAcademicYears(mockData.academicYears);
    setPrograms(mockData.programs);
    setQuotas(mockData.quotas);
    setApplicants(mockData.applicants);
    setSeatAllocations(mockData.seatAllocations);
    setDocuments(mockData.documents);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - accept any credentials
    const mockUsers: User[] = [
      { id: '1', name: 'Admin User', email: 'admin@edumerge.com', role: 'admin' },
      { id: '2', name: 'Admission Officer', email: 'officer@edumerge.com', role: 'admission_officer' },
      { id: '3', name: 'Management', email: 'management@edumerge.com', role: 'management' },
    ];
    
    const user = mockUsers.find(u => u.email === email) || mockUsers[0];
    setCurrentUser(user);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addInstitution = (data: Omit<Institution, 'id' | 'createdAt'>) => {
    const newInstitution: Institution = {
      ...data,
      id: `inst-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setInstitutions([...institutions, newInstitution]);
  };

  const addCampus = (data: Omit<Campus, 'id' | 'createdAt'>) => {
    const newCampus: Campus = {
      ...data,
      id: `campus-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCampuses([...campuses, newCampus]);
  };

  const addDepartment = (data: Omit<Department, 'id' | 'createdAt'>) => {
    const newDepartment: Department = {
      ...data,
      id: `dept-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDepartments([...departments, newDepartment]);
  };

  const addAcademicYear = (data: Omit<AcademicYear, 'id' | 'createdAt'>) => {
    const newYear: AcademicYear = {
      ...data,
      id: `year-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAcademicYears([...academicYears, newYear]);
  };

  const addProgram = (data: Omit<Program, 'id' | 'createdAt'>) => {
    const newProgram: Program = {
      ...data,
      id: `prog-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPrograms([...programs, newProgram]);
  };

  const addQuota = (data: Omit<Quota, 'id' | 'createdAt' | 'filledSeats'>) => {
    const newQuota: Quota = {
      ...data,
      id: `quota-${Date.now()}`,
      filledSeats: 0,
      createdAt: new Date().toISOString(),
    };
    setQuotas([...quotas, newQuota]);
  };

  const updateQuota = (id: string, data: Partial<Quota>) => {
    setQuotas(quotas.map(q => (q.id === id ? { ...q, ...data } : q)));
  };

  const addApplicant = (data: Omit<Applicant, 'id' | 'applicationNumber' | 'createdAt' | 'updatedAt'>): string => {
    const appNumber = `APP${Date.now()}`;
    const newApplicant: Applicant = {
      ...data,
      id: `appl-${Date.now()}`,
      applicationNumber: appNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setApplicants([...applicants, newApplicant]);
    return newApplicant.id;
  };

  const updateApplicant = (id: string, data: Partial<Applicant>) => {
    setApplicants(applicants.map(a => 
      a.id === id 
        ? { ...a, ...data, updatedAt: new Date().toISOString() } 
        : a
    ));
  };

  const getApplicant = (id: string) => {
    return applicants.find(a => a.id === id);
  };

  const generateAdmissionNumber = (
    program: Program,
    department: Department,
    campus: Campus,
    institution: Institution,
    quotaType: QuotaType,
    academicYear: AcademicYear
  ): string => {
    const quota = quotas.find(q => q.programId === program.id && q.quotaType === quotaType);
    if (!quota) return '';
    
    const sequenceNumber = (quota.filledSeats + 1).toString().padStart(4, '0');
    const year = academicYear.year.split('-')[0];
    
    // Format: INST/2026/UG/CSE/KCET/0001
    return `${institution.code}/${year}/${program.courseType}/${program.code}/${quotaType}/${sequenceNumber}`;
  };

  const allocateSeat = (
    applicantId: string,
    programId: string,
    quotaType: QuotaType
  ): { success: boolean; message: string; admissionNumber?: string } => {
    const applicant = applicants.find(a => a.id === applicantId);
    if (!applicant) {
      return { success: false, message: 'Applicant not found' };
    }

    if (applicant.applicationStatus === 'Allocated' || applicant.applicationStatus === 'Confirmed') {
      return { success: false, message: 'Applicant already has a seat allocated' };
    }

    const quota = quotas.find(q => q.programId === programId && q.quotaType === quotaType);
    if (!quota) {
      return { success: false, message: 'Quota not found' };
    }

    // Check if seats are available
    if (quota.filledSeats >= quota.seats) {
      return { success: false, message: `No seats available in ${quotaType} quota. All ${quota.seats} seats are filled.` };
    }

    const program = programs.find(p => p.id === programId);
    if (!program) {
      return { success: false, message: 'Program not found' };
    }

    const department = departments.find(d => d.id === program.departmentId);
    const campus = campuses.find(c => c.id === department?.campusId);
    const institution = institutions.find(i => i.id === campus?.institutionId);
    const academicYear = academicYears.find(y => y.id === program.academicYearId);

    if (!department || !campus || !institution || !academicYear) {
      return { success: false, message: 'Invalid program configuration' };
    }

    // Allocate seat
    const allocation: SeatAllocation = {
      id: `alloc-${Date.now()}`,
      applicantId,
      programId,
      quotaId: quota.id,
      allocationDate: new Date().toISOString(),
      isConfirmed: false,
      createdAt: new Date().toISOString(),
    };

    setSeatAllocations([...seatAllocations, allocation]);
    
    // Update quota
    updateQuota(quota.id, { filledSeats: quota.filledSeats + 1 });
    
    // Update applicant
    updateApplicant(applicantId, {
      applicationStatus: 'Allocated',
      allocatedSeatId: allocation.id,
    });

    return {
      success: true,
      message: 'Seat allocated successfully',
    };
  };

  const confirmAdmission = (applicantId: string): { success: boolean; message: string } => {
    const applicant = applicants.find(a => a.id === applicantId);
    if (!applicant) {
      return { success: false, message: 'Applicant not found' };
    }

    if (applicant.applicationStatus !== 'Allocated') {
      return { success: false, message: 'Seat must be allocated before confirmation' };
    }

    if (applicant.feeStatus !== 'Paid') {
      return { success: false, message: 'Fee must be paid before confirmation' };
    }

    if (applicant.documentStatus !== 'Verified') {
      return { success: false, message: 'Documents must be verified before confirmation' };
    }

    const program = programs.find(p => p.id === applicant.programId);
    if (!program) {
      return { success: false, message: 'Program not found' };
    }

    const department = departments.find(d => d.id === program.departmentId);
    const campus = campuses.find(c => c.id === department?.campusId);
    const institution = institutions.find(i => i.id === campus?.institutionId);
    const academicYear = academicYears.find(y => y.id === program.academicYearId);

    if (!department || !campus || !institution || !academicYear) {
      return { success: false, message: 'Invalid program configuration' };
    }

    // Generate admission number
    const admissionNumber = generateAdmissionNumber(
      program,
      department,
      campus,
      institution,
      applicant.quotaType,
      academicYear
    );

    // Update applicant
    updateApplicant(applicantId, {
      applicationStatus: 'Confirmed',
      admissionNumber,
      admissionDate: new Date().toISOString(),
    });

    // Update seat allocation
    const allocation = seatAllocations.find(a => a.id === applicant.allocatedSeatId);
    if (allocation) {
      setSeatAllocations(
        seatAllocations.map(a =>
          a.id === allocation.id ? { ...a, isConfirmed: true } : a
        )
      );
    }

    return {
      success: true,
      message: `Admission confirmed! Admission Number: ${admissionNumber}`,
    };
  };

  const updateDocumentStatus = (applicantId: string, documentType: string, status: DocumentStatus) => {
    const existingDoc = documents.find(
      d => d.applicantId === applicantId && d.documentType === documentType
    );

    if (existingDoc) {
      setDocuments(
        documents.map(d =>
          d.id === existingDoc.id
            ? {
                ...d,
                status,
                verifiedAt: status === 'Verified' ? new Date().toISOString() : d.verifiedAt,
                verifiedBy: status === 'Verified' ? currentUser?.id : d.verifiedBy,
              }
            : d
        )
      );
    } else {
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        applicantId,
        documentType,
        status,
        uploadedAt: status === 'Submitted' ? new Date().toISOString() : undefined,
        verifiedAt: status === 'Verified' ? new Date().toISOString() : undefined,
        verifiedBy: status === 'Verified' ? currentUser?.id : undefined,
      };
      setDocuments([...documents, newDoc]);
    }

    // Update applicant document status
    const applicantDocs = documents.filter(d => d.applicantId === applicantId);
    const allVerified = applicantDocs.every(d => d.status === 'Verified');
    const anySubmitted = applicantDocs.some(d => d.status === 'Submitted' || d.status === 'Verified');

    if (allVerified && applicantDocs.length >= 3) { // Assuming at least 3 documents required
      updateApplicant(applicantId, { documentStatus: 'Verified' });
    } else if (anySubmitted) {
      updateApplicant(applicantId, { documentStatus: 'Submitted' });
    }
  };

  const getDashboardStats = (programId?: string): DashboardStats => {
    let relevantPrograms = programs;
    let relevantQuotas = quotas;
    let relevantApplicants = applicants;

    if (programId) {
      relevantPrograms = programs.filter(p => p.id === programId);
      relevantQuotas = quotas.filter(q => q.programId === programId);
      relevantApplicants = applicants.filter(a => a.programId === programId);
    }

    const totalIntake = relevantPrograms.reduce((sum, p) => sum + p.totalIntake, 0);
    const totalAdmitted = relevantApplicants.filter(a => a.applicationStatus === 'Confirmed').length;
    const totalAllocated = relevantApplicants.filter(a => a.applicationStatus === 'Allocated').length;
    const totalPending = relevantApplicants.filter(a => a.applicationStatus === 'Submitted').length;

    const quotaWiseStats = ['KCET', 'COMEDK', 'Management'].map((qt) => {
      const quotaType = qt as QuotaType;
      const programQuotas = relevantQuotas.filter(q => q.quotaType === quotaType);
      const total = programQuotas.reduce((sum, q) => sum + q.seats, 0);
      const filled = programQuotas.reduce((sum, q) => sum + q.filledSeats, 0);
      return {
        quotaType,
        total,
        filled,
        remaining: total - filled,
      };
    });

    const pendingDocuments = relevantApplicants.filter(
      a => a.documentStatus === 'Pending' || a.documentStatus === 'Submitted'
    ).length;

    const pendingFees = relevantApplicants.filter(a => a.feeStatus === 'Pending').length;

    const statusList: ApplicationStatus[] = ['Draft', 'Submitted', 'Allocated', 'Confirmed', 'Rejected'];
    const applicantsByStatus = statusList.map(status => ({
      status,
      count: relevantApplicants.filter(a => a.applicationStatus === status).length,
    }));

    return {
      totalIntake,
      totalAdmitted,
      totalAllocated,
      totalPending,
      quotaWiseStats,
      pendingDocuments,
      pendingFees,
      applicantsByStatus,
    };
  };

  const value: AppContextType = {
    currentUser,
    login,
    logout,
    institutions,
    campuses,
    departments,
    academicYears,
    programs,
    quotas,
    addInstitution,
    addCampus,
    addDepartment,
    addAcademicYear,
    addProgram,
    addQuota,
    updateQuota,
    applicants,
    addApplicant,
    updateApplicant,
    getApplicant,
    seatAllocations,
    allocateSeat,
    confirmAdmission,
    documents,
    updateDocumentStatus,
    getDashboardStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
