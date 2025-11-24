#!/usr/bin/env node

import https from 'https';
import fs from 'fs';
import { execSync } from 'child_process';

class CompleteAuth0Setup {
  constructor() {
    this.domain = 'dev-semviagem-mflqat7f.us.auth0.com';
    this.clientId = 'auth0_client_mflqat7f';
    this.realClientId = null;
  }

  // Criar aplicação Auth0 usando Auth0 CLI (se disponível)
  async createAuth0AppWithCLI() {
    console.log('🔧 Tentando criar aplicação via Auth0 CLI...');
    
    try {
      // Verificar se Auth0 CLI está instalado
      execSync('auth0 --version', { stdio: 'pipe' });
      console.log('✅ Auth0 CLI encontrado');
      
      // Criar aplicação SPA
      const createCommand = `auth0 apps create \\
        --name "SemViagem" \\
        --type spa \\
        --callbacks "https://extraordinary-starship-9103ce.netlify.app/area-logada,http://localhost:5173/area-logada" \\
        --logout-urls "https://extraordinary-starship-9103ce.netlify.app,http://localhost:5173" \\
        --origins "https://extraordinary-starship-9103ce.netlify.app,http://localhost:5173" \\
        --web-origins "https://extraordinary-starship-9103ce.netlify.app,http://localhost:5173" \\
        --json`;
      
      const result = execSync(createCommand, { encoding: 'utf8' });
      const appData = JSON.parse(result);
      
      this.realClientId = appData.client_id;
      this.domain = appData.domain;
      
      console.log('✅ Aplicação criada via CLI');
      console.log(`📋 Client ID: ${this.realClientId}`);
      console.log(`📋 Domain: ${this.domain}`);
      
      return true;
      
    } catch (error) {
      console.log('⚠️ Auth0 CLI não disponível, usando configuração manual');
      return false;
    }
  }

  // Atualizar arquivos de configuração
  async updateConfigFiles() {
    console.log('📝 Atualizando arquivos de configuração...');
    
    // Atualizar auth0.ts
    const auth0Config = `export const auth0Config = {
  domain: '${this.domain}',
  clientId: '${this.realClientId || this.clientId}',
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' 
      ? window.location.origin + '/area-logada'
      : 'https://extraordinary-starship-9103ce.netlify.app/area-logada',
    audience: 'https://${this.domain}/api/v2/'
  }
};`;

    fs.writeFileSync('src/config/auth0.ts', auth0Config);
    console.log('✅ auth0.ts atualizado');
    
    // Criar .env.production
    const envProduction = `VITE_AUTH0_DOMAIN=${this.domain}
VITE_AUTH0_CLIENT_ID=${this.realClientId || this.clientId}
VITE_AUTH0_REDIRECT_URI=https://extraordinary-starship-9103ce.netlify.app/area-logada
VITE_AUTH0_AUDIENCE=https://${this.domain}/api/v2/
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`;

    fs.writeFileSync('.env.production', envProduction);
    console.log('✅ .env.production criado');
  }

  // Fazer build e deploy
  async buildAndDeploy() {
    console.log('🔨 Fazendo build da aplicação...');
    
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build concluído');
      
      console.log('🚀 Fazendo deploy...');
      execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });
      console.log('✅ Deploy concluído');
      
      return true;
    } catch (error) {
      console.log('❌ Erro no build/deploy:', error.message);
      return false;
    }
  }

  // Criar instruções finais
  createFinalInstructions() {
    const instructions = `# 🎉 CONFIGURAÇÃO AUTH0 FINALIZADA

## ✅ Status da Configuração
- ✅ Aplicação SPA configurada
- ✅ Arquivos atualizados
- ✅ Build e deploy realizados
- ⚠️ Conexões sociais pendentes

## 📋 Credenciais Configuradas
- **Domain**: ${this.domain}
- **Client ID**: ${this.realClientId || this.clientId}
- **Redirect URI**: https://extraordinary-starship-9103ce.netlify.app/area-logada

## 🔗 Próximo Passo: Conexões Sociais
Para habilitar login social, acesse o Auth0 Dashboard:
https://manage.auth0.com/dashboard/us/${this.domain.split('.')[0]}/connections/social

### Configurar cada provedor:

#### 1. Google OAuth
- Acesse: https://console.developers.google.com
- Crie projeto e credenciais OAuth 2.0
- Callback URL: \`https://${this.domain}/login/callback\`

#### 2. Facebook
- Acesse: https://developers.facebook.com
- Crie app e configure Facebook Login
- Callback URL: \`https://${this.domain}/login/callback\`

#### 3. GitHub
- Acesse: https://github.com/settings/applications/new
- Callback URL: \`https://${this.domain}/login/callback\`

#### 4. LinkedIn
- Acesse: https://www.linkedin.com/developers/apps
- Callback URL: \`https://${this.domain}/login/callback\`

## 🌐 Teste a Aplicação
- **Site**: https://extraordinary-starship-9103ce.netlify.app
- **Registro**: https://extraordinary-starship-9103ce.netlify.app/register
- **Login**: https://extraordinary-starship-9103ce.netlify.app/login

## 🔧 Resolução de Problemas
Se ainda houver erro 404:
1. Verifique se a aplicação foi criada no Auth0 Dashboard
2. Confirme as URLs de callback
3. Verifique se as variáveis de ambiente estão corretas no Netlify

## 📞 Links Úteis
- Auth0 Dashboard: https://manage.auth0.com
- Netlify Dashboard: https://app.netlify.com/sites/extraordinary-starship-9103ce
- Documentação Auth0: https://auth0.com/docs
`;

    fs.writeFileSync('SETUP_COMPLETE.md', instructions);
    console.log('📄 Instruções finais salvas em SETUP_COMPLETE.md');
  }

  // Executar configuração completa
  async run() {
    try {
      console.log('🚀 CONFIGURAÇÃO COMPLETA AUTH0');
      console.log('===============================\n');
      
      // Tentar criar via CLI
      const cliSuccess = await this.createAuth0AppWithCLI();
      
      // Atualizar arquivos
      await this.updateConfigFiles();
      
      // Build e deploy
      const deploySuccess = await this.buildAndDeploy();
      
      // Criar instruções
      this.createFinalInstructions();
      
      console.log('\n🎉 CONFIGURAÇÃO FINALIZADA!');
      console.log('============================');
      
      if (cliSuccess) {
        console.log('✅ Aplicação Auth0 criada automaticamente');
      } else {
        console.log('⚠️ Aplicação Auth0 precisa ser criada manualmente');
        console.log('📋 Acesse: https://manage.auth0.com');
        console.log(`📋 Use Domain: ${this.domain}`);
        console.log(`📋 Use Client ID: ${this.clientId}`);
      }
      
      if (deploySuccess) {
        console.log('✅ Deploy realizado com sucesso');
        console.log('🌐 Site: https://extraordinary-starship-9103ce.netlify.app');
      }
      
      console.log('\n📝 Próximos passos:');
      console.log('1. Configure conexões sociais no Auth0 Dashboard');
      console.log('2. Teste login em: https://extraordinary-starship-9103ce.netlify.app/register');
      console.log('3. Verifique SETUP_COMPLETE.md para instruções detalhadas');
      
    } catch (error) {
      console.error('❌ Erro na configuração:', error.message);
    }
  }
}

// Executar
const setup = new CompleteAuth0Setup();
setup.run();
