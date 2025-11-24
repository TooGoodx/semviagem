# ⚠️ CORREÇÕES OBRIGATÓRIAS NO NETLIFY

**Data**: 23 de Novembro de 2025
**Status**: 🔴 **AÇÃO URGENTE NECESSÁRIA**

---

## 🚨 PROBLEMA CRÍTICO DETECTADO

Durante auditoria completa, foi descoberto que as configurações do Supabase no Netlify estão **100% INCORRETAS**!

### URL Errada
- ❌ Configurada: `https://vqflmhngywnbravitxxl.supabase.co`
- ✅ Deveria ser: `https://rtxrgqlhdbsztsbnycln.supabase.co`

### Chave Anon Inválida
- ❌ Configurada: `sb_publishable_SkNTS88mBZpTt7swmwgLgQ_6jWviV0z`
- ⚠️ **ISTO NÃO É UMA CHAVE JWT VÁLIDA!**
- ✅ Deveria ser: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 📋 INSTRUÇÕES PASSO-A-PASSO

### 1. Acessar Netlify Environment Variables

Abra este link:
```
https://app.netlify.com/sites/extraordinary-starship-9103ce/settings/deploys#environment
```

---

### 2. Corrigir VITE_SUPABASE_URL

#### Encontrar a variável:
- Procure por: **VITE_SUPABASE_URL**
- Clique em **"Options"** → **"Edit"**

#### Atualizar o valor:
```diff
- Valor antigo: https://vqflmhngywnbravitxxl.supabase.co
+ Valor novo:   https://rtxrgqlhdbsztsbnycln.supabase.co
```

#### Aplicar em todos os contextos:
- ✅ Production
- ✅ Deploy Previews
- ✅ Branch deploys
- ✅ Preview Server & Agent Runners
- ✅ Local development

**Clique em "Save"**

---

### 3. Corrigir VITE_SUPABASE_ANON_KEY

#### Encontrar a variável:
- Procure por: **VITE_SUPABASE_ANON_KEY**
- Clique em **"Options"** → **"Edit"**

#### Atualizar o valor:
```diff
- Valor antigo: sb_publishable_SkNTS88mBZpTt7swmwgLgQ_6jWviV0z
+ Valor novo:   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0eHJncWxoZGJzenRzYm55Y2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NjU1MTAsImV4cCI6MjA2NjE0MTUxMH0.IcF22qbU7vMlwQ04RfY3Tc4z9vmQYs-2sYxKxQoTnpw
```

#### Aplicar em todos os contextos:
- ✅ Production
- ✅ Deploy Previews
- ✅ Branch deploys
- ✅ Preview Server & Agent Runners
- ✅ Local development

**Clique em "Save"**

---

### 4. Adicionar/Corrigir SUPABASE_URL (Backend)

#### Verificar se existe:
- Procure por: **SUPABASE_URL** (sem VITE_)
- Se **NÃO existir**, clique em **"Add a variable"**
- Se **existir**, clique em **"Options"** → **"Edit"**

#### Configurar o valor:
```
Key:   SUPABASE_URL
Value: https://rtxrgqlhdbsztsbnycln.supabase.co
```

#### Aplicar em todos os contextos:
- ✅ Production
- ✅ Deploy Previews
- ✅ Branch deploys
- ✅ Preview Server & Agent Runners
- ✅ Local development

**Clique em "Save" ou "Create variable"**

---

### 5. Verificar SUPABASE_SERVICE_ROLE_KEY

#### Encontrar a variável:
- Procure por: **SUPABASE_SERVICE_ROLE_KEY**
- Clique em **"Options"** → **"View"**

#### Verificar o valor:
```
✅ Deve ser exatamente isto:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0eHJncWxoZGJzenRzYm55Y2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDU2NTUxMCwiZXhwIjoyMDY2MTQxNTEwfQ.Wbi3uTGtzbSiQqSzLlYTbP7HhlfVQNAvBlOA48wh-ww
```

#### Se estiver diferente:
- Clique em **"Options"** → **"Edit"**
- Cole o valor correto acima
- **Clique em "Save"**

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Antes de fazer deploy, confirme:

### Variáveis Frontend (VITE_)
- [ ] **VITE_SUPABASE_URL** = `https://rtxrgqlhdbsztsbnycln.supabase.co`
- [ ] **VITE_SUPABASE_ANON_KEY** começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- [ ] **VITE_AUTH0_DOMAIN** = `dev-jbjzcnwlhqzgtcpp.us.auth0.com` ✅ (já estava correto)
- [ ] **VITE_AUTH0_CLIENT_ID** = `n3Q1wYJ3jAVdmLEy1QX2MvH3S88Jg1Sw` ✅ (já estava correto)

