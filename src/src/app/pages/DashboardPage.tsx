import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  FileText,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { DemoNotice } from '../components/DemoNotice';

export default function DashboardPage() {
  const { getDashboardStats, programs, currentUser } = useApp();
  const stats = getDashboardStats();

  const statCards = [
    {
      title: 'Total Intake',
      value: stats.totalIntake,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Confirmed Admissions',
      value: stats.totalAdmitted,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Allocated (Pending)',
      value: stats.totalAllocated,
      icon: UserPlus,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Pending Applications',
      value: stats.totalPending,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Pending Documents',
      value: stats.pendingDocuments,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Pending Fees',
      value: stats.pendingFees,
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      <DemoNotice />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {currentUser?.name}
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          Academic Year 2026-2027
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quota-wise Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quota-wise Seat Filling Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.quotaWiseStats.map((quota) => {
            const fillPercentage = (quota.filled / quota.total) * 100;
            return (
              <div key={quota.quotaType} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{quota.quotaType}</Badge>
                    <span className="text-sm text-gray-600">
                      {quota.filled} / {quota.total} seats filled
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {fillPercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={fillPercentage} className="h-2" />
                <p className="text-xs text-gray-500">
                  {quota.remaining} seats remaining
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Program-wise Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Program-wise Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {programs.map((program) => {
              const programStats = getDashboardStats(program.id);
              const fillPercentage =
                (programStats.totalAdmitted / program.totalIntake) * 100;
              return (
                <div
                  key={program.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{program.name}</p>
                    <p className="text-sm text-gray-500">
                      {programStats.totalAdmitted} confirmed /{' '}
                      {programStats.totalAllocated} allocated /{' '}
                      {program.totalIntake} intake
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {fillPercentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">filled</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Application Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Application Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.applicantsByStatus.map((status) => (
              <div
                key={status.status}
                className="text-center p-4 bg-gray-50 rounded-lg"
              >
                <p className="text-2xl font-bold text-gray-900">
                  {status.count}
                </p>
                <p className="text-sm text-gray-600 mt-1">{status.status}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}