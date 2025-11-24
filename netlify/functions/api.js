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
    // Extract the path from the Netlify function path
    // event.path will be like "/.netlify/functions/api/Token" 
    // We want to extract "/api/Token"
    let apiPath = event.path.replace('/.netlify/functions/api', '');
    if (!apiPath.startsWith('/api')) {
      apiPath = '/api' + apiPath;
    }
    if (event.queryStringParameters) {
      const queryString = querystring.stringify(event.queryStringParameters);
      if (queryString) {
        apiPath += '?' + queryString;
      }
    }
    
    // Target API URL
    const targetUrl = `https://api.moblix.com.br${apiPath}`;
    const url = new URL(targetUrl);
    
    // Prepare request headers - simulate a legitimate client
    const requestHeaders = {
      'Host': 'api.moblix.com.br',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Ch-Ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"'
    };

    // Copy important headers from the original request
    if (event.headers.authorization) {
      requestHeaders['Authorization'] = event.headers.authorization;
    }
    if (event.headers['content-type']) {
      requestHeaders['Content-Type'] = event.headers['content-type'];
    }

    // Set appropriate content type and origin for different requests
    if (apiPath.includes('/Token')) {
      // For token requests, use form-encoded content type and simulate moblix.com.br origin
      requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
      requestHeaders['Origin'] = 'https://moblix.com.br';
      requestHeaders['Referer'] = 'https://moblix.com.br/';
      // Remove some headers that might cause issues
      delete requestHeaders['Sec-Fetch-Site'];
    } else {
      // For other API requests, use JSON content type
      requestHeaders['Content-Type'] = 'application/json';
      requestHeaders['Origin'] = 'https://moblix.com.br';
      requestHeaders['Referer'] = 'https://moblix.com.br/';
      delete requestHeaders['Sec-Fetch-Site'];
    }
    
    // Prepare request options
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: event.httpMethod,
      headers: requestHeaders
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
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
        console.error('Proxy error:', error);
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Proxy error',
            message: error.message
          })
        });
      });

      // Send request body if it exists
      if (event.body) {
        req.write(event.body);
      }
      
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
