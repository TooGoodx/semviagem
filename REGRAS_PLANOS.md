# 📋 REGRAS DE NEGÓCIO - SISTEMA DE PLANOS

**Status:** ⚠️ TEMPORARIAMENTE DESABILITADO PARA TESTES
**Data criação:** 2025-11-20
**Última modificação:** 2025-11-20

---

## ⚠️ IMPORTANTE - LEIA ANTES DE REATIVAR

Este arquivo documenta **TODAS** as regras de negócio do sistema de planos (FREE/BASIC/PRO).

**Status atual da aplicação:**
- ✅ Código das regras EXISTE mas está COMENTADO
- ✅ Todos usuários têm acesso TOTAL (simulando PRO)
- ✅ Pronto para TESTES sem bloqueios
- ⏳ Aguardando testes no Supabase antes de reativar regras

**Para reativar as regras:**
1. Busque por `// TEMPORÁRIO: Desbloqueado para testes`
2. Descomente os blocos de código marcados
3. Teste cada plano (FREE, BASIC, PRO) individualmente

---

## 🎯 DEFINIÇÃO DOS PLANOS

### FREE (Gratuito)
**Características:**
- ✅ Busca ilimitada de voos
- ✅ Dashboard básico
- ❌ SEM acesso a configuração de alertas
- ❌ SEM alertas por WhatsApp

**subscription_status no Supabase:**
- `null` ou `'free'`

**Mensagem de upgrade:**
> "Desbloqueie Alertas Inteligentes"
> "Assine o plano Alertas na Mão para configurar alertas personalizados e receber avisos direto no WhatsApp antes de todo mundo."

---

### BASIC (Milhas na Mão - R$ 29,90/mês)
**Características:**
- ✅ Busca ilimitada de voos
- ✅ Dashboard completo
- ❌ SEM acesso a configuração de alertas
- ❌ SEM alertas por WhatsApp

**subscription_status no Supabase:**
- `'basic'` ou `'milhas_na_mao'`

**Links Stripe:**
- Anual: `https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI01`
- Mensal: `https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI02`

**Mensagem de upgrade:**
> "Upgrade para Alertas na Mão"
> "Com o plano Alertas na Mão você pode configurar múltiplas rotas, períodos e receber alertas personalizados antes de todo mundo."

---

### PRO (Alertas na Mão - R$ 49,90/mês)
**Características:**
- ✅ Busca ilimitada de voos
- ✅ Dashboard completo
- ✅ Configuração de alertas (até 3 origens, 5 destinos, 2 períodos)
- ✅ Alertas inteligentes por WhatsApp
- ✅ Acesso antecipado a promoções

**subscription_status no Supabase:**
- `'pro'` ou `'premium'` ou `'alertas_na_mao'`

**Links Stripe:**
- Anual: `https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI03`
- Mensal: `https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI04`

**Limites de configuração:**
- Máximo 3 códigos IATA de origem
- Máximo 5 códigos IATA de destino
- Máximo 2 faixas de datas
- Tipos de alerta: Milhas e/ou Preço

---

## 📁 ARQUIVOS COM REGRAS IMPLEMENTADAS

### 1. `src/hooks/useUserPlan.ts`
**Função:** Hook que determina o plano do usuário

**Lógica original (COMENTADA):**
```typescript
// Busca subscription_status do Supabase
// Retorna: { plan: 'free' | 'basic' | 'pro', canConfigureAlerts, canSearchUnlimited }
// canConfigureAlerts: TRUE apenas para PRO
// canSearchUnlimited: TRUE para BASIC e PRO
```

**Estado atual (TEMPORÁRIO):**
```typescript
// FORÇA todos usuários como PRO
return {
  plan: 'pro',
  canConfigureAlerts: true,
  canSearchUnlimited: true,
  isLoading: false,
  error: null
}
```

**Para reativar:**
- Descomentar lógica de fetch do Supabase
- Descomentar condicional de subscription_status

---

