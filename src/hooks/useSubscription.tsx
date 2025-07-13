
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
      // Define price IDs for each plan (you'll need to create these in Stripe)
      const priceIds = {
        professional: 'price_professional_r149', // Replace with actual Stripe price ID
        agency: 'price_agency_r799' // Replace with actual Stripe price ID
      };

      const priceId = priceIds[planName.toLowerCase() as keyof typeof priceIds];

      if (!priceId) {
        throw new Error('Invalid plan selected');
      }

      const { data, error } = await supabase.functions.invoke('stripe-payment', {
        body: {
          action: 'create_checkout_session',
          priceId,
          userId: user.id,
          planName
        }
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Payment Error",
        description: "Failed to start payment process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startFreeTrial = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          plan: 'trial',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Free trial started!",
        description: "You now have 3 days of full access to FlowHQ",
      });

      // Refresh the page to update the UI
      window.location.reload();

    } catch (error) {
      console.error('Error starting free trial:', error);
      toast({
        title: "Error",
        description: "Failed to start free trial. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    createCheckoutSession,
    startFreeTrial,
    loading
  };
};
