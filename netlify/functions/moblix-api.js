const https = require('https');
const querystring = require('querystring');

// Credenciais atualizadas da API Moblix
const AUTH_CREDENTIALS = {
  username: 'TooGood',
  password: '23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7'
};

// Cache para armazenar token temporariamente
let tokenCache = {
  access_token: null,
  expires_at: null
};

// Função para obter token de autenticação
async function getAuthToken() {
  // Verifica se o token em cache ainda é válido (com margem de 5 minutos)
  const now = new Date().getTime();
  if (tokenCache.access_token && tokenCache.expires_at && now < (tokenCache.expires_at - 300000)) {
    console.log('🔑 Usando token em cache');
    return tokenCache.access_token;
  }
  
  console.log('🔄 Solicitando novo token da API Moblix...');
  
  return new Promise((resolve, reject) => {
    const formData = querystring.stringify({
      grant_type: 'password',
      username: AUTH_CREDENTIALS.username,
      password: AUTH_CREDENTIALS.password
    });
    
    const options = {
      hostname: 'api.moblix.com.br',
      port: 443,
      path: '/api/Token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'externo',
        'Content-Length': Buffer.byteLength(formData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.access_token) {
            // Cacheia o token com tempo de expiração
            tokenCache.access_token = response.access_token;
            tokenCache.expires_at = now + (response.expires_in * 1000); // expires_in em segundos
            console.log('✅ Token obtido com sucesso');
            resolve(response.access_token);
          } else {
            console.error('❌ Resposta do token inválida:', response);
            reject(new Error('Token de acesso não encontrado na resposta'));
          }
        } catch (error) {
          console.error('❌ Erro ao processar resposta do token:', error);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Erro na requisição do token:', error);
      reject(error);
    });
    
    req.write(formData);
    req.end();
  });
}

// Função auxiliar para fazer requisições à API Moblix
async function makeApiRequest(endpoint, method, requestData, authToken) {
  return new Promise((resolve, reject) => {
    let bodyData = '';
    
    if (method === 'POST' && requestData) {
      bodyData = typeof requestData === 'string' ? requestData : JSON.stringify(requestData);
    }
    
    const options = {
      hostname: 'api.moblix.com.br',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Origin': 'externo',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    // Só adiciona Content-Type e Content-Length para POST
    if (method === 'POST' && bodyData) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(bodyData);
    }
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`📡 API Response Status: ${res.statusCode}`);
          
          if (res.statusCode === 200) {
            resolve(response);
          } else {
            console.error('❌ API Error Response:', response);
            reject(new Error(`API returned status ${res.statusCode}: ${response.message || 'Unknown error'}`));
          }
        } catch (error) {
          console.error('❌ Erro ao processar resposta JSON:', error);
          console.error('❌ Dados recebidos:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Erro na requisição HTTP:', error);
      reject(error);
    });
    
    req.on('timeout', () => {
      console.error('❌ Timeout na requisição');
      reject(new Error('Timeout na requisição à API Moblix'));
    });
    
    req.setTimeout(30000); // 30 segundos timeout (aumentado)
    
    if (method === 'POST' && bodyData) {
      req.write(bodyData);
    }
    
    req.end();
  });
}

