# 🔧 CRIAR APLICAÇÃO AUTH0 REAL

## 1. Acesse Auth0 Dashboard
https://manage.auth0.com

## 2. Crie Nova Aplicação
- Clique em "Create Application"
- Nome: **SemViagem**
- Tipo: **Single Page Web Applications**
- Clique em "Create"

## 3. Configure URLs na aba Settings
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

## 4. Copie as Credenciais
Após salvar, copie:
- **Domain** (ex: dev-abc123.us.auth0.com)
- **Client ID** (ex: xyz789...)

## 5. Execute o Script de Atualização
```bash
node scripts/update-with-real-credentials.js DOMAIN CLIENT_ID
```

Exemplo:
```bash
node scripts/update-with-real-credentials.js dev-abc123.us.auth0.com xyz789abc123
```

## 6. Habilitar Conexões Sociais (Opcional)
- Vá em **Authentication > Social**
- Habilite Google, Facebook, GitHub, LinkedIn
- Configure credenciais de cada provedor

---
**IMPORTANTE**: Use apenas credenciais reais do Auth0 Dashboard
