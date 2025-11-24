#!/usr/bin/env node

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
console.log(`Domain: ${domain}`);
console.log(`Client ID: ${clientId}`);

// Atualizar auth0.ts
const auth0Config = `export const auth0Config = {
  domain: '${domain}',
  clientId: '${clientId}',
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' 
      ? window.location.origin + '/area-logada'
      : 'https://extraordinary-starship-9103ce.netlify.app/area-logada',
    audience: 'https://${domain}/api/v2/'
  }
};

// Exportar também como AUTH0_CONFIG para compatibilidade
export const AUTH0_CONFIG = auth0Config;`;

fs.writeFileSync('src/config/auth0.ts', auth0Config);
console.log('✅ auth0.ts atualizado');

// Criar .env.production
const envProduction = `VITE_AUTH0_DOMAIN=${domain}
VITE_AUTH0_CLIENT_ID=${clientId}
VITE_AUTH0_REDIRECT_URI=https://extraordinary-starship-9103ce.netlify.app/area-logada
VITE_AUTH0_AUDIENCE=https://${domain}/api/v2/
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`;

fs.writeFileSync('.env.production', envProduction);
console.log('✅ .env.production atualizado');

// Build e deploy
console.log('🔨 Fazendo build...');
execSync('npm run build', { stdio: 'inherit' });

console.log('🚀 Fazendo deploy...');
execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });

console.log('\n🎉 CONFIGURAÇÃO CONCLUÍDA!');
console.log('✅ Credenciais reais configuradas');
console.log('✅ Build e deploy realizados');
console.log('🌐 Teste: https://extraordinary-starship-9103ce.netlify.app/register');