### 2. `src/components/alerts/AlertConfigSection.tsx`
**Função:** UI de configuração de alertas

**Lógica original (COMENTADA):**
```typescript
// Verifica canConfigureAlerts do useUserPlan
// Se FALSE (FREE ou BASIC):
//   - Mostra PlanUpgradeOverlay (bloqueio visual)
//   - Desabilita botão "Salvar configuração"
//   - Exibe badge "Exclusivo para Alertas na Mão"
// Se TRUE (PRO):
//   - Permite configuração completa
//   - Habilita botão "Salvar configuração"
//   - Exibe badge "✨ Alertas Ativos"
```

**Estado atual (TEMPORÁRIO):**
```typescript
// PlanUpgradeOverlay ESCONDIDO
// Botão "Salvar" sempre HABILITADO
// Badge sempre mostra "✨ Alertas Ativos"
```

**Para reativar:**
- Descomentar verificação `!canConfigureAlerts`
- Descomentar renderização condicional do PlanUpgradeOverlay
- Descomentar lógica de badges por plano

---

### 3. `src/components/alerts/PlanUpgradeOverlay.tsx`
**Função:** Overlay de bloqueio com CTA de upgrade

**Comportamento por plano:**

**FREE:**
- Ícone: Sparkles
- Título: "Desbloqueie Alertas Inteligentes"
- Features: 5 destinos, WhatsApp, 2 períodos, Busca ilimitada
- CTA: "Ver Planos"
- Nota: "A partir de R$ 29,90/mês · Cancele quando quiser"

**BASIC:**
- Ícone: Zap
- Título: "Upgrade para Alertas na Mão"
- Features: 5 destinos, Alertas real-time WhatsApp, 2 períodos
- CTA: "Fazer Upgrade"

**Estado atual (TEMPORÁRIO):**
- Componente EXISTE mas não é renderizado
- AlertConfigSection não chama este componente

**Para reativar:**
- Descomentar renderização condicional em AlertConfigSection

---

### 4. `netlify/functions/save-alert-config.js`
**Função:** Validação server-side de alertas (segurança)

**Lógica original (COMENTADA):**
```javascript
// PASSO 1: Buscar subscription_status do user_profiles
// PASSO 2: Validar plano
const isPro =
  subscriptionStatus === 'pro' ||
  subscriptionStatus === 'premium' ||
  subscriptionStatus === 'alertas_na_mao';

if (!isPro) {
  return {
    statusCode: 403,
    body: JSON.stringify({
      error: 'Forbidden',
      message: 'Exclusiva para assinantes do plano Alertas na Mão',
      current_plan: subscriptionStatus,
      required_plan: 'pro'
    })
  };
}

// PASSO 3: Validar limites (3 origens, 5 destinos, 2 períodos)
// PASSO 4: Salvar no Supabase
```

**Estado atual (TEMPORÁRIO):**
```javascript
// VALIDAÇÃO DE PLANO DESABILITADA
// Aceita salvamento de QUALQUER usuário
// Mantém validação de limites (origens, destinos, períodos)
```

**Para reativar:**
- Descomentar PASSO 1 (busca do perfil)
- Descomentar PASSO 2 (validação isPro)
- Descomentar retorno 403 para não-PRO

---

### 5. `src/components/CustomCalendar.tsx`
**Função:** Calendário de seleção de datas

**Regra REMOVIDA PERMANENTEMENTE (REQ-01):**
- ❌ Limite de 30 dias para FREE (REMOVIDO)
- ✅ TODOS os planos têm busca ilimitada de datas

**Estado atual (PERMANENTE):**
- Nenhuma restrição de data por plano
- PremiumUpgradeModal REMOVIDO
- isDateRestricted sempre retorna false

**Ação necessária:**
- ✅ NENHUMA - Esta mudança é permanente

---

### 6. `src/hooks/useUserPlan.ts` (Detalhado)
**Localização:** `src/hooks/useUserPlan.ts`

