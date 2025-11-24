const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('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');

const app = express();
const PORT = process.env.PORT || 3001;

// Webhook endpoint needs raw body
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cors());

// Stripe webhook endpoint
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = 'whsec_M5gEbLtXtwvWNPU8vpmDG7X0xlXbibYx';

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout session completed:', session.id);
      
      // Here you would typically:
      // 1. Update user subscription in database
      // 2. Send confirmation email
      // 3. Grant access to premium features
      
      break;
    
    case 'customer.subscription.created':
      const subscription = event.data.object;
      console.log('Subscription created:', subscription.id);
      break;
    
    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      console.log('Subscription updated:', updatedSubscription.id);
      break;
    
    case 'invoice.paid':
      const invoice = event.data.object;
      console.log('Invoice paid:', invoice.id);
      break;
    
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('Invoice payment failed:', failedInvoice.id);
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Create checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
});
