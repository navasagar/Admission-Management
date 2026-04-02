import { useState } from 'react';
import { Link } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Plus, Search, Eye } from 'lucide-react';
import type { ApplicationStatus } from '../types';

export default function ApplicantsPage() {
  const { applicants, programs, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'All'>('All');
  const [programFilter, setProgramFilter] = useState<string>('All');

  // Filter applicants
  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      applicant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || applicant.applicationStatus === statusFilter;

    const matchesProgram =
      programFilter === 'All' || applicant.programId === programFilter;

    return matchesSearch && matchesStatus && matchesProgram;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    const variants: Record<ApplicationStatus, any> = {
      Draft: 'secondary',
      Submitted: 'default',
      Allocated: 'outline',
      Confirmed: 'default',
      Rejected: 'destructive',
    };

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const canCreateApplicant = currentUser?.role === 'admin' || currentUser?.role === 'admission_officer';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
          <p className="text-gray-500 mt-1">
            Manage admission applications
          </p>
        </div>
        {canCreateApplicant && (
          <Link to="/applicants/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Applicant
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applicants ({filteredApplicants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or application number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ApplicationStatus | 'All')}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Allocated">Allocated</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={programFilter}
              onValueChange={(value) => setProgramFilter(value)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Programs</SelectItem>
                {programs.map((prog) => (
                  <SelectItem key={prog.id} value={prog.id}>
                    {prog.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Quota</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplicants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No applicants found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplicants.map((applicant) => {
                    const program = programs.find((p) => p.id === applicant.programId);
                    return (
                      <TableRow key={applicant.id}>
                        <TableCell className="font-mono text-sm">
                          {applicant.applicationNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {applicant.firstName} {applicant.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{applicant.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{program?.code}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{applicant.quotaType}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(applicant.applicationStatus)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              applicant.documentStatus === 'Verified'
                                ? 'default'
                                : applicant.documentStatus === 'Submitted'
                                ? 'outline'
                                : 'secondary'
                            }
                          >
                            {applicant.documentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              applicant.feeStatus === 'Paid' ? 'default' : 'destructive'
                            }
                          >
                            {applicant.feeStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {applicant.admissionNumber || '-'}
                        </TableCell>
                        <TableCell>
                          <Link to={`/applicants/${applicant.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
