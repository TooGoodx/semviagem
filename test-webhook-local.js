#!/usr/bin/env node

/**
 * Script para testar o webhook do Stripe localmente
 *
 * Uso:
 *   node test-webhook-local.js
 *
 * Este script simula eventos do Stripe para testar a função webhook
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (mesmas vars de ambiente)
const supabaseUrl = process.env.SUPABASE_URL || 'https://vqflmhngywnbravitxxl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada!');
  console.log('💡 Configure com: export SUPABASE_SERVICE_ROLE_KEY="sua-key"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mesma função do webhook
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

// Testes
async function runTests() {
  console.log('🧪 Iniciando testes do webhook...\n');

  // Teste 1: Criar usuário de teste
  console.log('📝 Teste 1: Criando usuário de teste...');
  const testAuth0Id = 'test|webhook-test-' + Date.now();

  try {
    const { data: user, error } = await supabase
      .from('user_profiles')
      .insert({
        auth0_id: testAuth0Id,
        email: 'webhook-test@example.com',
        name: 'Webhook Test User',
        subscription_status: 'free'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return;
    }

    console.log('✅ Usuário criado:', user);
    console.log('');

  } catch (err) {
    console.error('❌ Erro:', err.message);
    return;
  }

  // Teste 2: Simular checkout.session.completed
  console.log('📝 Teste 2: Simulando checkout.session.completed...');
  try {
    await updateUserSubscription(testAuth0Id, {
      stripe_customer_id: 'cus_test_' + Date.now(),
      subscription_status: 'premium',
      subscription_end_date: null
    });
    console.log('');
  } catch (err) {
    console.error('❌ Teste 2 falhou:', err.message);
  }

  // Teste 3: Simular customer.subscription.created
  console.log('📝 Teste 3: Simulando customer.subscription.created...');
  try {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // +1 mês

    await updateUserSubscription(testAuth0Id, {
      subscription_status: 'premium',
      subscription_end_date: endDate.toISOString()
    });
    console.log('');
  } catch (err) {
    console.error('❌ Teste 3 falhou:', err.message);
  }

  // Teste 4: Verificar estado final
  console.log('📝 Teste 4: Verificando estado final...');
  try {
    const { data: finalUser, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auth0_id', testAuth0Id)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar usuário:', error);
    } else {
      console.log('✅ Estado final do usuário:');
      console.log(JSON.stringify(finalUser, null, 2));
      console.log('');

      // Validações
      const checks = [
        { label: 'subscription_status é premium', pass: finalUser.subscription_status === 'premium' },
        { label: 'subscription_end_date está setado', pass: !!finalUser.subscription_end_date },
        { label: 'stripe_customer_id está setado', pass: !!finalUser.stripe_customer_id },
        { label: 'updated_at foi atualizado', pass: !!finalUser.updated_at }
      ];

      console.log('📊 Validações:');
      checks.forEach(check => {
        console.log(`  ${check.pass ? '✅' : '❌'} ${check.label}`);
      });
      console.log('');

      const allPassed = checks.every(c => c.pass);
      if (allPassed) {
        console.log('🎉 TODOS OS TESTES PASSARAM!');
      } else {
        console.log('⚠️  Alguns testes falharam');
      }
    }
  } catch (err) {
    console.error('❌ Teste 4 falhou:', err.message);
  }

  // Limpeza
  console.log('\n🧹 Limpando usuário de teste...');
  try {
    await supabase
      .from('user_profiles')
      .delete()
      .eq('auth0_id', testAuth0Id);
    console.log('✅ Usuário de teste removido');
  } catch (err) {
    console.error('⚠️  Erro ao remover usuário:', err.message);
  }

  console.log('\n✅ Testes concluídos!');
}

// Executar testes
runTests().catch(err => {
  console.error('💥 Erro fatal:', err);
  process.exit(1);
});
