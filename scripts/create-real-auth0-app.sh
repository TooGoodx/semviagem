#!/bin/bash

# Script para criar aplicação Auth0 via API
echo "🚀 Criando aplicação SPA no Auth0..."

# Primeiro, obter token de Management API (requer configuração manual inicial)
echo "⚠️ Para usar este script, você precisa:"
echo "1. Criar uma aplicação Machine-to-Machine no Auth0 Dashboard"
echo "2. Autorizar para Management API com escopo create:clients"
echo "3. Substituir CLIENT_ID e CLIENT_SECRET abaixo"

CLIENT_ID="YOUR_M2M_CLIENT_ID"
CLIENT_SECRET="YOUR_M2M_CLIENT_SECRET"
DOMAIN="dev-semviagem-mflqat7f.us.auth0.com"

# Obter token de acesso
TOKEN_RESPONSE=$(curl -s -X POST "https://$DOMAIN/oauth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "'$CLIENT_ID'",
    "client_secret": "'$CLIENT_SECRET'",
    "audience": "https://'$DOMAIN'/api/v2/",
    "grant_type": "client_credentials"
  }')

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Erro ao obter token de acesso"
  echo "Resposta: $TOKEN_RESPONSE"
  exit 1
fi

echo "✅ Token obtido com sucesso"

# Criar aplicação SPA
APP_RESPONSE=$(curl -s -X POST "https://$DOMAIN/api/v2/clients" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SemViagem",
    "description": "Aplicação React SPA para SemViagem",
    "app_type": "spa",
    "callbacks": [
      "https://extraordinary-starship-9103ce.netlify.app/area-logada",
      "http://localhost:5173/area-logada"
    ],
    "allowed_logout_urls": [
      "https://extraordinary-starship-9103ce.netlify.app",
      "http://localhost:5173"
    ],
    "allowed_origins": [
      "https://extraordinary-starship-9103ce.netlify.app",
      "http://localhost:5173"
    ],
    "web_origins": [
      "https://extraordinary-starship-9103ce.netlify.app",
      "http://localhost:5173"
    ],
    "grant_types": ["authorization_code", "refresh_token"],
    "token_endpoint_auth_method": "none",
    "oidc_conformant": true
  }')

echo "📋 Resposta da criação da aplicação:"
echo "$APP_RESPONSE" | jq .

# Extrair Client ID da resposta
REAL_CLIENT_ID=$(echo $APP_RESPONSE | grep -o '"client_id":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$REAL_CLIENT_ID" ]; then
  echo "✅ Aplicação criada com sucesso!"
  echo "📋 Client ID real: $REAL_CLIENT_ID"
  echo "📋 Domain: $DOMAIN"
  
  # Atualizar arquivo de configuração
  echo "VITE_AUTH0_DOMAIN=$DOMAIN" > .env.production
  echo "VITE_AUTH0_CLIENT_ID=$REAL_CLIENT_ID" >> .env.production
  echo "VITE_AUTH0_REDIRECT_URI=https://extraordinary-starship-9103ce.netlify.app/area-logada" >> .env.production
  echo "VITE_AUTH0_AUDIENCE=https://$DOMAIN/api/v2/" >> .env.production
  
  echo "✅ Arquivo .env.production atualizado"
else
  echo "❌ Erro ao criar aplicação"
fi

echo "🔗 Próximo passo: Habilitar conexões sociais no Auth0 Dashboard"
echo "https://manage.auth0.com/dashboard/us/$(echo $DOMAIN | cut -d'.' -f1)/connections/social"
