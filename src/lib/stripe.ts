import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '../config/stripe';

// Initialize Stripe
export const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

// Create checkout session
export const createCheckoutSession = async () => {
  try {
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: STRIPE_CONFIG.priceId,
        successUrl: STRIPE_CONFIG.successUrl,
        cancelUrl: STRIPE_CONFIG.cancelUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Redirect to Stripe Checkout
export const redirectToCheckout = async () => {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    const session = await createCheckoutSession();
    
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (error) {
      console.error('Stripe redirect error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};

// Direct redirect to existing Stripe checkout URL
export const redirectToStripeCheckout = () => {
  const checkoutUrl = 'https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI02?locale=pt-BR&__embed_source=buy_btn_1RyKDdRtN3YwSDWnNaQ2MkrB';
  window.location.href = checkoutUrl;
};
