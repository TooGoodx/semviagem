# 🧪 TESTE COMPLETO: Webhook do Stripe

**Data:** 2025-10-17
**Status:** ❌ WEBHOOK COM ERRO CRÍTICO

---

## 🔍 DIAGNÓSTICO ATUAL

### 1. Status da URL do Webhook

**URL:** `https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/webhook`

**Teste realizado:**
```bash
curl -I https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/webhook
```

**Resultado:**
```
HTTP/2 502 Bad Gateway
```

❌ **PROBLEMA:** O webhook retorna erro 502 (Bad Gateway)

**Possíveis causas:**
1. ✅ **CONFIRMADO:** Função `updateUserSubscription()` não existe (causa erro em runtime)
2. Variáveis de ambiente ausentes
3. Timeout da function
4. Erro de inicialização do Supabase

---

## 🐛 PROBLEMAS IDENTIFICADOS

### Problema 1: Função Ausente ❌ CRÍTICO

**Arquivo:** `netlify/functions/webhook.js`

**Linhas com erro:**
- Linha 42: `await updateUserSubscription(...)` - checkout.session.completed
- Linha 57: `await updateUserSubscription(...)` - customer.subscription.created
- Linha 74: `await updateUserSubscription(...)` - customer.subscription.updated
- Linha 87: `await updateUserSubscription(...)` - customer.subscription.deleted

**Erro JavaScript:**
```
ReferenceError: updateUserSubscription is not defined
```

**Impacto:**
- Function trava ao receber webhook
- Retorna 502 Bad Gateway
- Stripe marca webhook como failed
- Dados não são salvos no Supabase
- Usuários pagam mas não ganham acesso

---

### Problema 2: Keys Hardcoded ⚠️ SEGURANÇA

**Linha 1:**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_live_51OyFRw...');
```

**Linha 18:**
```javascript
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_M5gEbLtX...';
```

⚠️ **RISCO:** Keys de produção expostas no código!

**Problema:**
- Keys visíveis no repositório
- Violação de segurança
- Keys podem ser usadas maliciosamente

**Recomendação:** Remover fallbacks hardcoded e usar apenas variáveis de ambiente

---

## 🔧 CORREÇÃO NECESSÁRIA

### Passo 1: Adicionar Função `updateUserSubscription`

**Arquivo:** `netlify/functions/webhook.js`

**Adicionar após linha 6 (após createClient):**

```javascript
// Função para atualizar assinatura do usuário no Supabase
async function updateUserSubscription(auth0_id, updateData) {
  try {
    console.log('Updating subscription for user:', auth0_id);
    console.log('Update data:', updateData);

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('auth0_id', auth0_id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('No user found with auth0_id:', auth0_id);
      return null;
    }

    console.log('Subscription updated successfully:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Failed to update user subscription:', error);
    throw error;
  }
}
```

---

### Passo 2: Remover Keys Hardcoded

**Mudança na linha 1:**
```javascript
// ANTES (INSEGURO):
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_live_51OyFRw...');

// DEPOIS (SEGURO):
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}
const stripe = require('stripe')(stripeKey);
```

**Mudança na linha 18:**
```javascript
// ANTES (INSEGURO):
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_M5gEbLtX...';

// DEPOIS (SEGURO):
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) {
  console.error('STRIPE_WEBHOOK_SECRET not configured');
  return {
    statusCode: 500,
    body: JSON.stringify({ error: 'Webhook secret not configured' })
  };
}
```

---

## 🧪 PLANO DE TESTE

### Teste 1: Verificar Variáveis de Ambiente

**No Netlify Dashboard:**
1. Ir em: Site Configuration → Environment Variables
2. Verificar se existem:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

**Se faltarem:** Configurar antes de prosseguir

---

### Teste 2: Testar Webhook Localmente (Stripe CLI)

**Requisitos:**
- Stripe CLI instalado
- Netlify Dev rodando

**Comandos:**

1. **Instalar Stripe CLI (se não tiver):**
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Ou baixar de: https://stripe.com/docs/stripe-cli
```

