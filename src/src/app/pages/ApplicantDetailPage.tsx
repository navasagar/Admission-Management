import { useParams, useNavigate } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  GraduationCap,
  FileText,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

export default function ApplicantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getApplicant,
    programs,
    departments,
    campuses,
    institutions,
    academicYears,
    updateApplicant,
    updateDocumentStatus,
    confirmAdmission,
    currentUser,
  } = useApp();

  const applicant = id ? getApplicant(id) : undefined;

  if (!applicant) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-500 mb-4">Applicant not found</p>
        <Button onClick={() => navigate('/applicants')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applicants
        </Button>
      </div>
    );
  }

  const program = programs.find((p) => p.id === applicant.programId);
  const department = program ? departments.find((d) => d.id === program.departmentId) : undefined;
  const campus = department ? campuses.find((c) => c.id === department.campusId) : undefined;
  const institution = campus ? institutions.find((i) => i.id === campus.institutionId) : undefined;
  const academicYear = academicYears.find((y) => y.id === applicant.academicYearId);

  const documentTypes = [
    '10th Marksheet',
    '12th Marksheet',
    'Allotment Letter',
    'Category Certificate',
    'Passport Photo',
  ];

  const handleDocumentVerify = (documentType: string) => {
    updateDocumentStatus(applicant.id, documentType, 'Verified');
    toast.success(`${documentType} verified`);
  };

  const handleDocumentReject = (documentType: string) => {
    updateDocumentStatus(applicant.id, documentType, 'Pending');
    toast.success(`${documentType} marked as pending`);
  };

  const handleFeeUpdate = (status: 'Pending' | 'Paid') => {
    updateApplicant(applicant.id, { feeStatus: status });
    toast.success(`Fee status updated to ${status}`);
  };

  const handleConfirmAdmission = () => {
    const result = confirmAdmission(applicant.id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'admission_officer';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/applicants')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {applicant.firstName} {applicant.lastName}
          </h1>
          <p className="text-gray-500 mt-1">{applicant.applicationNumber}</p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant={
              applicant.applicationStatus === 'Confirmed'
                ? 'default'
                : applicant.applicationStatus === 'Allocated'
                ? 'outline'
                : 'secondary'
            }
          >
            {applicant.applicationStatus}
          </Badge>
          {applicant.admissionNumber && (
            <Badge variant="default" className="font-mono">
              {applicant.admissionNumber}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">
                  {applicant.firstName} {applicant.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">
                  {new Date(applicant.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{applicant.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <Badge variant="outline">{applicant.category}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{applicant.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{applicant.phone}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">
                  {applicant.address}, {applicant.city}, {applicant.state} -{' '}
                  {applicant.pincode}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Academic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic & Admission Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Institution</p>
                  <p className="font-medium">{institution?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Campus</p>
                  <p className="font-medium">{campus?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{department?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Program</p>
                  <p className="font-medium">{program?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Academic Year</p>
                  <p className="font-medium">{academicYear?.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Course Type</p>
                  <Badge variant="outline">{program?.courseType}</Badge>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Entry Type</p>
                  <Badge variant="outline">{applicant.entryType}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Admission Mode</p>
                  <Badge variant="outline">{applicant.admissionMode}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quota Type</p>
                  <Badge variant="secondary">{applicant.quotaType}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Qualifying Exam</p>
                  <p className="font-medium">{applicant.qualifyingExam}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Marks</p>
                  <p className="font-medium">{applicant.marks}</p>
                </div>
                {applicant.rank && (
                  <div>
                    <p className="text-sm text-gray-500">Rank</p>
                    <p className="font-medium">{applicant.rank}</p>
                  </div>
                )}
                {applicant.allotmentNumber && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Allotment Number</p>
                    <p className="font-medium font-mono">{applicant.allotmentNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          {canEdit && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documentTypes.map((docType) => (
                    <div
                      key={docType}
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{docType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDocumentVerify(docType)}
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDocumentReject(docType)}
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Status Panel */}
        <div className="space-y-6">
          {/* Document Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Document Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
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
              </div>
              {applicant.documentStatus === 'Pending' && (
                <p className="text-xs text-gray-500 mt-2">
                  Documents need to be submitted and verified
                </p>
              )}
            </CardContent>
          </Card>

          {/* Fee Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Fee Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge
                  variant={applicant.feeStatus === 'Paid' ? 'default' : 'destructive'}
                >
                  {applicant.feeStatus}
                </Badge>
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFeeUpdate('Paid')}
                    className="flex-1"
                  >
                    Mark Paid
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFeeUpdate('Pending')}
                    className="flex-1"
                  >
                    Mark Pending
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admission Confirmation */}
          {applicant.applicationStatus === 'Allocated' && canEdit && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Confirm Admission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {applicant.documentStatus === 'Verified' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-orange-600" />
                    )}
                    <span>Documents Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {applicant.feeStatus === 'Paid' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-orange-600" />
                    )}
                    <span>Fee Paid</span>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full"
                      disabled={
                        applicant.documentStatus !== 'Verified' ||
                        applicant.feeStatus !== 'Paid'
                      }
                    >
                      Confirm Admission
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Admission</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will generate a permanent admission number for the applicant.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleConfirmAdmission}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {(applicant.documentStatus !== 'Verified' ||
                  applicant.feeStatus !== 'Paid') && (
                  <p className="text-xs text-gray-500">
                    Complete all requirements to confirm admission
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Admission Confirmed */}
          {applicant.applicationStatus === 'Confirmed' && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-green-900">
                  <CheckCircle2 className="h-5 w-5" />
                  Admission Confirmed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-green-700">Admission Number</p>
                    <p className="font-mono font-bold text-green-900">
                      {applicant.admissionNumber}
                    </p>
                  </div>
                  {applicant.admissionDate && (
                    <div>
                      <p className="text-xs text-green-700">Admission Date</p>
                      <p className="text-sm text-green-900">
                        {new Date(applicant.admissionDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
