const https = require('https');
const querystring = require('querystring');

// Credenciais da API Moblix
const AUTH_CREDENTIALS = {
  username: process.env.MOBLIX_USERNAME || 'TooGood',
  password: process.env.MOBLIX_PASSWORD || '23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7'
};

// Cache para armazenar token temporariamente
let tokenCache = {
  access_token: null,
  expires_at: null
};

// Função para obter token de autenticação
async function getAuthToken() {
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
            tokenCache.access_token = response.access_token;
            tokenCache.expires_at = now + (response.expires_in * 1000);
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
    
    req.setTimeout(30000);
    
    if (method === 'POST' && bodyData) {
      req.write(bodyData);
    }
    
    req.end();
  });
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

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
    
    let apiPath = event.path.replace('/.netlify/functions/moblix-api', '');
    
    // BUSCA DE VOOS
    if (apiPath.includes('/api/ConsultaAereo/Consultar')) {
      console.log('📡 Processando busca de voos...');
      
      // Parse do body
      let requestData;
      try {
        if (event.body) {
          let parsedBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
          
          // Structured format from React
          if (parsedBody.path && parsedBody.method && parsedBody.body) {
            console.log('📨 Structured request detected');
            requestData = typeof parsedBody.body === 'string' ? JSON.parse(parsedBody.body) : parsedBody.body;
          } else {
            requestData = parsedBody;
          }
        } else {
          requestData = {};
        }
        
        console.log('📋 Parâmetros recebidos:', requestData);
      } catch (parseError) {
        console.error('❌ Erro de parsing JSON:', parseError);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Invalid JSON',
            message: parseError.message
          })
        };
      }
      
      // Obter token
      let authToken;
      try {
        authToken = await getAuthToken();
        console.log('🔑 Token obtido');
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
      
      // ✅ NORMALIZAR PARÂMETROS - APENAS campos que a Moblix ACEITA
      const finalRequestData = {
        Origem: (requestData.Origem || requestData.origem || '').toUpperCase(),
        Destino: (requestData.Destino || requestData.destino || '').toUpperCase(),
        Ida: requestData.Ida || requestData.ida,
        Adultos: parseInt(requestData.Adultos || requestData.adultos || 1),
        Criancas: parseInt(requestData.Criancas || requestData.criancas || 0),
        Bebes: parseInt(requestData.Bebes || requestData.bebes || 0),
        Companhia: parseInt(requestData.Companhia !== undefined ? requestData.Companhia : (requestData.companhia !== undefined ? requestData.companhia : -1))
      };

      // ✅ ADICIONAR VOLTA SOMENTE SE EXISTIR
      const volta = requestData.Volta || requestData.volta;
      if (volta && volta.trim() !== '' && volta !== 'undefined' && volta !== 'null') {
        finalRequestData.Volta = volta;
      }

      console.log('🎯 Parâmetros LIMPOS:', JSON.stringify(finalRequestData, null, 2));
      console.log('🔍 Volta incluída?', !!finalRequestData.Volta);

      // Validações
      if (!finalRequestData.Origem || !finalRequestData.Destino || !finalRequestData.Ida) {
        console.error('❌ Parâmetros obrigatórios faltando');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Missing required parameters',
            message: 'Origem, Destino e Ida são obrigatórios',
            received: finalRequestData
          })
        };
      }

      try {
        console.log('🌐 Fazendo requisição para Moblix...');
        const result = await makeApiRequest('/api/ConsultaAereo/Consultar', 'POST', finalRequestData, authToken);

        console.log('📊 Resultado:', {
          Success: result.Success,
          HasResult: result.HasResult,
          HasError: !!result.ExErro,
          ErrorDetail: result.ExErro?.Detail || 'none',
          TotalItens: result.TotalItens
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
    }
    
    // TOKEN ENDPOINT
    else if (apiPath.includes('/api/Token')) {
      console.log('🔑 Processando solicitação de token...');
      
      const formData = querystring.parse(event.body || '');
      
      return new Promise((resolve) => {
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
    }
    
    // BUSCA DE AEROPORTOS
    else if (apiPath.includes('/aereo/api/aeroporto')) {
      console.log('🛫 Processando busca de aeroportos...');
      
      const filtro = event.queryStringParameters?.filtro || '';
      
      try {
        const authToken = await getAuthToken();
        const endpoint = `/aereo/api/aeroporto?filtro=${encodeURIComponent(filtro)}`;
        const result = await makeApiRequest(endpoint, 'GET', null, authToken);
        
        console.log('✅ Aeroportos encontrados:', result?.Data?.length || 0);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result)
        };
      } catch (error) {
        console.error('❌ Erro ao buscar aeroportos:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Airport Search Error',
            message: error.message
          })
        };
      }
    }
    
    // PROXY GENÉRICO
    else {
      console.log('📡 Proxy direto para:', apiPath);
      
      const authToken = await getAuthToken();
      const result = await makeApiRequest(apiPath, event.httpMethod, event.body, authToken);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

  } catch (error) {
    console.error('❌ Function error:', error);
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