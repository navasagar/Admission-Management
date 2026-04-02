import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { toast } from 'sonner';
import { ClipboardList, Users, CheckCircle } from 'lucide-react';
import type { QuotaType } from '../types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export default function SeatAllocationPage() {
  const { applicants, programs, quotas, allocateSeat } = useApp();
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedApplicant, setSelectedApplicant] = useState<string>('');
  const [selectedQuota, setSelectedQuota] = useState<QuotaType | ''>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Filter pending applicants
  const pendingApplicants = applicants.filter(
    (a) => a.applicationStatus === 'Submitted'
  );

  // Filter applicants by program
  const filteredApplicants = selectedProgram
    ? pendingApplicants.filter((a) => a.programId === selectedProgram)
    : pendingApplicants;

  // Get quotas for selected program
  const programQuotas = selectedProgram
    ? quotas.filter((q) => q.programId === selectedProgram)
    : [];

  const handleAllocate = () => {
    if (!selectedApplicant || !selectedProgram || !selectedQuota) {
      toast.error('Please select applicant, program, and quota');
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmAllocation = () => {
    const result = allocateSeat(selectedApplicant, selectedProgram, selectedQuota as QuotaType);
    
    if (result.success) {
      toast.success(result.message);
      setSelectedApplicant('');
      setSelectedQuota('');
    } else {
      toast.error(result.message);
    }
    
    setShowConfirmDialog(false);
  };

  const selectedApplicantData = applicants.find((a) => a.id === selectedApplicant);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Seat Allocation</h1>
        <p className="text-gray-500 mt-1">Allocate seats to pending applicants</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Allocation Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Allocate Seat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Program Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Program *</label>
                <Select
                  value={selectedProgram}
                  onValueChange={(value) => {
                    setSelectedProgram(value);
                    setSelectedApplicant('');
                    setSelectedQuota('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((prog) => (
                      <SelectItem key={prog.id} value={prog.id}>
                        {prog.name} ({prog.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Applicant Selection */}
              {selectedProgram && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select Applicant * ({filteredApplicants.length} pending)
                  </label>
                  <Select value={selectedApplicant} onValueChange={setSelectedApplicant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an applicant" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredApplicants.map((applicant) => (
                        <SelectItem key={applicant.id} value={applicant.id}>
                          {applicant.firstName} {applicant.lastName} -{' '}
                          {applicant.applicationNumber} ({applicant.quotaType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quota Selection */}
              {selectedApplicant && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Quota *</label>
                  <Select
                    value={selectedQuota}
                    onValueChange={(value) => setSelectedQuota(value as QuotaType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose quota type" />
                    </SelectTrigger>
                    <SelectContent>
                      {programQuotas.map((quota) => {
                        const available = quota.seats - quota.filledSeats;
                        const disabled = available <= 0;
                        return (
                          <SelectItem
                            key={quota.id}
                            value={quota.quotaType}
                            disabled={disabled}
                          >
                            {quota.quotaType} - {available} available ({quota.filledSeats}/
                            {quota.seats})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Applicant Preview */}
              {selectedApplicantData && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="font-medium">Selected Applicant Details:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>{' '}
                      {selectedApplicantData.firstName} {selectedApplicantData.lastName}
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>{' '}
                      <Badge variant="outline">{selectedApplicantData.category}</Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Quota Type:</span>{' '}
                      <Badge variant="secondary">{selectedApplicantData.quotaType}</Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Marks:</span> {selectedApplicantData.marks}
                    </div>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleAllocate}
                disabled={!selectedApplicant || !selectedProgram || !selectedQuota}
              >
                Allocate Seat
              </Button>
            </CardContent>
          </Card>

          {/* Recently Allocated */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Allocated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {applicants
                  .filter((a) => a.applicationStatus === 'Allocated')
                  .slice(0, 5)
                  .map((applicant) => {
                    const program = programs.find((p) => p.id === applicant.programId);
                    return (
                      <div
                        key={applicant.id}
                        className="flex items-center justify-between border-b pb-3 last:border-0"
                      >
                        <div>
                          <p className="font-medium">
                            {applicant.firstName} {applicant.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {program?.code} - {applicant.quotaType}
                          </p>
                        </div>
                        <Badge variant="outline">Allocated</Badge>
                      </div>
                    );
                  })}
                {applicants.filter((a) => a.applicationStatus === 'Allocated').length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent allocations
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quota Availability */}
        <div className="space-y-6">
          {selectedProgram ? (
            programQuotas.map((quota) => {
              const available = quota.seats - quota.filledSeats;
              const fillPercentage = (quota.filledSeats / quota.seats) * 100;
              const isNearFull = fillPercentage >= 90;
              const isFull = available === 0;

              return (
                <Card key={quota.id} className={isFull ? 'border-red-200' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{quota.quotaType}</CardTitle>
                      {isFull && <Badge variant="destructive">Full</Badge>}
                      {!isFull && isNearFull && (
                        <Badge variant="outline" className="text-orange-600">
                          Almost Full
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available</span>
                      <span className="font-bold">{available}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Filled</span>
                      <span>{quota.filledSeats}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total</span>
                      <span>{quota.seats}</span>
                    </div>
                    <Progress value={fillPercentage} className="h-2" />
                    <p className="text-xs text-gray-500 text-center">
                      {fillPercentage.toFixed(1)}% filled
                    </p>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Select a program to view quota availability</p>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Applications</span>
                <Badge variant="secondary">{pendingApplicants.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Allocated Today</span>
                <Badge variant="outline">
                  {
                    applicants.filter(
                      (a) =>
                        a.applicationStatus === 'Allocated' &&
                        a.updatedAt &&
                        new Date(a.updatedAt).toDateString() === new Date().toDateString()
                    ).length
                  }
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Allocated</span>
                <Badge variant="outline">
                  {applicants.filter((a) => a.applicationStatus === 'Allocated').length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Seat Allocation</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to allocate a seat to:
              {selectedApplicantData && (
                <div className="mt-3 bg-gray-50 rounded p-3 space-y-1">
                  <p>
                    <strong>Applicant:</strong> {selectedApplicantData.firstName}{' '}
                    {selectedApplicantData.lastName}
                  </p>
                  <p>
                    <strong>Program:</strong>{' '}
                    {programs.find((p) => p.id === selectedProgram)?.name}
                  </p>
                  <p>
                    <strong>Quota:</strong> {selectedQuota}
                  </p>
                </div>
              )}
              <p className="mt-3">
                This will lock one seat in the selected quota. Continue?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAllocation}>
              Confirm Allocation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
