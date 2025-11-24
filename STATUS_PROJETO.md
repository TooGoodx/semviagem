# 📊 STATUS DO PROJETO - SemViagem

**Última atualização:** 2025-11-20
**Sessão atual:** Sprint 2 - FASE 1 Concluída

---

## 🎯 INFORMAÇÕES CRÍTICAS DO PROJETO

### Contatos e Links Importantes
- **WhatsApp:** +55 31 99105-8027 (https://wa.me/5531991058027)
- **E-mail:** contato@semviagem.com.br
- **Stripe:** Links de checkout configurados
- **Auth0:** Autenticação configurada com Google, Facebook, GitHub, LinkedIn
- **Supabase:** Database user_profiles configurado

### Usuários de Teste
- **PRO User:** brunogp89@gmail.com (100% desconto no Stripe)
  - **PENDÊNCIA:** subscription_status precisa ser atualizado manualmente no Supabase

---

## 📋 ARQUITETURA DO SISTEMA

### Sistema de Planos (3 Tiers)
```
FREE (Plano Gratuito)
├─ Busca ilimitada de voos ✅ (REQ-01: limite de 30 dias REMOVIDO)
├─ Dashboard básico ✅
└─ SEM acesso a alertas ❌

BASIC (Milhas na Mão - R$ 29,90/mês)
├─ Busca ilimitada de voos ✅
├─ Dashboard completo ✅
└─ SEM acesso a alertas ❌

PRO (Alertas na Mão - R$ 49,90/mês)
├─ Busca ilimitada de voos ✅
├─ Dashboard completo ✅
└─ Configuração de Alertas ✅
   ├─ Até 3 origens
   ├─ Até 5 destinos
   ├─ Até 2 períodos de datas
   └─ Alertas via WhatsApp
```

### Fluxo de Dados do Usuário
```
CADASTRO:
1. AuthTabs (registro manual ou social login)
2. PhoneCollectionModal (apenas no CADASTRO, não no LOGIN) ✅
3. localStorage → AuthCallback
4. save-user-data.js (Netlify Function)
5. Supabase user_profiles

PERFIL:
1. Profile.tsx carrega dados via load-user-profile.js ✅
2. Exibe WhatsApp, Instagram, Avatar do Google ✅
3. AlertConfigSection (bloqueado para FREE/BASIC) ✅
```

---

## ✅ SPRINT 1 - CONCLUÍDA

### Implementações Realizadas
1. ✅ Sistema de planos (FREE/BASIC/PRO)
2. ✅ Hook useUserPlan.ts
3. ✅ check-subscription.js (Netlify Function)
4. ✅ Integração Stripe para pagamentos
5. ✅ Dashboard com diferenciação de planos
6. ✅ Limite de 30 dias para usuários FREE (DEPOIS REMOVIDO EM SPRINT 2)

---

## ✅ SPRINT 2 - FASE 1 CONCLUÍDA

### O que foi implementado na FASE 1:

#### 1. Design System Padronizado ✅
- [x] Profile.tsx redesenhado com cores e sombras do Dashboard
- [x] Substituído `<select>` HTML por shadcn/ui `Select` components
- [x] Avatar component com suporte a foto do Google
- [x] Tipografia e espaçamento consistentes

#### 2. Campo Instagram ✅
- [x] Adicionado em AuthTabs.tsx (formulário de registro)
- [x] Validação de formato (@usuario ou URL)
- [x] Fluxo completo: localStorage → AuthCallback → Supabase
- [x] save-user-data.js atualizado para salvar Instagram
- [x] Profile.tsx exibe Instagram carregado do Supabase

#### 3. Avatar do Google ✅
- [x] Profile.tsx usa `user?.picture` do Auth0
- [x] Fallback para iniciais em caso de ausência de foto
- [x] Avatar redondo com efeito hover "Alterar foto"

#### 4. Sistema de Alertas com Validação Multi-Plan ✅
- [x] AlertConfigSection.tsx criado
- [x] PlanUpgradeOverlay.tsx criado (mensagens diferentes para FREE vs BASIC)
- [x] save-alert-config.js (Netlify Function com validação server-side)
- [x] Validação de limites: 3 origens, 5 destinos, 2 períodos
- [x] Bloqueio visual e funcional para FREE e BASIC

#### 5. CORREÇÕES CRÍTICAS (FASE 1) ✅

**BUG-01: Carregar dados do perfil do Supabase** ✅
- [x] Criado `netlify/functions/load-user-profile.js`
- [x] Profile.tsx carrega WhatsApp e Instagram automaticamente
- [x] useEffect busca dados na montagem do componente

**BUG-02: Modal WhatsApp só no cadastro** ✅
- [x] AuthTabs.tsx verifica `activeTab === 'login'`
- [x] Modal aparece APENAS no cadastro
- [x] Login social direto sem modal

**REQ-01: Busca ilimitada para TODOS** ✅
- [x] CustomCalendar.tsx - Removida lógica de restrição de 30 dias
- [x] `isDateRestricted` sempre retorna `false`
- [x] Removido PremiumUpgradeModal
- [x] Removidos estilos amarelos de datas bloqueadas
- [x] FREE/BASIC/PRO podem buscar qualquer data futura

**FIX: Número WhatsApp corrigido** ✅
- [x] Home.tsx atualizado de 5531997334723 para 5531991058027

---

## ⏳ PENDÊNCIAS ATUAIS

### BUG-03: Usuário PRO não reconhecido (STAND-BY)
**Usuário afetado:** brunogp89@gmail.com
**Problema:** subscription_status não está como 'pro' no Supabase
**Solução manual quando aprovado:**
```sql
UPDATE user_profiles
SET subscription_status = 'pro'
WHERE email = 'brunogp89@gmail.com';
```

### REQ-02: Sistema de Trial 14 dias (PLANEJADO - NÃO INICIADO)
- [ ] Adicionar campos trial_start_date e trial_end_date no Supabase
- [ ] Criar hook useTrialStatus.ts
- [ ] Criar TrialExpiredModal.tsx
- [ ] Modificar AuthenticatedRoute.tsx para verificar trial
- [ ] Paywall após 14 dias

### INTEGRAÇÃO FUTURA: Stripe Webhook (PLANEJADO - NÃO INICIADO)
- [ ] Criar netlify/functions/stripe-webhook.js
- [ ] Escutar eventos: subscription.created, subscription.updated, invoice.payment_succeeded
- [ ] Sincronização automática de subscription_status

---

## 📁 ARQUIVOS PRINCIPAIS MODIFICADOS (SPRINT 2)

### Criados:
- `netlify/functions/load-user-profile.js` - Busca dados do usuário
- `netlify/functions/save-alert-config.js` - Salva alertas com validação
- `src/components/alerts/AlertConfigSection.tsx` - UI de configuração de alertas
- `src/components/alerts/PlanUpgradeOverlay.tsx` - Overlay de upgrade

### Modificados:
- `src/pages/Profile.tsx` - Redesign + carregamento de dados do Supabase
- `src/components/auth/AuthTabs.tsx` - Instagram + modal WhatsApp apenas no cadastro
- `src/pages/Register.tsx` - Suporte a Instagram
- `src/pages/AuthCallback.tsx` - Salva Instagram no fluxo OAuth
- `src/components/CustomCalendar.tsx` - Removidas restrições de data
- `src/pages/Home.tsx` - WhatsApp correto (5531991058027)
- `netlify/functions/save-user-data.js` - Salva Instagram

---

## 🔧 COMANDOS ÚTEIS

### Desenvolvimento
```bash
npm run dev                    # Inicia servidor Vite
npx tsc --noEmit              # Verifica TypeScript
npm cache clean --force        # Limpa cache npm
rm -rf node_modules/.vite     # Limpa cache Vite
```

### Teste Local
```bash
# Servidor rodando em:
http://localhost:5173/

# Clear localStorage no navegador:
localStorage.clear()
```

---

## 🎯 PRÓXIMOS PASSOS (SPRINT 2 - FASE 2)

### Decisão pendente do usuário:
1. **BUG-03:** Atualizar subscription_status do brunogp89@gmail.com?
2. **REQ-02:** Iniciar implementação do sistema de trial 14 dias?
3. **Stripe Webhook:** Priorizar sincronização automática?

### Testes necessários:
- [ ] Cadastro completo (manual + social)
- [ ] Login sem modal de WhatsApp
- [ ] Perfil carregando WhatsApp e Instagram
- [ ] Busca de datas futuras ilimitadas
- [ ] Bloqueio de alertas para FREE/BASIC
- [ ] Configuração de alertas para PRO

---

## 📊 MÉTRICAS DE QUALIDADE

### Código
- ✅ TypeScript sem erros
- ✅ Vite build OK
- ✅ HMR funcionando
- ✅ Cache limpo

### Funcionalidades
- ✅ Autenticação (Auth0)
- ✅ Busca de voos (Moblix API)
- ✅ Sistema de planos (3 tiers)
- ✅ Perfil com dados dinâmicos
- ✅ Alertas (estrutura PRO)
- ⏳ Trial system (pendente)
- ⏳ Webhook Stripe (pendente)

---

**Status:** ✅ FASE 1 da Sprint 2 concluída com sucesso!
**Aguardando:** Aprovação do usuário para FASE 2 ou novos testes
