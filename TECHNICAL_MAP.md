# 🗺️ MAPA TÉCNICO COMPLETO - SemViagem (BuscadorReact)

> Documentação técnica detalhada da arquitetura, fluxos, APIs e estrutura do projeto
> Última atualização: Janeiro 2025

---

## 📋 **ÍNDICE**

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Estrutura de Pastas](#estrutura-de-pastas)
3. [Rotas e Navegação](#rotas-e-navegação)
4. [Contextos e Estado Global](#contextos-e-estado-global)
5. [Integrações de API](#integrações-de-api)
6. [Componentes Principais](#componentes-principais)
7. [Fluxos de Usuário (UX)](#fluxos-de-usuário-ux)
8. [Autenticação e Autorização](#autenticação-e-autorização)
9. [Sistema de Pagamentos](#sistema-de-pagamentos)
10. [Netlify Functions (Backend)](#netlify-functions-backend)

---

## 🏗️ **VISÃO GERAL DA ARQUITETURA**

### **Stack Tecnológica**

```
Frontend:
├── React 19 (UI framework)
├── TypeScript 5 (tipagem estática)
├── Vite 7 (bundler)
├── Tailwind CSS 4 (estilização)
├── React Router DOM 7 (navegação)
└── Radix UI (componentes acessíveis)

Backend/APIs:
├── Netlify Functions (serverless backend)
├── API Moblix (busca de voos)
├── Supabase (banco de dados + auth)
├── Stripe (pagamentos)
└── Auth0 (autenticação social)

Deploy:
└── Netlify (hosting + CI/CD + Edge Functions)
```

### **Fluxo de Dados**

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│   React App (Vite + TypeScript) │
│   ┌──────────────────────────┐  │
│   │ Contextos Globais        │  │
│   │ ├── AuthContext          │  │
│   │ ├── SelectionContext     │  │
│   │ └── TravelContext        │  │
│   └──────────────────────────┘  │
└────────┬────────┬────────┬──────┘
         │        │        │
         ▼        ▼        ▼
    ┌────────┬────────┬────────┐
    │ Moblix │ Stripe │Supabase│
    │  API   │  API   │   DB   │
    └────────┴────────┴────────┘
         ▲
         │
    ┌────────────────┐
    │ Netlify        │
    │ Functions      │
    │ (Proxy/API)    │
    └────────────────┘
```

---

## 📁 **ESTRUTURA DE PASTAS**

```
buscadorReact-main/
│
├── 📂 src/                          # Código-fonte principal
│   ├── 📂 pages/                    # Páginas da aplicação (33 páginas)
│   │   ├── Home.tsx                 # Landing page + busca de voos
│   │   ├── Dashboard.tsx            # Painel do usuário autenticado
│   │   ├── Premium.tsx              # Página de assinatura PRO
│   │   ├── Flights.tsx              # Busca de voos (área premium)
│   │   ├── FlightSearch.tsx         # Busca de voos (alternativa)
│   │   ├── Hotels.tsx               # Busca de hotéis
│   │   ├── About.tsx                # Sobre Júlio Martins
│   │   ├── Consultoria.tsx          # Serviços de consultoria
│   │   ├── Treinamentos.tsx         # Cursos e treinamentos
│   │   ├── AlertasImperdiveis.tsx   # Alertas de promoções
│   │   ├── GrupoExclusivo.tsx       # Grupo VIP
│   │   ├── Login.tsx                # Autenticação
│   │   ├── Register.tsx             # Cadastro
│   │   ├── Profile.tsx              # Perfil do usuário
│   │   ├── BookingManagement.tsx    # Gestão de reservas
│   │   ├── ClaudeThinkDemo.tsx      # Demo do Think Tool (NOVO)
│   │   └── ...                      # Outras páginas
│   │
│   ├── 📂 components/               # Componentes reutilizáveis
│   │   ├── Navbar.tsx               # Navegação principal
│   │   ├── ProtectedRoute.tsx       # Guard de rotas premium
│   │   ├── AuthenticatedRoute.tsx   # Guard de rotas autenticadas
│   │   ├── FlightResultCard.tsx     # Card de resultado de voo
│   │   ├── FlightResultsHome.tsx    # Lista de resultados (Home)
│   │   ├── AirportSearch.tsx        # Autocompletar aeroportos
│   │   ├── CustomCalendar.tsx       # Calendário de datas
│   │   ├── PremiumUpgradeModal.tsx  # Modal de upgrade
│   │   ├── SelectionModal.tsx       # Modal de seleção de voos
│   │   ├── StripeButton.tsx         # Botão de pagamento Stripe
│   │   └── 📂 ui/                   # Componentes Radix UI
│   │
│   ├── 📂 context/                  # Contextos React
│   │   ├── AuthContext.tsx          # Estado de autenticação
│   │   ├── SelectionContext.tsx     # Seleção de voos (ida/volta)
│   │   └── MoblixContext.tsx        # Estado da API Moblix
│   │
│   ├── 📂 services/                 # Serviços de API
│   │   ├── moblixApiService.ts      # Cliente API Moblix
│   │   ├── moblixAuth.ts            # Autenticação Moblix
│   │   ├── auth.ts                  # Autenticação Supabase
│   │   ├── apiService.ts            # Cliente HTTP genérico
│   │   ├── claudeThinkService.ts    # Serviço Think Tool (NOVO)
│   │   └── webhook.ts               # Webhooks Stripe
│   │
│   ├── 📂 hooks/                    # Custom hooks
│   │   ├── useSubscription.ts       # Status de assinatura
│   │   ├── useClaudeThink.ts        # Hook Think Tool (NOVO)
│   │   ├── useLocalStorage.ts       # Persistência local
│   │   └── use-toast.ts             # Sistema de notificações
│   │
│   ├── 📂 routes/                   # Configuração de rotas
│   │   └── AppRoutes.tsx            # Definição de todas as rotas
│   │
│   ├── 📂 config/                   # Configurações
│   │   ├── supabase.ts              # Config Supabase
│   │   ├── stripe.ts                # Config Stripe
│   │   └── auth0.ts                 # Config Auth0
│   │
│   ├── 📂 types/                    # Definições TypeScript
│   │   └── claude-think.ts          # Tipos Think Tool (NOVO)
│   │
│   ├── App.tsx                      # Componente raiz
│   └── main.tsx                     # Entry point
│
├── 📂 netlify/                      # Backend serverless
│   └── 📂 functions/                # Netlify Functions
│       ├── aereo.js                 # Proxy API Moblix (voos)
│       ├── moblix-api.js            # Proxy genérico Moblix
│       ├── check-subscription.js    # Verifica assinatura
│       ├── create-checkout-session.js # Cria sessão Stripe
│       ├── save-user-data.js        # Salva dados do usuário
│       ├── get-user-data.js         # Busca dados do usuário
│       └── webhook.js               # Webhook Stripe
│
├── 📂 components/                   # Componentes compartilhados
│   ├── FlightResults.tsx            # Resultados de voos
│   ├── FlightCard.tsx               # Card individual de voo
│   ├── SearchFilters.tsx            # Filtros de busca
│   ├── TravelProgress.tsx           # Barra de progresso
│   └── 📂 utils/                    # Utilitários
│       ├── fareCache.ts             # Cache de tarifas
│       └── fareMaximizer.ts         # Otimização de tarifas
│
├── 📂 contexts/                     # Contextos globais extras
│   └── TravelContext.tsx            # Contexto de viagem
│
├── 📂 hooks/                        # Hooks compartilhados
│   ├── use-mobile.ts                # Detecção mobile
│   └── useLocalStorage.ts           # Storage hook
│
├── 📂 public/                       # Assets estáticos
│   ├── 📂 images/                   # Imagens
│   └── 📂 logos/                    # Logos de companhias aéreas
│
├── 📂 scripts/                      # Scripts de automação
│   └── ...                          # Scripts de deploy
│
├── package.json                     # Dependências
├── vite.config.js                   # Config Vite
├── tailwind.config.js               # Config Tailwind
├── tsconfig.json                    # Config TypeScript
├── netlify.toml                     # Config Netlify
└── README.md                        # Documentação

```

---

## 🛣️ **ROTAS E NAVEGAÇÃO**

### **Arquivo Principal de Rotas**
📄 [src/routes/AppRoutes.tsx](src/routes/AppRoutes.tsx)

### **Categorias de Rotas**

#### **🌐 PÚBLICAS** (sem autenticação)
```tsx
/                      → Home (landing page + busca)
/sobre                 → About (Júlio Martins)
/depoimentos           → Testimonials
/fale-comigo           → FaleComigo (contato)
/alertas-imperdiveis   → AlertasImperdiveis
/treinamentos          → Treinamentos
/consultoria           → Consultoria
/grupo-exclusivo       → GrupoExclusivo
/teste                 → TestPage
/test-airport          → TestAirportSearch
/fare-test             → FareTestPage
/claude-think-demo     → ClaudeThinkDemo (NOVO)
```

#### **🔐 AUTENTICADAS** (requer login, mas não assinatura)
```tsx
/dashboard             → Dashboard
/profile               → Profile
/premium               → Premium (página de assinatura)
```

#### **👤 GUEST ONLY** (apenas não autenticados)
```tsx
/register              → Register
/login                 → Login
/forgot-password       → ForgotPassword
```

#### **💎 PREMIUM** (requer assinatura ativa)
```tsx
/moblix-dashboard      → MoblixDashboard
/search                → HotelSearch
/flights               → Flights
/flight-search         → FlightSearch
/hotels                → Hotels
/ofertas               → FlightOffers
/bookings              → BookingManagement
/dashboard/clients/new → AddClient
```

#### **💳 PAGAMENTO** (Stripe)
```tsx
/checkout              → CheckoutDemo
/success               → Success (pós-pagamento)
/cancel                → Cancel (cancelamento)
/summary               → Summary
```

#### **🔄 REDIRECIONAMENTOS**
```tsx
/area-logada           → redireciona para /dashboard
/*                     → redireciona para / (404 handler)
```

### **Guards de Rota**

#### **ProtectedRoute**
📄 [src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx)

```typescript
Fluxo:
1. Verifica se está autenticado
   └── NÃO → Redireciona para /login
2. Verifica se tem assinatura ativa
   └── NÃO → Redireciona para /premium
3. Renderiza conteúdo protegido
```

#### **AuthenticatedRoute**
📄 [src/components/AuthenticatedRoute.tsx](src/components/AuthenticatedRoute.tsx)

```typescript
Fluxo:
1. Verifica se está autenticado
   └── NÃO → Redireciona para /login
2. Renderiza conteúdo
```

#### **GuestRoute**
📄 [src/routes/AppRoutes.tsx:40-52](src/routes/AppRoutes.tsx#L40-L52)

```typescript
Fluxo:
1. Verifica se está autenticado
   └── SIM → Redireciona para /dashboard
2. Renderiza página de login/registro
```

---

## 🧠 **CONTEXTOS E ESTADO GLOBAL**

### **1. AuthContext**
📄 [src/context/AuthContext.tsx](src/context/AuthContext.tsx)

**Responsabilidade:** Gerenciar autenticação com Auth0

```typescript
interface AuthContextType {
  user: User | null;              // Dados do usuário Auth0
  isAuthenticated: boolean;       // Se está logado
  isInitialized: boolean;         // Se Auth0 carregou
  isLoading: boolean;             // Estado de loading
  signOut: () => Promise<void>;   // Função de logout
  getAccessToken: () => Promise<string | undefined>;
  processPendingRegistration: () => void;
}
```

**Funcionalidades:**
- ✅ Autenticação com Auth0
- ✅ Gerenciamento de sessão
- ✅ Toast de boas-vindas
- ✅ Verificação de assinatura após login
- ✅ Redirecionamento para Stripe se não tiver assinatura
- ✅ Persistência de dados de registro pendente

**Uso:**
```tsx
const { user, isAuthenticated, signOut } = useAuth();
```

---

### **2. SelectionContext**
📄 [src/context/SelectionContext.tsx](src/context/SelectionContext.tsx)

**Responsabilidade:** Gerenciar seleção de voos (ida + volta)

```typescript
interface SelectionContextValue {
  selected: {
    outbound: Flight | null;   // Voo de ida selecionado
    return: Flight | null;     // Voo de volta selecionado
  };
  setOutbound: (flight: Flight | null) => void;
  setReturn: (flight: Flight | null) => void;
  clear: () => void;           // Limpar seleção
}
```

**Funcionalidades:**
- ✅ Persistência em localStorage
- ✅ Sincronização entre páginas
- ✅ Suporte a voos de ida e volta
- ✅ Hydration automática ao carregar

**Uso:**
```tsx
const { selected, setOutbound, setReturn, clear } = useSelection();
```

---

### **3. TravelContext**
📄 [contexts/TravelContext.tsx](contexts/TravelContext.tsx)

**Responsabilidade:** Gerenciar contexto completo de viagem

```typescript
interface TravelContextValue {
  searchData: SearchData;
  setSearchData: (data: SearchData) => void;
  selectedOutbound: Flight | null;
  selectedReturn: Flight | null;
  setSelectedOutbound: (flight: Flight) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isRoundTrip: boolean;
  needsReturnFlight: boolean;
  getReverseRoute: () => ReverseRoute;
}
```

**Funcionalidades:**
- ✅ Dados de busca (origem, destino, datas)
- ✅ Controle de steps (busca → seleção → pagamento)
- ✅ Detecção de ida e volta
- ✅ Inversão de rota para busca de volta

---

## 🔌 **INTEGRAÇÕES DE API**

### **1. API MOBLIX** (Busca de Voos)

#### **Serviço Principal**
📄 [src/services/moblixApiService.ts](src/services/moblixApiService.ts)

**Endpoints:**

```typescript
1. Autenticação
   POST /api/usuario/autenticar
   Body: { username, password }
   Response: { Token: string }

2. Busca de Voos
   POST /api/ConsultaAereo/Consultar
   Body: {
     Origem: string,      // Código IATA (ex: GRU)
     Destino: string,     // Código IATA (ex: LIS)
     DataIda: string,     // YYYY-MM-DD
     DataVolta: string,   // YYYY-MM-DD (opcional)
     Adultos: number,
     Criancas: number,
     Bebes: number,
     Companhia: number,   // -1 = todas, 1 = LATAM, etc
     Classe: number,      // 0 = econômica, 1 = executiva
     TipoViagem: string   // "IDA" ou "IDA_VOLTA"
   }
   Response: {
     Success: boolean,
     Data: [{
       Ida: Flight[],
       Volta: Flight[],
       TokenConsulta: string
     }]
   }

3. Consultar Tarifas
   POST /api/ConsultaAereo/ConsultarTarifa
   Body: {
     Token: string,
     IdViagem: string
   }
   Response: {
     Tarifas: Tarifa[]
   }

4. Buscar Aeroportos
   GET /api/Aeroporto/Buscar?pesquisa={query}
   Response: Airport[]
```

**Credenciais:**
```javascript
Username: 'TooGood'
Password: '23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7'
```

**Proxy via Netlify:**
📄 [netlify/functions/aereo.js](netlify/functions/aereo.js)

```javascript
// Desenvolvimento: API direta (com CORS: Origin: externo)
const API_URL = 'https://api.moblix.com.br'

// Produção: Netlify Function (proxy sem CORS)
const API_URL = '/.netlify/functions/aereo'
```

---

### **2. SUPABASE** (Banco de Dados + Auth)

#### **Configuração**
📄 [src/config/supabase.ts](src/config/supabase.ts)

```typescript
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
```

**Tabelas:**

```sql
1. users
   - id: UUID (PK)
   - auth0_id: string (Auth0 sub)
   - email: string
   - name: string
   - created_at: timestamp
   - updated_at: timestamp

2. subscriptions
   - id: UUID (PK)
   - user_id: UUID (FK → users)
   - stripe_customer_id: string
   - stripe_subscription_id: string
   - status: string (active, canceled, past_due)
   - current_period_end: timestamp
   - created_at: timestamp
   - updated_at: timestamp

3. bookings
   - id: UUID (PK)
   - user_id: UUID (FK → users)
   - flight_data: jsonb
   - status: string
   - created_at: timestamp
```

**Netlify Functions:**

```javascript
1. check-subscription.js
   GET /.netlify/functions/check-subscription?auth0_id={id}
   → Verifica se usuário tem assinatura ativa

2. save-user-data.js
   POST /.netlify/functions/save-user-data
   → Salva/atualiza dados do usuário

3. get-user-data.js
   GET /.netlify/functions/get-user-data?auth0_id={id}
   → Busca dados do usuário
```

---

### **3. STRIPE** (Pagamentos)

#### **Configuração**
📄 [src/config/stripe.ts](src/config/stripe.ts)

```typescript
const stripePublicKey = process.env.VITE_STRIPE_PUBLIC_KEY
```

**Fluxo de Pagamento:**

```
1. Usuário clica em "Assinar Agora"
   ↓
2. Frontend chama Netlify Function
   POST /.netlify/functions/create-checkout-session
   Body: {
     priceId: 'price_1RfmLZRtN3YwSDWn5pXFxsGQ',
     userId: user.sub
   }
   ↓
3. Stripe cria sessão de checkout
   Response: { sessionId, url }
   ↓
4. Redireciona usuário para Stripe Checkout
   window.location.href = url
   ↓
5. Usuário paga no Stripe
   ↓
6. Stripe envia webhook para Netlify
   POST /.netlify/functions/webhook
   Event: checkout.session.completed
   ↓
7. Netlify Function salva assinatura no Supabase
   ↓
8. Stripe redireciona para /success
```

**Preços:**
```javascript
Plano PRO: R$ 29,99/mês
Price ID: 'price_1RfmLZRtN3YwSDWn5pXFxsGQ'
Link direto: 'https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI02'
```

---

### **4. AUTH0** (Autenticação Social)

#### **Configuração**
📄 [src/config/auth0.ts](src/config/auth0.ts)

```typescript
domain: process.env.VITE_AUTH0_DOMAIN
clientId: process.env.VITE_AUTH0_CLIENT_ID
redirectUri: window.location.origin + '/dashboard'
```

**Providers:**
- Google
- Facebook
- Email/Password

**Fluxo:**
```
1. Usuário clica em "Login com Google"
   ↓
2. Auth0 abre popup de autenticação
   ↓
3. Usuário autoriza
   ↓
4. Auth0 retorna token JWT
   ↓
5. AuthContext salva dados do usuário
   ↓
6. Verifica assinatura no Supabase
   ↓
7. Redireciona para /dashboard ou /premium
```

---

## 🧩 **COMPONENTES PRINCIPAIS**

### **Componentes de Busca**

#### **1. AirportSearch**
📄 [src/components/AirportSearch.tsx](src/components/AirportSearch.tsx)

**Funcionalidade:** Autocompletar de aeroportos

```typescript
Features:
- Busca por país, cidade ou código IATA
- Debounce de 300ms
- Cache de resultados
- Agrupamento por cidade (múltiplos aeroportos)
- Destaque de termo pesquisado
- Bandeiras de países

API:
GET /api/Aeroporto/Buscar?pesquisa={query}
```

#### **2. CustomCalendar**
📄 [src/components/CustomCalendar.tsx](src/components/CustomCalendar.tsx)

**Funcionalidade:** Seletor de datas

```typescript
Features:
- Navegação entre meses
- Destaque de data selecionada
- Bloqueio de datas passadas
- Sugestão automática de data de volta (+7 dias)
- Validação de data de volta > data de ida
```

#### **3. SearchFilters**
📄 [components/SearchFilters.tsx](components/SearchFilters.tsx)

**Funcionalidade:** Filtros de resultados

```typescript
Filtros disponíveis:
- Passageiros (adultos, crianças, bebês)
- Tipo de pagamento (dinheiro, milhas, ambos)
- Ordenação (preço, duração, horário)
- Tipo de viagem (ida, ida e volta)
- Companhia aérea
- Número de escalas
```

---

### **Componentes de Resultados**

#### **4. FlightResultCard**
📄 [src/components/FlightResultCard.tsx](src/components/FlightResultCard.tsx)

**Funcionalidade:** Card individual de voo

```typescript
Exibe:
- Logo da companhia aérea
- Número do voo
- Origem → Destino
- Horários (saída/chegada)
- Duração total
- Número de escalas
- Preço (dinheiro ou milhas)
- Botão "Selecionar"

States:
- Normal
- Selecionado (borda verde)
- Loading (spinner)
```

#### **5. FlightResults / FlightResultsHome**
📄 [components/FlightResults.tsx](components/FlightResults.tsx)
📄 [src/components/FlightResultsHome.tsx](src/components/FlightResultsHome.tsx)

**Funcionalidade:** Lista completa de resultados

```typescript
Features:
- Separação ida/volta
- Filtros aplicados
- Ordenação
- Paginação
- Loading states
- Empty states
- Erro handling
```

---

### **Componentes de Modal**

#### **6. PremiumUpgradeModal**
📄 [src/components/PremiumUpgradeModal.tsx](src/components/PremiumUpgradeModal.tsx)

**Trigger:** Usuário tenta acessar feature premium sem assinatura

```typescript
Exibe:
- Mensagem de upgrade
- Benefícios do plano PRO
- Botão "Assinar Agora" (→ Stripe)
- Botão "Fechar"
```

#### **7. SelectionModal**
📄 [src/components/SelectionModal.tsx](src/components/SelectionModal.tsx)

**Trigger:** Usuário seleciona voo de ida (em viagem ida e volta)

```typescript
Exibe:
- Voo de ida selecionado
- Opção de buscar volta
- Resumo de preços
- Botão "Escolher volta"
```

#### **8. FlightFaresModal**
📄 [components/FlightFaresModal.tsx](components/FlightFaresModal.tsx)

**Trigger:** Usuário clica em "Ver tarifas"

```typescript
Exibe:
- Tarifas disponíveis (Light, Plus, Flex)
- Diferenças entre tarifas
- Bagagens inclusas
- Políticas de cancelamento
- Botão "Selecionar tarifa"
```

---

### **Componentes de Layout**

#### **9. Navbar**
📄 [src/components/Navbar.tsx](src/components/Navbar.tsx)

**Estrutura:**

```typescript
Desktop:
├── Logo (link para /)
├── Menu
│   ├── Buscar (scroll to #buscar)
│   ├── Sobre (scroll to #sobre)
│   ├── Depoimentos (/depoimentos)
│   ├── Consultoria (/consultoria)
│   └── Contato (/fale-comigo)
└── Auth
    ├── [Não autenticado] Login | Cadastrar
    └── [Autenticado] Avatar + Dropdown
        ├── Dashboard
        ├── Buscar voos
        ├── Ofertas
        ├── Perfil
        └── Sair

Mobile:
└── Hamburger menu (tudo acima em drawer)
```

**Features:**
- Sticky top
- Scroll smooth para seções da Home
- Dropdown de usuário com avatar
- Iniciais do usuário se não tiver foto
- Estado de loading

---

## 🎯 **FLUXOS DE USUÁRIO (UX)**

### **FLUXO 1: Busca de Voo (Usuário Novo)**

```
1. Usuário acessa / (Home)
   ↓
2. Preenche formulário de busca
   - Origem (autocompletar)
   - Destino (autocompletar)
   - Data de ida (calendar)
   - Data de volta (calendar, opcional)
   - Passageiros
   - Classe
   ↓
3. Clica em "Buscar Voos"
   ↓
4. [Loading] Consultando API Moblix...
   - Mensagens rotativas
   - Barra de progresso
   ↓
5. Resultados exibidos na Home
   ↓
6. Usuário clica em "Selecionar" em um voo
   ↓
7. [BLOQUEIO] Modal de Premium Upgrade
   "Para selecionar voos, assine o plano PRO"
   ↓
8. Usuário clica em "Assinar Agora"
   ↓
9. Redireciona para /premium
   ↓
10. [Se não autenticado] Redireciona para /login
    ↓
11. Login com Google/Facebook/Email
    ↓
12. Retorna para /premium
    ↓
13. Clica em "Comprar Agora!"
    ↓
14. Redireciona para Stripe Checkout
    ↓
15. Paga assinatura
    ↓
16. Stripe redireciona para /success
    ↓
17. Webhook salva assinatura no Supabase
    ↓
18. Usuário agora é PRO! 🎉
```

---

### **FLUXO 2: Busca de Voo (Usuário PRO)**

```
1. Usuário autenticado e PRO acessa / ou /flights
   ↓
2. Preenche formulário de busca
   ↓
3. Clica em "Buscar Voos"
   ↓
4. [Loading] Consultando API Moblix...
   ↓
5. Resultados exibidos
   ↓
6. [Se ida e volta] Usuário seleciona voo de IDA
   ↓
7. SelectionContext.setOutbound(flight)
   ↓
8. Página scrolla para resultados de VOLTA
   ↓
9. Usuário seleciona voo de VOLTA
   ↓
10. SelectionContext.setReturn(flight)
    ↓
11. SummarySection aparece no topo
    "Voo de ida selecionado | Voo de volta selecionado"
    ↓
12. Usuário clica em "Finalizar Seleção"
    ↓
13. Redireciona para /summary
    ↓
14. Exibe resumo completo:
    - Voo de ida (detalhes, escalas, horários)
    - Voo de volta (detalhes, escalas, horários)
    - Preço total
    - Passageiros
    ↓
15. Botão "Comprar na Companhia Aérea"
    ↓
16. Abre CompanyRedirectModal
    "Você será redirecionado para [COMPANHIA]"
    ↓
17. window.open(urlCompanhia)
```

---

### **FLUXO 3: Gerenciamento de Assinatura**

```
1. Usuário PRO acessa /profile
   ↓
2. Seção "Minha Assinatura"
   ├── Status: Ativa ✅
   ├── Plano: PRO (R$ 29,99/mês)
   ├── Próxima cobrança: 15/02/2025
   └── Botão "Gerenciar Assinatura"
   ↓
3. Clica em "Gerenciar Assinatura"
   ↓
4. Redireciona para Stripe Customer Portal
   ↓
5. Usuário pode:
   - Atualizar método de pagamento
   - Cancelar assinatura
   - Ver histórico de cobranças
   ↓
6. Stripe envia webhook de atualização
   ↓
7. Netlify Function atualiza Supabase
```

---

## 🔒 **AUTENTICAÇÃO E AUTORIZAÇÃO**

### **Níveis de Acesso**

```
┌─────────────────────────────────────┐
│  PÚBLICO                            │
│  - Home, About, Consultoria, etc    │
│  - Pode buscar voos (read-only)     │
└─────────────────────────────────────┘
           │ Login
           ▼
┌─────────────────────────────────────┐
│  AUTENTICADO                        │
│  - Dashboard, Profile               │
│  - Ainda não pode selecionar voos   │
└─────────────────────────────────────┘
           │ Assinatura PRO
           ▼
┌─────────────────────────────────────┐
│  PREMIUM (PRO)                      │
│  - Todas funcionalidades            │
│  - Busca ilimitada                  │
│  - Seleção de voos                  │
│  - Alertas inteligentes             │
│  - Consultoria IA (futuro)          │
└─────────────────────────────────────┘
```

### **Verificação de Acesso**

#### **1. No Frontend (Guards)**

```typescript
// ProtectedRoute.tsx
useEffect(() => {
  const checkSubscription = async () => {
    const response = await fetch(
      `/.netlify/functions/check-subscription?auth0_id=${user.sub}`
    );
    const { hasActiveSubscription } = await response.json();

    if (!hasActiveSubscription) {
      navigate('/premium');
    }
  };

  checkSubscription();
}, [user]);
```

#### **2. No Backend (Netlify Functions)**

```javascript
// check-subscription.js
exports.handler = async (event) => {
  const { auth0_id } = event.queryStringParameters;

  // Busca usuário no Supabase
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth0_id', auth0_id)
    .single();

  if (!user) {
    return { statusCode: 404 };
  }

  // Busca assinatura ativa
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  return {
    statusCode: 200,
    body: JSON.stringify({
      hasActiveSubscription: !!subscription
    })
  };
};
```

---

## 💳 **SISTEMA DE PAGAMENTOS**

### **Stripe Checkout Flow**

#### **1. Criação de Sessão**
📄 [netlify/functions/create-checkout-session.js](netlify/functions/create-checkout-session.js)

```javascript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  payment_method_types: ['card'],
  line_items: [{
    price: priceId, // price_1RfmLZRtN3YwSDWn5pXFxsGQ
    quantity: 1,
  }],
  success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/cancel`,
  customer_email: userEmail,
  metadata: {
    auth0_id: userId,
  },
});
```

#### **2. Webhook Handler**
📄 [netlify/functions/webhook.js](netlify/functions/webhook.js)

**Eventos Tratados:**

```javascript
1. checkout.session.completed
   → Salva assinatura inicial no Supabase

2. customer.subscription.updated
   → Atualiza status da assinatura

3. customer.subscription.deleted
   → Marca assinatura como cancelada

4. invoice.payment_failed
   → Marca assinatura como past_due
```

**Exemplo:**

```javascript
if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  const { auth0_id } = session.metadata;

  // Busca usuário
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth0_id', auth0_id)
    .single();

  // Salva assinatura
  await supabase.from('subscriptions').insert({
    user_id: user.id,
    stripe_customer_id: session.customer,
    stripe_subscription_id: session.subscription,
    status: 'active',
    current_period_end: new Date(session.subscription.current_period_end * 1000),
  });
}
```

---

## ☁️ **NETLIFY FUNCTIONS (BACKEND)**

### **Funções Disponíveis**

```javascript
📂 netlify/functions/

├── aereo.js                    # Proxy API Moblix (voos)
│   POST /.netlify/functions/aereo
│   Body: { path, body, method }
│
├── moblix-api.js               # Proxy genérico Moblix
│   ANY /.netlify/functions/moblix-api/*
│
├── check-subscription.js       # Verifica assinatura ativa
│   GET /.netlify/functions/check-subscription?auth0_id={id}
│   Response: { hasActiveSubscription: boolean }
│
├── create-checkout-session.js  # Cria sessão Stripe
│   POST /.netlify/functions/create-checkout-session
│   Body: { priceId, userId, userEmail }
│   Response: { sessionId, url }
│
├── save-user-data.js           # Salva dados do usuário
│   POST /.netlify/functions/save-user-data
│   Body: { userData, registrationData }
│
├── get-user-data.js            # Busca dados do usuário
│   GET /.netlify/functions/get-user-data?auth0_id={id}
│   Response: { user }
│
└── webhook.js                  # Webhook Stripe
    POST /.netlify/functions/webhook
    Headers: stripe-signature
    Body: Stripe Event
```

### **Variáveis de Ambiente (Netlify)**

```bash
# Supabase
VITE_SUPABASE_URL=https://vqflmhngywnbravitxxl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_service_role_...

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Auth0
VITE_AUTH0_DOMAIN=dev-xxx.auth0.com
VITE_AUTH0_CLIENT_ID=xxx...

# Moblix
MOBLIX_USERNAME=TooGood
MOBLIX_PASSWORD=23a01acf...
```

---

## 🎨 **DESIGN SYSTEM**

### **Cores Principais**

```css
/* Brand Colors */
--primary: #060D1C      /* Azul escuro (textos, backgrounds) */
--secondary: #F0C72F    /* Amarelo (CTAs, destaques) */
--accent: #4A90E2       /* Azul claro (links, icons) */

/* Status Colors */
--success: #10B981      /* Verde (sucesso, confirmação) */
--error: #EF4444        /* Vermelho (erro, cancelamento) */
--warning: #F59E0B      /* Laranja (avisos) */
--info: #3B82F6         /* Azul (informações) */

/* Neutral Colors */
--gray-50: #F9FAFB
--gray-100: #F3F4F6
--gray-200: #E5E7EB
--gray-300: #D1D5DB
--gray-400: #9CA3AF
--gray-500: #6B7280
--gray-600: #4B5563
--gray-700: #374151
--gray-800: #1F2937
--gray-900: #111827
```

### **Tipografia**

```css
/* Font Family */
font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
```

### **Componentes UI (Radix UI)**

```
📂 src/components/ui/
├── button.tsx
├── input.tsx
├── select.tsx
├── dialog.tsx (modais)
├── dropdown-menu.tsx
├── toast.tsx (notificações)
├── card.tsx
├── badge.tsx
├── calendar.tsx
├── accordion.tsx
└── ... (40+ componentes)
```

---

## 📊 **MÉTRICAS E ANALYTICS**

### **Eventos Rastreados (Futuro)**

```typescript
// Eventos de busca
analytics.track('flight_search', {
  origin: 'GRU',
  destination: 'LIS',
  departure_date: '2025-03-15',
  passengers: 2,
  trip_type: 'roundtrip'
});

// Eventos de conversão
analytics.track('flight_selected', { ... });
analytics.track('subscription_started', { plan: 'pro' });
analytics.track('payment_completed', { amount: 29.99 });
```

---

## 🐛 **DEBUG E LOGS**

### **Console Logs Úteis**

```javascript
// Moblix API
console.log('🛫 Consultando API Moblix:', payload);
console.log('✅ Resultados recebidos:', response.data);

// Autenticação
console.log('👤 Usuário autenticado:', user);
console.log('💎 Status Premium:', hasSubscription);

// Seleção de voos
console.log('✈️ Voo de ida selecionado:', outbound);
console.log('🔄 Voo de volta selecionado:', return);
```

---

## 📝 **NOTAS IMPORTANTES**

### **Limitações Conhecidas**

1. **API Moblix:**
   - Timeout após 30 segundos
   - LATAM: funciona ✅
   - GOL/Azul: temporariamente indisponíveis ⚠️
   - Limite de 100 requisições/hora

2. **Assinatura:**
   - Apenas 1 plano disponível (PRO R$29,99/mês)
   - Não há plano anual (ainda)

3. **Pagamento:**
   - Apenas cartão de crédito (Stripe)
   - Sem PIX ou boleto (por enquanto)

### **TODOs Futuros**

- [ ] Adicionar busca de hotéis
- [ ] Implementar sistema de alertas inteligentes
- [ ] Integrar Claude Think Tool para consultoria IA
- [ ] Adicionar histórico de buscas
- [ ] Salvar voos favoritos
- [ ] Sistema de indicação/afiliados
- [ ] App mobile (React Native)

---

## 🔗 **LINKS ÚTEIS**

- **Produção:** https://extraordinary-starship-9103ce.netlify.app
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Auth0 Dashboard:** https://manage.auth0.com
- **Netlify Dashboard:** https://app.netlify.com

---

**Última atualização:** Janeiro 2025
**Versão:** 4.0
**Desenvolvedor:** Bruno/Felipe
**Cliente:** Júlio Martins - SemViagem

---

*Este documento é um mapa vivo e será atualizado conforme o projeto evolui.*