### Variáveis Backend (sem VITE_)
- [ ] **SUPABASE_URL** = `https://rtxrgqlhdbsztsbnycln.supabase.co`
- [ ] **SUPABASE_SERVICE_ROLE_KEY** começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- [ ] **MOBLIX_USERNAME** = `TooGood` ✅ (já estava correto)
- [ ] **MOBLIX_PASSWORD** = `23a01acf...` ✅ (já estava correto)

### Variáveis Stripe
- [ ] **VITE_STRIPE_PUBLISHABLE_KEY** = `pk_live_51OyFRw...` ✅ (já estava correto)
- [ ] **STRIPE_SECRET_KEY** = `sk_live_51OyFRw...` ✅ (já estava correto)

---

## 🚀 PRÓXIMO PASSO: DEPLOY

Depois de corrigir TODAS as 4 variáveis acima:

### 1. Fazer Upload do ZIP

Acesse:
```
https://app.netlify.com/sites/extraordinary-starship-9103ce/deploys
```

Arraste o arquivo:
```
/Users/bruno/Downloads/buscadorReact-DEPLOY-FINAL-SUPABASE-CORRECTED-20251123-1906.zip
```

### 2. Aguardar Build

O build deve:
- ✅ Compilar sem erros
- ✅ Instalar dependências (side-channel, tslib)
- ✅ Gerar 10 Netlify Functions
- ⏱️ Levar ~2-3 minutos

### 3. Verificar Logs

Após deploy, verifique:
- Não deve haver erros de "Cannot find module"
- Não deve haver erros de conexão Supabase
- Functions devem inicializar corretamente

---

## 🧪 TESTES PÓS-DEPLOY

### 1. Teste de Variáveis (Browser Console)

Acesse a aplicação deployada e abra o console:

```javascript
// Deve retornar a URL correta
console.log(import.meta.env.VITE_SUPABASE_URL)
// Esperado: https://rtxrgqlhdbsztsbnycln.supabase.co

// Deve retornar JWT token
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 50))
// Esperado: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```

### 2. Teste de Autenticação

- [ ] Fazer login com Auth0
- [ ] Verificar se redireciona corretamente
- [ ] Verificar se SSO (Google/Facebook) aparece
- [ ] Verificar se dados são salvos no Supabase

### 3. Teste de Funcionalidades

- [ ] Buscar voos (Moblix API)
- [ ] Salvar configuração de alertas
- [ ] Testar checkout Stripe
- [ ] Verificar perfil de usuário
- [ ] Verificar assinatura

### 4. Verificar Netlify Function Logs

Acesse:
```
https://app.netlify.com/sites/extraordinary-starship-9103ce/functions
```

Clique em cada function e verifique:
- ✅ Não deve haver erros de conexão
- ✅ SUPABASE_URL deve estar correto nos logs
- ✅ Operações devem completar com sucesso

---

## 📊 COMPARAÇÃO ANTES/DEPOIS

### ANTES (ERRADO)
```
URL:      https://vqflmhngywnbravitxxl.supabase.co
Anon Key: sb_publishable_SkNTS88mBZpTt7swmwgLgQ_6jWviV0z ❌ NÃO É JWT!
Status:   🔴 TODAS as operações Supabase FALHANDO
```

### DEPOIS (CORRETO)
```
URL:      https://rtxrgqlhdbsztsbnycln.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Status:   🟢 Supabase 100% FUNCIONAL
```

---

## ⚠️ IMPORTANTE

**SEM ESTAS CORREÇÕES:**
- ❌ Login não salva no banco
- ❌ Perfis não carregam
- ❌ Alertas não funcionam
- ❌ Assinaturas não são verificadas
- ❌ Webhooks Stripe falham
- ❌ TODAS as 6 Netlify Functions que usam Supabase FALHAM

**COM ESTAS CORREÇÕES:**
- ✅ Aplicação 100% funcional
- ✅ Todas as features operacionais
- ✅ Dados persistem corretamente

---

## 📱 RESUMO RÁPIDO

**O que fazer agora:**

1. ⚙️ Acessar Netlify Environment Variables
2. ✏️ Corrigir 4 variáveis do Supabase:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (verificar)
3. 📦 Upload do ZIP: `buscadorReact-DEPLOY-FINAL-SUPABASE-CORRECTED-20251123-1906.zip`
4. ⏱️ Aguardar build (~2-3 min)
5. 🧪 Testar aplicação

---

## 📞 Dúvidas?

Consulte:
- **SUPABASE_CORRECTION.md** - Explicação detalhada do problema
- **NETLIFY_ENV_VARS.md** - Lista completa de variáveis
- **DEPLOY_INSTRUCTIONS.md** - Instruções gerais de deploy

---

**Status Atual**: 🟡 Código corrigido / Aguardando correção no Netlify
**Arquivo de Deploy**: `buscadorReact-DEPLOY-FINAL-SUPABASE-CORRECTED-20251123-1906.zip`
**Tamanho**: 4.7 MB
**Localização**: `/Users/bruno/Downloads/`

---

*Última atualização: 23/11/2025 19:06*
