# Variáveis de Ambiente do Netlify

## ⚠️ IMPORTANTE
Este arquivo documenta TODAS as variáveis de ambiente que devem estar configuradas no Netlify para o funcionamento correto da aplicação.

As variáveis marcadas com `VITE_` são expostas no frontend (código JavaScript do browser).
As variáveis SEM `VITE_` são usadas apenas nas Netlify Functions (backend).

---

## 🔐 Auth0 Configuration (Frontend)

### VITE_AUTH0_DOMAIN
- **Valor**: `dev-j184kb6qzqv5nkd8.us.auth0.com`
- **Tipo**: String
- **Contexto**: Production, Deploy Preview, Branch Deploy
- **Descrição**: Domínio do Auth0 para autenticação

### VITE_AUTH0_CLIENT_ID
- **Valor**: `SfN7paQtf9vBWAh21GEhCN7vVClmxxV8`
- **Tipo**: String
- **Contexto**: Production, Deploy Preview, Branch Deploy
- **Descrição**: Client ID da aplicação Auth0

### VITE_AUTH0_REDIRECT_URI
- **Valor**: `https://semviagem.com/area-logada`
- **Tipo**: String
- **Contexto**: Production
- **Descrição**: URL de callback após autenticação (⚠️ DEVE estar configurada no Auth0 Dashboard)
- **⚠️ IMPORTANTE**: Para desenvolvimento local, use `http://localhost:5173/area-logada`

### VITE_AUTH0_AUDIENCE
- **Valor**: `https://dev-j184kb6qzqv5nkd8.us.auth0.com/api/v2/`
- **Tipo**: String
- **Contexto**: Production, Deploy Preview, Branch Deploy
- **Descrição**: Audience para tokens JWT do Auth0

---

## 🗄️ Supabase Configuration

### Frontend (VITE_ prefix)

#### VITE_SUPABASE_URL
- **Valor**: `https://rtxrgqlhdbsztsbnycln.supabase.co`
- **Tipo**: String
- **Contexto**: Production, Deploy Preview, Branch Deploy
- **Descrição**: URL do projeto Supabase

#### VITE_SUPABASE_ANON_KEY
- **Valor**: `sb_publishable_o5gqKHJNLaS0B043dVkgGA_ndLGlpVr`
- **Tipo**: String
- **Contexto**: Production, Deploy Preview, Branch Deploy
- **Descrição**: Chave pública (publishable) do Supabase para uso no frontend
- **✅ ATUALIZADO**: Usando nova publishable key (Sprint 1)

### Backend (Netlify Functions)

#### SUPABASE_URL
- **Valor**: `https://rtxrgqlhdbsztsbnycln.supabase.co`
- **Tipo**: String (Sensitive)
- **Contexto**: Production, Deploy Preview, Branch Deploy
- **Descrição**: URL do projeto Supabase para Functions

