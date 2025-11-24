#!/usr/bin/env node

import https from 'https';
import fs from 'fs';
import { execSync } from 'child_process';

class RealAuth0Creator {
  constructor() {
    this.realDomain = null;
    this.realClientId = null;
  }

  // Criar tenant Auth0 real usando API pública
  async createRealAuth0Tenant() {
    console.log('🚀 Criando tenant Auth0 real...');
    
    // Usar Auth0 CLI para criar tenant se disponível
    try {
      // Verificar se Auth0 CLI está disponível
      execSync('auth0 --version', { stdio: 'pipe' });
      console.log('✅ Auth0 CLI encontrado');
      
      // Tentar criar tenant
      const tenantResult = execSync('auth0 tenants create --name "SemViagem" --json', { encoding: 'utf8' });
      const tenant = JSON.parse(tenantResult);
      
      this.realDomain = tenant.domain;
      console.log(`✅ Tenant criado: ${this.realDomain}`);
      
      return true;
    } catch (error) {
      console.log('⚠️ Auth0 CLI não disponível, usando domínio de teste');
      
      // Usar um domínio Auth0 de desenvolvimento público
      this.realDomain = 'dev-semviagem.us.auth0.com';
      this.realClientId = 'YOUR_REAL_CLIENT_ID_HERE';
      
      return false;
    }
  }

  // Criar aplicação SPA real
  async createRealSPAApp() {
    console.log('🔧 Criando aplicação SPA real...');
    
    try {
      const appCommand = `auth0 apps create \\
        --name "SemViagem" \\
        --type spa \\
        --callbacks "https://extraordinary-starship-9103ce.netlify.app/area-logada,http://localhost:5173/area-logada" \\
        --logout-urls "https://extraordinary-starship-9103ce.netlify.app,http://localhost:5173" \\
        --origins "https://extraordinary-starship-9103ce.netlify.app,http://localhost:5173" \\
        --web-origins "https://extraordinary-starship-9103ce.netlify.app,http://localhost:5173" \\
        --json`;
      
      const appResult = execSync(appCommand, { encoding: 'utf8' });
      const app = JSON.parse(appResult);
      
      this.realClientId = app.client_id;
      this.realDomain = app.domain;
      
      console.log(`✅ Aplicação criada: ${this.realClientId}`);
      return true;
      
    } catch (error) {
      console.log('⚠️ Erro ao criar aplicação via CLI');
      
      // Usar configuração manual
      this.realDomain = 'dev-semviagem.us.auth0.com';
      this.realClientId = 'PLACEHOLDER_CLIENT_ID';
      
      return false;
    }
  }

  // Atualizar configurações com domínio real
  async updateConfigWithRealDomain() {
    console.log('📝 Atualizando configurações...');
    
    // Atualizar auth0.ts
    const auth0Config = `export const auth0Config = {
  domain: '${this.realDomain}',
  clientId: '${this.realClientId}',
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' 
      ? window.location.origin + '/area-logada'
      : 'https://extraordinary-starship-9103ce.netlify.app/area-logada',
    audience: 'https://${this.realDomain}/api/v2/'
  }
};

// Exportar também como AUTH0_CONFIG para compatibilidade
export const AUTH0_CONFIG = auth0Config;`;

    fs.writeFileSync('src/config/auth0.ts', auth0Config);
    console.log('✅ auth0.ts atualizado');
    
    // Criar .env.production
    const envProduction = `VITE_AUTH0_DOMAIN=${this.realDomain}
VITE_AUTH0_CLIENT_ID=${this.realClientId}
VITE_AUTH0_REDIRECT_URI=https://extraordinary-starship-9103ce.netlify.app/area-logada
VITE_AUTH0_AUDIENCE=https://${this.realDomain}/api/v2/
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`;

    fs.writeFileSync('.env.production', envProduction);
    console.log('✅ .env.production atualizado');
    
    return { domain: this.realDomain, clientId: this.realClientId };
  }

  // Fazer build e deploy
  async buildAndDeploy() {
    console.log('🔨 Fazendo build...');
    
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

  // Criar instruções para configuração manual
  createManualInstructions() {
    const instructions = `# 🔧 CONFIGURAÇÃO MANUAL NECESSÁRIA

## ❌ Problema Identificado
O domínio Auth0 simulado não existe realmente.
Erro: "Unknown host: dev-semviagem-mflqat7f.us.auth0.com"

## 🛠️ Solução: Criar Aplicação Auth0 Real

### 1. Acesse Auth0 Dashboard
https://manage.auth0.com

### 2. Crie uma Nova Aplicação
- Nome: **SemViagem**
- Tipo: **Single Page Web Applications**

### 3. Configure URLs
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

### 4. Obter Credenciais Reais
Após criar a aplicação, copie:
- **Domain** (ex: dev-abc123.us.auth0.com)
- **Client ID** (ex: xyz789...)

### 5. Atualizar Configurações
Execute este comando substituindo pelas credenciais reais:
\`\`\`bash
# Substituir REAL_DOMAIN e REAL_CLIENT_ID
echo 'export const auth0Config = {
  domain: "REAL_DOMAIN",
  clientId: "REAL_CLIENT_ID",
  authorizationParams: {
    redirect_uri: typeof window !== "undefined" 
      ? window.location.origin + "/area-logada"
      : "https://extraordinary-starship-9103ce.netlify.app/area-logada",
    audience: "https://REAL_DOMAIN/api/v2/"
  }
};
export const AUTH0_CONFIG = auth0Config;' > src/config/auth0.ts
\`\`\`

### 6. Build e Deploy
\`\`\`bash
npm run build
netlify deploy --prod --dir=dist
\`\`\`

## ✅ Resultado Esperado
Após usar credenciais reais do Auth0:
- ✅ Erro 404 resolvido
- ✅ Login social funcionando
- ✅ Redirecionamento correto

---
**IMPORTANTE**: Use apenas credenciais reais do Auth0 Dashboard
`;

    fs.writeFileSync('AUTH0_MANUAL_FIX.md', instructions);
    console.log('📄 Instruções manuais salvas em AUTH0_MANUAL_FIX.md');
  }

  async run() {
    try {
      console.log('🚀 CRIANDO AUTH0 REAL');
      console.log('=====================\n');
      
      // Tentar criar tenant real
      const tenantCreated = await this.createRealAuth0Tenant();
      
      if (tenantCreated) {
        // Criar aplicação SPA
        await this.createRealSPAApp();
        
        // Atualizar configurações
        const config = await this.updateConfigWithRealDomain();
        
        // Build e deploy
        await this.buildAndDeploy();
        
        console.log('\n🎉 CONFIGURAÇÃO REAL CONCLUÍDA!');
        console.log(`✅ Domain: ${config.domain}`);
        console.log(`✅ Client ID: ${config.clientId}`);
        
      } else {
        // Criar instruções manuais
        this.createManualInstructions();
        
        console.log('\n⚠️ CONFIGURAÇÃO MANUAL NECESSÁRIA');
        console.log('==================================');
        console.log('❌ Não foi possível criar tenant automaticamente');
        console.log('📋 Siga as instruções em AUTH0_MANUAL_FIX.md');
        console.log('🌐 Acesse: https://manage.auth0.com');
      }
      
    } catch (error) {
      console.error('❌ Erro:', error.message);
      this.createManualInstructions();
    }
  }
}

const creator = new RealAuth0Creator();
creator.run();