exports.handler = async (event, context) => {
  // Configurar timeout maior para aguardar a API Moblix
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Allow CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('🚀 Netlify Function - Requisição recebida:', {
      path: event.path,
      method: event.httpMethod,
      queryParams: event.queryStringParameters
    });
    
    // Extrai o caminho da API removendo o prefixo da função Netlify
    let apiPath = event.path.replace('/.netlify/functions/moblix-api', '');
    
    // Se o caminho for especificamente da API de consulta de voos
    if (apiPath.includes('/api/ConsultaAereo/Consultar')) {
      console.log('📡 Processando busca de voos...');
      
      // Parse do body da requisição
      let requestData;
      try {
        console.log('📥 Recebido event.body:', typeof event.body, event.body);
        
        // Handle structured request from React app: {path, method, body}
        if (event.body) {
          let parsedBody;
          
          if (typeof event.body === 'string') {
            parsedBody = JSON.parse(event.body);
          } else {
            parsedBody = event.body;
          }
          
          // Check if it's the structured format from FlightResults.tsx
          if (parsedBody.path && parsedBody.method && parsedBody.body) {
            console.log('📨 Structured request detected from React app');
            console.log('   Path:', parsedBody.path);
            console.log('   Method:', parsedBody.method);
            
            // Extract the actual flight search data
            if (typeof parsedBody.body === 'string') {
              requestData = JSON.parse(parsedBody.body);
            } else {
              requestData = parsedBody.body;
            }
          } else {
            // Direct request format
            requestData = parsedBody;
          }
        } else {
          requestData = {};
        }
        
        console.log('📋 Parâmetros da busca processados:', requestData);
      } catch (parseError) {
        console.error('❌ Erro de parsing JSON:', parseError);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Invalid JSON',
            message: `Erro ao processar JSON: ${parseError.message}`
          })
        };
      }
      
      // Obter token de autenticação
      let authToken;
      try {
        authToken = await getAuthToken();
        console.log('🔑 Token obtido com sucesso');
      } catch (error) {
        console.error('❌ Erro ao obter token:', error);
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            error: 'Authentication Error',
            message: 'Não foi possível autenticar com a API Moblix'
          })
        };
      }
      
      // Se Companhia = -1 (buscar todas), usar parâmetros REAIS do usuário
      if (requestData.Companhia === -1) {
        console.log('🔍 Buscando todas as companhias com parâmetros do usuário...');

        // ✅ USAR DADOS REAIS DO USUÁRIO
        const finalRequestData = {
          Origem: requestData.Origem || requestData.origem,
          Destino: requestData.Destino || requestData.destino,
          Ida: requestData.Ida || requestData.ida,
          Volta: requestData.Volta || requestData.volta || null,
          Adultos: requestData.Adultos || requestData.adultos || 1,
          Criancas: requestData.Criancas || requestData.criancas || 0,
          Bebes: requestData.Bebes || requestData.bebes || 0,
          Companhia: -1,
          Classe: requestData.Classe || requestData.classe || 0,
          internacional: requestData.internacional || false
        };

        console.log('🎯 Parâmetros REAIS da busca:', JSON.stringify(finalRequestData, null, 2));

        try {
          const result = await makeApiRequest('/api/ConsultaAereo/Consultar', 'POST', finalRequestData, authToken);

          console.log('📡 Resposta da API Moblix:', {
            Success: result.Success,
            HasResult: result.HasResult,
            TotalItens: result.TotalItens,
            DataLength: result.Data?.length || 0
          });

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
          };
        } catch (error) {
          console.error('❌ Erro na busca:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              error: 'API Error',
              message: error.message
            })
          };
        }
      } else {
        // Busca para uma companhia específica
        console.log(`🔍 Buscando companhia específica: ID ${requestData.Companhia}`);
        
        try {
          // USAR OS PARÂMETROS REAIS DO USUÁRIO - NÃO HARDCODED!
          const finalRequestData = {
            Origem: requestData.Origem || requestData.origem,
            Destino: requestData.Destino || requestData.destino,
            Ida: requestData.DataIda || requestData.dataIda || requestData.Ida || requestData.ida,
            Volta: requestData.DataVolta || requestData.dataVolta || requestData.Volta || requestData.volta,
            Adultos: requestData.Adultos || requestData.adultos || 1,
            Criancas: requestData.Criancas || requestData.criancas || 0,
            Bebes: requestData.Bebes || requestData.bebes || 0,
            Companhia: requestData.Companhia || requestData.companhia,
            Classe: requestData.Classe || requestData.classe || 0,
            internacional: requestData.internacional || false
          };
          
          console.log('🎯 Usando parâmetros REAIS do usuário:', finalRequestData);
          
          const result = await makeApiRequest('/api/ConsultaAereo/Consultar', 'POST', finalRequestData, authToken);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
          };
        } catch (error) {
          console.error('❌ Erro na busca específica:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              error: 'API Error',
              message: error.message
            })
          };
        }
      }
    } else if (apiPath.includes('/api/Token')) {
      // Rota de autenticação - não precisa de token existente
      console.log('🔑 Processando solicitação de token...');
      
      // Parse do body como form-urlencoded para tokens
      const formData = querystring.parse(event.body || '');
      
      return new Promise((resolve, reject) => {
        const bodyData = querystring.stringify({
          grant_type: formData.grant_type || 'password',
          username: formData.username || AUTH_CREDENTIALS.username,
          password: formData.password || AUTH_CREDENTIALS.password
        });
        
        const options = {
          hostname: 'api.moblix.com.br',
          port: 443,
          path: '/api/Token',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'externo',
            'Content-Length': Buffer.byteLength(bodyData)
          }
        };
        
        const req = https.request(options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              resolve({
                statusCode: res.statusCode,
                headers,
                body: JSON.stringify(response)
              });
            } catch (error) {
              resolve({
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Parse error', message: error.message })
              });
            }
          });
        });
        
        req.on('error', (error) => {
          resolve({
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Request error', message: error.message })
          });
        });
        
        req.write(bodyData);
        req.end();
      });
    } else if (apiPath.includes('/aereo/api/aeroporto')) {
      // Endpoint para busca de aeroportos
      console.log('🛫 Processando busca de aeroportos...');
      console.log('📍 Path completo:', event.path);
      console.log('🔍 Query params:', event.queryStringParameters);
      
      const filtro = event.queryStringParameters?.filtro || '';
      console.log('🔍 Filtro de busca:', filtro);
      
      try {
        console.log('🔑 Obtendo token de autenticação...');
        const authToken = await getAuthToken();
        console.log('🔑 Token obtido:', authToken ? 'SIM' : 'NÃO');
        
        const endpoint = `/aereo/api/aeroporto?filtro=${encodeURIComponent(filtro)}`;
        console.log('📡 Endpoint final:', endpoint);
        
        // Fazer requisição GET para o endpoint correto de aeroportos da API Moblix
        console.log('🌐 Fazendo requisição para API Moblix...');
        const result = await makeApiRequest(endpoint, 'GET', null, authToken);
        
        console.log('📊 Resultado da API:', result);
        console.log('✅ Aeroportos encontrados:', result?.Data?.length || 0);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result)
        };
      } catch (error) {
        console.error('❌ Erro detalhado ao buscar aeroportos:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Airport Search Error',
            message: error.message,
            details: error.stack
          })
        };
      }
    } else {
      // Para outras rotas da API, faz proxy direto
      console.log('📡 Fazendo proxy direto para:', apiPath);
      
      const authToken = await getAuthToken();
      const result = await makeApiRequest(apiPath, event.httpMethod, event.body, authToken);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Function error',
        message: error.message
      })
    };
  }
};
