#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

class RealAuth0Setup {
  constructor() {
    // Usar tenant Auth0 público para desenvolvimento
    this.domain = 'dev-semviagem.us.auth0.com';
    this.clientId = 'YOUR_CLIENT_ID_HERE';
  }

  // Criar aplicação Auth0 real
  createRealApplication() {
    console.log('🚀 Configurando aplicação Auth0 real...');
    
    const instructions = `# 🔧 CRIAR APLICAÇÃO AUTH0 REAL

## 1. Acesse Auth0 Dashboard
https://manage.auth0.com

## 2. Crie Nova Aplicação
- Clique em "Create Application"
- Nome: **SemViagem**
- Tipo: **Single Page Web Applications**
- Clique em "Create"

## 3. Configure URLs na aba Settings
**Allowed Callback URLs:**
\`\`\`
https://extraordinary-starship-9103ce.netlify.app/area-logada,http://localhost:5173/area-logada
\`\`\`

**Allowed Logout URLs:**
\`\`\`
https://extraordinary-starship-9103ce.netlify.app,http://localhost:5173
\`\`\`

**Allowed Web Origins:**
\`\`\`
https://extraordinary-starship-9103ce.netlify.app,http://localhost:5173
\`\`\`

## 4. Copie as Credenciais
Após salvar, copie:
- **Domain** (ex: dev-abc123.us.auth0.com)
- **Client ID** (ex: xyz789...)

## 5. Execute o Script de Atualização
\`\`\`bash
node scripts/update-with-real-credentials.js DOMAIN CLIENT_ID
\`\`\`

Exemplo:
\`\`\`bash
node scripts/update-with-real-credentials.js dev-abc123.us.auth0.com xyz789abc123
\`\`\`

## 6. Habilitar Conexões Sociais (Opcional)
- Vá em **Authentication > Social**
- Habilite Google, Facebook, GitHub, LinkedIn
- Configure credenciais de cada provedor

---
**IMPORTANTE**: Use apenas credenciais reais do Auth0 Dashboard
`;

    fs.writeFileSync('CREATE_REAL_AUTH0_APP.md', instructions);
    console.log('📄 Instruções salvas em CREATE_REAL_AUTH0_APP.md');
  }

  // Criar script para atualizar com credenciais reais
  createUpdateScript() {
    const updateScript = `#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('❌ Uso: node update-with-real-credentials.js DOMAIN CLIENT_ID');
  console.log('Exemplo: node update-with-real-credentials.js dev-abc123.us.auth0.com xyz789abc123');
  process.exit(1);
}

const [domain, clientId] = args;

console.log('🔧 Atualizando com credenciais reais...');
console.log(\`Domain: \${domain}\`);
console.log(\`Client ID: \${clientId}\`);

// Atualizar auth0.ts
const auth0Config = \`export const auth0Config = {
  domain: '\${domain}',
  clientId: '\${clientId}',
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' 
      ? window.location.origin + '/area-logada'
      : 'https://extraordinary-starship-9103ce.netlify.app/area-logada',
    audience: 'https://\${domain}/api/v2/'
  }
};

// Exportar também como AUTH0_CONFIG para compatibilidade
export const AUTH0_CONFIG = auth0Config;\`;

fs.writeFileSync('src/config/auth0.ts', auth0Config);
console.log('✅ auth0.ts atualizado');

// Criar .env.production
const envProduction = \`VITE_AUTH0_DOMAIN=\${domain}
VITE_AUTH0_CLIENT_ID=\${clientId}
VITE_AUTH0_REDIRECT_URI=https://extraordinary-starship-9103ce.netlify.app/area-logada
VITE_AUTH0_AUDIENCE=https://\${domain}/api/v2/
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...\`;

fs.writeFileSync('.env.production', envProduction);
console.log('✅ .env.production atualizado');

// Build e deploy
console.log('🔨 Fazendo build...');
execSync('npm run build', { stdio: 'inherit' });

console.log('🚀 Fazendo deploy...');
execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });

console.log('\\n🎉 CONFIGURAÇÃO CONCLUÍDA!');
console.log('✅ Credenciais reais configuradas');
console.log('✅ Build e deploy realizados');
console.log('🌐 Teste: https://extraordinary-starship-9103ce.netlify.app/register');
`;

    fs.writeFileSync('scripts/update-with-real-credentials.js', updateScript);
    console.log('✅ Script de atualização criado');
  }

  // Configurar com placeholder temporário
  setupTemporaryConfig() {
    console.log('⚠️ Configurando placeholder temporário...');
    
    const auth0Config = `export const auth0Config = {
  domain: 'PLACEHOLDER_DOMAIN',
  clientId: 'PLACEHOLDER_CLIENT_ID',
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' 
      ? window.location.origin + '/area-logada'
      : 'https://extraordinary-starship-9103ce.netlify.app/area-logada',
    audience: 'https://PLACEHOLDER_DOMAIN/api/v2/'
  }
};

// Exportar também como AUTH0_CONFIG para compatibilidade
export const AUTH0_CONFIG = auth0Config;`;

    fs.writeFileSync('src/config/auth0.ts', auth0Config);
    console.log('✅ Placeholder configurado');
  }

  run() {
    console.log('🚀 CONFIGURAÇÃO AUTH0 REAL');
    console.log('==========================\n');
    
    this.createRealApplication();
    this.createUpdateScript();
    this.setupTemporaryConfig();
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Siga as instruções em CREATE_REAL_AUTH0_APP.md');
    console.log('2. Crie aplicação no Auth0 Dashboard');
    console.log('3. Execute o script com suas credenciais reais');
    console.log('\n🌐 Auth0 Dashboard: https://manage.auth0.com');
  }
}

const setup = new RealAuth0Setup();
setup.run();
