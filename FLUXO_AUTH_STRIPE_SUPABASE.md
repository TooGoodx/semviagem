# 🔄 FLUXO COMPLETO: Auth0 + Stripe + Supabase

**Data:** 2025-10-17
**Versão:** 1.0
**Status:** Documentação Completa

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Estrutura do Supabase](#estrutura-do-supabase)
3. [Fluxo 1: Registro de Usuário](#fluxo-1-registro-de-usuário)
4. [Fluxo 2: Login Existente](#fluxo-2-login-existente)
5. [Fluxo 3: Upgrade para Premium](#fluxo-3-upgrade-para-premium)
6. [Fluxo 4: Webhooks do Stripe](#fluxo-4-webhooks-do-stripe)
7. [Operações no Supabase](#operações-no-supabase)
8. [Problemas Identificados](#problemas-identificados)

---

## 🎯 VISÃO GERAL

### Arquitetura de Integração

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    AUTH0     │◄────►│   NETLIFY    │◄────►│   SUPABASE   │
│  (Identity)  │      │  (Functions) │      │  (Database)  │
└──────────────┘      └──────────────┘      └──────────────┘
                             ▲
                             │
                             ▼
                      ┌──────────────┐
                      │    STRIPE    │
                      │  (Payments)  │
                      └──────────────┘
```

### Responsabilidades

**Auth0:**
- Autenticação de usuários (email/senha, Google, Facebook)
- Gestão de tokens (ID token, access token)
- Social login (OAuth)
- Password reset

**Netlify Functions:**
- Middleware entre Frontend e Backend
- Processamento de dados
- Chamadas ao Supabase (com service role key)
- Webhooks do Stripe
- CORS handling

**Supabase:**
- Database PostgreSQL
- Armazenamento de perfis de usuários
- Status de assinaturas
- Dados adicionais (telefone, preferências, etc)
- Queries e relacionamentos

**Stripe:**
- Processamento de pagamentos
- Gestão de assinaturas
- Webhooks para eventos de pagamento
- Customer management

---

## 🗄️ ESTRUTURA DO SUPABASE

### Tabela: `user_profiles`

**Localização:** Database → Tables → `user_profiles`

**Schema:**

```sql
CREATE TABLE user_profiles (
  -- Identificadores
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth0_id                TEXT UNIQUE NOT NULL,  -- Chave de ligação com Auth0 (ex: "google-oauth2|123456")

  -- Dados Pessoais
  name                    TEXT,                   -- Nome completo do usuário
  email                   TEXT NOT NULL UNIQUE,   -- Email (vindo do Auth0)
  phone                   TEXT,                   -- Telefone (do formulário de registro)
  birth_date              DATE,                   -- Data de nascimento (futuro)

  -- Preferências
  accept_marketing        BOOLEAN DEFAULT FALSE,  -- Aceita receber emails de marketing

  -- Autenticação
  provider                TEXT,                   -- Tipo de login: 'google-oauth2', 'facebook', 'auth0' (email/senha)

  -- Assinatura (Stripe)
  subscription_status     TEXT DEFAULT 'free',    -- Status: 'free', 'premium', 'cancelled'
  subscription_end_date   TIMESTAMP,              -- Data de expiração da assinatura
  stripe_customer_id      TEXT,                   -- ID do customer no Stripe (ex: "cus_...")

  -- Timestamps
  created_at              TIMESTAMP DEFAULT NOW(), -- Data de criação do perfil
  updated_at              TIMESTAMP DEFAULT NOW()  -- Última atualização
);

-- Índices
CREATE INDEX idx_user_profiles_auth0_id ON user_profiles(auth0_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);
```

### Campos Detalhados

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| `id` | UUID | ✅ | ID único no Supabase | `550e8400-e29b-41d4-a716-446655440000` |
| `auth0_id` | TEXT | ✅ | ID do usuário no Auth0 (chave primária de ligação) | `google-oauth2\|123456789` |
| `name` | TEXT | ❌ | Nome completo | `João Silva` |
| `email` | TEXT | ✅ | Email único | `joao@example.com` |
| `phone` | TEXT | ❌ | Telefone com código do país | `5511999999999` |
| `birth_date` | DATE | ❌ | Data de nascimento | `1990-01-15` |
| `accept_marketing` | BOOLEAN | ❌ | Aceita marketing | `true` / `false` |
| `provider` | TEXT | ❌ | Método de autenticação | `google-oauth2`, `facebook`, `auth0` |
| `subscription_status` | TEXT | ❌ | Status da assinatura | `free`, `premium`, `cancelled` |
| `subscription_end_date` | TIMESTAMP | ❌ | Quando a assinatura expira | `2025-12-31T23:59:59Z` |
| `stripe_customer_id` | TEXT | ❌ | ID do cliente no Stripe | `cus_PQRst123456789` |
| `created_at` | TIMESTAMP | ✅ | Data de criação | `2025-10-17T14:30:00Z` |
| `updated_at` | TIMESTAMP | ✅ | Data de atualização | `2025-10-17T15:45:00Z` |

### Valores de `subscription_status`

| Valor | Significado | Tem Acesso Premium? |
|-------|-------------|---------------------|
| `free` | Usuário sem assinatura (padrão) | ❌ Não |
| `premium` | Assinatura ativa | ✅ Sim |
| `cancelled` | Assinatura cancelada (mas pode ter período restante) | ⚠️ Depende da `subscription_end_date` |

### Valores de `provider`

| Valor | Método de Login |
|-------|-----------------|
| `google-oauth2` | Login com Google |
| `facebook` | Login com Facebook |
| `auth0` | Login com email/senha (database do Auth0) |

---

## 🔄 FLUXO 1: REGISTRO DE USUÁRIO

### Diagrama Completo

```
┌─────────────────────────────────────────────────────────────┐
│  1. USUÁRIO: Acessa /register                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. FRONTEND: Register.tsx                                   │
│                                                              │
│  Formulário:                                                 │
│  - Nome: "João Silva"                                       │
│  - Email: "joao@example.com"                                │
│  - Telefone: "(11) 99999-9999"                              │
│  - [x] Aceito receber ofertas                               │
│                                                              │
│  Clica "Criar Conta"                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. FRONTEND: Salva em localStorage                          │
│                                                              │
│  localStorage.setItem('pendingRegistration', JSON.stringify({│
│    name: "João Silva",                                      │
│    email: "joao@example.com",                               │
│    phone: "5511999999999",                                  │
│    acceptMarketing: true                                    │
│  }));                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. FRONTEND: Chama Auth0                                    │
│                                                              │
│  auth0.loginWithRedirect({                                  │
│    authorizationParams: {                                   │
│      screen_hint: 'signup',                                 │
│      redirect_uri: '/auth/callback'                         │
│    }                                                         │
│  })                                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. AUTH0: Mostra tela de signup                             │
│                                                              │
│  Opções:                                                     │
│  - Criar senha (database)                                   │
│  - Continue with Google                                     │
│  - Continue with Facebook                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  6. USUÁRIO: Escolhe Google                                  │
│                                                              │
│  - Redireciona para Google OAuth                            │
│  - Usuário seleciona conta                                  │
│  - Google autoriza                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  7. GOOGLE: Retorna para Auth0                               │
│                                                              │
│  - Envia authorization code                                 │
│  - Auth0 valida                                             │
│  - Auth0 gera tokens                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  8. AUTH0: Retorna para /auth/callback                       │
│                                                              │
│  URL: /auth/callback#id_token=eyJ...&access_token=eyJ...    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  9. FRONTEND: AuthCallback.tsx ✅ CRÍTICO                    │
│                                                              │
│  const user = useAuth0().user; // Auth0 processa tokens     │
│  // user.sub = "google-oauth2|123456789"                    │
│  // user.email = "joao@example.com"                         │
│  // user.name = "João Silva"                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  10. FRONTEND: Lê pendingRegistration                        │
│                                                              │
│  const pendingData = localStorage.getItem(                  │
│    'pendingRegistration'                                    │
│  );                                                          │
│  const regData = JSON.parse(pendingData);                   │
│  // regData = { name, email, phone, acceptMarketing }       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  11. FRONTEND → NETLIFY FUNCTION: save-user-data             │
│                                                              │
│  POST /.netlify/functions/save-user-data                    │
│  Body: {                                                     │
│    userData: {                                              │
│      sub: "google-oauth2|123456789",                        │
│      email: "joao@example.com",                             │
│      name: "João Silva"                                     │
│    },                                                        │
│    registrationData: {                                      │
│      name: "João Silva",                                    │
│      phone: "5511999999999",                                │
│      acceptMarketing: true                                  │
│    }                                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  12. NETLIFY FUNCTION: save-user-data.js                     │
│                                                              │
│  - Recebe dados do request                                  │
│  - Conecta ao Supabase (service role key)                   │
│  - Verifica se usuário existe                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  13. SUPABASE: Query SELECT                                  │
│                                                              │
│  SELECT * FROM user_profiles                                │
│  WHERE auth0_id = 'google-oauth2|123456789'                 │
│  LIMIT 1;                                                    │
│                                                              │
│  Resultado: ❌ Nenhum registro (usuário novo)               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  14. NETLIFY FUNCTION: Cria novo usuário                     │
│                                                              │
│  INSERT INTO user_profiles (                                │
│    auth0_id,                                                │
│    name,                                                    │
│    email,                                                   │
│    phone,                                                   │
│    accept_marketing,                                        │
│    provider,                                                │
│    subscription_status,                                     │
│    created_at,                                              │
│    updated_at                                               │
│  ) VALUES (                                                  │
│    'google-oauth2|123456789',                               │
│    'João Silva',                                            │
│    'joao@example.com',                                      │
│    '5511999999999',                                         │
│    true,                                                    │
│    'google-oauth2',  ← extraído do auth0_id                │
│    'free',           ← padrão                               │
│    NOW(),                                                    │
│    NOW()                                                     │
│  ) RETURNING *;                                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  15. SUPABASE: ✅ Registro criado                            │
│                                                              │
│  {                                                           │
│    id: "550e8400-e29b-41d4-a716-446655440000",             │
│    auth0_id: "google-oauth2|123456789",                     │
│    name: "João Silva",                                      │
│    email: "joao@example.com",                               │
│    phone: "5511999999999",                                  │
│    birth_date: null,                                        │
│    accept_marketing: true,                                  │
│    provider: "google-oauth2",                               │
│    subscription_status: "free",                             │
│    subscription_end_date: null,                             │
│    stripe_customer_id: null,                                │
│    created_at: "2025-10-17T14:30:00Z",                      │
│    updated_at: "2025-10-17T14:30:00Z"                       │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  16. NETLIFY FUNCTION: Retorna sucesso                       │
│                                                              │
│  Response: {                                                 │
│    success: true,                                           │
│    message: "User profile created successfully",            │
│    user: { ... }                                            │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  17. FRONTEND: Limpa localStorage                            │
│                                                              │
│  localStorage.removeItem('pendingRegistration');            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  18. FRONTEND → NETLIFY FUNCTION: check-subscription         │
│                                                              │
│  GET /.netlify/functions/check-subscription                 │
│      ?auth0_id=google-oauth2|123456789                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  19. NETLIFY FUNCTION: check-subscription.js                 │
│                                                              │
│  SELECT subscription_status, subscription_end_date,         │
│         stripe_customer_id                                  │
│  FROM user_profiles                                         │
│  WHERE auth0_id = 'google-oauth2|123456789';                │
│                                                              │
│  Resultado: {                                               │
│    subscription_status: 'free',                             │
│    subscription_end_date: null,                             │
│    stripe_customer_id: null                                 │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  20. NETLIFY FUNCTION: Calcula status                        │
│                                                              │
│  const hasActiveSubscription =                              │
│    status === 'premium' &&                                  │
│    (!endDate || endDate > NOW());                           │
│                                                              │
│  // Neste caso: false                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  21. NETLIFY FUNCTION: Retorna status                        │
│                                                              │
│  Response: {                                                 │
│    success: true,                                           │
│    hasActiveSubscription: false,                            │
│    subscription_status: 'free',                             │
│    subscription_end_date: null,                             │
│    stripe_customer_id: null                                 │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  22. FRONTEND: Salva em sessionStorage                       │
│                                                              │
│  sessionStorage.setItem('subscription_status',              │
│    JSON.stringify({                                         │
│      hasSubscription: false,                                │
│      checkedAt: "2025-10-17T14:30:05Z"                      │
│    })                                                        │
│  );                                                          │
│                                                              │
│  sessionStorage.setItem('show_subscription_banner', 'true');│
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  23. FRONTEND: Mostra toast e redireciona                    │
│                                                              │
│  toast.success("Bem-vindo, João Silva! 🎉");               │
│  navigate('/dashboard');                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  24. ✅ USUÁRIO NO DASHBOARD                                 │
│                                                              │
│  - Autenticado no Auth0                                     │
│  - Perfil criado no Supabase                                │
│  - Status: Free (sem assinatura)                            │
│  - Pode acessar: Dashboard, Profile                        │
│  - NÃO pode acessar: Flights, Ofertas (requer Premium)     │
└─────────────────────────────────────────────────────────────┘
```

### Dados Gravados no Supabase (Registro)

**Tabela:** `user_profiles`

```sql
-- O QUE É GRAVADO NO REGISTRO:
INSERT INTO user_profiles (
  auth0_id,           -- "google-oauth2|123456789" (do Auth0)
  name,               -- "João Silva" (do formulário)
  email,              -- "joao@example.com" (do Auth0)
  phone,              -- "5511999999999" (do formulário)
  accept_marketing,   -- true (do checkbox)
  provider,           -- "google-oauth2" (extraído do auth0_id)
  subscription_status,-- "free" (padrão)
  subscription_end_date, -- null (padrão)
  stripe_customer_id, -- null (ainda não tem)
  created_at,         -- NOW()
  updated_at          -- NOW()
);
```

---

## 🔄 FLUXO 2: LOGIN EXISTENTE

### Diagrama Simplificado

```
User → /login → "Continue with Google" → Auth0 → Google →
Auth0 → /auth/callback → check user exists → update data →
check subscription → dashboard
```

### Diferenças do Registro

1. **Não há `pendingRegistration` no localStorage**
2. **Usuário já existe no Supabase**
3. **Function faz UPDATE ao invés de INSERT**

### Query no Supabase (Login)

```sql
-- 1. Verifica se usuário existe
SELECT * FROM user_profiles
WHERE auth0_id = 'google-oauth2|123456789'
LIMIT 1;

-- Resultado: ✅ Encontrado

-- 2. Atualiza dados (caso algo tenha mudado no Auth0)
UPDATE user_profiles
SET
  name = 'João Silva',  -- pode ter mudado no Google
  email = 'joao@example.com',
  provider = 'google-oauth2',
  updated_at = NOW()
WHERE auth0_id = 'google-oauth2|123456789'
RETURNING *;
```

### Toast Diferente

```javascript
// Registro
toast.success("Bem-vindo, João Silva! 🎉");

// Login existente
toast.success("Bem-vindo de volta, João Silva! 👋");
```

---

## 💳 FLUXO 3: UPGRADE PARA PREMIUM

### Diagrama Completo

```
┌─────────────────────────────────────────────────────────────┐
│  1. USUÁRIO PREMIUM: Tenta acessar /flights                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. FRONTEND: ProtectedRoute.tsx                             │
│                                                              │
│  Verifica:                                                   │
│  - isAuthenticated? ✅ Sim                                   │
│  - hasSubscription? ❌ Não (lê do sessionStorage)            │
│                                                              │
│  Ação: Mostra PremiumUpgradeModal                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. USUÁRIO: Clica "Assinar Agora"                           │
│                                                              │
│  Redireciona para: /premium                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. FRONTEND: Premium.tsx                                    │
│                                                              │
│  Mostra planos:                                             │
│  - Mensal: R$ 49,90/mês                                     │
│  - Anual: R$ 499,90/ano                                     │
│                                                              │
│  Usuário escolhe: Mensal                                    │
│  Clica em StripeButton                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. FRONTEND: StripeButton.tsx                               │
│                                                              │
│  onClick={() => {                                           │
│    fetch('/.netlify/functions/create-checkout-session', {   │
│      method: 'POST',                                        │
│      body: JSON.stringify({                                 │
│        priceId: 'price_1234abcd',  // ID do preço no Stripe │
│        userId: user.sub,            // Auth0 ID             │
│        userEmail: user.email,                               │
│        successUrl: '/success?session_id={CHECKOUT_SESSION_ID}',│
│        cancelUrl: '/cancel'                                 │
│      })                                                      │
│    })                                                        │
│  }}                                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  6. NETLIFY FUNCTION: create-checkout-session.js             │
│                                                              │
│  Recebe:                                                     │
│  - priceId: "price_1234abcd"                                │
│  - userId: "google-oauth2|123456789"                        │
│  - userEmail: "joao@example.com"                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  7. NETLIFY FUNCTION: Busca/Cria customer no Stripe          │
│                                                              │
│  // Tenta buscar customer existente                         │
│  const customers = await stripe.customers.list({            │
│    email: "joao@example.com",                               │
│    limit: 1                                                 │
│  });                                                         │
│                                                              │
│  if (customers.data.length > 0) {                           │
│    customer = customers.data[0];                            │
│  } else {                                                    │
│    // Cria novo customer                                    │
│    customer = await stripe.customers.create({               │
│      email: "joao@example.com",                             │
│      metadata: {                                            │
│        auth0_id: "google-oauth2|123456789"                  │
│      }                                                       │
│    });                                                       │
│  }                                                           │
│                                                              │
│  // customer.id = "cus_PQRst123456789"                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  8. NETLIFY FUNCTION: Cria Checkout Session                  │
│                                                              │
│  const session = await stripe.checkout.sessions.create({    │
│    customer: "cus_PQRst123456789",                          │
│    payment_method_types: ['card'],                          │
│    line_items: [{                                           │
│      price: "price_1234abcd",  // Plano mensal             │
│      quantity: 1                                            │
│    }],                                                       │
│    mode: 'subscription',                                    │
│    success_url: 'https://myapp.com/success?session_id={...}',│
│    cancel_url: 'https://myapp.com/cancel',                  │
│    metadata: {                                              │
│      auth0_id: "google-oauth2|123456789",                   │
│      customer_id: "cus_PQRst123456789"                      │
│    },                                                        │
│    subscription_data: {                                     │
│      metadata: {                                            │
│        auth0_id: "google-oauth2|123456789"                  │
│      }                                                       │
│    }                                                         │
│  });                                                         │
│                                                              │
│  // session.id = "cs_test_abc123..."                        │
│  // session.url = "https://checkout.stripe.com/c/pay/..."  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  9. NETLIFY FUNCTION: Retorna URL do Stripe                  │
│                                                              │
│  Response: {                                                 │
│    url: "https://checkout.stripe.com/c/pay/cs_test_abc...", │
│    id: "cs_test_abc123..."                                  │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  10. FRONTEND: Redireciona para Stripe Checkout              │
│                                                              │
│  window.location.href = response.url;                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  11. STRIPE: Mostra página de checkout                       │
│                                                              │
│  - Formulário de cartão de crédito                          │
│  - Detalhes do plano                                        │
│  - Valor: R$ 49,90/mês                                      │
│  - Botão "Pagar"                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  12. USUÁRIO: Preenche dados do cartão e clica "Pagar"       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  13. STRIPE: Processa pagamento                              │
│                                                              │
│  - Valida cartão                                            │
│  - Cobra R$ 49,90                                           │
│  - Cria subscription                                        │
│  - ✅ Pagamento aprovado                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  14. STRIPE: Envia webhook → checkout.session.completed      │
│                                                              │
│  POST https://myapp.com/.netlify/functions/webhook          │
│  Headers:                                                    │
│    stripe-signature: "t=123,v1=abc..."                      │
│  Body:                                                       │
│    {                                                         │
│      type: "checkout.session.completed",                    │
│      data: {                                                │
│        object: {                                            │
│          id: "cs_test_abc123...",                           │
│          customer: "cus_PQRst123456789",                    │
│          metadata: {                                        │
│            auth0_id: "google-oauth2|123456789"              │
│          }                                                   │
│        }                                                     │
│      }                                                       │
│    }                                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  15. NETLIFY FUNCTION: webhook.js                            │
│                                                              │
│  - Verifica assinatura do webhook (security)                │
│  - Processa evento: checkout.session.completed              │
│                                                              │
│  case 'checkout.session.completed':                         │
│    await updateUserSubscription(                            │
│      "google-oauth2|123456789",                             │
│      {                                                       │
│        stripe_customer_id: "cus_PQRst123456789",            │
│        subscription_status: "premium",                      │
│        subscription_end_date: null  // será setado no       │
│                                      // próximo webhook      │
│      }                                                       │
│    );                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ PROBLEMA IDENTIFICADO!                                   │
│                                                              │
│  A função updateUserSubscription() é chamada mas            │
│  NÃO ESTÁ DEFINIDA no arquivo webhook.js!                   │
│                                                              │
│  ❌ BUG: Esta operação FALHA silenciosamente                │
│                                                              │
│  O que DEVERIA acontecer:                                   │
│  UPDATE user_profiles                                       │
│  SET                                                         │
│    stripe_customer_id = 'cus_PQRst123456789',               │
│    subscription_status = 'premium',                         │
│    updated_at = NOW()                                       │
│  WHERE auth0_id = 'google-oauth2|123456789';                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  16. STRIPE: Envia webhook → customer.subscription.created   │
│                                                              │
│  POST https://myapp.com/.netlify/functions/webhook          │
│  Body:                                                       │
│    {                                                         │
│      type: "customer.subscription.created",                 │
│      data: {                                                │
│        object: {                                            │
│          id: "sub_1234567890",                              │
│          status: "active",                                  │
│          current_period_end: 1735689600,  // Unix timestamp │
│          metadata: {                                        │
│            auth0_id: "google-oauth2|123456789"              │
│          }                                                   │
│        }                                                     │
│      }                                                       │
│    }                                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  17. NETLIFY FUNCTION: webhook.js                            │
│                                                              │
│  case 'customer.subscription.created':                      │
│    const endDate = new Date(                                │
│      subscription.current_period_end * 1000                 │
│    );                                                        │
│    // endDate = 2025-12-31T23:59:59Z                        │
│                                                              │
│    await updateUserSubscription(  // ❌ BUG: não existe     │
│      "google-oauth2|123456789",                             │
│      {                                                       │
│        subscription_status: "premium",                      │
│        subscription_end_date: "2025-12-31T23:59:59Z"        │
│      }                                                       │
│    );                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  18. STRIPE: Redireciona usuário                             │
│                                                              │
│  window.location.href =                                     │
│    "https://myapp.com/success?session_id=cs_test_abc123"    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  19. FRONTEND: Success.tsx                                   │
│                                                              │
│  - Mostra mensagem de sucesso                               │
│  - "✅ Pagamento confirmado!"                                │
│  - "Sua assinatura Premium está ativa"                      │
│  - Link para /dashboard                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  20. USUÁRIO: Volta ao Dashboard                             │
│                                                              │
│  ⚠️ MAS: Subscription status ainda mostra "free"!           │
│  Motivo: updateUserSubscription() não foi executado         │
└─────────────────────────────────────────────────────────────┘
```

### O Que DEVERIA Ser Gravado no Supabase (Upgrade)

**Após `checkout.session.completed`:**

```sql
UPDATE user_profiles
SET
  stripe_customer_id = 'cus_PQRst123456789',
  subscription_status = 'premium',
  updated_at = NOW()
WHERE auth0_id = 'google-oauth2|123456789';
```

**Após `customer.subscription.created`:**

```sql
UPDATE user_profiles
SET
  subscription_status = 'premium',
  subscription_end_date = '2025-12-31T23:59:59Z',  -- 1 mês depois
  updated_at = NOW()
WHERE auth0_id = 'google-oauth2|123456789';
```

**Estado Final Esperado:**

```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  auth0_id: "google-oauth2|123456789",
  name: "João Silva",
  email: "joao@example.com",
  phone: "5511999999999",
  birth_date: null,
  accept_marketing: true,
  provider: "google-oauth2",
  subscription_status: "premium",           // ✅ Atualizado
  subscription_end_date: "2025-12-31T23:59:59Z", // ✅ Setado
  stripe_customer_id: "cus_PQRst123456789", // ✅ Vinculado
  created_at: "2025-10-17T14:30:00Z",
  updated_at: "2025-10-17T15:45:00Z"        // ✅ Atualizado
}
```

---

## 🔔 FLUXO 4: WEBHOOKS DO STRIPE

### Eventos Tratados (Teoria)

| Evento Stripe | O Que Faz | Status Final |
|---------------|-----------|--------------|
| `checkout.session.completed` | Checkout finalizado | `subscription_status = 'premium'`<br>`stripe_customer_id` setado |
| `customer.subscription.created` | Assinatura criada | `subscription_end_date` setado |
| `customer.subscription.updated` | Assinatura renovada/alterada | Atualiza `subscription_status` e `subscription_end_date` |
| `customer.subscription.deleted` | Assinatura cancelada | `subscription_status = 'free'`<br>`subscription_end_date = null` |
| `invoice.paid` | Fatura paga (renovação) | Log (não implementado) |
| `invoice.payment_failed` | Pagamento falhou | Log (não implementado) |

### ⚠️ Problema: Função Ausente

**Arquivo:** `netlify/functions/webhook.js`

**Problema:** A função `updateUserSubscription()` é chamada 4 vezes mas NÃO EXISTE no código!

**Linhas afetadas:**
- Linha 42: `checkout.session.completed`
- Linha 57: `customer.subscription.created`
- Linha 74: `customer.subscription.updated`
- Linha 87: `customer.subscription.deleted`

**Impacto:** ❌ Webhooks do Stripe falham silenciosamente. Usuários pagam mas não ganham acesso Premium!

---

## 📊 OPERAÇÕES NO SUPABASE

### Resumo de Todas as Operações

| Operação | Quando | Query | Arquivo |
|----------|--------|-------|---------|
| **CREATE** | Novo registro (Auth0 callback) | `INSERT INTO user_profiles` | `save-user-data.js` |
| **READ** | Verificar se usuário existe | `SELECT * FROM user_profiles WHERE auth0_id = ?` | `save-user-data.js`<br>`check-subscription.js` |
| **UPDATE** | Login de usuário existente | `UPDATE user_profiles SET name, email... WHERE auth0_id = ?` | `save-user-data.js` |
| **UPDATE** | Webhook Stripe (deveria) | `UPDATE user_profiles SET subscription_status... WHERE auth0_id = ?` | ❌ **NÃO IMPLEMENTADO** |

### Query Completa: CREATE (Registro)

```sql
INSERT INTO user_profiles (
  auth0_id,
  name,
  email,
  phone,
  birth_date,
  accept_marketing,
  provider,
  subscription_status,
  subscription_end_date,
  stripe_customer_id,
  created_at,
  updated_at
) VALUES (
  $1,  -- auth0_id: "google-oauth2|123456789"
  $2,  -- name: "João Silva"
  $3,  -- email: "joao@example.com"
  $4,  -- phone: "5511999999999"
  $5,  -- birth_date: null
  $6,  -- accept_marketing: true
  $7,  -- provider: "google-oauth2"
  'free', -- subscription_status (padrão)
  NULL,   -- subscription_end_date
  NULL,   -- stripe_customer_id
  NOW(),  -- created_at
  NOW()   -- updated_at
)
RETURNING *;
```

### Query Completa: UPDATE (Login Existente)

```sql
UPDATE user_profiles
SET
  name = $1,                -- Atualiza caso tenha mudado
  email = $2,               -- Atualiza caso tenha mudado
  phone = $3,               -- Do registrationData (se houver)
  birth_date = $4,          -- Do registrationData (se houver)
  accept_marketing = $5,    -- Do registrationData (se houver)
  provider = $6,            -- Atualiza caso tenha mudado
  updated_at = NOW()
WHERE auth0_id = $7
RETURNING *;
```

### Query Completa: READ (Check Subscription)

```sql
SELECT
  subscription_status,
  subscription_end_date,
  stripe_customer_id
FROM user_profiles
WHERE auth0_id = $1
LIMIT 1;
```

### Query que DEVERIA Existir: UPDATE (Stripe Webhook)

```sql
-- Função que deveria estar implementada
CREATE OR REPLACE FUNCTION update_user_subscription(
  p_auth0_id TEXT,
  p_stripe_customer_id TEXT DEFAULT NULL,
  p_subscription_status TEXT DEFAULT NULL,
  p_subscription_end_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE(updated_user user_profiles)
AS $$
BEGIN
  RETURN QUERY
  UPDATE user_profiles
  SET
    stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id),
    subscription_status = COALESCE(p_subscription_status, subscription_status),
    subscription_end_date = COALESCE(p_subscription_end_date, subscription_end_date),
    updated_at = NOW()
  WHERE auth0_id = p_auth0_id
  RETURNING *;
END;
$$ LANGUAGE plpgsql;
```

---

## 🐛 PROBLEMAS IDENTIFICADOS

### 1. Função `updateUserSubscription` Não Existe ❌ CRÍTICO

**Arquivo:** `netlify/functions/webhook.js`

**Problema:**
```javascript
// Linha 42, 57, 74, 87
await updateUserSubscription(auth0_id, data);
// ❌ Esta função não está definida em nenhum lugar!
```

**Impacto:**
- Webhooks do Stripe falham
- Usuários pagam mas não ganham acesso
- `subscription_status` permanece como `free`
- `stripe_customer_id` não é vinculado
- Sistema de assinatura COMPLETAMENTE quebrado

**Solução Necessária:**

```javascript
// Adicionar no início de webhook.js, após o createClient

async function updateUserSubscription(auth0_id, updateData) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('auth0_id', auth0_id)
      .select();

    if (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }

    console.log('Subscription updated successfully:', data);
    return data[0];
  } catch (error) {
    console.error('Failed to update user subscription:', error);
    throw error;
  }
}
```

---

### 2. Estrutura da Tabela Supabase Não Documentada

**Problema:** Não sabemos com certeza:
- Se a tabela `user_profiles` existe
- Se tem todos os campos necessários
- Se há constraints (unique, not null, etc)
- Se há indexes adequados

**Recomendação:** Acessar Supabase Dashboard e verificar/criar a tabela

**SQL de Criação Sugerido:**

```sql
-- Criar tabela (se não existe)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth0_id TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  birth_date DATE,
  accept_marketing BOOLEAN DEFAULT FALSE,
  provider TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'cancelled')),
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth0_id ON user_profiles(auth0_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);

-- RLS (Row Level Security) - opcional mas recomendado
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Service role pode fazer tudo
CREATE POLICY "Service role full access" ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

---

### 3. Campos Ausentes no AuthCallback

**Problema:** O AuthCallback não envia alguns campos disponíveis:

**Campos disponíveis no Auth0 mas não salvos:**
- `picture` (URL da foto de perfil)
- `given_name` (primeiro nome)
- `family_name` (sobrenome)
- `locale` (idioma)
- `email_verified` (email verificado)

**Sugestão:** Expandir campos salvos para melhor experiência

---

### 4. Sem Tratamento de Erros de Rede

**Problema:** Se a Netlify Function falhar, o AuthCallback continua normalmente

```javascript
// AuthCallback.tsx linha 61
if (!saveResponse.ok) {
  console.error('Erro ao salvar dados do usuário:', await saveResponse.text());
}
// ⚠️ Apenas loga erro, não impede o fluxo
```

**Impacto:** Usuário pode fazer login mas dados não são salvos no Supabase

**Sugestão:** Adicionar retry logic ou mostrar erro ao usuário

---

## ✅ CHECKLIST DE CORREÇÕES NECESSÁRIAS

### Urgente (Bloqueia funcionalidades)
- [ ] **Implementar função `updateUserSubscription` em webhook.js**
- [ ] **Testar fluxo completo de upgrade para Premium**
- [ ] **Verificar/criar tabela `user_profiles` no Supabase**

### Importante (Melhora experiência)
- [ ] Adicionar retry logic no AuthCallback
- [ ] Salvar campos adicionais do Auth0 (picture, etc)
- [ ] Adicionar logs mais detalhados nos webhooks
- [ ] Implementar monitoring de falhas de webhook

### Desejável (Otimizações)
- [ ] Cache de subscription status (além de sessionStorage)
- [ ] Função para sincronizar manualmente com Stripe
- [ ] Admin panel para visualizar assinaturas
- [ ] Email de confirmação após upgrade

---

## 🎯 RESUMO EXECUTIVO

### O Que Está Funcionando ✅
1. **Registro de novos usuários** (Auth0 → Supabase)
2. **Login de usuários existentes** (Auth0 → Supabase)
3. **Verificação de subscription status** (Supabase → Frontend)
4. **Criação de checkout session** (Frontend → Stripe)
5. **Processamento de pagamento** (Stripe)

### O Que Está Quebrado ❌
1. **Webhooks do Stripe não atualizam Supabase**
   - Causa: Função `updateUserSubscription` não existe
   - Impacto: Usuários pagam mas não ganham acesso Premium

### Fluxo de Dados (Resumido)

```
REGISTRO:
Auth0 → localStorage → AuthCallback → Netlify Function → Supabase ✅

LOGIN:
Auth0 → AuthCallback → Netlify Function → Supabase (UPDATE) ✅

CHECK SUBSCRIPTION:
Frontend → Netlify Function → Supabase (SELECT) → sessionStorage ✅

UPGRADE:
Frontend → Netlify Function → Stripe Checkout ✅
Stripe → Webhook → Netlify Function → Supabase ❌ QUEBRADO

DADOS NO SUPABASE:
- auth0_id (ligação com Auth0) ✅
- name, email, phone (dados pessoais) ✅
- accept_marketing (preferências) ✅
- provider (método de login) ✅
- subscription_status (free/premium) ⚠️ Não atualiza
- subscription_end_date (data de expiração) ⚠️ Não seta
- stripe_customer_id (vínculo com Stripe) ⚠️ Não vincula
```

---

**📋 Este documento mapeia 100% do fluxo entre Auth0, Stripe e Supabase!**

**Próximo passo recomendado:** Corrigir o webhook.js adicionando a função `updateUserSubscription`.
