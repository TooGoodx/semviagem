import axios from 'axios';

// Desabilita logs de debug em produção
const DEBUG = false;

// Configuração da API Moblix
// Em produção, sempre usa as Netlify Functions como proxy para evitar CORS
const API_BASE_URL = import.meta.env.DEV ? '' : '/.netlify/functions/aereo';
const TOKEN_ENDPOINT = '/api/Token';

// Credenciais da API
const CREDENTIALS = {
  username: 'TooGood',
  password: '23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7' // Senha fornecida
};

// Debug desabilitado para produção
// console.log('🔐 Credenciais configuradas:', {
//   username: CREDENTIALS.username,
//   passwordLength: CREDENTIALS.password.length,
//   passwordStart: CREDENTIALS.password.substring(0, 8) + '...'
// });

// Armazena o token e sua data de expiração
let accessToken = null;
let tokenExpiry = null;

// Cabeçalhos padrão
const DEFAULT_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept': 'application/json',
  'Origin': 'externo'
};

/**
 * Verifica se o token está expirado
 * @returns {boolean} True se o token estiver expirado ou próximo de expirar
 */
function isTokenExpired() {
  if (!tokenExpiry) return true;
  // Considera o token como expirado se faltar menos de 5 minutos
  return Date.now() >= (tokenExpiry - 300000);
}

/**
 * Obtém um token de acesso da API Moblix
 * @returns {Promise<string>} Token de acesso JWT
 */
async function fetchNewToken() {
  try {
    if (DEBUG) console.log('Solicitando novo token de acesso...');
    
    // Preparando os dados exatamente como no curl que funciona
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', CREDENTIALS.username);
    params.append('password', CREDENTIALS.password);

    // Construindo a URL final
    const url = `${API_BASE_URL}${TOKEN_ENDPOINT}`;
    if (DEBUG) console.log('Enviando requisição para:', url);
    if (DEBUG) console.log('Com dados:', params.toString().replace(CREDENTIALS.password, '***'));
    
    // Usando fetch com configuração para o proxy local
    try {
      if (DEBUG) console.log('Enviando requisição POST para:', url);
      if (DEBUG) console.log('Headers:', {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      });
      if (DEBUG) console.log('Body:', params.toString().replace(CREDENTIALS.password, '***'));
      
      const response = await fetch(url, {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        credentials: 'omit',
        mode: 'cors',
        redirect: 'follow'
      });

      if (DEBUG) console.log('Resposta recebida. Status:', response.status);
      const responseText = await response.text();
      if (DEBUG) console.log('Resposta bruta:', responseText);
      
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Erro ao fazer parse da resposta JSON:', e);
        throw new Error(`Resposta inválida do servidor: ${responseText}`);
      }
      
      if (!response.ok) {
        console.error('Erro na resposta:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(`Erro ${response.status}: ${data.error_description || 'Falha na autenticação'}`);
      }

      if (data && data.access_token) {
        accessToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in * 1000) - 300000; // 5 minutos antes
        // Salva no localStorage apenas se estiver no browser
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('moblixToken', accessToken);
          localStorage.setItem('moblixTokenExpiry', tokenExpiry.toString());
        }
        if (DEBUG) console.log('Token obtido com sucesso');
        return accessToken;
      }
      
      throw new Error('Resposta da API não contém token de acesso');
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw new Error(`Falha na autenticação: ${error.message}`);
    }

  } catch (error) {
    console.error('Erro ao obter token de acesso:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error('Falha na autenticação com a API Moblix');
  }
}

/**
 * Obtém o token atual ou solicita um novo se necessário
 * @returns {Promise<string>} Token de acesso JWT
 */
export async function getAccessToken() {
  if (accessToken && !isTokenExpired()) {
    return accessToken;
  }
  return await fetchNewToken();
}

/**
 * Serviço de autenticação da API Moblix
 */
