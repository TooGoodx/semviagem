const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const auth0Id = event.queryStringParameters?.auth0_id;

    if (!auth0Id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'auth0_id parameter is required' }),
      };
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('subscription_status, subscription_end_date, stripe_customer_id')
      .eq('auth0_id', auth0Id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!profile) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: true,
          hasActiveSubscription: false,
          subscription_status: 'free',
          subscription_end_date: null,
        }),
      };
    }

    const status = profile.subscription_status || 'free';
    const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
    const now = new Date();

    const hasActiveSubscription =
      status === 'premium' && (!endDate || endDate.getTime() > now.getTime());

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        hasActiveSubscription,
        subscription_status: status,
        subscription_end_date: profile.subscription_end_date,
        stripe_customer_id: profile.stripe_customer_id || null,
      }),
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
    };
  }
};
