const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    const { auth0_id } = event.queryStringParameters;

    if (!auth0_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'auth0_id is required' }),
      };
    }

    console.log('📖 load-user-profile: Buscando dados do usuário:', auth0_id);

    // Buscar perfil completo do usuário
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('name, email, phone, instagram, subscription_status, created_at, updated_at')
      .eq('auth0_id', auth0_id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);

      // Se o usuário não existe, retornar null ao invés de erro
      if (profileError.code === 'PGRST116') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ profile: null }),
        };
      }

      throw profileError;
    }

    console.log('✅ Perfil encontrado:', profile?.email);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        profile: profile,
      }),
    };
  } catch (error) {
    console.error('❌ Erro no load-user-profile:', error);
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
