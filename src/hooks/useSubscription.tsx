
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSubscription = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createCheckoutSession = async (planName: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Creating checkout session for plan:', planName);
      
      const { data, error } = await supabase.functions.invoke('stripe-payment', {
        body: {
          action: 'create_checkout_session',
          planName: planName.toLowerCase(),
          userId: user.id
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Checkout session response:', data);

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received from server');
      }

    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to start payment process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startFreeTrial = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to start your free trial",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Starting free trial for user:', user.id);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          plan: 'trial',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      toast({
        title: "Free trial started!",
        description: "You now have access to 30 clients and premium features for your trial period.",
      });

      // Refresh the page to update the UI
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Error starting free trial:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start free trial. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    startFreeTrial,
    loading
  };
};
