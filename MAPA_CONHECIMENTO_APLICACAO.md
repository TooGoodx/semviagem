# 🗺️ MAPA DE CONHECIMENTO - APLICAÇÃO COMPLETA

**Data de Criação:** 2025-10-17
**Projeto:** buscadorReact (Sistema de Busca de Voos e Milhas)
**Versão:** 0.1.0
**Status:** Produção (https://extraordinary-starship-9103ce.netlify.app)

---

## 📋 ÍNDICE
1. [Visão Geral](#visão-geral)
2. [Arquitetura Técnica](#arquitetura-técnica)
3. [Estrutura de Pastas](#estrutura-de-pastas)
4. [Stack Tecnológico](#stack-tecnológico)
5. [Sistema de Rotas](#sistema-de-rotas)
6. [Páginas e Funcionalidades](#páginas-e-funcionalidades)
7. [Componentes](#componentes)
8. [Serviços e APIs](#serviços-e-apis)
9. [Autenticação e Autorização](#autenticação-e-autorização)
10. [Integrações Externas](#integrações-externas)
11. [Fluxos Principais](#fluxos-principais)
12. [Configurações](#configurações)
13. [Deploy e Infraestrutura](#deploy-e-infraestrutura)

---

## 🎯 VISÃO GERAL

### Propósito
Sistema especializado em **busca de voos com foco em milhas**, desenvolvido para consultores e especialistas em programas de fidelidade aérea.

### Principais Funcionalidades
- 🔍 Busca de voos (dinheiro e milhas)
- 💰 Comparação de preços entre companhias
- 🎯 Sistema de assinatura Premium (via Stripe)
- 👤 Gestão de clientes
- 📊 Dashboard com estatísticas
- 🤖 Integração com Claude AI (ClaudeThink)
- 📧 Sistema de notificações e alertas

### Público-Alvo
- Consultores de milhas profissionais
- Agentes de viagem especializados
- Usuários avançados de programas de fidelidade

---

## 🏗️ ARQUITETURA TÉCNICA

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌─────────────┐          │
│  │   Pages    │  │ Components │  │   Hooks     │          │
│  └────────────┘  └────────────┘  └─────────────┘          │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌─────────────┐          │
│  │  Services  │  │  Context   │  │   Utils     │          │
│  └────────────┘  └────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     CAMADA DE API                            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Netlify    │  │  Moblix API  │  │   Auth0      │     │
│  │  Functions   │  │  (Voos)      │  │  (Auth)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Supabase   │  │    Stripe    │  │   Netlify    │     │
│  │  (Database)  │  │  (Payments)  │  │  (Deploy)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Padrões Arquiteturais
- **SPA (Single Page Application)** com React Router
- **Component-Based Architecture** (React)
- **Context API** para gerenciamento de estado global
- **Serverless Functions** (Netlify Functions)
- **JAMstack** (JavaScript, APIs, Markup)

---

## 📁 ESTRUTURA DE PASTAS

```
buscadorReact-main/
├── 📂 src/                          # Código-fonte principal
│   ├── 📂 pages/                    # Páginas da aplicação (37 arquivos)
│   │   ├── Home.tsx                 # Landing page principal
│   │   ├── Dashboard.tsx            # Dashboard do usuário
│   │   ├── Login.tsx                # Página de login
│   │   ├── Register.tsx             # Página de registro
│   │   ├── AuthCallback.tsx         # Callback Auth0 ✅ CORRIGIDO
│   │   ├── FlightSearch.tsx         # Busca de voos
│   │   ├── Premium.tsx              # Página de upgrade premium
│   │   ├── Profile.tsx              # Perfil do usuário
│   │   ├── ClaudeThinkDemo.tsx      # Demo do Claude AI
│   │   └── ...                      # + 28 outras páginas
│   │
│   ├── 📂 components/               # Componentes reutilizáveis (25+ arquivos)
│   │   ├── Navbar.tsx               # Barra de navegação
│   │   ├── ProtectedRoute.tsx       # Rota protegida (premium)
│   │   ├── AuthenticatedRoute.tsx   # Rota autenticada
│   │   ├── AirportSearch.tsx        # Busca de aeroportos
│   │   ├── FlightResultCard.tsx     # Card de resultado de voo
│   │   ├── 📂 auth/                 # Componentes de autenticação
│   │   ├── 📂 onboarding/           # Componentes de onboarding
│   │   └── 📂 ui/                   # Componentes UI (Radix + shadcn)
│   │
│   ├── 📂 services/                 # Serviços e APIs (12 arquivos)
│   │   ├── auth.ts                  # Serviço de autenticação
│   │   ├── moblixApiService.ts      # API Moblix (voos)
│   │   ├── claudeThinkService.ts    # Serviço Claude AI
│   │   ├── apiService.ts            # Cliente API genérico
│   │   ├── moblixAuth.ts            # Auth Moblix
│   │   └── webhook.ts               # Webhooks (Stripe)
│   │
│   ├── 📂 config/                   # Configurações
│   │   ├── auth0.ts                 # Config Auth0
│   │   ├── supabase.ts              # Config Supabase
│   │   └── stripe.ts                # Config Stripe
│   │
│   ├── 📂 context/                  # Context API (3 arquivos)
│   │   ├── AuthContext.tsx          # Contexto de autenticação
│   │   ├── MoblixContext.tsx        # Contexto Moblix
│   │   └── SelectionContext.tsx     # Contexto de seleção
│   │
│   ├── 📂 routes/                   # Sistema de rotas
│   │   └── AppRoutes.tsx            # Definição de todas as rotas
│   │
│   ├── 📂 hooks/                    # Custom Hooks (3 arquivos)
│   │   ├── useClaudeThink.ts        # Hook Claude AI
│   │   ├── useSubscription.ts       # Hook de assinatura
│   │   └── useLocalStorage.ts       # Hook localStorage
│   │
│   ├── 📂 types/                    # TypeScript types
│   │   └── claude-think.ts          # Types Claude AI
│   │
│   ├── 📂 utils/                    # Utilitários
│   │   └── airlineLogos.ts          # Logos de companhias
│   │
│   ├── 📂 data/                     # Dados estáticos
│   │   └── airports.ts              # Lista de aeroportos
│   │
│   ├── 📂 constants/                # Constantes
│   │   └── airlines.js              # Constantes de companhias
│   │
│   ├── 📂 styles/                   # Estilos globais
│   │   └── designSystem.ts          # Sistema de design
│   │
│   ├── App.tsx                      # Componente raiz
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Estilos globais CSS
│
├── 📂 netlify/                      # Netlify Functions
│   ├── 📂 functions/                # Serverless functions (8 arquivos)
│   │   ├── moblix-api.js            # Proxy Moblix API
│   │   ├── save-user-data.js        # Salvar dados usuário
│   │   ├── check-subscription.js    # Verificar assinatura
│   │   ├── create-checkout-session.js # Criar sessão Stripe
│   │   └── webhook.js               # Webhooks Stripe
│   └── 📂 edge-functions/           # Edge functions
│
├── 📂 components/                   # Next.js components (legacy?)
│   ├── 📂 ui/                       # Componentes shadcn/ui (50+ arquivos)
│   └── 📂 utils/                    # Utils de componentes
│
├── 📂 scripts/                      # Scripts de automação (15 arquivos)
│   ├── auto-configure-auth0.js      # Config automática Auth0
│   ├── setup-auth0.js               # Setup Auth0
│   ├── configure-netlify.js         # Config Netlify
│   └── ...
│
├── 📂 public/                       # Arquivos públicos
│   └── flight-response.json         # Mock de resposta de voos
│
├── 📂 .vscode/                      # Configurações VSCode
├── 📂 .claude/                      # Configurações Claude Code
├── 📂 .netlify/                     # Cache Netlify
│
├── 📄 package.json                  # Dependências npm
├── 📄 vite.config.js                # Configuração Vite
├── 📄 tailwind.config.js            # Configuração Tailwind
├── 📄 tsconfig.json                 # Configuração TypeScript
├── 📄 .mcp.json                     # Configuração MCP Servers
├── 📄 netlify.toml                  # Configuração Netlify (se existir)
│
└── 📄 README.md                     # Documentação principal
```

### Estatísticas
- **Total de arquivos TypeScript/React:** ~150+
- **Páginas:** 37
- **Componentes:** 25+ principais + 50+ UI components
- **Serviços:** 12
- **Netlify Functions:** 8
- **Scripts de automação:** 15

---

## 🛠️ STACK TECNOLÓGICO

### Frontend Core
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 19.1.1 | Framework UI |
| TypeScript | 5.8.3 | Tipagem estática |
| Vite | 5.4.0 | Build tool |
| React Router DOM | 7.8.1 | Navegação SPA |

### UI & Styling
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Tailwind CSS | 4.1.9 | Framework CSS |
| Radix UI | Vários | Componentes primitivos |
| Lucide React | 0.454.0 | Ícones |
| React Hot Toast | 2.6.0 | Notificações |
| Sonner | 1.7.4 | Toast alternativo |

### Gerenciamento de Estado
| Tecnologia | Propósito |
|------------|-----------|
| Context API | Estado global |
| React Hooks | Estado local |
| LocalStorage | Persistência client-side |
| SessionStorage | Estado temporário |

### Backend & APIs
| Tecnologia | Propósito |
|------------|-----------|
| Netlify Functions | Serverless backend |
| Auth0 | Autenticação |
| Supabase | Database + Auth backup |
| Stripe | Pagamentos |
| Moblix API | Dados de voos |

### Bibliotecas de Apoio
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Axios | 1.11.0 | HTTP client |
| date-fns | 4.1.0 | Manipulação de datas |
| zod | 3.25.67 | Validação de schemas |
| react-hook-form | 7.60.0 | Formulários |
| recharts | 2.15.4 | Gráficos |

---

## 🛣️ SISTEMA DE ROTAS

### Estrutura de Rotas (AppRoutes.tsx)

#### 🌐 Rotas Públicas (Acesso livre)
```typescript
/ - Home                          # Landing page
/sobre - About                    # Sobre o projeto
/depoimentos - Testimonials       # Depoimentos
/fale-comigo - FaleComigo        # Contato
/alertas-imperdiveis             # Alertas de ofertas
/treinamentos                    # Treinamentos disponíveis
/consultoria                     # Serviços de consultoria
/grupo-exclusivo                 # Grupo VIP
/teste                          # Página de teste
/test-airport                   # Teste de busca de aeroportos
/fare-test                      # Teste de tarifas
/claude-think-demo              # Demo Claude AI
```

#### 🔓 Rotas Guest Only (Somente não autenticados)
```typescript
/register        # Registro de usuário (GuestRoute)
/login           # Login (GuestRoute)
/forgot-password # Recuperação de senha (GuestRoute)
```

#### 🔐 Rotas Autenticadas (Requer login)
```typescript
/dashboard            # Dashboard principal (AuthenticatedRoute)
/profile              # Perfil do usuário (AuthenticatedRoute)
/premium              # Página de upgrade (AuthenticatedRoute)
/update-password      # Atualização de senha (Public mas tipicamente autenticado)
```

#### ⭐ Rotas Premium (Requer assinatura ativa)
```typescript
/moblix-dashboard               # Dashboard Moblix (ProtectedRoute)
/search                        # Busca de hotéis (ProtectedRoute)
/flights                       # Busca de voos (ProtectedRoute)
/flight-search                 # Busca avançada (ProtectedRoute)
/hotels                        # Hotéis (ProtectedRoute)
/ofertas                       # Ofertas especiais (ProtectedRoute)
/bookings                      # Gestão de reservas (ProtectedRoute)
/dashboard/clients/new         # Adicionar cliente (ProtectedRoute)
```

#### 💳 Rotas de Pagamento (Stripe)
```typescript
/checkout    # Página de checkout
/success     # Sucesso no pagamento
/cancel      # Cancelamento
/summary     # Resumo da compra
```

#### 🔄 Rotas Especiais
```typescript
/auth/callback    # Callback Auth0 ✅ CRÍTICA (recém corrigida)
/area-logada      # Redirect para /dashboard (legacy)
*                 # Catch-all → redirect para /
```

### Tipos de Proteção de Rotas

#### 1. GuestRoute
- **Propósito:** Previne usuários autenticados de acessar páginas de login/registro
- **Comportamento:** Se autenticado → redireciona para `/dashboard`
- **Usado em:** Login, Register, Forgot Password

#### 2. AuthenticatedRoute
- **Propósito:** Permite apenas usuários autenticados
- **Comportamento:** Se NÃO autenticado → redireciona para `/login`
- **NÃO verifica:** Assinatura Premium
- **Usado em:** Dashboard, Profile, Premium

#### 3. ProtectedRoute
- **Propósito:** Requer autenticação + assinatura Premium ativa
- **Comportamento:**
  - Se NÃO autenticado → redireciona para `/login`
  - Se autenticado mas SEM assinatura → mostra modal de upgrade
- **Usado em:** Funcionalidades premium (busca de voos, Moblix, etc)

---

## 📄 PÁGINAS E FUNCIONALIDADES

### 1. Landing & Marketing (8 páginas)

#### Home.tsx
- **Rota:** `/`
- **Propósito:** Landing page principal
- **Funcionalidades:**
  - Hero section
  - Features showcase
  - Call-to-action para registro
  - Seções de benefícios
- **Público:** Todos (público)

#### About.tsx
- **Rota:** `/sobre`
- **Propósito:** Sobre o projeto e equipe
- **Conteúdo:** História, missão, valores

#### Testimonials.tsx
- **Rota:** `/depoimentos`
- **Propósito:** Depoimentos de clientes
- **Componentes:** Cards de reviews

#### FaleComigo.tsx
- **Rota:** `/fale-comigo`
- **Propósito:** Formulário de contato
- **Integração:** Envio de emails

#### AlertasImperdiveis.tsx
- **Rota:** `/alertas-imperdiveis`
- **Propósito:** Sistema de alertas de ofertas
- **Funcionalidades:** Cadastro para receber alertas

#### Treinamentos.tsx
- **Rota:** `/treinamentos`
- **Propósito:** Cursos e treinamentos disponíveis

#### Consultoria.tsx
- **Rota:** `/consultoria`
- **Propósito:** Serviços de consultoria
- **CTA:** Agendar consultoria

#### GrupoExclusivo.tsx
- **Rota:** `/grupo-exclusivo`
- **Propósito:** Grupo VIP/Premium
- **Benefícios:** Lista de vantagens exclusivas

---

### 2. Autenticação (6 páginas)

#### Login.tsx ✅
- **Rota:** `/login`
- **Tipo:** GuestRoute
- **Funcionalidades:**
  - Login com email/senha (Auth0)
  - Login com Google (Auth0)
  - Login com Facebook (Auth0)
  - "Esqueci minha senha"
  - Redirect para `/auth/callback`
- **Integração:** Auth0
- **Após login:** Redireciona para `/dashboard`

#### Register.tsx ✅
- **Rota:** `/register`
- **Tipo:** GuestRoute
- **Funcionalidades:**
  - Registro com email/senha
  - Social registration (Google, Facebook)
  - Captura de dados adicionais:
    - Nome
    - Email
    - Telefone
    - Opt-in marketing
  - Salva dados em `pendingRegistration` (localStorage)
  - Redirect para `/auth/callback`
- **Integração:** Auth0 + Supabase
- **Após registro:** Processa dados pendentes → `/dashboard`

#### AuthCallback.tsx ✅ CRÍTICO
- **Rota:** `/auth/callback`
- **Tipo:** Public (mas processamento especial)
- **Propósito:** Processar retorno do Auth0
- **Funcionalidades:**
  - Recebe tokens do Auth0 (hash da URL)
  - Processa `pendingRegistration` (se houver)
  - Salva dados do usuário no Supabase
  - Verifica status de assinatura
  - Salva em sessionStorage
  - Mostra toast de boas-vindas
  - Redireciona para `/dashboard`
- **Estados:**
  - Loading: "Autenticando..."
  - Erro: Mostra mensagem + redirect `/login`
  - Sucesso: Toast + redirect `/dashboard`
- **Crítico:** Sem esta rota, autenticação NÃO funciona!

#### ForgotPassword.tsx
- **Rota:** `/forgot-password`
- **Tipo:** GuestRoute
- **Funcionalidades:**
  - Formulário de recuperação
  - Envio de email via Auth0
  - Instruções de reset

#### UpdatePassword.tsx
- **Rota:** `/update-password`
- **Tipo:** Public (mas geralmente acessado autenticado)
- **Funcionalidades:**
  - Formulário de nova senha
  - Validação de senha forte
  - Atualização via Auth0

---

### 3. Área Logada (5 páginas)

#### Dashboard.tsx
- **Rota:** `/dashboard`
- **Tipo:** AuthenticatedRoute
- **Funcionalidades:**
  - Overview de estatísticas
  - Links rápidos
  - Status de assinatura
  - Histórico recente
- **Componentes:**
  - Cards de métricas
  - Gráficos (recharts)
  - Call-to-action contextual
- **Layout:** Grid responsivo

#### Profile.tsx
- **Rota:** `/profile`
- **Tipo:** AuthenticatedRoute
- **Funcionalidades:**
  - Edição de dados pessoais
  - Avatar/foto
  - Configurações de conta
  - Alterar senha
  - Preferências de notificação
- **Integração:** Supabase (save user data)

#### Premium.tsx
- **Rota:** `/premium`
- **Tipo:** AuthenticatedRoute
- **Funcionalidades:**
  - Planos disponíveis
  - Comparação de features
  - Botão de checkout (Stripe)
  - FAQ sobre assinatura
- **Integração:** Stripe Checkout
- **CTA:** Assinar agora

---

### 4. Sistema de Voos (7 páginas Premium)

#### Flights.tsx ⭐
- **Rota:** `/flights`
- **Tipo:** ProtectedRoute (requer Premium)
- **Funcionalidades:**
  - Busca avançada de voos
  - Filtros:
    - Companhias aéreas
    - Horários
    - Escalas
    - Preço (dinheiro/milhas)
  - Ordenação:
    - Menor preço
    - Menor tempo
    - Melhor avaliação
  - Resultados em cards
  - Comparação lado a lado
- **Integração:** Moblix API
- **Componentes:**
  - FlightResultCard
  - InteractiveFilters
  - AirportSearch
- **Arquivo:** 79KB (maior página!)

#### FlightSearch.tsx / FlightSearchFixed.tsx ⭐
- **Rota:** `/flight-search`
- **Tipo:** ProtectedRoute
- **Funcionalidades:**
  - Versão otimizada/debugada da busca
  - Suporte a multi-city
  - Busca por milhas específicas
  - Cache de resultados
- **Integração:** Moblix API
- **Performance:** Otimizada

#### FlightOffers.tsx ⭐
- **Rota:** `/ofertas`
- **Tipo:** ProtectedRoute
- **Funcionalidades:**
  - Ofertas especiais
  - Promoções relâmpago
  - Alertas personalizados
  - Filtros de ofertas
- **Atualização:** Real-time

#### MoblixDashboard.tsx ⭐
- **Rota:** `/moblix-dashboard`
- **Tipo:** ProtectedRoute
- **Funcionalidades:**
  - Interface completa Moblix API
  - Visualização de dados
  - Estatísticas de uso
  - Histórico de buscas
- **Integração:** Moblix Context

#### BookingManagement.tsx ⭐
- **Rota:** `/bookings`
- **Tipo:** ProtectedRoute
- **Funcionalidades:**
  - Gestão de reservas
  - Histórico de compras
  - Status de viagens
  - Documentos/vouchers
- **Integração:** Supabase (bookings table)

#### HotelSearch.tsx ⭐
- **Rota:** `/search`
- **Tipo:** ProtectedRoute
- **Funcionalidades:**
  - Busca de hotéis (futura?)
  - Integração com API de hotéis
- **Status:** Implementação básica

#### Hotels.tsx ⭐
- **Rota:** `/hotels`
- **Tipo:** ProtectedRoute
- **Funcionalidades:**
  - Listagem de hotéis
  - Filtros e ordenação
- **Status:** Implementação básica

---

### 5. Gestão de Clientes (1 página Premium)

#### AddClient.tsx ⭐
- **Rota:** `/dashboard/clients/new`
- **Tipo:** ProtectedRoute
- **Funcionalidades:**
  - Cadastro de cliente
  - Formulário completo:
    - Dados pessoais
    - Preferências de viagem
    - Programas de milhas
    - Contato
  - Validação com Zod
- **Integração:** Supabase (clients table)
- **Para:** Consultores profissionais

---

### 6. Pagamentos (4 páginas)

#### CheckoutDemo.tsx
- **Rota:** `/checkout`
- **Funcionalidades:**
  - Página de checkout Stripe
  - Seleção de plano
  - Resumo da compra
- **Integração:** Stripe Checkout

#### Success.tsx
- **Rota:** `/success`
- **Propósito:** Sucesso na compra
- **Funcionalidades:**
  - Confirmação visual
  - Detalhes da assinatura
  - Próximos passos
  - Link para dashboard

#### Cancel.tsx
- **Rota:** `/cancel`
- **Propósito:** Cancelamento do checkout
- **Funcionalidades:**
  - Mensagem de cancelamento
  - Opções de retorno
  - CTA para tentar novamente

#### Summary.tsx
- **Rota:** `/summary`
- **Propósito:** Resumo da compra/viagem
- **Funcionalidades:**
  - Detalhes completos
  - Valores
  - Informações de voo

---

### 7. Desenvolvimento & Debug (5 páginas)

#### TestPage.tsx
- **Rota:** `/teste`
- **Propósito:** Testes gerais
- **Uso:** Desenvolvimento

#### TestAirportSearch.tsx
- **Rota:** `/test-airport`
- **Propósito:** Testar componente de busca de aeroportos
- **Funcionalidades:**
  - Teste de autocomplete
  - Validação de dados

#### FareTestPage.tsx
- **Rota:** `/fare-test`
- **Propósito:** Testar sistema de tarifas
- **Funcionalidades:**
  - Testes de cálculo
  - Comparação de preços
  - Validação de lógica

#### FlightSearchDebug.tsx
- **Rota:** (não roteado)
- **Propósito:** Debug de busca de voos
- **Uso:** Desenvolvimento

#### ClaudeThinkDemo.tsx 🤖
- **Rota:** `/claude-think-demo`
- **Tipo:** Public
- **Propósito:** Demonstração do Claude AI Think
- **Funcionalidades:**
  - Interface de chat com Claude
  - Visualização do processo de "pensamento"
  - Exemplos de uso
  - Demo interativa
- **Integração:** Claude Think Service
- **Hook:** useClaudeThink

---

## 🧩 COMPONENTES

### Componentes de Navegação

#### Navbar.tsx
- **Localização:** `src/components/Navbar.tsx`
- **Propósito:** Barra de navegação principal
- **Funcionalidades:**
  - Logo e branding
  - Menu de navegação
  - User menu (se autenticado)
  - Botões de login/register
  - Mobile menu (hamburger)
- **Estados:**
  - Authenticated vs Guest
  - Premium vs Free
- **Integração:** AuthContext
- **Responsivo:** ✅

---

### Componentes de Roteamento

#### ProtectedRoute.tsx
- **Localização:** `src/components/ProtectedRoute.tsx`
- **Propósito:** Protege rotas que requerem Premium
- **Lógica:**
  ```typescript
  if (!isAuthenticated) → redirect /login
  if (!hasSubscription) → show PremiumUpgradeModal
  if (hasSubscription) → render children
  ```
- **Verifica:** Auth + Subscription
- **Hook:** useSubscription

#### AuthenticatedRoute.tsx
- **Localização:** `src/components/AuthenticatedRoute.tsx`
- **Propósito:** Protege rotas que requerem apenas autenticação
- **Lógica:**
  ```typescript
  if (!isAuthenticated) → redirect /login
  if (isAuthenticated) → render children
  ```
- **Verifica:** Apenas Auth
- **Hook:** useAuth

#### GuestRoute (em AppRoutes.tsx)
- **Localização:** `src/routes/AppRoutes.tsx`
- **Propósito:** Protege rotas de login/register
- **Lógica:**
  ```typescript
  if (isAuthenticated) → redirect /dashboard
  if (!isAuthenticated) → render children
  ```

---

### Componentes de Busca

#### AirportSearch.tsx
- **Localização:** `src/components/AirportSearch.tsx`
- **Propósito:** Autocomplete de aeroportos
- **Funcionalidades:**
  - Busca por código IATA
  - Busca por nome de cidade
  - Busca por nome de aeroporto
  - Dropdown de sugestões
  - Highlights de match
- **Dados:** `src/data/airports.ts`
- **Debounce:** ✅

---

### Componentes de Voos

#### FlightResultCard.tsx
- **Localização:** `src/components/FlightResultCard.tsx`
- **Propósito:** Card de resultado de voo
- **Exibe:**
  - Companhia aérea (logo)
  - Horários (partida/chegada)
  - Duração
  - Escalas
  - Preço (dinheiro)
  - Preço (milhas)
  - Classe
- **Ações:**
  - Selecionar voo
  - Ver detalhes
  - Comparar
- **Tamanho:** 48KB

#### FlightResultsHome.tsx / FlightResultsFlights.tsx
- **Localização:** `src/components/`
- **Propósito:** Container de resultados
- **Funcionalidades:**
  - Lista de FlightResultCard
  - Paginação
  - Loading states
  - Empty states
- **Diferença:**
  - Home: versão simplificada
  - Flights: versão completa com filtros

#### ReturnFlightModal.tsx
- **Localização:** `src/components/ReturnFlightModal.tsx`
- **Propósito:** Modal de seleção de voo de volta
- **Funcionalidades:**
  - Lista de voos de retorno
  - Filtros
  - Seleção

---

### Componentes de UI/UX

#### InteractiveFilters.tsx
- **Localização:** `src/components/InteractiveFilters.tsx`
- **Propósito:** Filtros interativos de busca
- **Filtros:**
  - Companhias aéreas (checkboxes)
  - Escalas (0, 1, 2+)
  - Horários (slider)
  - Preço (range)
  - Tipo de pagamento (dinheiro/milhas)
- **Estado:** Sincronizado com busca

#### FlightLoadingOverlay.tsx
- **Localização:** `src/components/FlightLoadingOverlay.tsx`
- **Propósito:** Overlay de loading durante busca
- **Funcionalidades:**
  - Animação
  - Mensagens dinâmicas
  - Progresso (se aplicável)

#### CustomCalendar.tsx
- **Localização:** `src/components/CustomCalendar.tsx`
- **Propósito:** Calendário customizado
- **Funcionalidades:**
  - Seleção de data
  - Range de datas
  - Desabilitar datas passadas
  - Destacar preços por data
- **Biblioteca:** react-day-picker

---

### Componentes de Modais

#### PremiumUpgradeModal.tsx
- **Localização:** `src/components/PremiumUpgradeModal.tsx`
- **Propósito:** Modal de upgrade para Premium
- **Trigger:** Acesso a rota protegida sem assinatura
- **Conteúdo:**
  - Benefícios Premium
  - Planos disponíveis
  - CTA de checkout
- **Ação:** Redirect para /premium ou Stripe Checkout

#### CabinClassModal.tsx
- **Localização:** `src/components/CabinClassModal.tsx`
- **Propósito:** Modal de seleção de classe
- **Opções:**
  - Econômica
  - Executiva
  - Primeira classe
- **Tamanho:** 53KB (complexo)

#### MilesGuidanceModal.tsx
- **Localização:** `src/components/MilesGuidanceModal.tsx`
- **Propósito:** Orientações sobre uso de milhas
- **Conteúdo:**
  - Dicas
  - Melhores práticas
  - FAQs

#### PurchaseConfirmationModal.tsx
- **Localização:** `src/components/PurchaseConfirmationModal.tsx`
- **Propósito:** Confirmação de compra
- **Exibe:**
  - Resumo da compra
  - Valores
  - Botões de ação

#### SelectionModal.tsx
- **Localização:** `src/components/SelectionModal.tsx`
- **Propósito:** Modal genérico de seleção
- **Uso:** Diversos contextos

---

### Componentes de Pagamento

#### StripeButton.tsx
- **Localização:** `src/components/StripeButton.tsx`
- **Propósito:** Botão de checkout Stripe
- **Funcionalidades:**
  - Cria sessão de checkout
  - Redireciona para Stripe
  - Loading states
- **Integração:** Netlify Function `create-checkout-session`

#### StripeCheckout.tsx
- **Localização:** `src/components/StripeCheckout.tsx`
- **Propósito:** Componente de checkout embutido
- **Uso:** Alternativo ao redirect

---

### Componentes UI (shadcn/ui)

**Localização:** `src/components/ui/` e `components/ui/`

Componentes Radix UI + shadcn/ui (50+ componentes):
- ✅ accordion.tsx - Acordeões
- ✅ alert-dialog.tsx - Diálogos de alerta
- ✅ alert.tsx - Alertas
- ✅ avatar.tsx - Avatares de usuário
- ✅ badge.tsx - Badges/etiquetas
- ✅ button.tsx - Botões
- ✅ calendar.tsx - Calendário
- ✅ card.tsx - Cards
- ✅ checkbox.tsx - Checkboxes
- ✅ dialog.tsx - Modais/diálogos
- ✅ dropdown-menu.tsx - Dropdowns
- ✅ form.tsx - Formulários
- ✅ input.tsx - Inputs de texto
- ✅ label.tsx - Labels
- ✅ select.tsx - Selects
- ✅ sheet.tsx - Sidesheets
- ✅ table.tsx - Tabelas
- ✅ tabs.tsx - Abas
- ✅ toast.tsx - Notificações toast
- ✅ ...e muitos outros

**Padrão:** Todos são componentes acessíveis (Radix UI) estilizados com Tailwind

---

### Componentes de Onboarding

#### ProfileWizard.tsx
- **Localização:** `src/components/onboarding/ProfileWizard.tsx`
- **Propósito:** Wizard de onboarding pós-registro
- **Etapas:**
  1. Boas-vindas
  2. Preferências de viagem
  3. Programas de milhas
  4. Configurações
- **Estado:** Multi-step form

---

### Componentes de Autenticação

#### AuthTabs.tsx
- **Localização:** `src/components/auth/AuthTabs.tsx`
- **Propósito:** Abas de login/registro
- **Funcionalidades:**
  - Tab Login
  - Tab Register
  - Social auth buttons
- **Uso:** Pode ser usado em modais

---

## 🔧 SERVIÇOS E APIs

### Serviços de Autenticação

#### auth.ts
- **Localização:** `src/services/auth.ts`
- **Propósito:** Lógica de autenticação
- **Funcionalidades:**
  - Login
  - Registro
  - Logout
  - Recuperação de senha
  - Refresh token
  - Check auth status
- **Integração:** Auth0 + Supabase

#### auth.js
- **Localização:** `src/services/auth.js`
- **Propósito:** Versão JavaScript (legacy?)
- **Status:** Pode ser migrada para TS

---

### Serviços de API

#### apiService.ts
- **Localização:** `src/services/apiService.ts`
- **Propósito:** Cliente HTTP genérico
- **Funcionalidades:**
  - Wrapper sobre Axios
  - Interceptors (auth headers)
  - Error handling
  - Retry logic
- **Configuração:**
  - Base URL
  - Timeout
  - Headers padrão

---

### Serviços Moblix

#### moblixApiService.ts
- **Localização:** `src/services/moblixApiService.ts`
- **Propósito:** Integração com Moblix API
- **Funcionalidades:**
  - Busca de voos
  - Busca de ofertas
  - Detalhes de voo
  - Cálculo de milhas
  - Cache de resultados
- **Tamanho:** 34KB (complexo)
- **Endpoints:**
  - `/api/flights/search`
  - `/api/flights/offers`
  - `/api/flights/details`

#### moblixApiService.js
- **Localização:** `src/services/moblixApiService.js`
- **Propósito:** Versão JavaScript
- **Tamanho:** 19KB

#### moblixApiService_clean.js
- **Localização:** `src/services/moblixApiService_clean.js`
- **Propósito:** Versão limpa/refatorada
- **Tamanho:** 8KB

#### moblixAuth.ts
- **Localização:** `src/services/moblixAuth.ts`
- **Propósito:** Autenticação específica Moblix
- **Funcionalidades:**
  - Get API token
  - Refresh token
  - Validate token

#### moblixService.ts
- **Localização:** `src/services/moblixService.ts`
- **Propósito:** Serviço de alto nível Moblix
- **Funcionalidades:**
  - Coordena moblixApiService
  - Lógica de negócio
  - Transformação de dados

---

### Serviços de Pagamento

#### webhook.ts
- **Localização:** `src/services/webhook.ts`
- **Propósito:** Processar webhooks do Stripe
- **Eventos:**
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- **Ações:**
  - Atualizar status de assinatura no Supabase
  - Enviar emails de confirmação
  - Logs de auditoria

---

### Serviços de IA

#### claudeThinkService.ts
- **Localização:** `src/services/claudeThinkService.ts`
- **Propósito:** Integração com Claude AI
- **Funcionalidades:**
  - Enviar prompts
  - Receber respostas
  - Stream de thinking process
  - Parsing de responses
- **Endpoint:** (Configurar)
- **Hook:** useClaudeThink

---

## 🔐 AUTENTICAÇÃO E AUTORIZAÇÃO

### Sistema de Autenticação

#### Provider: Auth0
- **Domain:** `dev-z4okudaokz1tfpki.us.auth0.com`
- **Client ID:** `UWkClVFOk5ttmeC7jYrSWKKkwm4SGDYJ`
- **Redirect URI:**
  - Dev: `http://localhost:5174/auth/callback`
  - Prod: `https://extraordinary-starship-9103ce.netlify.app/auth/callback`

#### Métodos de Autenticação Suportados
1. **Email/Senha** (Auth0 Database)
2. **Google OAuth** (Social)
3. **Facebook OAuth** (Social)

#### Fluxo de Autenticação

```
┌──────────────────────────────────────────────────────┐
│ 1. USUÁRIO CLICA "LOGIN COM GOOGLE"                  │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ 2. FRONTEND: Login.tsx                               │
│    - Chama auth0.loginWithRedirect({                │
│        connection: 'google-oauth2',                  │
│        redirect_uri: '/auth/callback'                │
│      })                                              │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ 3. AUTH0: Redireciona para Google                   │
│    - URL: https://accounts.google.com/o/oauth2/...  │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ 4. GOOGLE: Usuário autoriza                         │
│    - Seleciona conta                                │
│    - Concede permissões                             │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ 5. GOOGLE: Retorna para Auth0                       │
│    - Envia authorization code                       │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ 6. AUTH0: Processa                                   │
│    - Valida authorization code                      │
│    - Gera tokens (ID token, access token)           │
│    - Cria/atualiza usuário no Auth0 DB              │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ 7. AUTH0: Redireciona para /auth/callback           │
│    - URL: /auth/callback#id_token=...&access_token..│
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ 8. FRONTEND: AuthCallback.tsx ✅ CRÍTICO             │
│    - Extrai tokens da URL                           │
│    - Valida tokens                                  │
│    - Busca pendingRegistration (se houver)          │
│    - Chama Netlify Function: save-user-data         │
│    - Chama Netlify Function: check-subscription     │
│    - Salva no sessionStorage                        │
│    - Mostra toast de boas-vindas                    │
│    - Redireciona para /dashboard                    │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ 9. FRONTEND: Dashboard.tsx                           │
│    - Usuário autenticado ✅                          │
│    - Dados carregados                               │
│    - Pronto para usar                               │
└──────────────────────────────────────────────────────┘
```

#### Armazenamento de Sessão

**LocalStorage:**
- `pendingRegistration` - Dados do formulário de registro
- Auth0 tokens (gerenciado pelo SDK)

**SessionStorage:**
- `subscription_status` - Status de assinatura
  ```json
  {
    "hasSubscription": boolean,
    "checkedAt": "2025-10-17T...",
    "plan": "premium" | "free"
  }
  ```

**Cookies:**
- Auth0 session cookies (httpOnly)

---

### Sistema de Autorização

#### Níveis de Acesso

**1. Guest (Não autenticado)**
- ✅ Acessar landing pages
- ✅ Ver conteúdo público
- ✅ Registrar/login
- ❌ Acessar dashboard
- ❌ Buscar voos

**2. Authenticated (Usuário logado)**
- ✅ Tudo do Guest
- ✅ Acessar dashboard
- ✅ Editar perfil
- ✅ Ver página de upgrade
- ❌ Buscar voos (precisa Premium)
- ❌ Usar Moblix Dashboard

**3. Premium (Assinatura ativa)**
- ✅ Tudo do Authenticated
- ✅ Buscar voos ilimitados
- ✅ Moblix Dashboard completo
- ✅ Gestão de clientes
- ✅ Ofertas exclusivas
- ✅ Suporte prioritário

---

### Verificação de Assinatura

#### Hook: useSubscription

**Localização:** `src/hooks/useSubscription.ts`

**Funcionalidades:**
```typescript
const {
  hasSubscription,    // boolean
  loading,            // boolean
  checkSubscription,  // function
  error              // Error | null
} = useSubscription();
```

**Lógica:**
1. Verifica sessionStorage primeiro (cache)
2. Se não houver ou expirado:
   - Chama Netlify Function `check-subscription`
   - Netlify Function consulta Supabase
   - Retorna status
   - Salva em sessionStorage
3. Retorna resultado

**Cache:** 5 minutos (configur ável)

---

### Context API

#### AuthContext

**Localização:** `src/context/AuthContext.tsx`

**Fornece:**
```typescript
{
  isAuthenticated: boolean,
  user: User | null,
  loading: boolean,
  login: (credentials) => Promise,
  logout: () => Promise,
  register: (data) => Promise,
  updateUser: (data) => Promise
}
```

**Provider:** Envolve toda a aplicação em `main.tsx`

---

## 🔌 INTEGRAÇÕES EXTERNAS

### 1. Auth0
- **Propósito:** Autenticação e gestão de usuários
- **Configuração:** `src/config/auth0.ts`
- **Funcionalidades:**
  - Social login (Google, Facebook)
  - Email/senha
  - Password reset
  - MFA (se configurado)
- **SDK:** `@auth0/auth0-react`

### 2. Supabase
- **Propósito:** Database + backup auth
- **URL:** `https://vqflmhngywnbravitxxl.supabase.co`
- **Configuração:** `src/config/supabase.ts`
- **Tabelas:**
  - `users` - Dados de usuários
  - `subscriptions` - Assinaturas
  - `clients` - Clientes dos consultores
  - `bookings` - Reservas
  - `user_data` - Dados adicionais
  - (possivelmente outras)
- **Funcionalidades:**
  - CRUD de dados
  - Real-time subscriptions (se usado)
  - Storage (se usado)
- **SDK:** `@supabase/supabase-js`

### 3. Stripe
- **Propósito:** Processamento de pagamentos
- **Configuração:** `src/config/stripe.ts`
- **Funcionalidades:**
  - Checkout sessions
  - Subscription billing
  - Webhooks
  - Customer portal
- **Produtos:**
  - Plano Premium (mensal/anual?)
- **SDK:** `@stripe/stripe-js`

### 4. Moblix API
- **Propósito:** Dados de voos e milhas
- **URL:** `https://api.moblix.com.br`
- **Autenticação:** API Key
- **Proxy:** Via Vite dev server ou Netlify Function
- **Endpoints:**
  - `/api/flights/search` - Buscar voos
  - `/api/offers` - Ofertas
  - (outros endpoints)
- **Cliente:** `src/services/moblixApiService.ts`

### 5. Netlify
- **Propósito:** Hosting + Serverless Functions
- **URL:** `https://extraordinary-starship-9103ce.netlify.app`
- **Functions:**
  - `moblix-api.js` - Proxy Moblix
  - `save-user-data.js` - Salvar dados Supabase
  - `check-subscription.js` - Verificar assinatura
  - `create-checkout-session.js` - Criar sessão Stripe
  - `webhook.js` - Processar webhooks Stripe
  - `get-user-data.js` - Buscar dados usuário
  - `api.js` - API genérica
  - `aereo.js` - (propósito?)
- **Edge Functions:**
  - `hello.js` - Hello world example

---

## 🔄 FLUXOS PRINCIPAIS

### Fluxo 1: Registro de Novo Usuário

```
1. Usuário acessa /register
2. Preenche formulário:
   - Nome
   - Email
   - Telefone
   - [x] Aceito receber ofertas
3. Clica "Criar Conta"
4. Dados são salvos em localStorage ('pendingRegistration')
5. auth0.loginWithRedirect({ screen_hint: 'signup' })
6. Redireciona para Auth0 signup
7. Usuário cria senha ou escolhe social login
8. Auth0 retorna para /auth/callback
9. AuthCallback.tsx processa:
   - Pega pendingRegistration do localStorage
   - Chama save-user-data (Netlify Function)
   - Salva no Supabase
   - Limpa localStorage
   - Chama check-subscription
   - Mostra toast: "Bem-vindo, [Nome]! 🎉"
   - Redireciona para /dashboard
10. Dashboard carrega dados do usuário
```

---

### Fluxo 2: Login Existente (Google)

```
1. Usuário acessa /login
2. Clica "Continue with Google"
3. auth0.loginWithRedirect({ connection: 'google-oauth2' })
4. Redireciona para Google OAuth
5. Usuário seleciona conta e autoriza
6. Google retorna para Auth0
7. Auth0 processa e retorna para /auth/callback
8. AuthCallback.tsx processa:
   - Valida tokens
   - NÃO há pendingRegistration
   - Chama check-subscription
   - Salva status em sessionStorage
   - Mostra toast: "Bem-vindo de volta, [Nome]! 👋"
   - Redireciona para /dashboard
9. Dashboard carrega
```

---

### Fluxo 3: Upgrade para Premium

```
1. Usuário autenticado tenta acessar /flights
2. ProtectedRoute detecta: !hasSubscription
3. Mostra PremiumUpgradeModal:
   - Benefícios
   - Planos disponíveis
   - Preço
4. Usuário clica "Assinar Agora"
5. Redireciona para /premium ou diretamente para Stripe
6. StripeButton cria checkout session:
   - Chama Netlify Function: create-checkout-session
   - Function retorna Stripe Checkout URL
7. Redireciona para Stripe Checkout
8. Usuário preenche dados de pagamento
9. Stripe processa pagamento
10. Redireciona para /success?session_id=...
11. Success.tsx mostra confirmação
12. Em background:
    - Stripe envia webhook para /api/webhook
    - Netlify Function webhook.js processa
    - Atualiza Supabase: subscription_status = 'active'
    - Envia email de confirmação (se configurado)
13. Usuário retorna ao /dashboard
14. checkSubscription retorna true
15. Usuário pode acessar /flights ✅
```

---

### Fluxo 4: Busca de Voos

```
1. Usuário Premium acessa /flights
2. Preenche formulário de busca:
   - Origem (autocomplete)
   - Destino (autocomplete)
   - Data ida
   - Data volta (opcional)
   - Passageiros
   - Classe
3. Clica "Buscar"
4. FlightLoadingOverlay aparece
5. Frontend chama moblixApiService.searchFlights()
6. Service faz request para Netlify Function moblix-api
7. Netlify Function faz request para Moblix API real
8. Moblix retorna dados de voos
9. Netlify Function formata e retorna para frontend
10. Frontend processa dados
11. Renderiza lista de FlightResultCard
12. Usuário pode:
    - Filtrar resultados (InteractiveFilters)
    - Ordenar (preço, tempo)
    - Selecionar voo
13. Clica em voo → detalhes ou modal
14. Clica "Reservar" → processo de booking
```

---

### Fluxo 5: Logout

```
1. Usuário clica em "Sair" (Navbar)
2. auth0.logout({ returnTo: window.location.origin })
3. Auth0 limpa sessão
4. Redireciona para homepage (/)
5. sessionStorage limpo
6. localStorage mantém apenas dados não sensíveis
7. Usuário vê homepage como Guest
```

---

## ⚙️ CONFIGURAÇÕES

### Variáveis de Ambiente

**Arquivo:** `.env.local` (não commitado)

```bash
# Auth0
VITE_AUTH0_DOMAIN=dev-z4okudaokz1tfpki.us.auth0.com
VITE_AUTH0_CLIENT_ID=UWkClVFOk5ttmeC7jYrSWKKkwm4SGDYJ
VITE_AUTH0_AUDIENCE=https://dev-z4okudaokz1tfpki.us.auth0.com/api/v2/

# Supabase
VITE_SUPABASE_URL=https://vqflmhngywnbravitxxl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_SkNTS88mBZpTt7swmwgLgQ_6jWviV0z

# Stripe
VITE_STRIPE_PUBLIC_KEY=(configurar)

# Moblix
VITE_MOBLIX_API_URL=https://api.moblix.com.br
VITE_MOBLIX_API_KEY=(configurar)

# App
VITE_APP_URL=http://localhost:5174
```

**Netlify (Variáveis de Build):**
- Mesmas variáveis acima (sem VITE_ prefix para Functions)
- `STRIPE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MOBLIX_API_KEY`

---

### Vite Config

**Arquivo:** `vite.config.js`

**Principais Configurações:**
```javascript
{
  plugins: [react()],
  resolve: {
    alias: {
      '@': './',  // Import com @/
      '~': './'   // Import com ~/
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.moblix.com.br',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false
  }
}
```

**Propósito do Proxy:**
- Evitar CORS em desenvolvimento
- Proxy de `/api/*` para Moblix API
- Adiciona headers necessários

---

### Tailwind Config

**Arquivo:** `tailwind.config.js`

**Customizações:**
```javascript
{
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 50-950 },  // Azul personalizado
        secondary: { 50-950 }, // Amarelo/dourado
        accent: { light, DEFAULT, dark },
        dark: { 50-900 }
      },
      fontFamily: {
        sans: ['Inter', ...]
      },
      animation: {
        'fade-in': ...,
        'slide-up': ...,
        'pulse-slow': ...
      }
    }
  }
}
```

---

### TypeScript Config

**Arquivo:** `tsconfig.json`

**Principais Configs:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "~/*": ["./*"]
    }
  }
}
```

---

### MCP Servers Config

**Arquivo:** `.mcp.json`

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

**Propósito:** Configurar MCP servers para Claude Code

**Servidores Instalados:**
- `playwright` - Automação de browser ✅

**Futuros:**
- `evolution-api` - WhatsApp/Meta
- `supabase` - Database operations

---

## 🚀 DEPLOY E INFRAESTRUTURA

### Netlify Deploy

**URL de Produção:** https://extraordinary-starship-9103ce.netlify.app

**Configuração de Build:**
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false
```

**Deploy Automático:**
- ✅ Git push → auto deploy
- ✅ Preview deploys para PRs
- ✅ Rollback com um clique

**Environment Variables (Netlify Dashboard):**
- Todas as variáveis de ambiente de produção
- Stripe keys
- Supabase service role key
- Moblix API key

---

### Estrutura de Build

**Output:** `dist/`

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      # Bundle principal
│   ├── vendor-[hash].js     # Dependências
│   └── [component]-[hash].js # Code-split chunks
├── _redirects               # Netlify redirects
└── ...
```

**Code Splitting:**
- ✅ Lazy loading de rotas
- ✅ Vendor chunk separado
- ✅ Dynamic imports

---

### Performance

**Otimizações Aplicadas:**
- ✅ Code splitting
- ✅ Tree shaking (Vite)
- ✅ Minificação (esbuild)
- ✅ Compressão gzip/brotli (Netlify)
- ✅ CDN global (Netlify)
- ✅ Cache de assets (hash no nome)

**Métricas Alvo:**
- FCP (First Contentful Paint): < 1.5s
- LCP (Largest Contentful Paint): < 2.5s
- TTI (Time to Interactive): < 3.5s
- CLS (Cumulative Layout Shift): < 0.1

---

## 📊 ESTATÍSTICAS DO PROJETO

### Tamanho dos Arquivos

**Maiores Arquivos:**
1. `Home_broken.tsx` - 132KB
2. `Home.tsx` - 121KB
3. `Flights.tsx` - 79KB
4. `FlightResultsFlights.tsx` - 62KB
5. `FlightResultsHome.tsx` - 57KB
6. `CabinClassModal.tsx` - 53KB

**Total estimado:** ~2MB de código TypeScript/React

---

### Dependências

**Principais:**
- React ecosystem: 5 packages
- UI Components: 30+ packages (Radix UI)
- Supabase: 7 packages
- Stripe: 2 packages
- Utilities: 10+ packages

**Total:** ~90 dependências principais

---

### Linhas de Código (Estimativa)

- **TypeScript/React:** ~15.000 linhas
- **CSS/Tailwind:** ~2.000 linhas
- **Configuração:** ~500 linhas
- **Scripts:** ~1.500 linhas
- **Total:** ~19.000 linhas de código

---

## 🎓 CONCEITOS E PADRÕES

### Padrões de Design Usados

1. **Component Composition**
   - Componentes pequenos e reutilizáveis
   - Composição ao invés de herança

2. **Container/Presentational Pattern**
   - Componentes smart (com lógica)
   - Componentes dumb (apenas UI)

3. **Custom Hooks**
   - Lógica reutilizável
   - Separação de concerns

4. **Context API**
   - Estado global
   - Evita prop drilling

5. **Protected Routes**
   - Higher-Order Components (HOC)
   - Route guards

6. **Service Layer**
   - Abstração de APIs
   - Lógica de negócio separada

---

### Boas Práticas Aplicadas

✅ **TypeScript** para type safety
✅ **React 19** (latest)
✅ **Functional Components** (não class components)
✅ **Hooks** ao invés de lifecycle methods
✅ **Code splitting** para performance
✅ **Environment variables** para configuração
✅ **Serverless functions** para backend
✅ **JAMstack** architecture
✅ **Git** para controle de versão
✅ **Netlify** para CI/CD automático

---

## 🐛 PROBLEMAS CONHECIDOS E SOLUÇÕES

### 1. Autenticação Quebrada ✅ RESOLVIDO
**Problema:** Login/registro redirecionava para homepage ao invés de dashboard

**Causa:** Rota `/auth/callback` não estava registrada no `AppRoutes.tsx`

**Solução:**
- Adicionado import de `AuthCallback`
- Adicionado `<Route path="/auth/callback" element={<AuthCallback />} />`

**Status:** ✅ Corrigido em 2025-10-17

---

### 2. Arquivos Duplicados
**Observação:** Existem vários arquivos duplicados/legacy:
- `Home.tsx`, `Home_backup.tsx`, `Home_broken.tsx`
- `FlightSearch.tsx`, `FlightSearchFixed.tsx`, `FlightSearchDebug.tsx`
- `moblixApiService.ts`, `moblixApiService.js`, `moblixApiService_clean.js`
- `auth.ts`, `auth.js`

**Recomendação:**
- Consolidar para versão TypeScript
- Remover arquivos `_backup` e `_broken` após validação
- Manter apenas versão funcional

---

### 3. Netlify Functions em Dev
**Observação:** Netlify Functions retornam 404 em desenvolvimento local

**Causa:** Functions só funcionam no Netlify (produção)

**Solução:**
- Usar Netlify CLI (`netlify dev`) para testar localmente
- Ou mockar Functions em desenvolvimento
- Ou usar Vite proxy para APIs externas

---

## 🔮 ROADMAP E MELHORIAS FUTURAS

### Curto Prazo
- [ ] Limpar arquivos duplicados/legacy
- [ ] Migrar todos arquivos `.js` para `.ts`
- [ ] Adicionar testes unitários (Jest/Vitest)
- [ ] Adicionar testes E2E (Playwright via MCP)
- [ ] Melhorar tratamento de erros
- [ ] Adicionar loading skeletons
- [ ] Otimizar imagens (lazy loading)

### Médio Prazo
- [ ] Implementar sistema de reviews
- [ ] Adicionar histórico de buscas
- [ ] Implementar favoritos
- [ ] Adicionar comparação de múltiplos voos
- [ ] Sistema de notificações push
- [ ] Dashboard de analytics avançado
- [ ] Export de relatórios (PDF)

### Longo Prazo
- [ ] App mobile (React Native)
- [ ] Integração com mais APIs de voos
- [ ] Sistema de cashback/pontos
- [ ] Marketplace de milhas
- [ ] Comunidade/fórum
- [ ] Inteligência de preços (ML)
- [ ] Assistente AI completo (Claude Agent)

---

## 📚 RECURSOS E DOCUMENTAÇÃO

### Documentação do Projeto
- `README.md` - Visão geral e instalação
- `CHAT_HISTORY_SUMMARY.txt` - Histórico de evoluções
- `MCP_ARCHITECTURE_VISUAL.md` - Arquitetura MCP
- `MCP_CUSTOM_SERVERS_GUIDE.md` - Guia MCP servers
- `PLAYWRIGHT_FEATURES.md` - Funcionalidades Playwright
- `TEST_NOW.md` - Instruções de teste
- `AUTH_FIXES_IMPLEMENTED.md` - Correções de auth
- Este arquivo: `MAPA_CONHECIMENTO_APLICACAO.md`

### Links Úteis
- **Produção:** https://extraordinary-starship-9103ce.netlify.app
- **Netlify Dashboard:** (configurar link)
- **Auth0 Dashboard:** https://manage.auth0.com/
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Stripe Dashboard:** https://dashboard.stripe.com/
- **GitHub Repo:** https://github.com/Mytoogood/buscadorReact

### Tecnologias Principais
- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/
- **Tailwind Docs:** https://tailwindcss.com/
- **Auth0 Docs:** https://auth0.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Netlify Docs:** https://docs.netlify.com/

---

## 🏁 CONCLUSÃO

Este é um projeto **moderno, bem estruturado e em produção** de busca de voos com foco em milhas.

**Pontos Fortes:**
- ✅ Stack tecnológico atual (React 19, Vite, TypeScript)
- ✅ Arquitetura bem organizada
- ✅ Sistema de autenticação robusto (Auth0)
- ✅ Integração com múltiplas APIs
- ✅ Design system consistente (Tailwind + Radix UI)
- ✅ Deploy automatizado (Netlify)
- ✅ Serverless backend
- ✅ Funcionalidades premium via Stripe

**Áreas de Melhoria:**
- 🔄 Consolidar arquivos duplicados
- 🔄 Adicionar testes automatizados
- 🔄 Melhorar documentação inline
- 🔄 Otimizar performance (bundle size)
- 🔄 Implementar melhor error handling

**Status Atual:**
- ✅ MVP em produção
- ✅ Autenticação funcional
- ✅ Busca de voos operacional
- ✅ Sistema de pagamento ativo
- 🚀 Pronto para evolução com MCP Agents

---

**Mapa de Conhecimento criado em:** 2025-10-17
**Por:** Claude Code (Sonnet 4.5)
**Para:** Bruno - Desenvolvedor
**Projeto:** buscadorReact v0.1.0

---

**🎯 Este documento serve como referência completa para:**
- Novos desenvolvedores que entram no projeto
- Claude Code em novos chats (copiar contexto relevante)
- Documentação técnica do sistema
- Planejamento de features futuras
- Troubleshooting e debug
- Onboarding de equipe

**✅ Mantenha este documento atualizado conforme o projeto evolui!**
