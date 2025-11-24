const https = require('https');
const querystring = require('querystring');

exports.handler = async (event, context) => {
  // Allow CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    console.log('🚀 Function started');
    console.log('📨 Event method:', event.httpMethod);
    console.log('📨 Event body:', event.body?.substring(0, 200));
    console.log('📨 Event headers:', JSON.stringify(event.headers, null, 2));
    
    // Parse request body to get actual API path and data
    let apiPath = '/api/ConsultaAereo/Consultar'; // Default to flight search
    let requestBody = event.body;
    let requestMethod = event.httpMethod;
    
    // Check if this is a token request
    if (event.body && event.body.includes('grant_type=password')) {
      apiPath = '/api/Token';
      console.log('🔐 Token request detected');
      
      // For token requests, use environment variables
      const username = process.env.MOBLIX_USERNAME || 'TooGood';
      const password = process.env.MOBLIX_PASSWORD || '23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7';
      
      requestBody = `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
      console.log('🔐 Using credentials from environment variables');
    }
    // Check if this is a structured request from the application
    else if (event.body && event.headers['content-type']?.includes('application/json')) {
      try {
        const parsedBody = JSON.parse(event.body);
        if (parsedBody.path && parsedBody.method) {
          // This is a structured request from the application
          apiPath = parsedBody.path;
          requestBody = parsedBody.body;
          requestMethod = parsedBody.method;
          console.log('📨 Structured request detected:', {
            path: apiPath,
            method: requestMethod,
            bodyLength: requestBody?.length || 0
          });
        } else {
          // Direct API call - busca de voos
          console.log('📋 Direct flight search request detected');
        }
      } catch (parseError) {
        console.log('⚠️ JSON parse error, using default flight search:', parseError.message);
      }
    }
    
    // Add query parameters if present
    if (event.queryStringParameters) {
      const queryString = querystring.stringify(event.queryStringParameters);
      if (queryString) {
        apiPath += '?' + queryString;
      }
    }
    
    console.log('🔍 Final API path:', apiPath);
    console.log('📤 Request method:', requestMethod);
    console.log('📦 Request body:', requestBody);
    
    // Target API URL
    const targetUrl = `https://api.moblix.com.br${apiPath}`;
    const url = new URL(targetUrl);
    
    // Configurar headers para a requisição à API externa
    let contentType = 'application/json';
    
    // Para token requests, usar form-urlencoded
    if (apiPath.includes('/api/Token')) {
      contentType = 'application/x-www-form-urlencoded';
    }
    
    // Extrair token de autorização do header da requisição
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    const apiHeaders = {
      'Content-Type': contentType,
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Origin': 'externo'
    };

    // Copy authorization header if present
    if (authHeader) {
      apiHeaders['Authorization'] = authHeader;
      console.log('🔐 Authorization header found and forwarded');
    } else {
      console.log('⚠️ No authorization header found in request');
    }
    
    // Add debug logging
    console.log('🔍 Proxy request details:', {
      method: requestMethod,
      path: apiPath,
      targetUrl: targetUrl,
      hasAuth: !!authHeader,
      bodyLength: requestBody ? requestBody.length : 0
    });
    
    // Prepare request options
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: requestMethod, // Use the parsed method
      headers: apiHeaders
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          console.log('📥 API response received, length:', data.length);
          console.log('📊 API response status:', res.statusCode);
          console.log('🔍 API response preview:', data.substring(0, 500));
          
          // Ensure we have a valid response
          if (!data || data.length === 0) {
            console.error('❌ Empty response from API');
            resolve({
              statusCode: 500,
              headers,
              body: JSON.stringify({
                error: 'Empty response from API',
                message: 'The external API returned an empty response'
              })
            });
            return;
          }
          
          resolve({
            statusCode: res.statusCode,
            headers: {
              ...headers,
              'Content-Type': res.headers['content-type'] || 'application/json'
            },
            body: data
          });
        });
      });

      req.on('error', (error) => {
        console.error('❌ Proxy error:', error);
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Proxy error',
            message: error.message
          })
        });
      });

      req.on('timeout', () => {
        console.error('❌ Request timeout');
        req.destroy();
        resolve({
          statusCode: 408,
          headers,
          body: JSON.stringify({
            error: 'Request timeout',
            message: 'The request to the external API timed out'
          })
        });
      });

      // Set timeout
      req.setTimeout(30000);

      // Send request body if it exists
      if (requestBody) {
        console.log('📤 Writing request body, length:', requestBody.length);
        req.write(requestBody);
      }
      
      console.log('🚀 Sending request to:', options.hostname + options.path);
      req.end();
    });

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
