
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, planName, userId } = await req.json()

    if (!STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured')
    }

    console.log('Processing Stripe payment:', { action, planName, userId })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (action === 'create_checkout_session') {
      // Get user email for Stripe customer
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single()

      if (!profile?.email) {
        throw new Error('User email not found')
      }

      // Define price mappings
      const priceMapping = {
        professional: {
          price: 14900, // R149.00 in cents
          name: 'Professional Plan',
          description: '150 clients, 100GB storage, premium features'
        },
        agency: {
          price: 79900, // R799.00 in cents  
          name: 'Agency Plan',
          description: 'Unlimited clients, 1TB storage, white-label'
        }
      }

      const planConfig = priceMapping[planName as keyof typeof priceMapping]
      if (!planConfig) {
        throw new Error('Invalid plan selected')
      }

      // Create Stripe checkout session
      const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'success_url': `${req.headers.get('origin')}/dashboard?payment=success&plan=${planName}`,
          'cancel_url': `${req.headers.get('origin')}/dashboard?payment=cancelled`,
          'payment_method_types[]': 'card',
          'mode': 'subscription',
          'customer_email': profile.email,
          'line_items[0][price_data][currency]': 'zar',
          'line_items[0][price_data][product_data][name]': planConfig.name,
          'line_items[0][price_data][product_data][description]': planConfig.description,
          'line_items[0][price_data][unit_amount]': planConfig.price.toString(),
          'line_items[0][price_data][recurring][interval]': 'month',
          'line_items[0][quantity]': '1',
          'client_reference_id': userId,
          'metadata[plan_name]': planName,
          'metadata[user_id]': userId
        })
      })

      if (!stripeResponse.ok) {
        const errorData = await stripeResponse.text()
        console.error('Stripe checkout session creation failed:', errorData)
        throw new Error('Failed to create checkout session')
      }

      const session = await stripeResponse.json()
      console.log('Stripe checkout session created:', session.id)

      return new Response(
        JSON.stringify({ 
          url: session.url,
          sessionId: session.id 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (action === 'webhook') {
      // Handle Stripe webhooks for subscription updates
      const event = await req.json()
      
      console.log('Received Stripe webhook:', event.type)

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const userId = session.metadata.user_id
        const planName = session.metadata.plan_name

        // Update user's plan in the database
        const { error } = await supabase
          .from('profiles')
          .update({ 
            plan: planName.toLowerCase(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (error) {
          console.error('Error updating user plan:', error)
          throw error
        }

        console.log(`Updated user ${userId} to ${planName} plan`)
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in stripe-payment function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