export default {
  /**
   * Realiza o login na API Moblix
   * @returns {Promise<Object>} Dados da autenticação
   */
  async login() {
    try {
      if (DEBUG) console.log('Iniciando processo de login...');
      
      // Criando a string de dados exatamente como no curl
      const formData = `grant_type=password&username=${encodeURIComponent(CREDENTIALS.username)}&password=${encodeURIComponent(CREDENTIALS.password)}`;

      if (DEBUG) console.log('Enviando requisição para:', `${API_BASE_URL}${TOKEN_ENDPOINT}`);
      if (DEBUG) console.log('Com dados:', formData.replace(CREDENTIALS.password, '***'));
      
    // Fazendo a requisição com configuração adequada para a API
    const response = await axios({
      method: 'post',
      url: `${API_BASE_URL}${TOKEN_ENDPOINT}`,
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      withCredentials: false,
      timeout: 10000
    });

      if (response.data && response.data.access_token) {
        // Atualiza o token e a data de expiração
        accessToken = response.data.access_token;
        tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 300000;
        
        if (DEBUG) console.log('✅ Token obtido com sucesso:', {
          tokenLength: accessToken.length,
          tokenStart: accessToken.substring(0, 20) + '...',
          expiresIn: response.data.expires_in,
          tokenType: response.data.token_type
        });
        
        // Salva no localStorage para persistência (apenas no browser)
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('moblixToken', accessToken);
          localStorage.setItem('moblixTokenExpiry', tokenExpiry.toString());
        }
        
        if (DEBUG) console.log('Login realizado com sucesso');
        return response.data; // Retorna todos os dados da resposta
      }
      
      throw new Error('Resposta da API não contém token de acesso');
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Se for um erro de resposta da API, adiciona mais detalhes
      if (error.response) {
        const errorDetails = {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
          config: {
            url: error.response.config?.url,
            method: error.response.config?.method,
            headers: error.response.config?.headers
          }
        };
        
        console.error('Detalhes completos do erro:', JSON.stringify(errorDetails, null, 2));
        
        // Retorna um objeto de erro mais detalhado
        throw {
          message: `Erro ${error.response.status} na autenticação: ${error.response.statusText}`,
          ...errorDetails,
          originalError: error
        };
      }
      
      throw error;
    }
  },
  

  /**
   * Realiza o logout
   */
  logout() {
    accessToken = null;
    tokenExpiry = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('moblixToken');
      localStorage.removeItem('moblixTokenExpiry');
    }
    if (DEBUG) console.log('Logout realizado com sucesso');
  },
  
  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} Verdadeiro se estiver autenticado, falso caso contrário
   */
  isAuthenticated() {
    // Verifica se temos um token e se ele não está expirado
    const token = this.getToken();
    if (!token) {
      if (DEBUG) console.log('Nenhum token encontrado');
      return false;
    }
    
    if (isTokenExpired()) {
      if (DEBUG) console.log('Token expirado ou próximo de expirar');
      return false;
    }
    
    return true;
  },

  /**
   * Obtém o token de acesso armazenado
   * @returns {string|null} Token de acesso ou null se não existir
   */
  getToken() {
    // Se o token em memória está expirado, limpa
    if (accessToken && isTokenExpired()) {
      if (DEBUG) console.log('Token em memória expirado');
      accessToken = null;
      return null;
    }
    
    // Retorna o token em memória se existir
    if (accessToken) {
      return accessToken;
    }
    
    // Tenta obter do localStorage (apenas no browser)
    if (typeof localStorage !== 'undefined') {
      const storedToken = localStorage.getItem('moblixToken');
      const storedExpiry = localStorage.getItem('moblixTokenExpiry');
      
      if (storedToken && storedExpiry) {
        // Verifica se o token armazenado ainda é válido
        if (Date.now() < parseInt(storedExpiry, 10)) {
          accessToken = storedToken;
          tokenExpiry = storedExpiry;
          return storedToken;
        } else {
          // Token expirado, remove do armazenamento
          localStorage.removeItem('moblixToken');
          localStorage.removeItem('moblixTokenExpiry');
        }
      }
    }
    
    return null;
  },
  
  /**
   * Obtém o cabeçalho de autorização formatado
   * @returns {Promise<Object>} Cabeçalho de autorização
   */
  async getAuthHeader() {
    let token = this.getToken();
    
    // Se não há token ou está expirado, tenta obter um novo
    if (!token || isTokenExpired()) {
      if (DEBUG) console.log('Token ausente ou expirado, obtendo novo token...');
      try {
        await this.login();
        token = this.getToken();
      } catch (error) {
        console.error('Erro ao obter token:', error);
        return {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        };
      }
    }
    
    if (!token) {
      console.warn('Nenhum token de autenticação encontrado após tentativa de login');
      return {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }
};
