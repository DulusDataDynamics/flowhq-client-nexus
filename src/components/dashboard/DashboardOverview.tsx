
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
  const { createCheckoutSession, loading } = useSubscription();
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
    if (planLimits.maxClients === 0) return 100;
    return Math.min((stats.totalProjects / planLimits.maxClients) * 100, 100);
  };

  const isNearLimit = () => {
    return planLimits.maxClients !== -1 && planLimits.maxClients > 0 && (stats.totalProjects / planLimits.maxClients) >= 0.8;
  };

  const getTrialDaysLeft = () => {
    if (!planLimits.trialEndDate || planLimits.plan !== 'trial') return 0;
    const endDate = new Date(planLimits.trialEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="space-y-6">
      <DashboardStats stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle>Plan Usage - {planLimits.plan.charAt(0).toUpperCase() + planLimits.plan.slice(1).replace('_', ' ')} Plan</CardTitle>
          <CardDescription>
            {planLimits.plan === 'trial' && (
              <span className="text-blue-600 font-medium">
                {getTrialDaysLeft()} days left in your free trial
              </span>
            )}
            {planLimits.plan === 'expired_trial' && (
              <span className="text-red-600 font-medium">
                Your free trial has expired. Please upgrade to continue using FlowHQ.
              </span>
            )}
            {planLimits.plan !== 'trial' && planLimits.plan !== 'expired_trial' && (
              "Your current plan limits and usage"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {planLimits.plan === 'expired_trial' ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-red-600 mb-4">Trial Expired</h3>
                <p className="text-gray-600 mb-6">
                  Your 5-day free trial has ended. Upgrade to a paid plan to continue using FlowHQ.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => createCheckoutSession('professional')}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Upgrade to Professional - $20/month
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => createCheckoutSession('agency')}
                    disabled={loading}
                  >
                    Upgrade to Agency - $119/month
                  </Button>
                </div>
              </div>
            ) : (
              <>
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
                        planLimits.plan === 'trial' ? 'bg-blue-600' :
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
                {(planLimits.plan === 'trial' || planLimits.plan === 'expired_trial') && (
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => createCheckoutSession('professional')}
                      disabled={loading}
                    >
                      Upgrade to Professional - $20/month
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => createCheckoutSession('agency')}
                      disabled={loading}
                    >
                      Upgrade to Agency - $119/month
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {planLimits.plan !== 'expired_trial' && (
        <>
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
                    <p className="text-sm font-medium">
                      {planLimits.plan === 'trial' ? 'Free trial started' : 'Account created'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {planLimits.plan === 'trial' 
                        ? `${getTrialDaysLeft()} days remaining` 
                        : 'Welcome to FlowHQ!'
                      }
                    </p>
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
        </>
      )}
    </div>
  );
};
