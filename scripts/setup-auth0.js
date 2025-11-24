const https = require('https');
const fs = require('fs');

// Configuração Auth0
const AUTH0_DOMAIN = 'dev-4qj8x2kqh3n7m1pz.us.auth0.com';
const CLIENT_ID = 'your-management-api-client-id';
const CLIENT_SECRET = 'your-management-api-client-secret';

// URLs da aplicação
const APP_URLS = {
  production: 'https://extraordinary-starship-9103ce.netlify.app',
  development: 'http://localhost:5173'
};

class Auth0Setup {
  constructor() {
    this.accessToken = null;
  }

  // Obter token de acesso para Management API
  async getManagementToken() {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        audience: `https://${AUTH0_DOMAIN}/api/v2/`,
        grant_type: 'client_credentials'
      });

      const options = {
        hostname: AUTH0_DOMAIN,
        port: 443,
        path: '/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            this.accessToken = result.access_token;
            console.log('✅ Token de acesso obtido');
            resolve(result.access_token);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  // Criar aplicação SPA
  async createApplication() {
    if (!this.accessToken) {
      throw new Error('Token de acesso necessário');
    }

    return new Promise((resolve, reject) => {
      const appData = JSON.stringify({
        name: 'SemViagem React App',
        description: 'Aplicação React para SemViagem com múltiplos provedores de autenticação',
        app_type: 'spa',
        callbacks: [
          `${APP_URLS.production}/area-logada`,
          `${APP_URLS.development}/area-logada`
        ],
        allowed_logout_urls: [
          APP_URLS.production,
          APP_URLS.development
        ],
        allowed_origins: [
          APP_URLS.production,
          APP_URLS.development
        ],
        web_origins: [
          APP_URLS.production,
          APP_URLS.development
        ],
        grant_types: ['authorization_code', 'refresh_token'],
        token_endpoint_auth_method: 'none'
      });

      const options = {
        hostname: AUTH0_DOMAIN,
        port: 443,
        path: '/api/v2/clients',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Length': appData.length
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            if (res.statusCode === 201) {
              console.log('✅ Aplicação criada com sucesso');
              console.log(`📋 Client ID: ${result.client_id}`);
              this.saveCredentials(result);
              resolve(result);
            } else {
              console.log('ℹ️ Resposta:', responseData);
              reject(new Error(`Erro ao criar aplicação: ${res.statusCode}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.write(appData);
      req.end();
    });
  }

  // Habilitar conexões sociais
  async enableSocialConnections() {
    const connections = [
      { name: 'google-oauth2', strategy: 'google-oauth2' },
      { name: 'facebook', strategy: 'facebook' },
      { name: 'github', strategy: 'github' },
      { name: 'linkedin', strategy: 'linkedin' }
    ];

    for (const connection of connections) {
      try {
        await this.enableConnection(connection);
        console.log(`✅ Conexão ${connection.name} habilitada`);
      } catch (error) {
        console.log(`⚠️ Erro ao habilitar ${connection.name}:`, error.message);
      }
    }
  }

  async enableConnection(connection) {
    return new Promise((resolve, reject) => {
      const connectionData = JSON.stringify({
        name: connection.name,
        strategy: connection.strategy,
        enabled_clients: [], // Será preenchido após criar a aplicação
        options: {}
      });

      const options = {
        hostname: AUTH0_DOMAIN,
        port: 443,
        path: '/api/v2/connections',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Length': connectionData.length
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          if (res.statusCode === 201 || res.statusCode === 409) {
            resolve();
          } else {
            reject(new Error(`Status: ${res.statusCode}`));
          }
        });
      });

      req.on('error', reject);
      req.write(connectionData);
      req.end();
    });
  }

  // Salvar credenciais em arquivo
  saveCredentials(appData) {
    const credentials = {
      domain: AUTH0_DOMAIN,
      clientId: appData.client_id,
      redirectUri: `${APP_URLS.production}/area-logada`,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`
    };

    // Criar arquivo .env.local
    const envContent = `# Auth0 Configuration - Gerado automaticamente
VITE_AUTH0_DOMAIN=${credentials.domain}
VITE_AUTH0_CLIENT_ID=${credentials.clientId}
VITE_AUTH0_REDIRECT_URI=${credentials.redirectUri}
VITE_AUTH0_AUDIENCE=${credentials.audience}

# Supabase Configuration (configure manualmente)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

# Stripe Configuration (configure manualmente)
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
`;

    fs.writeFileSync('.env.local', envContent);
    console.log('📁 Arquivo .env.local criado');

    // Criar arquivo com instruções para Netlify
    const netlifyInstructions = `# Variáveis para Netlify Environment Variables

Copie e cole estas variáveis no Netlify Dashboard:
Site Settings → Environment Variables

VITE_AUTH0_DOMAIN=${credentials.domain}
VITE_AUTH0_CLIENT_ID=${credentials.clientId}
VITE_AUTH0_REDIRECT_URI=${credentials.redirectUri}
VITE_AUTH0_AUDIENCE=${credentials.audience}

# Após configurar, execute:
npm run build
netlify deploy --prod --dir=dist
`;

    fs.writeFileSync('netlify-env-vars.txt', netlifyInstructions);
    console.log('📋 Instruções para Netlify salvas em netlify-env-vars.txt');
  }

  // Executar setup completo
  async run() {
    try {
      console.log('🚀 Iniciando configuração Auth0...');
      
      await this.getManagementToken();
      const app = await this.createApplication();
      await this.enableSocialConnections();
      
      console.log('\n✅ Configuração concluída!');
      console.log('📝 Próximos passos:');
      console.log('1. Configure as variáveis no Netlify usando netlify-env-vars.txt');
      console.log('2. Configure as chaves dos provedores sociais no Auth0 Dashboard');
      console.log('3. Execute: npm run build && netlify deploy --prod --dir=dist');
      
    } catch (error) {
      console.error('❌ Erro na configuração:', error.message);
      console.log('\n🔧 Configuração manual necessária:');
      console.log('1. Acesse: https://manage.auth0.com');
      console.log('2. Crie uma nova aplicação SPA');
      console.log('3. Configure as URLs de callback e logout');
      console.log('4. Habilite as conexões sociais');
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const setup = new Auth0Setup();
  setup.run();
}

module.exports = Auth0Setup;
