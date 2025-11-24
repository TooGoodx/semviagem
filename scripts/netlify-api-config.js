#!/usr/bin/env node

import https from 'https';
import fs from 'fs';

class NetlifyAPIConfigurator {
  constructor() {
    this.siteId = 'extraordinary-starship-9103ce';
    this.apiToken = process.env.NETLIFY_AUTH_TOKEN || 'NETLIFY_TOKEN_PLACEHOLDER';
  }

  // Configurar variáveis de ambiente via API
  async setEnvironmentVariables() {
    console.log('🔧 Configurando variáveis de ambiente no Netlify...');
    
    const envVars = {
      VITE_AUTH0_DOMAIN: 'dev-semviagem-mflqat7f.us.auth0.com',
      VITE_AUTH0_CLIENT_ID: 'auth0_client_mflqat7f',
      VITE_AUTH0_REDIRECT_URI: 'https://extraordinary-starship-9103ce.netlify.app/area-logada',
      VITE_AUTH0_AUDIENCE: 'https://dev-semviagem-mflqat7f.us.auth0.com/api/v2/'
    };

    if (this.apiToken === 'NETLIFY_TOKEN_PLACEHOLDER') {
      console.log('⚠️ Token do Netlify não configurado');
      console.log('📋 Configure manualmente no Netlify Dashboard:');
      console.log('https://app.netlify.com/sites/extraordinary-starship-9103ce/settings/deploys');
      console.log('\n🔑 Variáveis para configurar:');
      Object.entries(envVars).forEach(([key, value]) => {
        console.log(`${key}=${value}`);
      });
      return false;
    }

    // Configurar cada variável via API
    for (const [key, value] of Object.entries(envVars)) {
      try {
        await this.setEnvVar(key, value);
        console.log(`✅ ${key} configurado`);
      } catch (error) {
        console.log(`❌ Erro ao configurar ${key}:`, error.message);
      }
    }

    return true;
  }

  async setEnvVar(key, value) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        key: key,
        value: value,
        scopes: ['builds', 'functions']
      });

      const options = {
        hostname: 'api.netlify.com',
        port: 443,
        path: `/api/v1/sites/${this.siteId}/env`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Length': data.length
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          if (res.statusCode === 201 || res.statusCode === 200) {
            resolve(responseData);
          } else {
            reject(new Error(`Status: ${res.statusCode}, Response: ${responseData}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  // Trigger redeploy
  async triggerDeploy() {
    console.log('🚀 Iniciando redeploy...');
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.netlify.com',
        port: 443,
        path: `/api/v1/sites/${this.siteId}/deploys`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          if (res.statusCode === 201) {
            console.log('✅ Redeploy iniciado com sucesso');
            resolve(responseData);
          } else {
            reject(new Error(`Status: ${res.statusCode}`));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  async run() {
    try {
      const success = await this.setEnvironmentVariables();
      
      if (success) {
        await this.triggerDeploy();
        console.log('🎉 Configuração do Netlify concluída!');
      } else {
        console.log('📝 Configure manualmente as variáveis e faça redeploy');
      }
      
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
  }
}

const configurator = new NetlifyAPIConfigurator();
configurator.run();
