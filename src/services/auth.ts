import axios from 'axios';

// Configuração da API Moblix
// Em desenvolvimento: usa API direta com CORS (funciona com Origin: externo)
// Em produção: usa Netlify Functions como proxy para evitar CORS
const API_BASE_URL = import.meta.env.DEV ? 'https://api.moblix.com.br' : '/.netlify/functions/moblix-api';
const TOKEN_ENDPOINT = '/api/Token';

// Credenciais da API
const CREDENTIALS = {
  username: 'TooGood',
  password: '23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7' // Senha fornecida
};

// Armazena o token e sua data de expiração
let accessToken: string | null = null;
let tokenExpiry: number | null = null;

// Cabeçalhos padrão
const DEFAULT_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept': 'application/json'
};

/**
 * Verifica se o token está expirado
 * @returns {boolean} True se o token estiver expirado ou próximo de expirar
 */
function isTokenExpired(): boolean {
  if (!tokenExpiry) return true;
  // Considera o token como expirado se faltar menos de 5 minutos
  return Date.now() >= (tokenExpiry - 300000);
}

/**
 * Obtém um token de acesso da API Moblix
 * @returns {Promise<string>} Token de acesso JWT
 */
async function fetchNewToken(): Promise<string> {
  try {
    console.log('Solicitando novo token de acesso...');
    
    // Preparando os dados exatamente como no curl que funciona
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', CREDENTIALS.username);
    params.append('password', CREDENTIALS.password);

    // Construindo a URL final
    const url = `${API_BASE_URL}${TOKEN_ENDPOINT}`;
    console.log('Enviando requisição para:', url);
    console.log('Com dados:', params.toString().replace(CREDENTIALS.password, '***'));
    
    // Usando fetch com configuração para o proxy local
    try {
      console.log('Enviando requisição POST para:', url);
      console.log('Headers:', {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      });
      console.log('Body:', params.toString().replace(CREDENTIALS.password, '***'));
      
      const response = await fetch(url, {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Origin': 'externo'
        },
        credentials: 'omit',
        mode: 'cors',
        redirect: 'follow'
      });

      console.log('Resposta recebida. Status:', response.status);
      const responseText = await response.text();
      console.log('Resposta bruta:', responseText);
      
      let data: any;
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
        console.log('Token obtido com sucesso');
        return accessToken;
      }
      
      throw new Error('Resposta da API não contém token de acesso');
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw new Error(`Falha na autenticação: ${(error as Error).message}`);
    }

  } catch (error: any) {
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
export async function getAccessToken(): Promise<string> {
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
   * @returns {Promise<any>} Dados da autenticação
   */
  async login(): Promise<any> {
    try {
      console.log('Iniciando processo de login...');
      
      // Criando a string de dados exatamente como no curl
      const formData = `grant_type=password&username=${encodeURIComponent(CREDENTIALS.username)}&password=${encodeURIComponent(CREDENTIALS.password)}`;

      console.log('Enviando requisição para:', `${API_BASE_URL}${TOKEN_ENDPOINT}`);
      console.log('Com dados:', formData.replace(CREDENTIALS.password, '***'));
      
    // Fazendo a requisição com configuração adequada para a API
    const response = await axios({
      method: 'post',
      url: `${API_BASE_URL}${TOKEN_ENDPOINT}`,
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Origin': 'externo'
      },
      withCredentials: false,
      timeout: 10000
    });

      if (response.data && response.data.access_token) {
        // Atualiza o token e a data de expiração
        accessToken = response.data.access_token;
        tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 300000;
        
        // Salva no localStorage para persistência (apenas no browser)
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('moblixToken', accessToken);
          localStorage.setItem('moblixTokenExpiry', tokenExpiry.toString());
        }
        
        console.log('Login realizado com sucesso');
        return response.data; // Retorna todos os dados da resposta
      }
      
      throw new Error('Resposta da API não contém token de acesso');
    } catch (error: any) {
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
    console.log('Logout realizado com sucesso');
  },
  
  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} Verdadeiro se estiver autenticado, falso caso contrário
   */
  isAuthenticated(): boolean {
    // Verifica se temos um token e se ele não está expirado
    const token = this.getToken();
    if (!token) {
      console.log('Nenhum token encontrado');
      return false;
    }
    
    if (isTokenExpired()) {
      console.log('Token expirado ou próximo de expirar');
      return false;
    }
    
    return true;
  },

  /**
   * Obtém o token de acesso armazenado
   * @returns {string|null} Token de acesso ou null se não existir
   */
  getToken(): string | null {
    // Se o token em memória está expirado, limpa
    if (accessToken && isTokenExpired()) {
      console.log('Token em memória expirado');
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
          tokenExpiry = parseInt(storedExpiry, 10);
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
   * @returns {any} Cabeçalho de autorização
   */
  getAuthHeader(): any {
    const token = this.getToken();
    if (!token) {
      console.warn('Nenhum token de autenticação encontrado');
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
