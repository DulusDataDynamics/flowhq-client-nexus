
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

interface DashboardOverviewProps {
  onNavigate: (page: string) => void;
}

export const DashboardOverview = ({ onNavigate }: DashboardOverviewProps) => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalFiles: 0,
    aiInteractions: 0,
    generatedContent: 0
  });
  const { user } = useAuth();
  const { planLimits, refreshPlan } = usePlanLimits();
  const { startFreeTrial, loading } = useSubscription();
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardStats();
    handlePaymentCallback();
  }, [user]);

  const handlePaymentCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const plan = urlParams.get('plan');

    if (paymentStatus === 'success' && plan) {
      toast({
        title: "Payment Successful!",
        description: `Welcome to the ${plan} plan! Your account has been upgraded.`,
      });
      refreshPlan();
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your subscription was not processed. You can try again anytime.",
        variant: "destructive"
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

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

  const getUsagePercentage = () => {
    if (planLimits.maxClients === -1) return 20;
    return Math.min((stats.totalProjects / planLimits.maxClients) * 100, 100);
  };

  const isNearLimit = () => {
    return planLimits.maxClients !== -1 && (stats.totalProjects / planLimits.maxClients) >= 0.8;
  };

  return (
    <div className="space-y-6">
      <DashboardStats stats={stats} />

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
                  className={`h-2 rounded-full transition-all ${
                    planLimits.maxClients === -1 ? 'bg-green-600' : 
                    isNearLimit() ? 'bg-red-600' : 'bg-blue-600'
                  }`}
                  style={{ 
                    width: planLimits.maxClients === -1 ? '20%' : 
                           `${getUsagePercentage()}%` 
                  }}
                ></div>
              </div>
              {isNearLimit() && (
                <p className="text-sm text-red-600 mt-1">
                  You're approaching your client limit. Consider upgrading your plan.
                </p>
              )}
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
                Start Free Trial (30 Clients)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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
