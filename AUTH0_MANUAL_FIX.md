# 🔧 CONFIGURAÇÃO MANUAL NECESSÁRIA

## ❌ Problema Identificado
O domínio Auth0 simulado não existe realmente.
Erro: "Unknown host: dev-semviagem-mflqat7f.us.auth0.com"

## 🛠️ Solução: Criar Aplicação Auth0 Real

### 1. Acesse Auth0 Dashboard
https://manage.auth0.com

### 2. Crie uma Nova Aplicação
- Nome: **SemViagem**
- Tipo: **Single Page Web Applications**

### 3. Configure URLs
**Allowed Callback URLs:**
```
https://extraordinary-starship-9103ce.netlify.app/area-logada,http://localhost:5173/area-logada
```

**Allowed Logout URLs:**
```
https://extraordinary-starship-9103ce.netlify.app,http://localhost:5173
```

**Allowed Web Origins:**
```
https://extraordinary-starship-9103ce.netlify.app,http://localhost:5173
```

### 4. Obter Credenciais Reais
Após criar a aplicação, copie:
- **Domain** (ex: dev-abc123.us.auth0.com)
- **Client ID** (ex: xyz789...)

### 5. Atualizar Configurações
Execute este comando substituindo pelas credenciais reais:
```bash
# Substituir REAL_DOMAIN e REAL_CLIENT_ID
echo 'export const auth0Config = {
  domain: "REAL_DOMAIN",
  clientId: "REAL_CLIENT_ID",
  authorizationParams: {
    redirect_uri: typeof window !== "undefined" 
      ? window.location.origin + "/area-logada"
      : "https://extraordinary-starship-9103ce.netlify.app/area-logada",
    audience: "https://REAL_DOMAIN/api/v2/"
  }
};
export const AUTH0_CONFIG = auth0Config;' > src/config/auth0.ts
```

### 6. Build e Deploy
```bash
npm run build
netlify deploy --prod --dir=dist
```

## ✅ Resultado Esperado
Após usar credenciais reais do Auth0:
- ✅ Erro 404 resolvido
- ✅ Login social funcionando
- ✅ Redirecionamento correto

---
**IMPORTANTE**: Use apenas credenciais reais do Auth0 Dashboard
