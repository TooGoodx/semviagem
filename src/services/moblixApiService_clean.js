import axios from 'axios';
import axiosRetry from 'axios-retry';
import authService from './auth';

// Configuração do axios com retry
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.response?.status >= 500;
  }
});

// Função auxiliar para formatar datas para a API
function formatDateForAPI(dateString) {
  if (!dateString || dateString === '0001-01-01') return null;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn('Data inválida fornecida:', dateString);
    return null;
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Função auxiliar para converter classe para valor numérico
function getClasseValue(classe) {
  const classeMap = {
    'economica': 1,
    'executiva': 2,
    'primeira': 3
  };
  
  return classeMap[classe?.toLowerCase()] || 1;
}

const moblixApiService = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://buscadorreact.netlify.app/.netlify/functions',

  /**
   * Método genérico para fazer requisições à API
   */
  async request({ method = 'GET', endpoint, data = null, params = null, headers = {}, timeout = 30000, signal = null }) {
    try {
      const authHeaders = await authService.getAuthHeaders();
      
      const config = {
        method: method.toUpperCase(),
        url: `${this.baseURL}${endpoint}`,
        headers: {
          ...authHeaders,
          ...headers
        },
        timeout,
        signal
      };

      if (data) {
        config.data = data;
      }

      if (params) {
        config.params = params;
      }

      console.log(`🔄 ${method.toUpperCase()} ${endpoint}`, { data, params });
      
      const response = await axios(config);
      
      console.log(`✅ ${method.toUpperCase()} ${endpoint} - Status: ${response.status}`);
      
      return response.data;
    } catch (error) {
      console.error(`❌ ${method.toUpperCase()} ${endpoint} - Erro:`, error.message);
      
      if (error.response?.status === 401) {
        console.log('🔄 Token expirado, tentando renovar...');
        await authService.refreshToken();
        
        const newAuthHeaders = await authService.getAuthHeaders();
        const retryConfig = {
          ...error.config,
          headers: {
            ...error.config.headers,
            ...newAuthHeaders
          }
        };
        
        const retryResponse = await axios(retryConfig);
        return retryResponse.data;
      }
      
      throw error;
    }
  },

  /**
   * Consulta voos usando busca consolidada com Companhia: -1
   */
  async consultarVoos(params) {
    console.log('🛫 Iniciando busca consolidada de voos com Companhia: -1');
    console.log('Parâmetros recebidos:', params);

    const requestData = {
      Origem: params.origem.toUpperCase(),
      Destino: params.destino.toUpperCase(),
      Ida: formatDateForAPI(params.ida),
      Adultos: parseInt(params.adultos) || 1,
      Criancas: parseInt(params.criancas) || 0,
      Bebes: parseInt(params.bebes) || 0,
      Companhia: -1, // Busca consolidada para todas as companhias
      Classe: getClasseValue(params.classe)
    };

    // Adiciona volta apenas se fornecida e válida
    if (params.volta && params.volta !== '0001-01-01') {
      requestData.Volta = formatDateForAPI(params.volta);
    }

    console.log('📤 Dados da requisição consolidada:', requestData);

    try {
      const response = await this.request({
        method: 'POST',
        endpoint: '/aereo',
        data: requestData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('📥 Resposta recebida:', response ? 'OK' : 'VAZIA');

      if (!response || !response.Data || !Array.isArray(response.Data)) {
        console.warn('⚠️ Estrutura de resposta inesperada:', response);
        return { flights: [], message: 'Nenhum voo encontrado' };
      }

      // Extração de voos com múltiplos fallbacks
      let flights = [];
      
      for (const dataItem of response.Data) {
        console.log('🔍 Processando item de dados:', dataItem);
        
        // Tentativa 1: flights array direto
        if (dataItem.flights && Array.isArray(dataItem.flights)) {
          flights.push(...dataItem.flights);
          console.log(`✅ Extraídos ${dataItem.flights.length} voos de flights array`);
        }
        // Tentativa 2: Ida array
        else if (dataItem.Ida && Array.isArray(dataItem.Ida)) {
          flights.push(...dataItem.Ida);
          console.log(`✅ Extraídos ${dataItem.Ida.length} voos de Ida array`);
        }
        // Tentativa 3: Se o próprio dataItem é um array de voos
        else if (Array.isArray(dataItem)) {
          flights.push(...dataItem);
          console.log(`✅ Extraídos ${dataItem.length} voos do array direto`);
        }
        // Tentativa 4: Busca por propriedades que contenham arrays de voos
        else if (typeof dataItem === 'object') {
          const flightArrays = Object.values(dataItem).filter(value => 
            Array.isArray(value) && value.length > 0 && 
            value[0] && typeof value[0] === 'object'
          );
          
          for (const flightArray of flightArrays) {
            flights.push(...flightArray);
            console.log(`✅ Extraídos ${flightArray.length} voos de propriedade do objeto`);
          }
        }
      }

      console.log(`🎯 Total de voos extraídos: ${flights.length}`);

      if (flights.length === 0) {
        console.warn('⚠️ Nenhum voo encontrado na resposta');
        return { flights: [], message: 'Nenhum voo encontrado para os critérios especificados' };
      }

      return { 
        flights: flights,
        message: `${flights.length} voos encontrados`,
        success: true
      };

    } catch (error) {
      console.error('❌ Erro na busca consolidada de voos:', error);
      
      if (error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
        throw new Error('Falha na conexão com a API de voos. Verifique sua conectividade.');
      }
      
      throw error;
    }
  },

  /**
   * Busca aeroportos
   */
  async buscarAeroportos(filtro = '', options = {}) {
    try {
      console.log('🛫 Buscando aeroportos com filtro:', filtro);
      
      const response = await this.request({
        method: 'GET',
        endpoint: '/aereo/api/aeroporto',
        params: {
          filtro: filtro.trim()
        },
        headers: {
          'Accept': 'application/json'
        },
        signal: options.signal
      });
      
      console.log('✅ Aeroportos encontrados:', response?.length || 0);
      return response && Array.isArray(response) ? response : (response?.Data || []);
    } catch (error) {
      console.error('❌ Erro ao buscar aeroportos:', error);
      
      // Lista fallback para manter a funcionalidade
      const aeroportosFallback = [
        { Iata: 'GRU', Nome: 'Aeroporto Internacional de São Paulo/Guarulhos', Pais: 'Brasil' },
        { Iata: 'CGH', Nome: 'Aeroporto de São Paulo/Congonhas', Pais: 'Brasil' },
        { Iata: 'BSB', Nome: 'Aeroporto Internacional de Brasília', Pais: 'Brasil' },
        { Iata: 'SDU', Nome: 'Aeroporto Santos Dumont', Pais: 'Brasil' },
        { Iata: 'GIG', Nome: 'Aeroporto Internacional do Rio de Janeiro/Galeão', Pais: 'Brasil' }
      ];
      
      if (!filtro || filtro.trim().length < 2) {
        return aeroportosFallback.slice(0, 5);
      }
      
      const filtroLower = filtro.toLowerCase().trim();
      return aeroportosFallback.filter(aeroporto => 
        aeroporto.Nome.toLowerCase().includes(filtroLower) ||
        aeroporto.Iata.toLowerCase().includes(filtroLower)
      );
    }
  },

  /**
   * Lista ofertas de voos
   */
  async listarOfertas(params = {}) {
    const { international = false, quantidade = 10, shuffle = false } = params;
    
    return this.request({
      method: 'get',
      endpoint: '/oferta/api/ofertas',
      params: {
        international,
        quantidade: 100,
        shuffle
      },
      headers: {
        'Accept': 'application/json'
      }
    });
  },

  /**
   * Método de exemplo para dados POST
   */
  async postExampleData(data) {
    return this.request({
      method: 'post',
      endpoint: '/api/exemplo/endpoint',
      data
    });
  }
};

export default moblixApiService;
