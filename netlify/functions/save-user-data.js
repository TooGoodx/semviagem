const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const requestBody = JSON.parse(event.body);

    // Support both old format (userData + registrationData) and new format (flat object)
    let userData, registrationData;

    if (requestBody.userData) {
      // Old format: { userData: {...}, registrationData: {...} }
      userData = requestBody.userData;
      registrationData = requestBody.registrationData;
    } else if (requestBody.auth0_id) {
      // New format: flat object with all fields
      userData = requestBody;
      registrationData = null;
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request format' }),
      };
    }

    // Validate required data
    const auth0Id = userData.sub || userData.auth0_id;
    if (!auth0Id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'auth0_id is required' }),
      };
    }

    console.log('💾 save-user-data: Processing request for user:', auth0Id);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auth0_id', auth0Id)
      .single();

    // Prepare user data for insert/update
    const userProfile = {
      name: userData.name || registrationData?.name || 'User',
      email: userData.email,
      phone: userData.phone || registrationData?.phone || null,
      instagram: userData.instagram || registrationData?.instagram || null,
      birth_date: userData.birth_date || registrationData?.birthDate || null,
      accept_marketing: userData.accept_marketing || registrationData?.acceptMarketing || false,
      provider: auth0Id.split('|')[0], // google-oauth2, facebook, auth0, etc.
      updated_at: new Date().toISOString(),
    };

    if (existingUser) {
      // Update existing user
      console.log('📝 Updating existing user:', auth0Id);

      const { data, error } = await supabase
        .from('user_profiles')
        .update(userProfile)
        .eq('auth0_id', auth0Id)
        .select();

      if (error) throw error;

      console.log('✅ User updated successfully');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'User profile updated successfully',
          user: data[0]
        }),
      };
    } else {
      // Create new user
      console.log('✨ Creating new user:', auth0Id);

      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          auth0_id: auth0Id,
          ...userProfile,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      console.log('✅ User created successfully');

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'User profile created successfully',
          user: data[0]
        }),
      };
    }
  } catch (error) {
    console.error('Error saving user data:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
    };
  }
};
