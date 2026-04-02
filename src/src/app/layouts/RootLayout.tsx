import { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import {
  LayoutDashboard,
  Settings,
  Users,
  ClipboardList,
  BarChart3,
  LogOut,
  Menu,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';

export default function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useApp();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'admission_officer', 'management'],
    },
    {
      path: '/master-setup',
      label: 'Master Setup',
      icon: Settings,
      roles: ['admin'],
    },
    {
      path: '/applicants',
      label: 'Applicants',
      icon: Users,
      roles: ['admin', 'admission_officer'],
    },
    {
      path: '/seat-allocation',
      label: 'Seat Allocation',
      icon: ClipboardList,
      roles: ['admin', 'admission_officer'],
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: BarChart3,
      roles: ['admin', 'admission_officer', 'management'],
    },
  ];

  const allowedNavItems = navItems.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  const NavLinks = () => (
    <>
      {allowedNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100 ${
              isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600'
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="font-bold text-xl text-gray-900">EduMerge CRM</h1>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <NavLinks />
        </nav>
        <div className="border-t p-4">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
            <p className="text-xs text-gray-500">{currentUser.email}</p>
            <p className="text-xs text-gray-400 capitalize mt-1">
              {currentUser.role.replace('_', ' ')}
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar - Mobile */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
          <h1 className="font-bold text-lg">EduMerge CRM</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center border-b px-6">
                <h1 className="font-bold text-xl">EduMerge CRM</h1>
              </div>
              <nav className="flex-1 space-y-1 p-4">
                <NavLinks />
              </nav>
              <div className="border-t p-4">
                <div className="mb-3 px-3">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                  <p className="text-xs text-gray-400 capitalize mt-1">
                    {currentUser.role.replace('_', ' ')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
