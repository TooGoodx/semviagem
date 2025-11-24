#!/usr/bin/env node

import https from 'https';
import fs from 'fs';

// Configurações do Netlify
const NETLIFY_SITE_ID = 'extraordinary-starship-9103ce';
const NETLIFY_API_TOKEN = process.env.NETLIFY_AUTH_TOKEN || 'YOUR_NETLIFY_TOKEN_HERE';

// Ler configurações geradas
const readEnvFile = () => {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        envVars[key.trim()] = value.trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Erro ao ler .env.local:', error.message);
    return null;
  }
};

// Configurar variáveis no Netlify via API
const setNetlifyEnvVars = async (envVars) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      env: envVars
    });

    const options = {
      hostname: 'api.netlify.com',
      port: 443,
      path: `/api/v1/sites/${NETLIFY_SITE_ID}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NETLIFY_API_TOKEN}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Variáveis configuradas no Netlify');
          resolve(responseData);
        } else {
          console.log('❌ Erro ao configurar variáveis:', res.statusCode);
          console.log('Resposta:', responseData);
          reject(new Error(`Status: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

// Executar configuração
const runConfig = async () => {
  console.log('🔧 Configurando variáveis de ambiente no Netlify...');
  
  const envVars = readEnvFile();
  if (!envVars) {
    console.log('❌ Não foi possível ler as variáveis de ambiente');
    return;
  }

  if (NETLIFY_API_TOKEN === 'YOUR_NETLIFY_TOKEN_HERE') {
    console.log('⚠️ Token do Netlify não configurado');
    console.log('📋 Configure manualmente no Netlify Dashboard:');
    console.log('https://app.netlify.com/sites/extraordinary-starship-9103ce/settings/deploys');
    console.log('\nVariáveis para configurar:');
    Object.entries(envVars).forEach(([key, value]) => {
      if (key.startsWith('VITE_')) {
        console.log(`${key}=${value}`);
      }
    });
    return;
  }

  try {
    await setNetlifyEnvVars(envVars);
    console.log('🚀 Fazendo redeploy...');
    // Trigger redeploy
    // ... código para redeploy
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
};

runConfig();
