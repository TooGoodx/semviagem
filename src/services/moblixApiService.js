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
  
  console.log('🗓️ Formatando data:', dateString);
  
  // Se já está no formato correto (YYYY-MM-DD), apenas valida
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const date = new Date(dateString + 'T00:00:00');
    if (!isNaN(date.getTime())) {
      console.log('✅ Data já no formato correto:', dateString);
      return dateString;
    }
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn('⚠️ Data inválida fornecida:', dateString);
    // Usar data de amanhã como fallback
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const fallbackDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    console.log('🔄 Usando data fallback:', fallbackDate);
    return fallbackDate;
  }
  
  // Garantir que a data não seja no passado
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date < today) {
    console.warn('⚠️ Data no passado detectada:', dateString);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    date.setTime(tomorrow.getTime());
    console.log('🔄 Ajustada para amanhã:', date.toISOString().split('T')[0]);
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const formattedDate = `${year}-${month}-${day}`;
  console.log('✅ Data formatada:', formattedDate);
  return formattedDate;
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

// Configuração da API Moblix com detecção de ambiente
// Em desenvolvimento: usa API direta (CORS habilitado)
// Em produção: usa Netlify Functions como proxy
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.DEV)
  ? 'https://api.moblix.com.br'
  : '/.netlify/functions/moblix-api';

console.log('🔧 moblixApiService.js - Ambiente:', import.meta.env?.DEV ? 'DESENVOLVIMENTO' : 'PRODUÇÃO');
console.log('🔧 moblixApiService.js - API_BASE_URL:', API_BASE_URL);

