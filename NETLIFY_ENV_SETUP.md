# Configuração de Variáveis de Ambiente - Netlify

## 🚨 PROBLEMA IDENTIFICADO
As variáveis de ambiente do Auth0 estão com valores placeholder, causando o erro:
- `domain: dev-semviagem.us.auth0.com` (não existe)
- `client_id: your-client-id-here` (placeholder)

## ✅ SOLUÇÃO

### 1. Acesse o Netlify Dashboard
1. Vá para: https://app.netlify.com/sites/extraordinary-starship-9103ce/settings/deploys
2. Clique em "Environment variables"

### 2. Configure as Variáveis Auth0
```
VITE_AUTH0_DOMAIN = dev-4qj8x2kqh3n7m1pz.us.auth0.com
VITE_AUTH0_CLIENT_ID = [SEU_CLIENT_ID_REAL]
VITE_AUTH0_REDIRECT_URI = https://extraordinary-starship-9103ce.netlify.app/area-logada
VITE_AUTH0_AUDIENCE = https://dev-4qj8x2kqh3n7m1pz.us.auth0.com/api/v2/
```

### 3. Como Obter os Valores Corretos

#### Auth0 Dashboard:
1. Acesse: https://manage.auth0.com
2. Applications → SemViagem → Settings
3. Copie:
   - **Domain**: `dev-xxxxxxx.us.auth0.com`
   - **Client ID**: `xxxxxxxxxxxxxxxxx`

### 4. Configurar Social Connections
No Auth0 Dashboard:
1. Authentication → Social
2. Habilitar:
   - Google (OAuth 2.0)
   - Facebook
   - GitHub
   - LinkedIn

### 5. Configurar URLs Permitidas
Em Applications → SemViagem → Settings:

**Allowed Callback URLs:**
```
https://extraordinary-starship-9103ce.netlify.app/area-logada,
http://localhost:5173/area-logada
```

**Allowed Logout URLs:**
```
https://extraordinary-starship-9103ce.netlify.app,
http://localhost:5173
```

**Allowed Web Origins:**
```
https://extraordinary-starship-9103ce.netlify.app,
http://localhost:5173
```

### 6. Após Configurar as Variáveis
Execute novo deploy:
```bash
npm run build
netlify deploy --prod --dir=dist
```

## 🔍 Verificação
Após o deploy, teste:
1. Acesse: https://extraordinary-starship-9103ce.netlify.app/register
2. Clique em qualquer provedor social
3. Deve redirecionar para Auth0 (não mais erro 404)

## 📝 Variáveis Completas Necessárias
```env
# Auth0
VITE_AUTH0_DOMAIN=dev-xxxxxxx.us.auth0.com
VITE_AUTH0_CLIENT_ID=xxxxxxxxxxxxxxxxx
VITE_AUTH0_REDIRECT_URI=https://extraordinary-starship-9103ce.netlify.app/area-logada
VITE_AUTH0_AUDIENCE=https://dev-xxxxxxx.us.auth0.com/api/v2/

# Supabase (se usando)
VITE_SUPABASE_URL=https://xxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxx

# Stripe (se usando)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxx
```
