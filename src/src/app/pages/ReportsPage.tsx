import { useApp } from '../contexts/AppContext';
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
import { BarChart3, FileText, Users, AlertCircle } from 'lucide-react';
import { Progress } from '../components/ui/progress';

export default function ReportsPage() {
  const { getDashboardStats, programs, applicants, quotas } = useApp();
  const stats = getDashboardStats();

  // Pending Documents List
  const pendingDocApplicants = applicants.filter(
    (a) => a.documentStatus === 'Pending' || a.documentStatus === 'Submitted'
  );

  // Pending Fees List
  const pendingFeeApplicants = applicants.filter((a) => a.feeStatus === 'Pending');

  // Program-wise detailed stats
  const programStats = programs.map((program) => {
    const programQuotas = quotas.filter((q) => q.programId === program.id);
    const totalSeats = programQuotas.reduce((sum, q) => sum + q.seats, 0);
    const filledSeats = programQuotas.reduce((sum, q) => sum + q.filledSeats, 0);
    const confirmed = applicants.filter(
      (a) => a.programId === program.id && a.applicationStatus === 'Confirmed'
    ).length;
    const allocated = applicants.filter(
      (a) => a.programId === program.id && a.applicationStatus === 'Allocated'
    ).length;
    const pending = applicants.filter(
      (a) => a.programId === program.id && a.applicationStatus === 'Submitted'
    ).length;

    return {
      program,
      totalSeats,
      filledSeats,
      confirmed,
      allocated,
      pending,
      fillPercentage: totalSeats > 0 ? (filledSeats / totalSeats) * 100 : 0,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">
          Comprehensive overview of admission progress
        </p>
      </div>

      {/* Overall Summary */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Intake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalIntake}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Confirmed Admissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.totalAdmitted}</p>
            <Progress
              value={(stats.totalAdmitted / stats.totalIntake) * 100}
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Seats Allocated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats.totalAllocated}</p>
            <p className="text-sm text-gray-500 mt-1">Pending confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{stats.totalPending}</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting allocation</p>
          </CardContent>
        </Card>
      </div>

      {/* Quota-wise Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quota-wise Seat Filling Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quota Type</TableHead>
                <TableHead>Total Seats</TableHead>
                <TableHead>Filled</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Fill Percentage</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.quotaWiseStats.map((quota) => (
                <TableRow key={quota.quotaType}>
                  <TableCell>
                    <Badge variant="secondary">{quota.quotaType}</Badge>
                  </TableCell>
                  <TableCell>{quota.total}</TableCell>
                  <TableCell>{quota.filled}</TableCell>
                  <TableCell>{quota.remaining}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(quota.filled / quota.total) * 100}
                        className="h-2 flex-1"
                      />
                      <span className="text-sm">
                        {((quota.filled / quota.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {quota.remaining === 0 ? (
                      <Badge variant="destructive">Full</Badge>
                    ) : quota.remaining <= quota.total * 0.1 ? (
                      <Badge variant="outline" className="text-orange-600">
                        Almost Full
                      </Badge>
                    ) : (
                      <Badge variant="default">Available</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Program-wise Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Program-wise Admission Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Total Intake</TableHead>
                <TableHead>Confirmed</TableHead>
                <TableHead>Allocated</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Fill Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programStats.map((stat) => (
                <TableRow key={stat.program.id}>
                  <TableCell>{stat.program.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{stat.program.code}</Badge>
                  </TableCell>
                  <TableCell>{stat.totalSeats}</TableCell>
                  <TableCell>
                    <span className="text-green-600 font-medium">{stat.confirmed}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-blue-600">{stat.allocated}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-orange-600">{stat.pending}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={stat.fillPercentage} className="h-2 flex-1" />
                      <span className="text-sm">{stat.fillPercentage.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Documents Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pending Documents ({pendingDocApplicants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingDocApplicants.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No pending document verifications
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingDocApplicants.map((applicant) => {
                  const program = programs.find((p) => p.id === applicant.programId);
                  return (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-mono text-sm">
                        {applicant.applicationNumber}
                      </TableCell>
                      <TableCell>
                        {applicant.firstName} {applicant.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{program?.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            applicant.documentStatus === 'Submitted'
                              ? 'outline'
                              : 'secondary'
                          }
                        >
                          {applicant.documentStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Fees Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Pending Fees ({pendingFeeApplicants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingFeeApplicants.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No pending fee payments</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fee Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingFeeApplicants.map((applicant) => {
                  const program = programs.find((p) => p.id === applicant.programId);
                  return (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-mono text-sm">
                        {applicant.applicationNumber}
                      </TableCell>
                      <TableCell>
                        {applicant.firstName} {applicant.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{program?.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            applicant.applicationStatus === 'Allocated'
                              ? 'outline'
                              : 'secondary'
                          }
                        >
                          {applicant.applicationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{applicant.feeStatus}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Application Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            {stats.applicantsByStatus.map((status) => (
              <div key={status.status} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">{status.count}</p>
                <p className="text-sm text-gray-600 mt-1">{status.status}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
