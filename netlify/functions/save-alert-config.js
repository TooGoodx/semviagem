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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { auth0_id, config } = JSON.parse(event.body);

    if (!auth0_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'auth0_id is required' }),
      };
    }

    console.log('💾 save-alert-config: Salvando configuração (DESBLOQUEADO TEMPORARIAMENTE)');

    // ⚠️ TEMPORÁRIO: Validação de plano DESABILITADA para testes - Ver REGRAS_PLANOS.md
    // TODO: Descomentar validação após testes no Supabase

    /* ==================== VALIDAÇÃO DE PLANO ORIGINAL (COMENTADA) ====================

    console.log('💾 save-alert-config: Verificando plano do usuário:', auth0_id);

    // PASSO 1: Buscar perfil do usuário para verificar plano
    const { data: profile, error: profileError} = await supabase
      .from('user_profiles')
      .select('subscription_status')
      .eq('auth0_id', auth0_id)
      .single();

    if (profileError || !profile) {
      console.error('❌ Usuário não encontrado:', profileError);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    // PASSO 2: Validar plano - APENAS PRO pode salvar alertas
    const subscriptionStatus = profile.subscription_status || 'free';
    const isPro =
      subscriptionStatus === 'pro' ||
      subscriptionStatus === 'premium' ||
      subscriptionStatus === 'alertas_na_mao';

    if (!isPro) {
      console.warn('⚠️ Tentativa de salvar alertas sem plano PRO:', {
        auth0_id,
        current_plan: subscriptionStatus
      });

      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          error: 'Forbidden',
          message: 'Configuração de Alertas é exclusiva para assinantes do plano Alertas na Mão',
          current_plan: subscriptionStatus,
          required_plan: 'pro'
        }),
      };
    }

    ==================== FIM VALIDAÇÃO DE PLANO ORIGINAL ==================== */

    // PASSO 3: Validar estrutura da configuração
    if (!config || typeof config !== 'object') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid config format' }),
      };
    }

    // Validações de limites
    const { origens, destinos, dateRanges, alertTypes } = config;

    if (origens && origens.length > 3) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Maximum 3 origins allowed' }),
      };
    }

    if (destinos && destinos.length > 5) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Maximum 5 destinations allowed' }),
      };
    }

    if (dateRanges && dateRanges.length > 2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Maximum 2 date ranges allowed' }),
      };
    }

    console.log('✅ Validações passadas, salvando configuração de alertas');

    // PASSO 4: Salvar configuração no Supabase
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        alert_config: config,
        updated_at: new Date().toISOString(),
      })
      .eq('auth0_id', auth0_id)
      .select();

    if (error) {
      console.error('❌ Erro ao salvar alertas:', error);
      throw error;
    }

    console.log('✅ Configuração de alertas salva com sucesso');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Alertas configurados com sucesso',
        data: data[0],
      }),
    };
  } catch (error) {
    console.error('❌ Erro no save-alert-config:', error);
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
