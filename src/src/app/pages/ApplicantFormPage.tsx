import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import type { Category, EntryType, AdmissionMode, QuotaType } from '../types';

export default function ApplicantFormPage() {
  const navigate = useNavigate();
  const { addApplicant, programs, academicYears } = useApp();

  const [formData, setFormData] = useState({
    programId: '',
    academicYearId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    email: '',
    phone: '',
    category: 'GM' as Category,
    entryType: 'Regular' as EntryType,
    admissionMode: 'Government' as AdmissionMode,
    quotaType: 'KCET' as QuotaType,
    qualifyingExam: '',
    marks: 0,
    rank: '',
    allotmentNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    applicationStatus: 'Submitted' as const,
    documentStatus: 'Pending' as const,
    feeStatus: 'Pending' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.programId || !formData.academicYearId) {
      toast.error('Please select program and academic year');
      return;
    }

    const applicantId = addApplicant(formData);
    toast.success('Applicant created successfully');
    navigate(`/applicants/${applicantId}`);
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/applicants')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Applicant</h1>
          <p className="text-gray-500 mt-1">Create a new admission application</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Program Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Program Selection</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Academic Year *</Label>
              <Select
                value={formData.academicYearId}
                onValueChange={(value) => handleChange('academicYearId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Program *</Label>
              <Select
                value={formData.programId}
                onValueChange={(value) => handleChange('programId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((prog) => (
                    <SelectItem key={prog.id} value={prog.id}>
                      {prog.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Date of Birth *</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleChange('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: Category) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GM">General (GM)</SelectItem>
                  <SelectItem value="SC">Scheduled Caste (SC)</SelectItem>
                  <SelectItem value="ST">Scheduled Tribe (ST)</SelectItem>
                  <SelectItem value="OBC">OBC</SelectItem>
                  <SelectItem value="2A">Category 2A</SelectItem>
                  <SelectItem value="2B">Category 2B</SelectItem>
                  <SelectItem value="3A">Category 3A</SelectItem>
                  <SelectItem value="3B">Category 3B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Admission Details */}
        <Card>
          <CardHeader>
            <CardTitle>Admission Details</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Entry Type *</Label>
              <Select
                value={formData.entryType}
                onValueChange={(value: EntryType) => handleChange('entryType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Lateral">Lateral Entry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Admission Mode *</Label>
              <Select
                value={formData.admissionMode}
                onValueChange={(value: AdmissionMode) => handleChange('admissionMode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quota Type *</Label>
              <Select
                value={formData.quotaType}
                onValueChange={(value: QuotaType) => handleChange('quotaType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KCET">KCET</SelectItem>
                  <SelectItem value="COMEDK">COMEDK</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Qualifying Exam *</Label>
              <Input
                value={formData.qualifyingExam}
                onChange={(e) => handleChange('qualifyingExam', e.target.value)}
                placeholder="e.g., KCET 2026, 12th Board"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Marks *</Label>
              <Input
                type="number"
                value={formData.marks}
                onChange={(e) => handleChange('marks', parseFloat(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Rank {formData.admissionMode === 'Government' ? '*' : '(Optional)'}</Label>
              <Input
                value={formData.rank}
                onChange={(e) => handleChange('rank', e.target.value)}
                placeholder="Exam rank"
                required={formData.admissionMode === 'Government'}
              />
            </div>

            {formData.admissionMode === 'Government' && (
              <div className="space-y-2 md:col-span-2">
                <Label>Allotment Number *</Label>
                <Input
                  value={formData.allotmentNumber}
                  onChange={(e) => handleChange('allotmentNumber', e.target.value)}
                  placeholder="Government allotment number"
                  required
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Address *</Label>
              <Input
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>City *</Label>
              <Input
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>State *</Label>
              <Input
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Pincode *</Label>
              <Input
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/applicants')}>
            Cancel
          </Button>
          <Button type="submit">Create Applicant</Button>
        </div>
      </form>
    </div>
  );
}
