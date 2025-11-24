const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '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');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Atualiza a assinatura do usuário no Supabase
 * @param {string} auth0_id - ID do usuário no Auth0 (ex: "google-oauth2|123456")
 * @param {object} updateData - Dados para atualizar (subscription_status, stripe_customer_id, etc)
 * @returns {Promise<object>} Dados do usuário atualizado
 */
async function updateUserSubscription(auth0_id, updateData) {
  try {
    console.log('🔄 Updating subscription for user:', auth0_id);
    console.log('📝 Update data:', JSON.stringify(updateData, null, 2));

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('auth0_id', auth0_id)
      .select();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️  No user found with auth0_id:', auth0_id);
      return null;
    }

    console.log('✅ Subscription updated successfully:', data[0]);
    return data[0];
  } catch (error) {
    console.error('💥 Failed to update user subscription:', error);
    throw error;
  }
}

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_M5gEbLtXtwvWNPU8vpmDG7X0xlXbibYx';

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
    };
  }

  // Handle the event
  console.log('Received Stripe webhook event:', stripeEvent.type);

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        const session = stripeEvent.data.object;
        console.log('Checkout session completed:', session.id);
        
        if (session.metadata && session.metadata.auth0_id) {
          await updateUserSubscription(session.metadata.auth0_id, {
            stripe_customer_id: session.customer,
            subscription_status: 'premium',
            subscription_end_date: null // Will be set when subscription is created
          });
        }
        
        break;
      
      case 'customer.subscription.created':
        const subscription = stripeEvent.data.object;
        console.log('Subscription created:', subscription.id);
        
        if (subscription.metadata && subscription.metadata.auth0_id) {
          const endDate = new Date(subscription.current_period_end * 1000);
          await updateUserSubscription(subscription.metadata.auth0_id, {
            subscription_status: 'premium',
            subscription_end_date: endDate.toISOString()
          });
        }
        
        break;
      
      case 'customer.subscription.updated':
        const updatedSubscription = stripeEvent.data.object;
        console.log('Subscription updated:', updatedSubscription.id);
        
        if (updatedSubscription.metadata && updatedSubscription.metadata.auth0_id) {
          const status = updatedSubscription.status === 'active' ? 'premium' : 'free';
          const endDate = updatedSubscription.current_period_end ? 
            new Date(updatedSubscription.current_period_end * 1000).toISOString() : null;
          
          await updateUserSubscription(updatedSubscription.metadata.auth0_id, {
            subscription_status: status,
            subscription_end_date: endDate
          });
        }
        
        break;
      
      case 'customer.subscription.deleted':
        const deletedSubscription = stripeEvent.data.object;
        console.log('Subscription cancelled:', deletedSubscription.id);
        
        if (deletedSubscription.metadata && deletedSubscription.metadata.auth0_id) {
          await updateUserSubscription(deletedSubscription.metadata.auth0_id, {
            subscription_status: 'free',
            subscription_end_date: null
          });
        }
        
        break;
      
      case 'invoice.paid':
        const invoice = stripeEvent.data.object;
        console.log('Invoice paid:', invoice.id);
        break;
      
      case 'invoice.payment_failed':
        const failedInvoice = stripeEvent.data.object;
        console.log('Invoice payment failed:', failedInvoice.id);
        break;
      
      default:
        console.log(`Unhandled event type ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
