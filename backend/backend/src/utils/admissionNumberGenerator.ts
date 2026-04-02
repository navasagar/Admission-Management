// Generate unique admission number
// Format: INST/YEAR/COURSE/DEPT/QUOTA/SEQUENCE
export function generateAdmissionNumber(
  institutionCode: string,
  academicYear: string,
  courseType: string,
  departmentCode: string,
  quotaType: string,
  sequence: number
): string {
  const year = academicYear.split('-')[0];
  const seqStr = String(sequence).padStart(4, '0');
  return `${institutionCode}/${year}/${courseType}/${departmentCode}/${quotaType}/${seqStr}`;
}

// Generate application number
// Format: APP/YYYY/MMDD/SEQUENCE
export function generateApplicationNumber(sequence: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const seqStr = String(sequence).padStart(5, '0');
  return `APP/${year}/${month}${day}/${seqStr}`;
}

// Generate UUID
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Calculate age from date of birth
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}

// Validate email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (Indian)
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

// Validate pincode (Indian)
export function validatePincode(pincode: string): boolean {
  const pincodeRegex = /^[0-9]{6}$/;
  return pincodeRegex.test(pincode);
}
