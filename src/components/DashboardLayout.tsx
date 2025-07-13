
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  LayoutDashboard, 
  Users,
  FileText,
  DollarSign,
  Bot, 
  Settings, 
  LogOut,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState as useStateHook } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const DashboardLayout = ({ children, currentPage, onPageChange }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clientCount, setClientCount] = useStateHook(0);
  const { signOut, user } = useAuth();
  const { planLimits } = usePlanLimits();
  const { createCheckoutSession, loading } = useSubscription();

  useEffect(() => {
    loadClientCount();
  }, [user]);

  const loadClientCount = async () => {
    if (!user) return;

    try {
      const { count } = await supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);
      
      setClientCount(count || 0);
    } catch (error) {
      console.error('Error loading client count:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'invoices', label: 'Invoices', icon: DollarSign },
    { id: 'flowbot', label: 'FlowBot', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const handleUpgrade = async (planName: string) => {
    await createCheckoutSession(planName);
  };

  const getClientUsagePercentage = () => {
    if (planLimits.maxClients === -1) return 20;
    return Math.min((clientCount / planLimits.maxClients) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden bg-white shadow-sm border-b p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FlowHQ</h1>
                <p className="text-xs text-gray-500">Client Portal</p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-blue-700">
                  {planLimits.plan.charAt(0).toUpperCase() + planLimits.plan.slice(1)} Plan
                </span>
                <span className="text-xs text-blue-600">
                  {planLimits.maxClients === -1 ? 'Unlimited' : `${clientCount} of ${planLimits.maxClients} clients`}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${getClientUsagePercentage()}%` }}
                ></div>
              </div>
              {(planLimits.plan === 'free' || planLimits.plan === 'trial') && (
                <Button 
                  size="sm" 
                  className="w-full mt-2 text-xs"
                  onClick={() => handleUpgrade('professional')}
                  disabled={loading}
                >
                  <Zap className="mr-1 h-3 w-3" />
                  Upgrade
                </Button>
              )}
            </div>
          </div>
          
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      onPageChange(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </nav>
          
          <div className="p-4 border-t">
            <div className="mb-4">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-gray-500">Logged in</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
