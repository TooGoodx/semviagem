#!/usr/bin/env node

// Script para atualizar variáveis no Netlify via CLI
import { execSync } from 'child_process';

const envVars = {
  "VITE_AUTH0_DOMAIN": "dev-semviagem-mflqat7f.us.auth0.com",
  "VITE_AUTH0_CLIENT_ID": "auth0_client_mflqat7f",
  "VITE_AUTH0_REDIRECT_URI": "https://extraordinary-starship-9103ce.netlify.app/area-logada",
  "VITE_AUTH0_AUDIENCE": "https://dev-semviagem-mflqat7f.us.auth0.com/api/v2/"
};

console.log('🔧 Atualizando variáveis no Netlify...');

Object.entries(envVars).forEach(([key, value]) => {
  try {
    execSync(`netlify env:set ${key} "${value}"`, { stdio: 'inherit' });
    console.log(`✅ ${key} configurado`);
  } catch (error) {
    console.log(`⚠️ Erro ao configurar ${key}`);
  }
});

console.log('🚀 Fazendo redeploy...');
execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });
console.log('✅ Deploy concluído!');
