
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PlanLimits {
  maxClients: number;
  maxStorage: number; // in GB
  plan: string;
  features: string[];
}

export const usePlanLimits = () => {
  const [planLimits, setPlanLimits] = useState<PlanLimits>({
    maxClients: 0,
    maxStorage: 0,
    plan: 'free',
    features: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadUserPlan();
  }, [user]);

  const loadUserPlan = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading user plan:', error);
        return;
      }

      const userPlan = profile?.plan || 'free';
      const limits = getPlanLimits(userPlan);
      setPlanLimits(limits);

    } catch (error) {
      console.error('Error loading plan limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanLimits = (plan: string): PlanLimits => {
    switch (plan) {
      case 'trial':
        return {
          maxClients: 30,
          maxStorage: 5,
          plan: 'trial',
          features: ['Basic Messaging', 'File Sharing', 'Mobile App Access', 'Community Support']
        };
      case 'professional':
        return {
          maxClients: 150,
          maxStorage: 100,
          plan: 'professional',
          features: ['Custom Branding', 'Advanced Analytics', 'E-Signature', 'Payment Processing', 'Priority Support', 'FlowBot AI Assistant']
        };
      case 'agency':
        return {
          maxClients: -1, // unlimited
          maxStorage: 1000,
          plan: 'agency',
          features: ['Team Collaboration', 'White-Label Solution', 'Advanced Workflows', 'API Access', 'Dedicated Support', 'Custom Integrations']
        };
      default:
        return {
          maxClients: 1,
          maxStorage: 1,
          plan: 'free',
          features: ['Basic Features Only']
        };
    }
  };

  return {
    planLimits,
    loading,
    refreshPlan: loadUserPlan
  };
};