2. **Login no Stripe:**
```bash
stripe login
```

3. **Iniciar Netlify Dev:**
```bash
netlify dev
```

4. **Em outro terminal, criar túnel do Stripe:**
```bash
stripe listen --forward-to http://localhost:8888/.netlify/functions/webhook
```

5. **Copiar o webhook secret** que aparece (ex: `whsec_...`)

6. **Criar `.env` com o secret:**
```bash
echo "STRIPE_WEBHOOK_SECRET=whsec_..." >> .env
```

7. **Testar evento manualmente:**
```bash
# Testar checkout.session.completed
stripe trigger checkout.session.completed
```

8. **Ver logs:**
- Netlify Dev mostrará logs da function
- Stripe CLI mostrará status do webhook

**Resultado esperado:**
```
✅ Received Stripe webhook event: checkout.session.completed
✅ Checkout session completed: cs_test_...
✅ Updating subscription for user: google-oauth2|...
✅ Subscription updated successfully
✅ 200 OK
```

---

### Teste 3: Simular Webhook com cURL

**Criar payload de teste:**

```bash
# checkout.session.completed
curl -X POST http://localhost:8888/.netlify/functions/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123",
        "customer": "cus_test_456",
        "metadata": {
          "auth0_id": "google-oauth2|123456789"
        }
      }
    }
  }'
```

**⚠️ Nota:** Este teste vai falhar na verificação de assinatura do Stripe. Use o Stripe CLI para testes reais.

---

### Teste 4: Verificar Supabase

**No Supabase Dashboard:**

1. Ir em: Table Editor → `user_profiles`

2. Verificar se existe a tabela e colunas:
   - `auth0_id` (TEXT)
   - `subscription_status` (TEXT)
   - `subscription_end_date` (TIMESTAMP)
   - `stripe_customer_id` (TEXT)
   - `updated_at` (TIMESTAMP)

3. Criar usuário de teste se não existir:
```sql
INSERT INTO user_profiles (
  auth0_id,
  email,
  name,
  subscription_status
) VALUES (
  'test|123456789',
  'test@example.com',
  'Test User',
  'free'
);
```

4. Após testar webhook, verificar se foi atualizado:
```sql
SELECT * FROM user_profiles
WHERE auth0_id = 'test|123456789';
```

---

### Teste 5: Webhook em Produção (Stripe Dashboard)

**Configurar webhook no Stripe:**

1. Ir em: https://dashboard.stripe.com/webhooks

2. Clicar em: "Add endpoint"

3. **Endpoint URL:**
```
https://extraordinary-starship-9103ce.netlify.app/.netlify/functions/webhook
```

4. **Events to send:**
   - [x] checkout.session.completed
   - [x] customer.subscription.created
   - [x] customer.subscription.updated
   - [x] customer.subscription.deleted
   - [x] invoice.paid
   - [x] invoice.payment_failed

5. **Salvar e copiar o Webhook Secret** (whsec_...)

6. **Adicionar secret no Netlify:**
   - Site Configuration → Environment Variables
   - `STRIPE_WEBHOOK_SECRET = whsec_...`

7. **Fazer deploy:**
```bash
git add netlify/functions/webhook.js
git commit -m "Fix: Add updateUserSubscription function to webhook"
git push
```

8. **Testar no Stripe Dashboard:**
   - Ir em: Webhooks → Seu webhook
   - Clicar em: "Send test webhook"
   - Escolher: checkout.session.completed
   - Click: "Send test webhook"

9. **Ver resultado:**
   - Status: 200 OK ✅
   - Response: `{"received": true}`

---

## 📊 CHECKLIST DE VERIFICAÇÃO