#### SUPABASE_SERVICE_ROLE_KEY
- **Valor**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0eHJncWxoZGJzenRzYm55Y2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDU2NTUxMCwiZXhwIjoyMDY2MTQxNTEwfQ.Wbi3uTGtzbSiQqSzLlYTbP7HhlfVQNAvBlOA48wh-ww`
- **Tipo**: String (Sensitive - **NUNCA COMMITAR**)
- **Contexto**: Production, Deploy Preview, Branch Deploy
- **Descrição**: Service Role Key do Supabase com privilégios administrativos
- **⚠️ CRÍTICO**: Esta chave bypassa Row Level Security - use apenas em Functions!

---

## 💳 Stripe Configuration

### Frontend (VITE_ prefix)

#### VITE_STRIPE_PUBLISHABLE_KEY
- **Valor**: `pk_live_51OyFRwRtN3YwSDWnX7l0Nh8lRCDijNack0r4becarAP3naafshFTGnDcNz7STR4q5iPcz1hX41fsE8770BhzGb1Q00TExFo0kt`
- **Tipo**: String
- **Contexto**: Production, Deploy Preview, Branch Deploy
- **Descrição**: Chave pública do Stripe (seguro expor no frontend)

#### VITE_STRIPE_PRICE_ID
- **Valor**: `price_1RfmLZRtN3YwSDWn5pXFxsGQ`
- **Tipo**: String
- **Contexto**: Production, Deploy Preview, Branch Deploy
- **Descrição**: ID do preço/produto no Stripe

#### VITE_STRIPE_BUTTON_ID
- **Valor**: `buy_btn_1RyKDdRtN3YwSDWnNaQ2MkrB`
- **Tipo**: String
- **Contexto**: Production, Deploy Preview, Branch Deploy
- **Descrição**: ID do botão de compra do Stripe

#### VITE_STRIPE_CHECKOUT_URL
- **Valor**: `https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI02`
- **Tipo**: String
- **Contexto**: Production, Deploy Preview, Branch Deploy
- **Descrição**: URL direta para checkout do Stripe

#### VITE_STRIPE_WEBHOOK_SECRET
- **Valor**: `whsec_M5gEbLtXtwvWNPU8vpmDG7X0xlXbibYx`
- **Tipo**: String
- **Contexto**: Production, Deploy Preview, Branch Deploy
- **Descrição**: Secret do webhook do Stripe (usado no frontend também)

### Backend (Netlify Functions)

#### STRIPE_SECRET_KEY
- **Valor**: `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`
- **Tipo**: String (Sensitive - **NUNCA EXPOR NO FRONTEND**)
- **Contexto**: Production, Deploy Preview, Branch Deploy
- **Descrição**: Secret key do Stripe para operações no backend
- **⚠️ CRÍTICO**: Usar apenas em Netlify Functions!

#### STRIPE_WEBHOOK_SECRET
- **Valor**: `whsec_M5gEbLtXtwvWNPU8vpmDG7X0xlXbibYx`
- **Tipo**: String (Sensitive)
- **Contexto**: Production, Deploy Preview, Branch Deploy
- **Descrição**: Secret para validar webhooks do Stripe

---

## 🛫 Moblix API Configuration (Backend Only)

#### MOBLIX_USERNAME
- **Valor**: `TooGood`
- **Tipo**: String
- **Contexto**: Production, Deploy Preview, Branch Deploy
- **Descrição**: Username para autenticação na API Moblix

#### MOBLIX_PASSWORD
- **Valor**: `23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7`
- **Tipo**: String (Sensitive)
- **Contexto**: Production, Deploy Preview, Branch Deploy
- **Descrição**: Password/Token hash para API Moblix

---

## 📋 Checklist de Configuração no Netlify

### 1. Acessar Netlify Dashboard
```
https://app.netlify.com/sites/extraordinary-starship-9103ce/settings/deploys#environment
```

### 2. Adicionar Variáveis de Ambiente
Para cada variável listada acima:
1. Clicar em "Edit variables"
2. Clicar em "New variable"
3. Inserir:
   - **Key**: Nome da variável (ex: `VITE_AUTH0_DOMAIN`)
   - **Values**: Valor correspondente
   - **Scopes**: Selecionar contextos apropriados
     - ✅ Production
     - ✅ Deploy previews
     - ✅ Branch deploys
4. Clicar em "Create variable"

### 3. Variáveis Críticas (Verificar Primeiro)

**Frontend:**
- ✅ VITE_AUTH0_DOMAIN
- ✅ VITE_AUTH0_CLIENT_ID
- ✅ VITE_AUTH0_AUDIENCE
- ✅ VITE_SUPABASE_URL
- ✅ VITE_SUPABASE_ANON_KEY
- ✅ VITE_STRIPE_PUBLISHABLE_KEY

**Backend:**
- ✅ SUPABASE_URL
- ✅ SUPABASE_SERVICE_ROLE_KEY (⚠️ OBTER NO SUPABASE)
- ✅ STRIPE_SECRET_KEY
- ✅ STRIPE_WEBHOOK_SECRET
- ✅ MOBLIX_USERNAME
- ✅ MOBLIX_PASSWORD

### 4. Após Configurar
1. Trigger manual deploy no Netlify
2. Verificar logs de deploy
3. Testar autenticação Auth0
4. Testar busca de voos (Moblix API)
5. Testar checkout Stripe

---

## 🔍 Verificação de Variáveis

Para verificar se as variáveis estão corretamente configuradas, você pode:

### No Frontend (Browser Console):
```javascript
// Estas devem retornar os valores corretos
console.log(import.meta.env.VITE_AUTH0_DOMAIN)
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
```

### Nas Netlify Functions (Logs):
```javascript
// Verificar logs das functions durante execução
console.log('SUPABASE_URL:', process.env.SUPABASE_URL)
console.log('Has STRIPE_SECRET_KEY:', !!process.env.STRIPE_SECRET_KEY)
```

---

## 🚨 Troubleshooting

### Auth0 não funciona
- ✅ Verificar `VITE_AUTH0_DOMAIN` está correto
- ✅ Verificar `VITE_AUTH0_CLIENT_ID` está correto
- ✅ Verificar callback URLs no Auth0 Dashboard incluem URL do Netlify

### Busca de voos não funciona
- ✅ Verificar `MOBLIX_USERNAME` e `MOBLIX_PASSWORD` no backend
- ✅ Verificar logs da function `aereo.js` no Netlify

### Stripe checkout não funciona
- ✅ Verificar `VITE_STRIPE_PUBLISHABLE_KEY` no frontend
- ✅ Verificar `STRIPE_SECRET_KEY` nas Functions
- ✅ Verificar webhook endpoint configurado no Stripe Dashboard

### Supabase não salva dados
- ✅ Verificar `SUPABASE_SERVICE_ROLE_KEY` está configurado
- ✅ Verificar RLS policies no Supabase
- ✅ Verificar logs das Functions

---

## 📝 Notas Importantes

1. **NUNCA** commitar arquivos `.env` ou `.env.local` com valores reais
2. As variáveis com `VITE_` são expostas no bundle JavaScript final
3. As variáveis sem `VITE_` são apenas para Netlify Functions (backend)
4. Após alterar variáveis, é necessário fazer novo deploy
5. Para desenvolvimento local, copie `.env.example` para `.env.local`

---

## 🔒 Segurança

### Variáveis Sensíveis (NUNCA EXPOR):
- ❌ `SUPABASE_SERVICE_ROLE_KEY`
- ❌ `STRIPE_SECRET_KEY`
- ❌ `MOBLIX_PASSWORD`

### Variáveis Públicas (OK expor):
- ✅ `VITE_AUTH0_DOMAIN`
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY`
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY` (com Row Level Security habilitado)

---

## ⚠️ AÇÃO CRÍTICA: CONFIGURAR AUTH0 DASHBOARD

**ANTES de fazer o deploy, você DEVE atualizar as URLs no Auth0:**

1. **Acesse:** https://manage.auth0.com
2. **Selecione a aplicação:** SemViagem (Client ID: `SfN7paQtf9vBWAh21GEhCN7vVClmxxV8`)
3. **Vá em Settings e atualize:**

**Allowed Callback URLs:**
```
https://semviagem.com/area-logada,http://localhost:5173/area-logada
```

**Allowed Logout URLs:**
```
https://semviagem.com,http://localhost:5173
```

**Allowed Web Origins:**
```
https://semviagem.com,http://localhost:5173
```

**Allowed Origins (CORS):**
```
https://semviagem.com,http://localhost:5173
```

4. **Clique em "Save Changes"**

> ⚠️ **Se você não fizer isso, o login NÃO vai funcionar em produção!**

---

Última atualização: 2025-12-05 (Mobile UX + Production deployment)