**Interface de retorno:**
```typescript
{
  plan: 'free' | 'basic' | 'pro',
  isLoading: boolean,
  error: string | null,
  canSearchUnlimited: boolean,  // TRUE para basic e pro
  canConfigureAlerts: boolean,  // TRUE apenas para pro
}
```

**Mapeamento subscription_status → plan:**
```typescript
// FREE
null, 'free' → plan: 'free'

// BASIC
'basic', 'milhas_na_mao' → plan: 'basic'

// PRO
'pro', 'premium', 'alertas_na_mao' → plan: 'pro'
```

**Lógica de permissões:**
```typescript
canSearchUnlimited = (plan === 'basic' || plan === 'pro')
canConfigureAlerts = (plan === 'pro')
```

---

## 🔄 PROCESSO DE REATIVAÇÃO

### Passo 1: Reativar useUserPlan.ts
```bash
# Localizar linha:
// TEMPORÁRIO: Desbloqueado para testes

# Descomentar:
- Fetch do Supabase (check-subscription)
- Lógica de mapeamento subscription_status
- Retorno baseado em plano real
```

### Passo 2: Reativar AlertConfigSection.tsx
```bash
# Descomentar:
- Verificação !canConfigureAlerts
- Renderização de PlanUpgradeOverlay
- Lógica de badges (FREE/BASIC/PRO)
- Habilitação condicional do botão Salvar
```

### Passo 3: Reativar save-alert-config.js
```bash
# Descomentar:
- Busca de user_profiles no Supabase
- Validação isPro
- Retorno 403 para FREE e BASIC
```

### Passo 4: Testar cada plano
```sql
-- Configurar usuário de teste como FREE
UPDATE user_profiles
SET subscription_status = 'free'
WHERE email = 'teste@example.com';

-- Configurar como BASIC
UPDATE user_profiles
SET subscription_status = 'basic'
WHERE email = 'teste@example.com';

-- Configurar como PRO
UPDATE user_profiles
SET subscription_status = 'pro'
WHERE email = 'teste@example.com';
```

---

## 🧪 CHECKLIST DE TESTES (Pós-reativação)

### Teste FREE:
- [ ] Dashboard acessa OK
- [ ] Busca de voos OK (ilimitada)
- [ ] AlertConfigSection mostra overlay de upgrade
- [ ] Badge mostra "Disponível nos planos pagos"
- [ ] Botão "Salvar configuração" DESABILITADO ou OCULTO
- [ ] save-alert-config.js retorna 403

### Teste BASIC:
- [ ] Dashboard acessa OK
- [ ] Busca de voos OK (ilimitada)
- [ ] AlertConfigSection mostra overlay de upgrade
- [ ] Badge mostra "Exclusivo para Alertas na Mão"
- [ ] save-alert-config.js retorna 403

### Teste PRO:
- [ ] Dashboard acessa OK
- [ ] Busca de voos OK (ilimitada)
- [ ] AlertConfigSection totalmente funcional
- [ ] Badge mostra "✨ Alertas Ativos"
- [ ] Salvar configuração funciona
- [ ] save-alert-config.js retorna 200

---

## 📊 ESTATÍSTICAS

**Total de arquivos com regras:** 4
- Hooks: 1 (useUserPlan.ts)
- Components: 2 (AlertConfigSection.tsx, PlanUpgradeOverlay.tsx)
- Functions: 1 (save-alert-config.js)

**Linhas de código comentadas:** ~150

**Tempo estimado de reativação:** 15-30 minutos

---

## 🔗 LINKS ÚTEIS

**Stripe Checkout:**
- BASIC Anual: https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI01
- BASIC Mensal: https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI02
- PRO Anual: https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI03
- PRO Mensal: https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI04

**Supabase Table:** `user_profiles`
**Campo crítico:** `subscription_status`

---

**Criado por:** Claude Code
**Sessão:** Sprint 2 - Desbloqueio Temporário
**Objetivo:** Permitir testes completos antes de aplicar regras de negócio
