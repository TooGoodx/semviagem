# 🔧 CONFIGURAÇÃO AUTOMÁTICA NETLIFY

## 📋 Variáveis para Configurar
Acesse: https://app.netlify.com/sites/extraordinary-starship-9103ce/settings/deploys

Clique em "Environment variables" e adicione:

**VITE_AUTH0_DOMAIN**
`dev-semviagem-mflqat7f.us.auth0.com`

**VITE_AUTH0_CLIENT_ID**
`auth0_client_mflqat7f`

**VITE_AUTH0_REDIRECT_URI**
`https://extraordinary-starship-9103ce.netlify.app/area-logada`

**VITE_AUTH0_AUDIENCE**
`https://dev-semviagem-mflqat7f.us.auth0.com/api/v2/`


## 🚀 Após Configurar
1. Clique em "Save"
2. Vá para "Deploys" 
3. Clique em "Trigger deploy" → "Deploy site"

## ✅ Verificação
Após o deploy, acesse:
https://extraordinary-starship-9103ce.netlify.app/register

O erro 404 deve ser resolvido.
