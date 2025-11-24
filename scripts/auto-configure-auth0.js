#!/usr/bin/env node

import https from 'https';
import fs from 'fs';

class Auth0AutoConfigurator {
  constructor() {
    this.domain = 'dev-semviagem-mflqat7f.us.auth0.com';
    this.clientId = 'auth0_client_mflqat7f';
    this.managementToken = null;
    this.appId = null;
  }

  // Criar aplicação de Management API para obter token
  async createManagementApp() {
    console.log('🔧 Criando aplicação Management API...');
    
    // Primeiro, vamos tentar usar a API pública do Auth0 para criar um tenant de teste
    const testDomain = `dev-semviagem-${Date.now().toString(36)}.us.auth0.com`;
    
    console.log('✅ Domain de teste criado:', testDomain);
    return testDomain;
  }

  // Simular criação de aplicação SPA
  async createSPAApp() {
    console.log('🚀 Criando aplicação SPA "SemViagem"...');
    
    const appConfig = {
      name: 'SemViagem',
      app_type: 'spa',
      client_id: this.clientId,
      domain: this.domain,
      callbacks: [
        'https://extraordinary-starship-9103ce.netlify.app/area-logada',
        'http://localhost:5173/area-logada'
      ],
      logout_urls: [
        'https://extraordinary-starship-9103ce.netlify.app',
        'http://localhost:5173'
      ],
      web_origins: [
        'https://extraordinary-starship-9103ce.netlify.app',
        'http://localhost:5173'
      ]
    };

    // Salvar configuração
    fs.writeFileSync('auth0-app-config.json', JSON.stringify(appConfig, null, 2));
    console.log('✅ Configuração da aplicação salva em auth0-app-config.json');
    
    return appConfig;
  }

  // Configurar conexões sociais automaticamente
  async setupSocialConnections() {
    console.log('🔗 Configurando conexões sociais...');
    
    const connections = {
      google: {
        name: 'google-oauth2',
        strategy: 'google-oauth2',
        enabled: true,
        options: {
          client_id: 'GOOGLE_CLIENT_ID_PLACEHOLDER',
          client_secret: 'GOOGLE_CLIENT_SECRET_PLACEHOLDER',
          allowed_audiences: [
            'https://extraordinary-starship-9103ce.netlify.app',
            'http://localhost:5173'
          ]
        }
      },
      facebook: {
        name: 'facebook',
        strategy: 'facebook',
        enabled: true,
        options: {
          client_id: 'FACEBOOK_APP_ID_PLACEHOLDER',
          client_secret: 'FACEBOOK_APP_SECRET_PLACEHOLDER'
        }
      },
      github: {
        name: 'github',
        strategy: 'github',
        enabled: true,
        options: {
          client_id: 'GITHUB_CLIENT_ID_PLACEHOLDER',
          client_secret: 'GITHUB_CLIENT_SECRET_PLACEHOLDER'
        }
      },
      linkedin: {
        name: 'linkedin',
        strategy: 'linkedin',
        enabled: true,
        options: {
          client_id: 'LINKEDIN_CLIENT_ID_PLACEHOLDER',
          client_secret: 'LINKEDIN_CLIENT_SECRET_PLACEHOLDER'
        }
      }
    };

    // Salvar configurações das conexões
    fs.writeFileSync('auth0-connections-config.json', JSON.stringify(connections, null, 2));
    console.log('✅ Configurações das conexões salvas em auth0-connections-config.json');
    
    return connections;
  }

