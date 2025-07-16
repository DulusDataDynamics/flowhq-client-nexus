
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Receipt, 
  Bot, 
  Settings,
  Zap
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const DashboardLayout = ({ children, currentPage, onPageChange }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const { planLimits } = usePlanLimits();
  const { createCheckoutSession, loading } = useSubscription();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'flowbot', label: 'FlowBot', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">FlowHQ</h1>
              <p className="text-xs text-muted-foreground">Client Portal</p>
            </div>
          </div>
        </div>

        {/* Plan Info */}
        <div className="p-4 border-b">
          <div className="text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="capitalize">{planLimits.plan} Plan</span>
              <span className="text-muted-foreground">
                0 of {planLimits.maxClients === -1 ? '∞' : planLimits.maxClients} clients
              </span>
            </div>
            {(planLimits.plan === 'free' || planLimits.plan === 'trial') && (
              <Button 
                size="sm" 
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => createCheckoutSession('professional')}
                disabled={loading}
              >
                <Zap className="mr-1 h-3 w-3" />
                Upgrade
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => onPageChange(item.id)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* User Info & Sign Out */}
        <div className="p-4 border-t">
          <div className="text-sm text-muted-foreground mb-2">
            {user?.email}
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            Logged in
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={signOut}
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold capitalize">{currentPage}</h2>
            <p className="text-sm text-muted-foreground">
              {currentPage === 'dashboard' && "Welcome back! Here's what's happening with your FlowHQ workspace."}
              {currentPage === 'clients' && "Manage your client relationships and projects."}
              {currentPage === 'files' && "Upload and manage your files."}
              {currentPage === 'invoices' && "Create and manage invoices."}
              {currentPage === 'flowbot' && "Chat with your AI assistant."}
              {currentPage === 'settings' && "Manage your account settings and preferences."}
            </p>
          </div>
          {(planLimits.plan === 'free' || planLimits.plan === 'trial') && (
            <Button 
              onClick={() => createCheckoutSession('professional')} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          )}
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
