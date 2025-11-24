import axios from 'axios';

// Configuração da API Moblix (usando proxy local)
const API_BASE_URL = '';
const TOKEN_ENDPOINT = '/api/Token';

// Credenciais da API
const CREDENTIALS = {
  username: 'TooGood',
  password: '23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7',
  tokenType: 'bearer'
};

// Armazena o token e sua data de expiração
let accessToken: string | null = null;
let tokenExpiry: string | null = null;

// Cabeçalhos padrão
const DEFAULT_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded'
};

/**
 * Verifica se o token está expirado
 * @returns {boolean} True se o token estiver expirado ou próximo de expirar
 */
function isTokenExpired(): boolean {
  if (!tokenExpiry) return true;
  // Considera o token como expirado se faltar menos de 5 minutos
  return Date.now() >= (parseInt(tokenExpiry, 10) - 300000);
}

/**
 * Obtém um token de acesso da API Moblix
 * @returns {Promise<string>} Token de acesso JWT
 */
async function fetchNewToken(): Promise<string> {
  try {
    console.log('Solicitando novo token de acesso...');
    
    // Usando URLSearchParams para codificação URL-encoded correta
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', CREDENTIALS.username);
    params.append('password', CREDENTIALS.password);

    const response = await axios({
      method: 'post',
      url: `${API_BASE_URL}${TOKEN_ENDPOINT}`,
      data: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 15000 // 15 segundos de timeout
    });

    if (response.data && response.data.access_token) {
      // Atualiza o token e a data de expiração
      accessToken = response.data.access_token;
      tokenExpiry = (Date.now() + (response.data.expires_in * 1000)).toString();
      
      // Armazena para persistência
      localStorage.setItem('moblixToken', accessToken);
      localStorage.setItem('moblixTokenExpiry', tokenExpiry);
      
      console.log('Novo token obtido com sucesso');
      return accessToken;
    }

    throw new Error('Resposta de autenticação inválida: token não encontrado');
  } catch (error: any) {
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          ...error.config?.headers,
          'Authorization': '[FILTERED]' // Não logar o token
        }
      }
    };
    
    console.error('Erro ao obter token de acesso:', errorDetails);
    
    // Limpa os dados de autenticação em caso de erro
    accessToken = null;
    tokenExpiry = null;
    localStorage.removeItem('moblixToken');
    localStorage.removeItem('moblixTokenExpiry');
    
    throw new Error('Falha na autenticação. Verifique suas credenciais e tente novamente.');
  }
}

/**
 * Obtém o token atual ou solicita um novo se necessário
 * @returns {Promise<string>} Token de acesso JWT
 */
async function getAccessToken(): Promise<string> {
  // Se já temos um token válido em memória, retorna ele
  if (accessToken && !isTokenExpired()) {
    return accessToken;
  }

  // Tenta carregar do localStorage
  const storedToken = localStorage.getItem('moblixToken');
  const storedExpiry = localStorage.getItem('moblixTokenExpiry');
  
  if (storedToken && storedExpiry) {
    // Verifica se o token armazenado ainda é válido
    if (Date.now() < parseInt(storedExpiry, 10)) {
      accessToken = storedToken;
      tokenExpiry = storedExpiry;
      return accessToken;
    }
    // Se o token estiver expirado, remove do armazenamento
    localStorage.removeItem('moblixToken');
    localStorage.removeItem('moblixTokenExpiry');
  }

  // Se chegou aqui, precisa obter um novo token
  return await fetchNewToken();
}

/**
 * Serviço de autenticação da API Moblix
 */
export const moblixAuth = {
  /**
   * Realiza o login na API Moblix
   * @returns {Promise<Object>} Dados da autenticação
   */
  async login() {
    try {
      console.log('Iniciando processo de login...');
      
      // Obtém um novo token
      const token = await getAccessToken();
      
      if (!token) {
        throw new Error('Não foi possível obter o token de acesso');
      }
      
      console.log('Login realizado com sucesso');
      
      return {
        success: true,
        token: token,
        tokenType: CREDENTIALS.tokenType,
        expiresIn: 28800, // 8 horas em segundos
        expiresAt: parseInt(tokenExpiry!, 10)
      };
    } catch (error: any) {
      console.error('Erro ao fazer login:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  /**
   * Realiza o logout
   */
  logout() {
    console.log('Efetuando logout...');
    accessToken = null;
    tokenExpiry = null;
    localStorage.removeItem('moblixToken');
    localStorage.removeItem('moblixTokenExpiry');
    console.log('Dados de autenticação removidos');
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
    
    // Tenta obter do localStorage
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
    
    return null;
  },
  
  /**
   * Obtém o cabeçalho de autorização formatado
   * @returns {Object} Cabeçalho de autorização
   */
  getAuthHeader() {
    const token = this.getToken();
    if (!token) {
      console.warn('Nenhum token de autenticação encontrado');
      return {
        ...DEFAULT_HEADERS,
        'Content-Type': 'application/json' // Altera para JSON quando não há token
      };
    }
    
    return {
      ...DEFAULT_HEADERS,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
};

export default moblixAuth;