### Antes de Corrigir
- [x] Webhook retorna 502 ❌
- [x] Função `updateUserSubscription` não existe ❌
- [x] Keys hardcoded no código ⚠️
- [ ] Variáveis de ambiente configuradas?
- [ ] Tabela `user_profiles` existe no Supabase?

### Após Correção
- [ ] Função `updateUserSubscription` adicionada ✅
- [ ] Keys hardcoded removidas ✅
- [ ] Webhook testado localmente (Stripe CLI) ✅
- [ ] Webhook responde 200 OK ✅
- [ ] Dados são salvos no Supabase ✅
- [ ] Webhook configurado no Stripe Dashboard ✅
- [ ] Teste em produção funciona ✅

---

## 🎯 RESULTADO ESPERADO

### Request do Stripe
```json
POST /.netlify/functions/webhook
Headers:
  stripe-signature: t=1634...,v1=abc...
Body:
  {
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123",
        "customer": "cus_ABC123",
        "metadata": {
          "auth0_id": "google-oauth2|123456789"
        }
      }
    }
  }
```

### Logs da Function
```
✅ Received Stripe webhook event: checkout.session.completed
✅ Checkout session completed: cs_test_123
✅ Updating subscription for user: google-oauth2|123456789
✅ Update data: {
     stripe_customer_id: "cus_ABC123",
     subscription_status: "premium",
     subscription_end_date: null
   }
✅ Subscription updated successfully
```

### Response
```json
HTTP 200 OK
{
  "received": true
}
```

### Supabase (Antes)
```javascript
{
  auth0_id: "google-oauth2|123456789",
  subscription_status: "free",
  subscription_end_date: null,
  stripe_customer_id: null
}
```

### Supabase (Depois)
```javascript
{
  auth0_id: "google-oauth2|123456789",
  subscription_status: "premium",         // ✅ Atualizado
  subscription_end_date: null,            // ✅ (será setado no próximo evento)
  stripe_customer_id: "cus_ABC123",       // ✅ Vinculado
  updated_at: "2025-10-17T15:30:00Z"      // ✅ Atualizado
}
```

---

## 🚨 ERROS COMUNS E SOLUÇÕES

### Erro: "Webhook signature verification failed"
**Causa:** Webhook secret incorreto ou ausente

**Solução:**
1. Verificar `STRIPE_WEBHOOK_SECRET` no Netlify
2. Copiar secret correto do Stripe Dashboard
3. Fazer redeploy

---

### Erro: "updateUserSubscription is not defined"
**Causa:** Função não foi adicionada ao código

**Solução:**
1. Adicionar função conforme "Passo 1" acima
2. Commit e push
3. Aguardar deploy

---

### Erro: "No user found with auth0_id: ..."
**Causa:** Usuário não existe no Supabase

**Solução:**
1. Verificar se usuário fez login/registro
2. Verificar se `save-user-data` function funcionou
3. Verificar auth0_id no metadata do Stripe

---

### Erro: "relation user_profiles does not exist"
**Causa:** Tabela não criada no Supabase

**Solução:**
1. Criar tabela no Supabase (ver SQL no FLUXO_AUTH_STRIPE_SUPABASE.md)
2. Garantir que service role key tem permissões

---

## 📋 PRÓXIMOS PASSOS

1. **URGENTE:** Corrigir webhook.js (adicionar função)
2. **URGENTE:** Remover keys hardcoded
3. **IMPORTANTE:** Configurar variáveis de ambiente
4. **IMPORTANTE:** Testar localmente com Stripe CLI
5. **IMPORTANTE:** Configurar webhook no Stripe Dashboard
6. **DESEJÁVEL:** Adicionar monitoring/alertas
7. **DESEJÁVEL:** Implementar retry logic

---

**🎯 RESUMO:** O webhook está quebrado porque falta a função `updateUserSubscription`. Após adicionar a função e fazer deploy, o sistema de assinaturas funcionará corretamente!