const moblixApiService = {
  baseURL: API_BASE_URL,

  /**
   * Método genérico para fazer requisições à API
   */
  async request({ method = 'GET', endpoint, data = null, params = null, headers = {}, timeout = 30000, signal = null }) {
    try {
      const authHeaders = await authService.getAuthHeader();
      
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
        await authService.login();
        
        const newAuthHeaders = await authService.getAuthHeader();
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
   * Consulta voos usando busca consolidada otimizada com Companhia: -1
   */
  async consultarVoos(params) {
    console.log('🛫 Iniciando busca consolidada otimizada de voos com Companhia: -1');
    console.log('Parâmetros recebidos:', params);

    // Tentar primeiro com parâmetros mais básicos para debug
    const requestData = {
      Origem: params.origem.toUpperCase(),
      Destino: params.destino.toUpperCase(),
      Ida: formatDateForAPI(params.ida),
      Adultos: parseInt(params.adultos) || 1,
      Criancas: parseInt(params.criancas) || 0,
      Bebes: parseInt(params.bebes) || 0,
      Companhia: -1, // -1 = Todas as companhias
      Classe: getClasseValue(params.classe)
    };

    console.log('🔍 Parâmetros básicos para debug:', {
      origem: requestData.Origem,
      destino: requestData.Destino,
      ida: requestData.Ida,
      adultos: requestData.Adultos,
      companhia: requestData.Companhia,
      classe: requestData.Classe
    });

    // Adiciona volta apenas se fornecida e válida
    if (params.volta && params.volta !== '0001-01-01') {
      requestData.Volta = formatDateForAPI(params.volta);
      requestData.TipoViagem = 2; // Ida e volta
    } else {
      requestData.TipoViagem = 1; // Somente ida
    }

    console.log('📤 Dados da requisição consolidada otimizada:', requestData);

    try {
      // Verificar autenticação antes da requisição
      const authHeaders = await authService.getAuthHeader();
      console.log('🔐 Headers de autenticação:', {
        hasAuth: !!authHeaders.Authorization,
        authType: authHeaders.Authorization ? 'Bearer token present' : 'No auth token'
      });

      let response = await this.request({
        method: 'POST',
        endpoint: '/api/ConsultaAereo/Consultar',
        data: requestData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 45000 // Timeout aumentado para busca consolidada
      });

      // Se a busca não foi completada, fazer polling até Completed === true
      if (response && !response.Completed && response.ExErro?.Extensions?.LeaseId) {
        console.log('🔄 Busca não completada, iniciando polling até Completed === true...');
        console.log('🆔 LeaseId:', response.ExErro.Extensions.LeaseId);
        
        const maxAttempts = 20; // Máximo 20 tentativas (até 200 segundos)
        const pollInterval = 10000; // Verificar a cada 10 segundos
        let attempt = 0;
        
        while (!response.Completed && attempt < maxAttempts) {
          attempt++;
          console.log(`🔄 Polling ${attempt}/${maxAttempts} - Aguardando ${pollInterval/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          
          console.log(`🔍 Verificando status (tentativa ${attempt})...`);
          const pollResponse = await this.request({
            method: 'POST',
            endpoint: '/api/ConsultaAereo/Consultar',
            data: requestData,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 45000
          });
          
          console.log(`📊 Completed=${pollResponse?.Completed}, Success=${pollResponse?.Success}, DataLength=${pollResponse?.Data?.length || 0}`);
          
          // Atualizar resposta
          if (pollResponse) {
            response = pollResponse;
            
            if (pollResponse.Completed === true) {
              console.log(`✅ Busca completada com sucesso após ${attempt} tentativas (${attempt * pollInterval / 1000}s)`);
              break;
            }
          }
        }
        
        if (!response.Completed) {
          console.log(`⚠️ Busca não completou após ${maxAttempts} tentativas, mas retornando dados disponíveis`);
        }
      }

      console.log('📥 Resposta recebida:', response ? 'OK' : 'VAZIA');
      console.log('📊 Estrutura da resposta:', {
        hasData: !!response?.Data,
        dataLength: response?.Data?.length || 0,
        dataType: Array.isArray(response?.Data) ? 'array' : typeof response?.Data
      });
      console.log('🔍 Resposta completa:', JSON.stringify(response, null, 2));

      if (!response || !response.Data) {
        console.warn('⚠️ Resposta sem dados:', response);
        return { flights: [], message: 'Nenhum voo encontrado' };
      }

      // Extração otimizada de voos com múltiplos fallbacks
      let flights = [];
      const dataArray = Array.isArray(response.Data) ? response.Data : [response.Data];
      
      for (const dataItem of dataArray) {
        console.log('🔍 Processando item de dados:', {
          type: typeof dataItem,
          keys: typeof dataItem === 'object' ? Object.keys(dataItem) : 'N/A'
        });
        
        // Tentativa 1: flights array direto (estrutura que funcionou anteriormente)
        if (dataItem.flights && Array.isArray(dataItem.flights)) {
          // Verifica se cada flight tem segments (estrutura aninhada da Moblix)
          for (const flight of dataItem.flights) {
            if (flight.segments && Array.isArray(flight.segments)) {
              // Cada segment é um voo individual - extrair todos
              for (const segment of flight.segments) {
                flights.push({
                  ...segment,
                  validatingBy: flight.validatingBy,
                  fareGroup: flight.fareGroup,
                  // Adicionar códigos de aeroporto no nível do flight
                  Origem: segment.departure || segment.Origem,
                  Destino: segment.arrival || segment.Destino,
                  // Preserva informações do flight pai
                  parentFlightInfo: {
                    validatingBy: flight.validatingBy,
                    fareGroup: flight.fareGroup
                  }
                });
              }
              console.log(`✅ Extraídos ${flight.segments.length} voos de segments dentro de flights`);
            } else {
              // Se não tem segments, adiciona o flight completo
              flights.push(flight);
            }
          }
          console.log(`✅ Total extraído de flights array: ${flights.length}`);
        }
        // Tentativa 2: Flights com F maiúsculo
        else if (dataItem.Flights && Array.isArray(dataItem.Flights)) {
          flights.push(...dataItem.Flights);
          console.log(`✅ Extraídos ${dataItem.Flights.length} voos de Flights array`);
        }
        // Tentativa 3: Ida array (estrutura Moblix tradicional)
        else if (dataItem.Ida && Array.isArray(dataItem.Ida)) {
          flights.push(...dataItem.Ida);
          console.log(`✅ Extraídos ${dataItem.Ida.length} voos de Ida array`);
          
          // Adiciona voos de volta se existirem
          if (dataItem.Volta && Array.isArray(dataItem.Volta)) {
            flights.push(...dataItem.Volta);
            console.log(`✅ Extraídos ${dataItem.Volta.length} voos de Volta array`);
          }
        }
        // Tentativa 3: Voos array direto
        else if (dataItem.Voos && Array.isArray(dataItem.Voos)) {
          flights.push(...dataItem.Voos);
          console.log(`✅ Extraídos ${dataItem.Voos.length} voos de Voos array`);
        }
        // Tentativa 4: Se o próprio dataItem é um array de voos
        else if (Array.isArray(dataItem)) {
          flights.push(...dataItem);
          console.log(`✅ Extraídos ${dataItem.length} voos do array direto`);
        }
        // Tentativa 5: Busca por propriedades que contenham arrays de voos
        else if (typeof dataItem === 'object') {
          const flightArrays = Object.entries(dataItem).filter(([key, value]) => 
            Array.isArray(value) && value.length > 0 && 
            value[0] && typeof value[0] === 'object' &&
            // Verifica se parece com dados de voo
            (key.toLowerCase().includes('voo') || 
             key.toLowerCase().includes('flight') ||
             key.toLowerCase().includes('ida') ||
             key.toLowerCase().includes('volta'))
          );
          
          for (const [key, flightArray] of flightArrays) {
            flights.push(...flightArray);
            console.log(`✅ Extraídos ${flightArray.length} voos de ${key}`);
          }
          
          // Tentativa 6: Buscar em objetos aninhados que podem conter voos
          if (flights.length === 0) {
            const nestedObjects = Object.values(dataItem).filter(value => 
              value && typeof value === 'object' && !Array.isArray(value)
            );
            
            for (const nestedObj of nestedObjects) {
              if (nestedObj.flights && Array.isArray(nestedObj.flights) && nestedObj.flights.length > 0) {
                flights.push(...nestedObj.flights);
                console.log(`✅ Extraídos ${nestedObj.flights.length} voos de objeto aninhado`);
              }
            }
          }
        }
      }

      console.log('🎯 Total de voos extraídos:', flights.length);

      if (flights.length === 0) {
        console.warn('⚠️ Nenhum voo encontrado na resposta da API');
        console.warn('🔍 Detalhes da resposta:', {
          success: response?.Success,
          hasResult: response?.HasResult,
          completed: response?.Completed,
          activeProviders: response?.Data?.[0]?.ActiveProviders?.length || 0,
          totalItems: response?.TotalItens
        });
        
        // Já estamos usando Companhia: -1 (todas as companhias)
        // Se mesmo assim não há provedores ativos, é um problema de configuração da conta
        
        // Retornar erro real sem fallback
        return { 
          flights: [], 
          message: 'Nenhum voo encontrado. Possíveis causas: (1) Nenhuma companhia aérea disponível na conta, (2) Rota não operada, (3) Datas indisponíveis.',
          success: false,
          error: 'NO_ACTIVE_PROVIDERS',
          details: {
            activeProviders: response?.Data?.[0]?.ActiveProviders?.length || 0,
            totalItems: response?.TotalItens || 0,
            completed: response?.Completed,
            hasResult: response?.HasResult
          },
          apiResponse: response
        };
      }

      // Log detalhado dos voos antes da remoção de duplicatas
      console.log('🔍 Analisando voos para duplicatas:');
      flights.forEach((flight, index) => {
        console.log(`Voo ${index + 1}:`, {
          rateToken: flight.rateToken || flight.segments?.[0]?.rateToken,
          departure: flight.departure || flight.segments?.[0]?.departure,
          departureDate: flight.departureDate || flight.segments?.[0]?.departureDate,
          flightNumber: flight.legs?.[0]?.flightNumber || flight.segments?.[0]?.legs?.[0]?.flightNumber,
          segments: flight.segments?.length || 0,
          fullStructure: Object.keys(flight)
        });
      });

      // Remover duplicatas baseado no rateToken dos segments
      const uniqueFlights = flights.filter((flight, index, self) => {
        const rateToken = flight.rateToken || flight.segments?.[0]?.rateToken;
        if (!rateToken) return true; // Manter voos sem rateToken
        
        return index === self.findIndex(f => {
          const fRateToken = f.rateToken || f.segments?.[0]?.rateToken;
          return fRateToken === rateToken;
        });
      });

      console.log('🔄 Voos únicos após remoção de duplicatas:', uniqueFlights.length);

      if (uniqueFlights.length === 0) {
        console.warn('⚠️ Nenhum voo encontrado na resposta');
        return { 
          flights: [], 
          message: 'Nenhum voo encontrado para os critérios especificados. Tente ajustar as datas ou destinos.',
          success: false
        };
      }

      // Log final antes de retornar
      console.log('📋 Retornando resultado final:', {
        totalVoos: uniqueFlights.length,
        primeiroVoo: uniqueFlights[0] ? {
          rateToken: uniqueFlights[0].rateToken || uniqueFlights[0].segments?.[0]?.rateToken,
          departure: uniqueFlights[0].departure || uniqueFlights[0].segments?.[0]?.departure,
          price: uniqueFlights[0].fareGroup?.priceWithTax || uniqueFlights[0].price
        } : null,
        estruturaCompleta: uniqueFlights.slice(0, 2)
      });

      return { 
        flights: uniqueFlights,
        message: `${uniqueFlights.length} voos encontrados`,
        success: true,
        searchParams: requestData
      };

    } catch (error) {
      console.error('❌ Erro na busca consolidada de voos:', error);
      
      if (error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
        throw new Error('Falha na conexão com a API de voos. Verifique sua conectividade.');
      }
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Timeout na busca de voos. Tente novamente em alguns instantes.');
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
      
      return response;
    } catch (error) {
      console.error('❌ Erro ao buscar aeroportos:', error);
      
      // Fallback: usar dados locais quando API falhar
      console.log('🔄 API falhou, usando dados locais como fallback');
      
      const { searchAirports } = await import('../data/airports');
      const localResults = searchAirports(filtro);
      
      // Converte para o formato esperado pela API Moblix
      const fallbackData = {
        TotalItens: localResults.length,
        Completed: true,
        Success: true,
        HasResult: localResults.length > 0,
        Erro: null,
        MensagemErro: null,
        Data: localResults.map((airport, index) => ({
          Index: index,
          Iata: airport.iata,
          Nome: airport.name,
          Cidade: airport.city,
          Pais: airport.country,
          Internacional: airport.country !== 'Brasil',
          Prioridade: airport.popular ? 95 : 0
        })),
        Token: null
      };
      
      console.log('✅ Usando dados locais:', fallbackData.Data.length, 'aeroportos encontrados');
      console.log('✅ Dados do fallback:', fallbackData);
      return fallbackData;
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
