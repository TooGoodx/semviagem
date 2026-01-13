// Stripe Configuration using environment variables
const baseUrl = typeof window !== 'undefined'
  ? window.location.origin
  : 'https://extraordinary-starship-9103ce.netlify.app';

export const STRIPE_CONFIG = {
  // Public key for frontend
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51OyFRwRtN3YwSDWnX7l0Nh8lRCDijNack0r4becarAP3naafshFTGnDcNz7STR4q5iPcz1hX41fsE8770BhzGb1Q00TExFo0kt',

  // Price ID for the product
  priceId: import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1RfmLZRtN3YwSDWn5pXFxsGQ',

  // Domain validation
  domainId: 'pmd_1Rx5lSRtN3YwSDWnWAvnPqt3',
  activeDomain: 'tripjunto.com',

  // Webhook configuration - these should only be used on backend
  webhookSecret: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || 'whsec_M5gEbLtXtwvWNPU8vpmDG7X0xlXbibYx',
  webhookEndpoint: `${baseUrl}/.netlify/functions/webhook`,

  // Redirect URLs
  successUrl: `${baseUrl}/success`,
  cancelUrl: `${baseUrl}/cancel`,

  // Events to listen for
  webhookEvents: [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'invoice.paid',
    'invoice.payment_failed'
  ]
};

// Note: Secret key (STRIPE_SECRET_KEY) should ONLY be used in Netlify Functions, never in frontend code
