import { createBrowserRouter } from 'react-router';
import RootLayout from './layouts/RootLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MasterSetupPage from './pages/MasterSetupPage';
import ApplicantsPage from './pages/ApplicantsPage';
import ApplicantFormPage from './pages/ApplicantFormPage';
import ApplicantDetailPage from './pages/ApplicantDetailPage';
import SeatAllocationPage from './pages/SeatAllocationPage';
import ReportsPage from './pages/ReportsPage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: DashboardPage,
      },
      {
        path: 'master-setup',
        Component: MasterSetupPage,
      },
      {
        path: 'applicants',
        Component: ApplicantsPage,
      },
      {
        path: 'applicants/new',
        Component: ApplicantFormPage,
      },
      {
        path: 'applicants/:id',
        Component: ApplicantDetailPage,
      },
      {
        path: 'seat-allocation',
        Component: SeatAllocationPage,
      },
      {
        path: 'reports',
        Component: ReportsPage,
      },
      {
        path: '*',
        Component: NotFoundPage,
      },
    ],
  },
]);
