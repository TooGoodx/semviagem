import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Usar SERVICE_ROLE para bypass RLS
);

export async function handler(event) {
  // Apenas POST permitido
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  // Verificar assinatura do webhook
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
    };
  }

  console.log('Received Stripe event:', stripeEvent.type);

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'customer.subscription.created': {
        const subscription = stripeEvent.data.object;
        await handleSubscriptionCreated(subscription);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      case 'invoice.paid': {
        const invoice = stripeEvent.data.object;
        await handleInvoicePaid(invoice);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object;
        await handlePaymentFailed(invoice);
        break;
      }
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (err) {
    console.error('Error processing webhook:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook handler failed', details: err.message })
    };
  }
}

/**
 * Processa checkout.session.completed
 * Chamado quando o pagamento é confirmado
 */
async function handleCheckoutCompleted(session) {
  console.log('Processing checkout.session.completed:', session.id);

  const auth0_id = session.metadata?.auth0_id;
  const customerEmail = session.customer_email || session.customer_details?.email;
  const stripeCustomerId = session.customer;
  const subscriptionId = session.subscription;

  // Determinar o plano baseado nos metadados ou price
  const planType = session.metadata?.plan_type || 'busca_ilimitada';

  const subscriptionStatus = planType === 'alertas_inteligentes'
    ? 'alertas_inteligentes'
    : 'busca_ilimitada';

  console.log('Updating user:', { auth0_id, customerEmail, subscriptionStatus, stripeCustomerId });

  // Buscar data de expiração da assinatura
  let expirationDate = null;
  if (subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      expirationDate = new Date(subscription.current_period_end * 1000).toISOString();
    } catch (e) {
      console.error('Error fetching subscription:', e);
      expirationDate = calculateExpirationDate();
    }
  } else {
    expirationDate = calculateExpirationDate();
  }

  // Atualizar usuário - tentar por auth0_id primeiro, depois por email
  const updateData = {
    subscription_status: subscriptionStatus,
    stripe_customer_id: stripeCustomerId,
    subscription_expires_at: expirationDate,
    updated_at: new Date().toISOString()
  };

  let result;

  if (auth0_id) {
    console.log('Updating by auth0_id:', auth0_id);
    result = await supabase
      .from('users')
      .update(updateData)
      .eq('auth0_id', auth0_id)
      .select();

    if (result.data && result.data.length > 0) {
      console.log('User updated successfully by auth0_id');
      return;
    }
  }

  if (customerEmail) {
    console.log('Updating by email:', customerEmail);
    result = await supabase
      .from('users')
      .update(updateData)
      .eq('email', customerEmail)
      .select();

    if (result.data && result.data.length > 0) {
      console.log('User updated successfully by email');
      return;
    }
  }

  if (result?.error) {
    console.error('Error updating user subscription:', result.error);
    throw result.error;
  }

  console.log('Warning: No user found to update', { auth0_id, customerEmail });
}

/**
 * Processa customer.subscription.created
 */
async function handleSubscriptionCreated(subscription) {
  console.log('Processing subscription.created:', subscription.id);

  const stripeCustomerId = subscription.customer;
  const auth0_id = subscription.metadata?.auth0_id;
  const status = subscription.status;

  if (status !== 'active' && status !== 'trialing') {
    console.log('Subscription not active yet, status:', status);
    return;
  }

  const subscriptionStatus = determinePlanFromSubscription(subscription);
  const expirationDate = new Date(subscription.current_period_end * 1000).toISOString();

  const updateData = {
    subscription_status: subscriptionStatus,
    stripe_customer_id: stripeCustomerId,
    subscription_expires_at: expirationDate,
    updated_at: new Date().toISOString()
  };

  // Tentar atualizar por auth0_id primeiro
  if (auth0_id) {
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('auth0_id', auth0_id);

    if (!error) {
      console.log('Subscription created and user updated by auth0_id');
      return;
    }
  }

  // Fallback: atualizar por stripe_customer_id
  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('stripe_customer_id', stripeCustomerId);

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  console.log('Subscription created and user updated');
}

/**
 * Processa customer.subscription.updated
 */
async function handleSubscriptionUpdated(subscription) {
  console.log('Processing subscription.updated:', subscription.id);

  const stripeCustomerId = subscription.customer;
  const status = subscription.status;

  // Mapear status do Stripe para nosso status
  let subscriptionStatus = 'free';
  if (status === 'active' || status === 'trialing') {
    subscriptionStatus = determinePlanFromSubscription(subscription);
  } else if (status === 'past_due') {
    // Manter acesso mas marcar como atrasado
    subscriptionStatus = determinePlanFromSubscription(subscription);
    console.log('Subscription is past_due, maintaining access for now');
  }

  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: subscriptionStatus,
      subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', stripeCustomerId);

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  console.log('Subscription updated successfully');
}

/**
 * Processa customer.subscription.deleted
 */
async function handleSubscriptionDeleted(subscription) {
  console.log('Processing subscription.deleted:', subscription.id);

  const stripeCustomerId = subscription.customer;

  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: 'free',
      subscription_expires_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', stripeCustomerId);

  if (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }

  console.log('Subscription canceled, user reverted to free tier');
}

/**
 * Processa invoice.paid - renovação de assinatura
 */
async function handleInvoicePaid(invoice) {
  console.log('Processing invoice.paid:', invoice.id);

  const stripeCustomerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) {
    console.log('Invoice not related to subscription, skipping');
    return;
  }

  // Buscar detalhes da assinatura para obter nova data de expiração
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const { error } = await supabase
      .from('users')
      .update({
        subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', stripeCustomerId);

    if (error) {
      console.error('Error updating subscription expiration:', error);
      throw error;
    }

    console.log('Subscription renewed successfully');
  } catch (e) {
    console.error('Error processing invoice.paid:', e);
    throw e;
  }
}

/**
 * Processa invoice.payment_failed
 */
async function handlePaymentFailed(invoice) {
  console.log('Processing invoice.payment_failed:', invoice.id);

  const stripeCustomerId = invoice.customer;
  const attemptCount = invoice.attempt_count;

  console.log(`Payment failed for customer ${stripeCustomerId}, attempt ${attemptCount}`);

  // Após 3 tentativas, revogar acesso
  if (attemptCount >= 3) {
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: 'free',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', stripeCustomerId);

    if (error) {
      console.error('Error revoking access after payment failure:', error);
      throw error;
    }

    console.log('Access revoked after multiple payment failures');
  } else {
    console.log('Payment failed but still within retry period');
  }
}

/**
 * Determina o plano baseado na subscription do Stripe
 */
function determinePlanFromSubscription(subscription) {
  const priceId = subscription.items?.data?.[0]?.price?.id || '';

  // Ajustar esses IDs conforme sua configuração no Stripe
  // Price ID para alertas_inteligentes
  if (priceId.includes('alertas') || priceId.includes('premium') || priceId.includes('inteligentes')) {
    return 'alertas_inteligentes';
  }

  // Default: busca_ilimitada
  return 'busca_ilimitada';
}

/**
 * Calcula data de expiração padrão (30 dias)
 */
function calculateExpirationDate() {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 30);
  return expiration.toISOString();
}
