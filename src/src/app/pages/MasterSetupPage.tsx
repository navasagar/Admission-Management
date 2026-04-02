import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Building2, MapPin, GraduationCap, Calendar, Percent } from 'lucide-react';
import type { CourseType } from '../types';

export default function MasterSetupPage() {
  const {
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
  } = useApp();

  // Institution Form
  const [instForm, setInstForm] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
  });

  // Campus Form
  const [campusForm, setCampusForm] = useState({
    institutionId: '',
    name: '',
    code: '',
    location: '',
  });

  // Department Form
  const [deptForm, setDeptForm] = useState({
    campusId: '',
    name: '',
    code: '',
  });

  // Academic Year Form
  const [yearForm, setYearForm] = useState({
    year: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  // Program Form
  const [progForm, setProgForm] = useState({
    departmentId: '',
    academicYearId: '',
    name: '',
    code: '',
    courseType: 'UG' as CourseType,
    duration: 4,
    totalIntake: 0,
  });

  // Quota Form
  const [quotaForm, setQuotaForm] = useState({
    programId: '',
    quotaType: 'KCET' as 'KCET' | 'COMEDK' | 'Management',
    seats: 0,
    isSupernumerary: false,
  });

  const handleAddInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    addInstitution(instForm);
    toast.success('Institution added successfully');
    setInstForm({ name: '', code: '', address: '', phone: '', email: '' });
  };

  const handleAddCampus = (e: React.FormEvent) => {
    e.preventDefault();
    addCampus(campusForm);
    toast.success('Campus added successfully');
    setCampusForm({ institutionId: '', name: '', code: '', location: '' });
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    addDepartment(deptForm);
    toast.success('Department added successfully');
    setDeptForm({ campusId: '', name: '', code: '' });
  };

  const handleAddYear = (e: React.FormEvent) => {
    e.preventDefault();
    addAcademicYear(yearForm);
    toast.success('Academic year added successfully');
    setYearForm({ year: '', startDate: '', endDate: '', isActive: true });
  };

  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    addProgram(progForm);
    toast.success('Program added successfully');
    setProgForm({
      departmentId: '',
      academicYearId: '',
      name: '',
      code: '',
      courseType: 'UG',
      duration: 4,
      totalIntake: 0,
    });
  };

  const handleAddQuota = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate total quota doesn't exceed intake
    const program = programs.find(p => p.id === quotaForm.programId);
    if (!program) {
      toast.error('Please select a program');
      return;
    }

    const existingQuotas = quotas.filter(q => q.programId === quotaForm.programId);
    const totalQuotaSeats = existingQuotas.reduce((sum, q) => sum + q.seats, 0) + quotaForm.seats;

    if (totalQuotaSeats > program.totalIntake) {
      toast.error(`Total quota seats (${totalQuotaSeats}) cannot exceed program intake (${program.totalIntake})`);
      return;
    }

    addQuota(quotaForm);
    toast.success('Quota added successfully');
    setQuotaForm({
      programId: '',
      quotaType: 'KCET',
      seats: 0,
      isSupernumerary: false,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Master Setup</h1>
        <p className="text-gray-500 mt-1">Configure institutions, programs, and quotas</p>
      </div>

      <Tabs defaultValue="institution" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="institution">Institution</TabsTrigger>
          <TabsTrigger value="campus">Campus</TabsTrigger>
          <TabsTrigger value="department">Department</TabsTrigger>
          <TabsTrigger value="year">Academic Year</TabsTrigger>
          <TabsTrigger value="program">Program</TabsTrigger>
          <TabsTrigger value="quota">Quota</TabsTrigger>
        </TabsList>

        {/* Institution Tab */}
        <TabsContent value="institution">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Add Institution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddInstitution} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Institution Name *</Label>
                    <Input
                      value={instForm.name}
                      onChange={(e) => setInstForm({ ...instForm, name: e.target.value })}
                      placeholder="Karnataka Institute of Technology"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Code *</Label>
                    <Input
                      value={instForm.code}
                      onChange={(e) => setInstForm({ ...instForm, code: e.target.value })}
                      placeholder="KIT"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address *</Label>
                    <Input
                      value={instForm.address}
                      onChange={(e) => setInstForm({ ...instForm, address: e.target.value })}
                      placeholder="123 Tech Road, Bangalore"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input
                      value={instForm.phone}
                      onChange={(e) => setInstForm({ ...instForm, phone: e.target.value })}
                      placeholder="+91 80 1234 5678"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={instForm.email}
                      onChange={(e) => setInstForm({ ...instForm, email: e.target.value })}
                      placeholder="info@kit.edu"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Add Institution</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Institutions ({institutions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {institutions.map((inst) => (
                    <div key={inst.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{inst.name}</p>
                          <Badge variant="outline" className="mt-1">{inst.code}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">{inst.address}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campus Tab */}
        <TabsContent value="campus">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Add Campus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCampus} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Institution *</Label>
                    <Select
                      value={campusForm.institutionId}
                      onValueChange={(value) =>
                        setCampusForm({ ...campusForm, institutionId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select institution" />
                      </SelectTrigger>
                      <SelectContent>
                        {institutions.map((inst) => (
                          <SelectItem key={inst.id} value={inst.id}>
                            {inst.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Campus Name *</Label>
                    <Input
                      value={campusForm.name}
                      onChange={(e) => setCampusForm({ ...campusForm, name: e.target.value })}
                      placeholder="Main Campus"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Code *</Label>
                    <Input
                      value={campusForm.code}
                      onChange={(e) => setCampusForm({ ...campusForm, code: e.target.value })}
                      placeholder="MC"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location *</Label>
                    <Input
                      value={campusForm.location}
                      onChange={(e) => setCampusForm({ ...campusForm, location: e.target.value })}
                      placeholder="Bangalore"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Add Campus</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campuses ({campuses.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campuses.map((campus) => {
                    const inst = institutions.find((i) => i.id === campus.institutionId);
                    return (
                      <div key={campus.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{campus.name}</p>
                            <Badge variant="outline" className="mt-1">{campus.code}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{campus.location}</p>
                        <p className="text-xs text-gray-400 mt-1">{inst?.name}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Department Tab */}
        <TabsContent value="department">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Add Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddDepartment} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Campus *</Label>
                    <Select
                      value={deptForm.campusId}
                      onValueChange={(value) => setDeptForm({ ...deptForm, campusId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select campus" />
                      </SelectTrigger>
                      <SelectContent>
                        {campuses.map((campus) => (
                          <SelectItem key={campus.id} value={campus.id}>
                            {campus.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department Name *</Label>
                    <Input
                      value={deptForm.name}
                      onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                      placeholder="Computer Science & Engineering"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Code *</Label>
                    <Input
                      value={deptForm.code}
                      onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                      placeholder="CSE"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Add Department</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Departments ({departments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {departments.map((dept) => {
                    const campus = campuses.find((c) => c.id === dept.campusId);
                    return (
                      <div key={dept.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{dept.name}</p>
                            <Badge variant="outline" className="mt-1">{dept.code}</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{campus?.name}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Academic Year Tab */}
        <TabsContent value="year">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Add Academic Year
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddYear} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Year *</Label>
                    <Input
                      value={yearForm.year}
                      onChange={(e) => setYearForm({ ...yearForm, year: e.target.value })}
                      placeholder="2026-2027"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={yearForm.startDate}
                      onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={yearForm.endDate}
                      onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Add Academic Year</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Years ({academicYears.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {academicYears.map((year) => (
                    <div key={year.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{year.year}</p>
                          {year.isActive && (
                            <Badge className="mt-1" variant="default">Active</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(year.startDate).toLocaleDateString()} -{' '}
                        {new Date(year.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Program Tab */}
        <TabsContent value="program">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Program</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProgram} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Department *</Label>
                    <Select
                      value={progForm.departmentId}
                      onValueChange={(value) => setProgForm({ ...progForm, departmentId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Academic Year *</Label>
                    <Select
                      value={progForm.academicYearId}
                      onValueChange={(value) => setProgForm({ ...progForm, academicYearId: value })}
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
                    <Label>Program Name *</Label>
                    <Input
                      value={progForm.name}
                      onChange={(e) => setProgForm({ ...progForm, name: e.target.value })}
                      placeholder="Bachelor of Engineering in Computer Science"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Code *</Label>
                    <Input
                      value={progForm.code}
                      onChange={(e) => setProgForm({ ...progForm, code: e.target.value })}
                      placeholder="CSE"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Course Type *</Label>
                    <Select
                      value={progForm.courseType}
                      onValueChange={(value: CourseType) =>
                        setProgForm({ ...progForm, courseType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UG">UG</SelectItem>
                        <SelectItem value="PG">PG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (years) *</Label>
                    <Input
                      type="number"
                      value={progForm.duration}
                      onChange={(e) => setProgForm({ ...progForm, duration: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Intake *</Label>
                    <Input
                      type="number"
                      value={progForm.totalIntake}
                      onChange={(e) => setProgForm({ ...progForm, totalIntake: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Add Program</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Programs ({programs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {programs.map((prog) => {
                    const dept = departments.find((d) => d.id === prog.departmentId);
                    const year = academicYears.find((y) => y.id === prog.academicYearId);
                    return (
                      <div key={prog.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{prog.name}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{prog.code}</Badge>
                              <Badge variant="outline">{prog.courseType}</Badge>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Intake: {prog.totalIntake} | Duration: {prog.duration} years
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {dept?.name} | {year?.year}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quota Tab */}
        <TabsContent value="quota">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Add Quota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddQuota} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Program *</Label>
                    <Select
                      value={quotaForm.programId}
                      onValueChange={(value) => setQuotaForm({ ...quotaForm, programId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map((prog) => (
                          <SelectItem key={prog.id} value={prog.id}>
                            {prog.name} (Intake: {prog.totalIntake})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quota Type *</Label>
                    <Select
                      value={quotaForm.quotaType}
                      onValueChange={(value: 'KCET' | 'COMEDK' | 'Management') =>
                        setQuotaForm({ ...quotaForm, quotaType: value })
                      }
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
                    <Label>Seats *</Label>
                    <Input
                      type="number"
                      value={quotaForm.seats}
                      onChange={(e) => setQuotaForm({ ...quotaForm, seats: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Add Quota</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quotas ({quotas.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quotas.map((quota) => {
                    const prog = programs.find((p) => p.id === quota.programId);
                    const fillPercentage = (quota.filledSeats / quota.seats) * 100;
                    return (
                      <div key={quota.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{quota.quotaType}</p>
                            <p className="text-xs text-gray-500 mt-1">{prog?.name}</p>
                          </div>
                          <Badge variant={fillPercentage >= 90 ? 'destructive' : 'outline'}>
                            {quota.filledSeats}/{quota.seats}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Filled</span>
                            <span>{fillPercentage.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