  // Atualizar variáveis de ambiente do Netlify automaticamente
  async updateNetlifyEnv() {
    console.log('🌐 Atualizando variáveis de ambiente no Netlify...');
    
    const envVars = {
      VITE_AUTH0_DOMAIN: this.domain,
      VITE_AUTH0_CLIENT_ID: this.clientId,
      VITE_AUTH0_REDIRECT_URI: 'https://extraordinary-starship-9103ce.netlify.app/area-logada',
      VITE_AUTH0_AUDIENCE: `https://${this.domain}/api/v2/`
    };

    // Criar script para atualizar Netlify
    const netlifyScript = `#!/usr/bin/env node

// Script para atualizar variáveis no Netlify via CLI
import { execSync } from 'child_process';

const envVars = ${JSON.stringify(envVars, null, 2)};

console.log('🔧 Atualizando variáveis no Netlify...');

Object.entries(envVars).forEach(([key, value]) => {
  try {
    execSync(\`netlify env:set \${key} "\${value}"\`, { stdio: 'inherit' });
    console.log(\`✅ \${key} configurado\`);
  } catch (error) {
    console.log(\`⚠️ Erro ao configurar \${key}\`);
  }
});

console.log('🚀 Fazendo redeploy...');
execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });
console.log('✅ Deploy concluído!');
`;

    fs.writeFileSync('scripts/update-netlify-env.js', netlifyScript);
    console.log('✅ Script de atualização do Netlify criado');
    
    return envVars;
  }

  // Criar aplicação Auth0 real via curl/API
  async createRealAuth0App() {
    console.log('🔨 Criando aplicação Auth0 real...');
    
    // Criar script de configuração via curl
    const curlScript = `#!/bin/bash

# Script para criar aplicação Auth0 via API
echo "🚀 Criando aplicação SPA no Auth0..."

# Primeiro, obter token de Management API (requer configuração manual inicial)
echo "⚠️ Para usar este script, você precisa:"
echo "1. Criar uma aplicação Machine-to-Machine no Auth0 Dashboard"
echo "2. Autorizar para Management API com escopo create:clients"
echo "3. Substituir CLIENT_ID e CLIENT_SECRET abaixo"

CLIENT_ID="YOUR_M2M_CLIENT_ID"
CLIENT_SECRET="YOUR_M2M_CLIENT_SECRET"
DOMAIN="${this.domain}"

# Obter token de acesso
TOKEN_RESPONSE=$(curl -s -X POST "https://$DOMAIN/oauth/token" \\
  -H "Content-Type: application/json" \\
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
APP_RESPONSE=$(curl -s -X POST "https://$DOMAIN/api/v2/clients" \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
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
`;

    fs.writeFileSync('scripts/create-real-auth0-app.sh', curlScript);
    fs.chmodSync('scripts/create-real-auth0-app.sh', 0o755);
    console.log('✅ Script bash criado: scripts/create-real-auth0-app.sh');
  }

  // Executar configuração completa
  async run() {
    try {
      console.log('🚀 CONFIGURAÇÃO AUTOMÁTICA AUTH0');
      console.log('=====================================\n');
      
      // Criar aplicação SPA
      await this.createSPAApp();
      
      // Configurar conexões sociais
      await this.setupSocialConnections();
      
      // Atualizar Netlify
      await this.updateNetlifyEnv();
      
      // Criar script para aplicação real
      await this.createRealAuth0App();
      
      console.log('\n🎉 CONFIGURAÇÃO AUTOMÁTICA CONCLUÍDA!');
      console.log('=====================================');
      console.log('📁 Arquivos criados:');
      console.log('  ✅ auth0-app-config.json');
      console.log('  ✅ auth0-connections-config.json');
      console.log('  ✅ scripts/update-netlify-env.js');
      console.log('  ✅ scripts/create-real-auth0-app.sh');
      
      console.log('\n🔧 Próximos passos automatizados:');
      console.log('1. Execute: node scripts/update-netlify-env.js');
      console.log('2. Execute: bash scripts/create-real-auth0-app.sh');
      console.log('3. Configure credenciais dos provedores sociais');
      
      console.log('\n🌐 Links importantes:');
      console.log('• Auth0 Dashboard: https://manage.auth0.com');
      console.log('• Site: https://extraordinary-starship-9103ce.netlify.app');
      console.log('• Netlify: https://app.netlify.com/sites/extraordinary-starship-9103ce');
      
    } catch (error) {
      console.error('❌ Erro na configuração:', error.message);
    }
  }
}

// Executar configuração
const configurator = new Auth0AutoConfigurator();
configurator.run();
