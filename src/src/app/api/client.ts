// API Configuration and utilities for backend communication

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Set token in localStorage
function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

// Remove token
function removeToken(): void {
  localStorage.removeItem('auth_token');
}

// API request helper
export async function apiCall<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getCurrentUser: () => apiCall('/auth/me'),

  logout: () => {
    removeToken();
  },

  setToken,
};

// Institutions API
export const institutionAPI = {
  getAll: () => apiCall('/institutions'),
  getById: (id: string) => apiCall(`/institutions/${id}`),
  create: (data: any) =>
    apiCall('/institutions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/institutions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/institutions/${id}`, {
      method: 'DELETE',
    }),
};

// Campuses API
export const campusAPI = {
  getAll: () => apiCall('/campuses'),
  getByInstitution: (institutionId: string) =>
    apiCall(`/campuses/institution/${institutionId}`),
  create: (data: any) =>
    apiCall('/campuses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/campuses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/campuses/${id}`, {
      method: 'DELETE',
    }),
};

// Departments API
export const departmentAPI = {
  getAll: () => apiCall('/departments'),
  getByCampus: (campusId: string) =>
    apiCall(`/departments/campus/${campusId}`),
  create: (data: any) =>
    apiCall('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/departments/${id}`, {
      method: 'DELETE',
    }),
};

// Academic Years API
export const academicYearAPI = {
  getAll: () => apiCall('/academic-years'),
  getActive: () => apiCall('/academic-years/active'),
  create: (data: any) =>
    apiCall('/academic-years', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/academic-years/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Programs API
export const programAPI = {
  getAll: () => apiCall('/programs'),
  getByDepartment: (departmentId: string) =>
    apiCall(`/programs/department/${departmentId}`),
  getWithQuotas: (id: string) => apiCall(`/programs/${id}/quotas`),
  create: (data: any) =>
    apiCall('/programs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/programs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Quotas API
export const quotaAPI = {
  getAll: () => apiCall('/quotas'),
  getByProgram: (programId: string) =>
    apiCall(`/quotas/program/${programId}`),
  create: (data: any) =>
    apiCall('/quotas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/quotas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Applicants API
export const applicantAPI = {
  getAll: () => apiCall('/applicants'),
  getByProgram: (programId: string) =>
    apiCall(`/applicants/program/${programId}`),
  getById: (id: string) => apiCall(`/applicants/${id}`),
  create: (data: any) =>
    apiCall('/applicants', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/applicants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Seat Allocation API
export const seatAllocationAPI = {
  getAll: () => apiCall('/seat-allocations'),
  getByProgram: (programId: string) =>
    apiCall(`/seat-allocations/program/${programId}`),
  allocate: (data: any) =>
    apiCall('/seat-allocations/allocate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  confirm: (allocationId: string) =>
    apiCall(`/seat-allocations/${allocationId}/confirm`, {
      method: 'POST',
    }),
};

// Documents API
export const documentAPI = {
  getByApplicant: (applicantId: string) =>
    apiCall(`/documents/applicant/${applicantId}`),
  updateStatus: (applicantId: string, documentType: string, data: any) =>
    apiCall(`/documents/${applicantId}/${documentType}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  markFeePaid: (applicantId: string) =>
    apiCall(`/documents/fee/${applicantId}`, {
      method: 'POST',
    }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => apiCall('/dashboard'),
  getProgramStats: (programId: string) =>
    apiCall(`/dashboard/program/${programId}`),
};

export default {
  authAPI,
  institutionAPI,
  campusAPI,
  departmentAPI,
  academicYearAPI,
  programAPI,
  quotaAPI,
  applicantAPI,
  seatAllocationAPI,
  documentAPI,
  dashboardAPI,
};
