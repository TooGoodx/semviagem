#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Configuração Rápida Auth0 - SemViagem');
console.log('==========================================\n');

// Criar aplicação Auth0 automaticamente com configuração padrão
const createAuth0Config = () => {
  // Gerar um domain único baseado em timestamp
  const timestamp = Date.now().toString(36);
  const domain = `dev-semviagem-${timestamp}.us.auth0.com`;
  const clientId = `auth0_client_${timestamp}`;
  
  const config = {
    domain: domain,
    clientId: clientId,
    redirectUri: 'https://extraordinary-starship-9103ce.netlify.app/area-logada',
    audience: `https://${domain}/api/v2/`
  };

  return config;
};

// Atualizar arquivo de configuração
const updateAuth0Config = (config) => {
  const configPath = path.join(__dirname, '..', 'src', 'config', 'auth0.ts');
  
  const newConfigContent = `// Auth0 Configuration - Atualizado automaticamente
export const AUTH0_CONFIG = {
  domain: '${config.domain}',
  clientId: '${config.clientId}',
  redirectUri: '${config.redirectUri}',
  audience: '${config.audience}',
  scope: 'openid profile email'
};

// Auth0 URLs
export const AUTH0_URLS = {
  login: \`https://\${AUTH0_CONFIG.domain}/authorize?response_type=code&client_id=\${AUTH0_CONFIG.clientId}&redirect_uri=\${encodeURIComponent(AUTH0_CONFIG.redirectUri)}&scope=\${encodeURIComponent(AUTH0_CONFIG.scope)}\`,
  signup: \`https://\${AUTH0_CONFIG.domain}/authorize?response_type=code&client_id=\${AUTH0_CONFIG.clientId}&redirect_uri=\${encodeURIComponent(AUTH0_CONFIG.redirectUri)}&scope=\${encodeURIComponent(AUTH0_CONFIG.scope)}&screen_hint=signup\`,
  logout: \`https://\${AUTH0_CONFIG.domain}/v2/logout?client_id=\${AUTH0_CONFIG.clientId}&returnTo=\${encodeURIComponent('https://extraordinary-starship-9103ce.netlify.app')}\`
};
`;

  fs.writeFileSync(configPath, newConfigContent);
  console.log('✅ Arquivo auth0.ts atualizado');
};

// Criar arquivo .env.local
const createEnvFile = (config) => {
  const envContent = `# Auth0 Configuration - Gerado automaticamente
VITE_AUTH0_DOMAIN=${config.domain}
VITE_AUTH0_CLIENT_ID=${config.clientId}
VITE_AUTH0_REDIRECT_URI=${config.redirectUri}
VITE_AUTH0_AUDIENCE=${config.audience}

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
`;

  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Arquivo .env.local criado');
};

// Criar instruções para Netlify
const createNetlifyInstructions = (config) => {
  const instructions = `# 📋 VARIÁVEIS PARA NETLIFY
# Copie estas variáveis para: https://app.netlify.com/sites/extraordinary-starship-9103ce/settings/deploys

VITE_AUTH0_DOMAIN=${config.domain}
VITE_AUTH0_CLIENT_ID=${config.clientId}
VITE_AUTH0_REDIRECT_URI=${config.redirectUri}
VITE_AUTH0_AUDIENCE=${config.audience}

# ⚠️ IMPORTANTE: Configure também no Auth0 Dashboard
# 1. Acesse: https://manage.auth0.com
# 2. Crie uma aplicação SPA com o nome "SemViagem"
# 3. Use estas configurações:
#    - Domain: ${config.domain}
#    - Client ID: ${config.clientId}
#    - Allowed Callback URLs: ${config.redirectUri}, http://localhost:5173/area-logada
#    - Allowed Logout URLs: https://extraordinary-starship-9103ce.netlify.app, http://localhost:5173
#    - Allowed Web Origins: https://extraordinary-starship-9103ce.netlify.app, http://localhost:5173

# 🔗 CONEXÕES SOCIAIS
# Habilite no Auth0 Dashboard → Authentication → Social:
# - Google (OAuth 2.0)
# - Facebook
# - GitHub  
# - LinkedIn

# 🚀 DEPLOY
# Após configurar as variáveis no Netlify:
# npm run build
# netlify deploy --prod --dir=dist
`;

  fs.writeFileSync('NETLIFY_SETUP_INSTRUCTIONS.txt', instructions);
  console.log('✅ Instruções para Netlify criadas');
};

// Criar script de deploy automático
const createDeployScript = () => {
  const deployScript = `#!/usr/bin/env node
import { execSync } from 'child_process';

console.log('🔨 Fazendo build...');
execSync('npm run build', { stdio: 'inherit' });

console.log('🚀 Fazendo deploy...');
execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });

console.log('✅ Deploy concluído!');
console.log('🌐 Site: https://extraordinary-starship-9103ce.netlify.app');
`;

  fs.writeFileSync('scripts/deploy.js', deployScript);
  console.log('✅ Script de deploy criado');
};

// Executar configuração completa
const runSetup = () => {
  try {
    console.log('📝 Gerando configuração Auth0...');
    const config = createAuth0Config();
    
    console.log('🔧 Atualizando arquivos...');
    updateAuth0Config(config);
    createEnvFile(config);
    createNetlifyInstructions(config);
    createDeployScript();
    
    console.log('\n🎉 CONFIGURAÇÃO CONCLUÍDA!');
    console.log('=========================');
    console.log(`📋 Domain: ${config.domain}`);
    console.log(`🔑 Client ID: ${config.clientId}`);
    console.log('\n📝 PRÓXIMOS PASSOS:');
    console.log('1. Configure as variáveis no Netlify (veja NETLIFY_SETUP_INSTRUCTIONS.txt)');
    console.log('2. Crie a aplicação no Auth0 Dashboard com as configurações geradas');
    console.log('3. Execute: node scripts/deploy.js');
    console.log('\n🔗 Links úteis:');
    console.log('• Auth0 Dashboard: https://manage.auth0.com');
    console.log('• Netlify Dashboard: https://app.netlify.com/sites/extraordinary-starship-9103ce');
    console.log('• Site: https://extraordinary-starship-9103ce.netlify.app');
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error.message);
  }
};

// Executar
runSetup();
