#!/usr/bin/env node

import https from 'https';
import { execSync } from 'child_process';

class NetlifyEnvConfigurator {
  constructor() {
    this.siteId = 'extraordinary-starship-9103ce';
  }

  // Configurar variáveis usando Netlify CLI
  async configureWithCLI() {
    console.log('🔧 Configurando variáveis no Netlify via CLI...');
    
    const envVars = {
      'VITE_AUTH0_DOMAIN': 'dev-semviagem-mflqat7f.us.auth0.com',
      'VITE_AUTH0_CLIENT_ID': 'auth0_client_mflqat7f',
      'VITE_AUTH0_REDIRECT_URI': 'https://extraordinary-starship-9103ce.netlify.app/area-logada',
      'VITE_AUTH0_AUDIENCE': 'https://dev-semviagem-mflqat7f.us.auth0.com/api/v2/'
    };

    try {
      // Verificar se Netlify CLI está disponível
      execSync('netlify --version', { stdio: 'pipe' });
      console.log('✅ Netlify CLI encontrado');

      // Configurar cada variável
      for (const [key, value] of Object.entries(envVars)) {
        try {
          execSync(`netlify env:set "${key}" "${value}"`, { stdio: 'inherit' });
          console.log(`✅ ${key} configurado`);
        } catch (error) {
          console.log(`⚠️ Erro ao configurar ${key}`);
        }
      }

      // Fazer redeploy
      console.log('🚀 Fazendo redeploy...');
      execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });
      console.log('✅ Deploy concluído com novas variáveis!');
      
      return true;
      
    } catch (error) {
      console.log('❌ Netlify CLI não disponível');
      return false;
    }
  }

  // Configurar via interface web (instruções automatizadas)
  async configureViaWeb() {
    console.log('🌐 Configurando via Netlify Dashboard...');
    
    const envVars = {
      'VITE_AUTH0_DOMAIN': 'dev-semviagem-mflqat7f.us.auth0.com',
      'VITE_AUTH0_CLIENT_ID': 'auth0_client_mflqat7f',
      'VITE_AUTH0_REDIRECT_URI': 'https://extraordinary-starship-9103ce.netlify.app/area-logada',
      'VITE_AUTH0_AUDIENCE': 'https://dev-semviagem-mflqat7f.us.auth0.com/api/v2/'
    };

    // Criar script de configuração manual
    const instructions = `# 🔧 CONFIGURAÇÃO AUTOMÁTICA NETLIFY

## 📋 Variáveis para Configurar
Acesse: https://app.netlify.com/sites/extraordinary-starship-9103ce/settings/deploys

Clique em "Environment variables" e adicione:

${Object.entries(envVars).map(([key, value]) => `**${key}**
\`${value}\`
`).join('\n')}

## 🚀 Após Configurar
1. Clique em "Save"
2. Vá para "Deploys" 
3. Clique em "Trigger deploy" → "Deploy site"

## ✅ Verificação
Após o deploy, acesse:
https://extraordinary-starship-9103ce.netlify.app/register

O erro 404 deve ser resolvido.
`;

    console.log(instructions);
    
    // Salvar instruções
    const fs = await import('fs');
    fs.writeFileSync('NETLIFY_CONFIG_INSTRUCTIONS.md', instructions);
    console.log('📄 Instruções salvas em NETLIFY_CONFIG_INSTRUCTIONS.md');
    
    return false;
  }

  async run() {
    console.log('🚀 CONFIGURAÇÃO NETLIFY AUTOMÁTICA');
    console.log('===================================\n');
    
    // Tentar via CLI primeiro
    const cliSuccess = await this.configureWithCLI();
    
    if (!cliSuccess) {
      // Fallback para instruções web
      await this.configureViaWeb();
      
      console.log('\n📝 PRÓXIMOS PASSOS:');
      console.log('1. Siga as instruções em NETLIFY_CONFIG_INSTRUCTIONS.md');
      console.log('2. Configure as variáveis no Netlify Dashboard');
      console.log('3. Faça redeploy do site');
    } else {
      console.log('\n🎉 CONFIGURAÇÃO CONCLUÍDA!');
      console.log('✅ Variáveis configuradas automaticamente');
      console.log('✅ Site redesployado');
      console.log('🌐 Teste: https://extraordinary-starship-9103ce.netlify.app');
    }
  }
}

const configurator = new NetlifyEnvConfigurator();
configurator.run();
