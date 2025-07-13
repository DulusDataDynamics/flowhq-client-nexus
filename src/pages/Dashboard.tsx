
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AIAssistant } from '@/components/AIAssistant';
import { ClientsPage } from '@/components/ClientsPage';
import { FilesPage } from '@/components/FilesPage';
import { InvoicesPage } from '@/components/InvoicesPage';
import { SettingsPage } from '@/components/SettingsPage';
import { AuthForm } from '@/components/AuthForm';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useSubscription } from '@/hooks/useSubscription';
import { Zap } from 'lucide-react';

const DashboardOverview = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalFiles: 0,
    aiInteractions: 0,
    generatedContent: 0
  });
  const { user } = useAuth();
  const { planLimits } = usePlanLimits();
  const { createCheckoutSession, startFreeTrial, loading } = useSubscription();

  useEffect(() => {
    loadDashboardStats();
  }, [user]);

  const loadDashboardStats = async () => {
    if (!user) return;

    try {
      const [projects, files, conversations, generated] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('files').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('ai_conversations').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('generated_content').select('id', { count: 'exact' }).eq('user_id', user.id)
      ]);

      setStats({
        totalProjects: projects.count || 0,
        totalFiles: files.count || 0,
        aiInteractions: conversations.count || 0,
        generatedContent: generated.count || 0
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your FlowHQ workspace.
          </p>
        </div>
        <Button onClick={() => createCheckoutSession('professional')} disabled={loading}>
          <Zap className="mr-2 h-4 w-4" />
          Upgrade Plan
        </Button>
      </div>

      <DashboardStats stats={stats} />

      {/* Plan Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Usage - {planLimits.plan.charAt(0).toUpperCase() + planLimits.plan.slice(1)} Plan</CardTitle>
          <CardDescription>Your current plan limits and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Active Clients</span>
                <span>
                  {stats.totalProjects} of {planLimits.maxClients === -1 ? '∞' : planLimits.maxClients}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    planLimits.maxClients === -1 ? 'bg-green-600' : 
                    (stats.totalProjects / planLimits.maxClients) >= 0.8 ? 'bg-red-600' : 'bg-blue-600'
                  }`}
                  style={{ 
                    width: planLimits.maxClients === -1 ? '20%' : 
                           `${Math.min((stats.totalProjects / planLimits.maxClients) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Storage Used</span>
                <span>0 MB of {planLimits.maxStorage} GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
            {planLimits.plan === 'free' && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => startFreeTrial()}
                disabled={loading}
              >
                Start Free Trial
              </Button>
            )}
            {(planLimits.plan === 'trial' || planLimits.plan === 'free') && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => createCheckoutSession('professional')}
                disabled={loading}
              >
                Upgrade Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Account created</p>
                <p className="text-xs text-muted-foreground">Welcome to FlowHQ!</p>
              </div>
              <span className="text-xs text-muted-foreground">Just now</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions and FlowBot Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <QuickActions onNavigate={onNavigate} />
        
        <Card>
          <CardHeader>
            <CardTitle>FlowBot AI Assistant</CardTitle>
            <CardDescription>
              What your AI assistant can help you with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Generate documents in any format</li>
              <li>• Create and edit images</li>
              <li>• Analyze and sort data from files</li>
              <li>• Build custom spreadsheets</li>
              <li>• Automate workflow processes</li>
              <li>• Extract information from documents</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading FlowHQ...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardOverview onNavigate={setCurrentPage} />;
      case 'clients':
        return <ClientsPage />;
      case 'files':
        return <FilesPage />;
      case 'invoices':
        return <InvoicesPage />;
      case 'flowbot':
        return <AIAssistant />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardOverview onNavigate={setCurrentPage} />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </DashboardLayout>
  );
};

export default Dashboard;
