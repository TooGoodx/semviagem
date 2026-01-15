import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rtxrgqlhdbsztsbnycln.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0eHJncWxoZGJzenRzYm55Y2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDU2NTUxMCwiZXhwIjoyMDY2MTQxNTEwfQ.Wbi3uTGtzbSiQqSzLlYTbP7HhlfVQNAvBlOA48wh-ww'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deleteUser() {
  const targetEmail = 'brunogp89@gmail.com'

  console.log('🔍 PASSO 1: Verificando usuário a ser deletado...')
  console.log('=' .repeat(60))

  // 1. Verificar usuário
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, full_name, auth0_id, subscription_status, created_at')
    .eq('email', targetEmail)
    .single()

  if (userError) {
    if (userError.code === 'PGRST116') {
      console.log('❌ Usuário não encontrado no banco de dados')
      return
    }
    console.error('❌ Erro ao buscar usuário:', userError)
    return
  }

  console.log('✅ Usuário encontrado:')
  console.log('   ID:', user.id)
  console.log('   Email:', user.email)
  console.log('   Nome:', user.full_name)
  console.log('   Auth0 ID:', user.auth0_id)
  console.log('   Plano:', user.subscription_status)
  console.log('   Criado em:', user.created_at)
  console.log('')

  // 2. Verificar alertas do usuário
  console.log('🔍 PASSO 2: Verificando alertas do usuário...')
  console.log('=' .repeat(60))

  const { data: alerts, error: alertsError } = await supabase
    .from('alerts')
    .select('id, alert_name, created_at')
    .eq('user_id', user.id)

  if (alertsError) {
    console.error('❌ Erro ao buscar alertas:', alertsError)
  } else {
    console.log(`📋 Encontrados ${alerts.length} alertas`)
    alerts.forEach((alert, i) => {
      console.log(`   ${i+1}. ${alert.alert_name} (ID: ${alert.id})`)
    })
    console.log('')
  }

  // 3. Deletar alertas
  if (alerts && alerts.length > 0) {
    console.log('🗑️  PASSO 3: Deletando alertas...')
    console.log('=' .repeat(60))

    const { error: deleteAlertsError } = await supabase
      .from('alerts')
      .delete()
      .eq('user_id', user.id)

    if (deleteAlertsError) {
      console.error('❌ Erro ao deletar alertas:', deleteAlertsError)
      return
    }

    console.log(`✅ ${alerts.length} alerta(s) deletado(s) com sucesso`)
    console.log('')
  }

  // 4. Deletar usuário
  console.log('🗑️  PASSO 4: Deletando usuário...')
  console.log('=' .repeat(60))

  const { error: deleteUserError } = await supabase
    .from('users')
    .delete()
    .eq('email', targetEmail)

  if (deleteUserError) {
    console.error('❌ Erro ao deletar usuário:', deleteUserError)
    return
  }

  console.log('✅ Usuário deletado com sucesso')
  console.log('')

  // 5. Confirmar exclusão
  console.log('✅ PASSO 5: Confirmando exclusão...')
  console.log('=' .repeat(60))

  const { count, error: countError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('❌ Erro ao contar usuários:', countError)
  } else {
    console.log(`📊 Total de usuários restantes: ${count}`)
  }

  console.log('')
  console.log('=' .repeat(60))
  console.log('🎉 OPERAÇÃO CONCLUÍDA')
  console.log('=' .repeat(60))
  console.log('')
  console.log('⚠️  PRÓXIMOS PASSOS:')
  console.log('   1. O usuário foi deletado do Supabase')
  console.log('   2. O usuário AINDA EXISTE no Auth0')
  console.log('   3. Para deletar do Auth0:')
  console.log('      - Acesse: https://manage.auth0.com')
  console.log('      - User Management → Users')
  console.log('      - Busque: brunogp89@gmail.com')
  console.log('      - Delete User')
  console.log('')
}

deleteUser()
