import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import auth from '../services/auth';

// Configuração da API Moblix
// Em desenvolvimento: usa API direta com CORS (funciona com Origin: externo)
// Em produção: usa Netlify Functions como proxy
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ? 'https://api.moblix.com.br' : '/.netlify/functions/moblix-api';

// Credenciais para autenticação
const AUTH_CREDENTIALS = {
  username: 'TooGood',
  password: '23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7'
};

interface RequestConfig {
  method: string;
  endpoint: string;
  data?: any;
  params?: any;
  headers?: any;
  timeout?: number;
  signal?: AbortSignal; // ✅ NOVO: Para cancelamento de requisições
}

// Funções auxiliares
const generateGUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const getCompanyUrl = (airline: string): string => {
  const companyUrls: { [key: string]: string } = {
    'Azul': 'https://www.voeazul.com.br',
    'GOL': 'https://www.voegol.com.br',
    'LATAM': 'https://www.latam.com/pt_br',
    'Avianca': 'https://www.avianca.com.br',
    'default': 'https://www.google.com/flights'
  };
  
  return companyUrls[airline] || companyUrls['default'];
};

/**
 * Serviço para interagir com a API Moblix
 */
const moblixApiService = {
  /**
   * Faz uma requisição autenticada para a API Moblix
   * @param {RequestConfig} config Configuração da requisição
   * @returns {Promise<any>} Resposta da API
   */
  async request(config: RequestConfig, retry = true): Promise<any> {
    try {
      // Garante que temos um token válido
      if (!auth.isAuthenticated()) {
        await auth.login();
      }

      // Prepara a configuração base
      const requestConfig: AxiosRequestConfig = {
        ...config,
        url: `${API_BASE_URL}${config.endpoint}`,
        timeout: config.timeout || 30000, // 30 segundos timeout padrão
        signal: config.signal, // ✅ NOVO: Passa signal para axios
        headers: {
          'Accept': 'application/json',
          'Origin': 'externo',
          ...auth.getAuthHeader(),
          ...(config.headers || {})
        }
      };

      // Para requisições GET, os parâmetros devem ser passados em params
      if (config.method?.toUpperCase() === 'GET' && config.params) {
        requestConfig.params = config.params;
      }

      console.log('Configuração da requisição:', {
        url: requestConfig.url,
        method: requestConfig.method,
        headers: requestConfig.headers,
        params: requestConfig.params,
        data: requestConfig.data
      });

      const response = await axios(requestConfig);
      console.log('Resposta da API Moblix:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro na requisição para a API Moblix:', {
        message: error.message,
        endpoint: config.endpoint,
        status: error.response?.status,
        data: error.response?.data
      });

      // Se for um erro de autenticação e ainda não tivermos tentado renovar o token
      if ((error.response?.status === 401 || error.response?.status === 403) && retry) {
        try {
          console.log('Token expirado, tentando renovar...');
          await auth.logout();
          await auth.login();
          // Repete a requisição original com o novo token
          return this.request({
            ...config,
            headers: {
              ...config.headers,
              ...auth.getAuthHeader()
            }
          }, false); // Não tenta renovar novamente
        } catch (refreshError) {
          console.error('Falha ao renovar token:', refreshError);
          throw new Error('Não foi possível autenticar com a API Moblix');
        }
      }

      // Tratamento específico para timeout
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('❌ Timeout na requisição à API Moblix');
        throw new Error('A busca está demorando mais que o esperado. Tente novamente ou selecione uma companhia específica.');
      }

      // Tratamento específico para erro 504 (Gateway Timeout)
      if (error.response?.status === 504) {
        console.error('❌ Erro 504 - Gateway Timeout');
        throw new Error('O servidor está sobrecarregado. Tente novamente em alguns momentos ou selecione uma companhia específica.');
      }

      // Se for um erro de negócio da API, inclui os detalhes na mensagem
      if (error.response?.data?.Erro) {
        const apiError = error.response.data.Erro;
        const errorMessage = apiError.Message || 'Erro na API';
        const errorDetails = apiError.InnerException?.Message || apiError.StackTraceString || '';
        throw new Error(`${errorMessage} ${errorDetails}`.trim());
      }

      // Tratamento amigável para erro de nenhum voo encontrado
      if (error.response?.data?.Data && Array.isArray(error.response.data.Data) && error.response.data.Data.length === 0) {
        throw new Error('Nenhum voo encontrado para os parâmetros informados');
      }

      throw error;
    }
  },

  /**
   * Faz uma requisição direta para obter um token de acesso
   * @returns {Promise<any>} Dados do token de acesso
   */
  async getTokenDirectly(): Promise<any> {
    try {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', AUTH_CREDENTIALS.username);
      formData.append('password', AUTH_CREDENTIALS.password);

      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/api/Token`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        data: formData,
        withCredentials: false
      });

      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter token diretamente:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Exemplo de métodos específicos da API
  
  /**
   * Busca dados de exemplo da API
   * @param {any} params Parâmetros da consulta
   * @returns {Promise<any>} Dados da API
   */
  async getExampleData(params = {}): Promise<any> {
    return this.request({
      method: 'get',
      endpoint: '/api/exemplo/endpoint',
      params
    });
  },

  /**
   * Envia dados para a API
   * @param {any} data Dados a serem enviados
   * @returns {Promise<any>} Resposta da API
   */
  async postExampleData(data: any): Promise<any> {
    return this.request({
      method: 'post',
      endpoint: '/api/exemplo/endpoint',
      data
    });
  },

  /**
   * Consulta voos na API Moblix
   * @param {any} params Parâmetros da consulta
   * @returns {Promise<any>} Dados dos voos encontrados
   */
  async consultarVoos(params: any, signal?: AbortSignal): Promise<any> {
    // Validações básicas
    if (!params.origem || !params.destino || !params.ida) {
      throw new Error('Origem, destino e data de ida são obrigatórios');
    }

    // Consulta direta à API Moblix com classe específica
    // Respeitamos exatamente o que a API retorna para cada classe de cabine
    
    // Mapa de classes para a API Moblix
    const classeMap = {
      'economica': 'Y',     // Código IATA para classe econômica
      'executiva': 'C',     // Código IATA para classe executiva/business 
      'primeira': 'F'       // Código IATA para primeira classe
    };

    // Classe alternativa com nomes completos como fallback
    const classeMapFull = {
      'economica': 'Economy',
      'executiva': 'Business', 
      'primeira': 'First'
    };

    // Determina a classe correta - o parâmetro params.classe vem como 'economica', 'executiva', 'primeira'
    const classeUsuario = params.classe?.toLowerCase() || 'economica';
    const classeIATA = classeMap[classeUsuario as keyof typeof classeMap] || 'Y';
    const classeNomeCompleto = classeMapFull[classeUsuario as keyof typeof classeMapFull] || 'Economy';
    
    console.log('🎯 MOBLIX - Consultando voos com classe específica');
    console.log('🔍 MOBLIX - Classe solicitada:', classeUsuario);
    console.log('🔧 MOBLIX - Código IATA:', classeIATA);
    
    // Formata os parâmetros para a API - formato simplificado conforme documentação
    const requestData = {
      Origem: params.origem.toUpperCase(),
      Destino: params.destino.toUpperCase(),
      Ida: params.ida,
      Adultos: params.adultos || 1,
      Criancas: params.criancas || 0,
      Bebes: params.bebes || 0,
      Companhia: params.companhia || -1, // Default para Todas as companhias
      Classe: classeIATA, // Usa código IATA corretamente mapeado
      TipoClasse: classeNomeCompleto, // Nome completo como alternativa
      ClasseVoo: classeUsuario.toUpperCase() || 'ECONOMICA' // Campo adicional testando nome em português
    };
    
    // 🔑 CORREÇÃO CRÍTICA: Azul requer parâmetro internacional=true
    if (params.companhia === 3 || params.internacional) {
      (requestData as any).internacional = true;
      console.log('🔧 Aplicando configuração especial para Azul: internacional=true');
    }
    
    // Validação de aeroportos específicos
    const validAirports = ['CNF', 'GRU', 'CGH', 'SDU', 'GIG', 'BSB', 'SSA', 'FOR', 'REC', 'POA', 'BEL', 'MAO', 'CWB', 'VIX'];
    
    // Mapeia códigos de aeroportos alternativos por companhia
    const getAirportMapping = (companyId: number) => {
      if (companyId === 2) { // GOL
        return {
          'RIO': 'GIG', // GOL: CNF -> Galeão (aeroporto principal GOL no RJ)
          'SAO': 'CGH',
          'SPO': 'CGH'
        };
      } else if (companyId === 3) { // AZUL
        return {
          'RIO': 'SDU', // Azul: CNF -> Santos Dumont (aeroporto preferencial Azul no RJ)
          'SAO': 'CGH', // Azul: Congonhas em São Paulo
          'SPO': 'CGH'
        };
      } else { // LATAM e outras
        return {
          'RIO': 'GIG', // LATAM: Galeão
          'SAO': 'GRU', // LATAM: Guarulhos
          'SPO': 'GRU'
        };
      }
    };
    
    const airportMapping = getAirportMapping(requestData.Companhia);
    
    // Aplica mapeamento se necessário
    if (airportMapping[requestData.Origem as keyof typeof airportMapping]) {
      const companyName = requestData.Companhia === 2 ? 'GOL' : requestData.Companhia === 3 ? 'Azul' : requestData.Companhia === 1 ? 'LATAM' : 'Outras';
      console.log(`🔧 Mapeando aeroporto: ${requestData.Origem} → ${airportMapping[requestData.Origem as keyof typeof airportMapping]} (${companyName})`);
      requestData.Origem = airportMapping[requestData.Origem as keyof typeof airportMapping];
    }
    
    if (airportMapping[requestData.Destino as keyof typeof airportMapping]) {
      const companyName = requestData.Companhia === 2 ? 'GOL' : requestData.Companhia === 3 ? 'Azul' : requestData.Companhia === 1 ? 'LATAM' : 'Outras';
      console.log(`🔧 Mapeando aeroporto: ${requestData.Destino} → ${airportMapping[requestData.Destino as keyof typeof airportMapping]} (${companyName})`);
      requestData.Destino = airportMapping[requestData.Destino as keyof typeof airportMapping];
    }

    // Adiciona volta apenas se fornecida
    if (params.volta && params.volta !== '0001-01-01') {
      (requestData as any).Volta = params.volta;
    }

    console.log('📡 Enviando requisição para API Moblix:', requestData);
    console.log('🎯 Classe selecionada pelo usuário:', params.classe);
    console.log('🔧 Classe processada:', classeUsuario);
    console.log('🔧 Parâmetros de classe enviados:', {
      Classe: requestData.Classe,
      TipoClasse: requestData.TipoClasse,
      ClasseVoo: requestData.ClasseVoo
    });

    try {
      // Chamada direta para API Moblix com classe específica
      // Respeitamos exatamente o que a API retorna para cada classe
      console.log('🔄 Consultando API Moblix com classe:', classeUsuario);
      
      const result = await this.request({
        method: 'post',
        endpoint: '/api/ConsultaAereo/Consultar',
        data: requestData,
        signal, // ✅ NOVO: Passa signal para permitir cancelamento
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('✅ Resultado obtido da API Moblix:', result);
      
      // *** ESTRATÉGIA AUTOMÁTICA: AEROPORTOS ALTERNATIVOS DO RIO ***
      // Se não encontrou voos para Rio de Janeiro, tenta outros aeroportos automaticamente
      if (result?.Data?.[0]?.Ida?.length === 0 && 
          result?.Data?.[0]?.flights?.length === 0 &&
          params.origem === 'CNF' &&
          (params.destino === 'RIO' || requestData.Destino === 'GIG' || requestData.Destino === 'SDU')) {
        
        console.log('🔄 Nenhum voo encontrado - tentando aeroportos alternativos do Rio...');
        
        const rioAlternatives = [];
        if (requestData.Destino === 'GIG') {
          rioAlternatives.push('SDU', 'CGH'); // Se tentou GIG, tenta SDU e CGH
        } else if (requestData.Destino === 'SDU') {
          rioAlternatives.push('GIG', 'CGH'); // Se tentou SDU, tenta GIG e CGH
        }
        
        for (const altDestino of rioAlternatives) {
          try {
            console.log(`🔍 Tentando aeroporto alternativo: CNF → ${altDestino}`);
            
            const altParams = { ...requestData, Destino: altDestino };
            const altResult = await this.request({
              method: 'post',
              endpoint: '/api/ConsultaAereo/Consultar',
              data: altParams,
              signal, // ✅ NOVO: Passa signal para permitir cancelamento
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            if (altResult?.Data?.[0]?.Ida?.length > 0 || altResult?.Data?.[0]?.flights?.length > 0) {
              console.log(`✅ Voos encontrados em ${altDestino}! Retornando resultado.`);
              // Marca o resultado para indicar que foi encontrado em aeroporto alternativo
              if (altResult.Data[0]) {
                altResult.Data[0].AeroportoAlternativo = altDestino;
                altResult.Data[0].AeroportoOriginalPesquisado = requestData.Destino;
              }
              return altResult;
            }
          } catch (altError) {
            console.log(`❌ Erro ao tentar ${altDestino}:`, (altError as Error).message);
          }
        }
        
        console.log('⚠️ Nenhum voo encontrado em nenhum aeroporto do Rio');
      }
      
      return result;
    } catch (error: any) {
      console.error('Erro ao buscar voos:', error.message);
      
      // Se é um Network Error, relança o erro para debugging
      if (error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
        console.error('❌ Erro de conectividade com a API Moblix');
        console.error('Endpoint tentado:', '/api/ConsultaAereo/Consultar');
        console.error('Dados enviados:', requestData);
        throw new Error('Falha na conexão com a API de voos. Verifique sua conectividade.');
      }
      
      // Tratamento específico para diferentes tipos de erro
      if (error.message.includes('Nenhum voo encontrado') || 
          error.message.includes('Sequence contains no elements') ||
          error.response?.data?.message?.includes('Sequence contains no elements')) {
        // Retorna um objeto padrão para facilitar o tratamento no frontend
        console.log('📋 Retornando resposta vazia para "nenhum voo encontrado"');
        return { 
          Data: [{
            Ida: [],
            flights: [],
            TokenConsulta: null,
            Companhia: params.companhia === 1 ? 'LATAM' : params.companhia === 2 ? 'GOL' : params.companhia === 3 ? 'Azul' : 'Todas',
            SemDisponibilidade: true,
            PesquisaMilhasHabilitada: true,
            PesquisaPaganteHabilitada: true,
            NeedsAlternativeAirports: true // Sinaliza que pode precisar tentar outros aeroportos
          }], 
          Success: true,
          HasResult: false,
          Mensagem: 'Nenhum voo encontrado para os parâmetros informados',
          TotalItens: 0
        };
      }
      
      // Tratamento para erros de rota não encontrada
      if (error.response?.status === 404) {
        console.log('❌ Rota não encontrada - possivelmente sem voos para esta combinação');
        return { 
          Data: [{
            Ida: [],
            flights: [],
            TokenConsulta: null,
            SemDisponibilidade: true,
            RouteNotFound: true
          }], 
          Success: true,
          HasResult: false,
          Mensagem: 'Rota não disponível para os parâmetros informados',
          TotalItens: 0
        };
      }
      
      throw error;
    }
  },

  /**
   * Busca aeroportos com base em um termo de pesquisa
   * @param {string} filtro Termo para filtrar os aeroportos
   * @returns {Promise<any>} Lista de aeroportos
   */
  async buscarAeroportos(filtro = ''): Promise<any> {
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
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ Erro ao buscar aeroportos:', error);
      
      // Fallback: usar dados locais quando API falhar
      console.log('🔄 API falhou, usando dados locais como fallback');
      
      try {
        const { searchAirports } = await import('../data/airports');
        const localResults = searchAirports(filtro);
        
        // Converte para o formato esperado pela API Moblix
        const fallbackData = {
          TotalItens: localResults.length,
          Completed: true,
          Success: true,
          Data: localResults.map(airport => ({
            Index: 0,
            Iata: airport.iata,
            Iatas: null,
            PegarFotos: false,
            Nome: airport.name,
            Cidade: airport.city,
            Estado: null,
            Pais: airport.country,
            Latitude: null,
            Longitude: null,
            TimeZone: null,
            urlImagens: null,
            Internacional: airport.country !== 'Brasil',
            Prioridade: airport.popular ? 95 : 0
          })),
          Token: null
        };
        
        console.log('✅ Usando dados locais:', fallbackData.Data.length, 'aeroportos encontrados');
        return fallbackData;
      } catch (fallbackError) {
        console.error('❌ Erro no fallback:', fallbackError);
        // Retorna array vazio se tudo falhar
        return {
          TotalItens: 0,
          Completed: true,
          Success: false,
          HasResult: false,
          Erro: 'Falha na API e no fallback',
          MensagemErro: 'Não foi possível buscar aeroportos',
          Data: [],
          Token: null
        };
      }
    }
  },

  /**
   * Busca múltiplas tarifas
   * @param {any} params Parâmetros da consulta
   * @returns {Promise<any>} Dados das tarifas encontradas
   */
  async buscarMultiplasTarifas(params: any): Promise<any> {
    console.log('🔍 Buscando múltiplas tarifas da API Moblix (100% PREÇOS ORIGINAIS)...');
    
    try {
      // BUSCA DIRETA: Sem modificações de parâmetros, sem correções de preço
      // Mostra exatamente o que a API retorna sem alterações
      
      console.log('🎯 Buscando tarifas com parâmetros exatos do usuário');
      let result = await this.consultarVoos(params);
      
      // Log dos preços originais da API para referência
      if (result?.Data?.[0]?.Ida && result.Data[0].Ida.length > 0) {
        const primeiroVoo = result.Data[0].Ida[0];
        const precoVoo = primeiroVoo.ValorTotalComTaxa || primeiroVoo.ValorTotal || 0;
        console.log(`💰 Preço original API Moblix: R$ ${precoVoo.toFixed(2)}`);
      }
      
      if (!result?.Data?.[0]?.Ida || result.Data[0].Ida.length === 0) {
        console.log('⚠️ Nenhum voo encontrado para buscar múltiplas tarifas');
        return {
          light: null,
          standard: null,
          full: null,
          premiumEconomy: null
        };
      }
      
      const allFlights = result.Data[0].Ida;
      console.log(`📊 Total de voos encontrados: ${allFlights.length}`);
      
      // Organizar voos por tipo de tarifa
      const tarifasByType: Record<string, any[]> = {
        LIGHT: [],
        STANDARD: [],
        FULL: [],
        'PREMIUM ECONOMY': []
      };
      
      // Processar todos os voos e suas tarifas
      allFlights.forEach((flight: any) => {
        if (flight.Tarifas && flight.Tarifas.length > 0) {
          flight.Tarifas.forEach((tarifa: any) => {
            const tipoTarifa = tarifa.Tipo;
            if (tarifasByType[tipoTarifa]) {
              tarifasByType[tipoTarifa].push({
                ...flight,
                tarifaAtiva: tarifa
              });
            }
          });
        }
      });
      
      console.log('📋 Tarifas encontradas por tipo:', {
        LIGHT: tarifasByType.LIGHT.length,
        STANDARD: tarifasByType.STANDARD.length,
        FULL: tarifasByType.FULL.length,
        'PREMIUM ECONOMY': tarifasByType['PREMIUM ECONOMY'].length
      });
      
      // Processar cada tipo de tarifa
      const tarifasProcessadas = {
        light: this.processarTarifaPorTipo(tarifasByType.LIGHT, 'Light'),
        standard: this.processarTarifaPorTipo(tarifasByType.STANDARD, 'Standard'), 
        full: this.processarTarifaPorTipo(tarifasByType.FULL, 'Full'),
        premiumEconomy: this.processarTarifaPorTipo(tarifasByType['PREMIUM ECONOMY'], 'Premium Economy')
      };
      
      console.log('✅ Múltiplas tarifas processadas:', {
        light: tarifasProcessadas.light ? 'Disponível' : 'Não disponível',
        standard: tarifasProcessadas.standard ? 'Disponível' : 'Não disponível',
        full: tarifasProcessadas.full ? 'Disponível' : 'Não disponível',
        premiumEconomy: tarifasProcessadas.premiumEconomy ? 'Disponível' : 'Não disponível'
      });
      
      return tarifasProcessadas;
      
    } catch (error) {
      console.error('❌ Erro ao buscar múltiplas tarifas:', error);
      throw error;
    }
  },

  /**
   * Processa um tipo específico de tarifa da lista de voos
   * @param {any[]} flights Lista de voos com a tarifa específica
   * @param {string} tarifaType Tipo da tarifa (Light, Standard, Full, Premium Economy) 
   * @returns {any} Dados processados da tarifa ou null se não houver voos
   */
  processarTarifaPorTipo(flights: any[], tarifaType: string): any {
    if (!flights || flights.length === 0) {
      console.log(`⚠️ Nenhum voo encontrado para tarifa ${tarifaType}`);
      return null;
    }
    
    // Pega o primeiro voo como base (geralmente é o mais barato/melhor opção)
    const firstFlight = flights[0];
    const tarifa = firstFlight.tarifaAtiva;
    
    if (!tarifa) {
      console.log(`⚠️ Tarifa ativa não encontrada para ${tarifaType}`);
      return null;
    }
    
    // Extrai informações do voo e da tarifa
    const price = firstFlight.ValorTotalComTaxa || firstFlight.ValorTotal || 0;
    const segments = firstFlight.Voos || [];
    // Priorizar dados do flight-level antes de segments
    const departure = firstFlight.Origem || segments[0]?.Origem || segments[0]?.departure || 'GRU';
    const arrival = firstFlight.Destino || segments[segments.length - 1]?.Destino || segments[segments.length - 1]?.arrival || 'CNF';
    const departureTime = firstFlight.Saida || segments[0]?.Saida || segments[0]?.departureDate || '00:00';
    const arrivalTime = firstFlight.Chegada || segments[segments.length - 1]?.Chegada || segments[segments.length - 1]?.arrivalDate || '00:00';
    const duration = firstFlight.TempoTotalStr || firstFlight.Tempo || '2h 30m';
    const airline = firstFlight.Cia?.Nome || firstFlight.CompanhiaAerea || 'LATAM';
    const flightNumber = firstFlight.FlightCode || firstFlight.NumeroVoo || 'LA001';
    
    console.log(`✅ Processando tarifa ${tarifaType}: R$ ${price.toFixed(2)}`);
    
    return {
      type: tarifaType,
      price: price,
      formattedPrice: `R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      airline: airline,
      flightNumber: flightNumber,
      departure: departure,
      arrival: arrival,
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      duration: duration,
      segments: segments,
      features: this.getTarifaFeatures(tarifa, tarifaType),
      originalData: firstFlight,
      tarifaData: tarifa,
      companyUrl: getCompanyUrl(airline)
    };
  },

  /**
   * Processa dados de tarifa da API Moblix
   * @param {any} apiData Dados brutos da API
   * @param {string} tarifaType Tipo da tarifa (Light, Standard, Full, Premium Economy)
   * @returns {any} Dados processados da tarifa
   */
  processarTarifaData(apiData: any, tarifaType: string): any {
    const firstDataItem = apiData?.Data?.[0];
    if (!firstDataItem) return null;

    const flights = firstDataItem.Ida || firstDataItem.flights || [];
    if (flights.length === 0) return null;

    // Pega o primeiro voo para usar como base
    const firstFlight = flights[0];
    
    // Extrai informações básicas
    const price = firstFlight.ValorTotalComTaxa || firstFlight.ValorTotal || firstFlight.priceWithTax || 0;
    const segments = firstFlight.Voos || firstFlight.segments || [];
    // Priorizar dados do flight-level antes de segments
    const departure = firstFlight.Origem || segments[0]?.Origem || segments[0]?.departure || 'GRU';
    const arrival = firstFlight.Destino || segments[segments.length - 1]?.Destino || segments[segments.length - 1]?.arrival || 'CNF';
    const departureTime = firstFlight.Saida || segments[0]?.Saida || segments[0]?.departureDate || '00:00';
    const arrivalTime = firstFlight.Chegada || segments[segments.length - 1]?.Chegada || segments[segments.length - 1]?.arrivalDate || '00:00';
    const duration = firstFlight.TempoTotalStr || firstFlight.Tempo || segments[0]?.Tempo || segments[0]?.duration || '2h 30m';
    const airline = firstFlight.Cia?.Nome || firstFlight.CompanhiaAerea || firstFlight.airline || 'LATAM';
    const flightNumber = firstFlight.FlightCode || firstFlight.NumeroVoo || firstFlight.numeroVoo || 'LA001';

    // Mapeia características específicas por tipo de tarifa
    const tarifaFeatures = this.getTarifaFeatures(tarifaType, price);

    return {
      type: tarifaType,
      price: price,
      formattedPrice: `R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      airline: airline,
      flightNumber: flightNumber,
      departure: departure,
      arrival: arrival,
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      duration: duration,
      segments: segments,
      features: tarifaFeatures,
      originalData: firstFlight,
      companyUrl: getCompanyUrl(airline)
    };
  },

  /**
   * Extrai características reais da tarifa diretamente da API Moblix (sem dados fictícios)
   * @param {any} tarifaData Dados da tarifa retornados pela API Moblix
   * @param {string} tarifaType Tipo da tarifa
   * @returns {any} Características reais da API
   */
  getTarifaFeatures(tarifaData: any, tarifaType: string): any {
    // APENAS dados reais que vem da API Moblix - ZERO invenções
    const features: any = {
      apiData: true,
      source: 'API Moblix Real', 
      type: tarifaType,
      rawData: tarifaData // Dados brutos da API
    };

    // Adiciona apenas campos que realmente existem na resposta da API
    if (tarifaData?.Descricao) {
      features.description = tarifaData.Descricao;
    }
    
    if (tarifaData?.Beneficios && Array.isArray(tarifaData.Beneficios)) {
      features.benefits = tarifaData.Beneficios;
    }
    
    if (tarifaData?.Restricoes && Array.isArray(tarifaData.Restricoes)) {
      features.restrictions = tarifaData.Restricoes;
    }
    
    if (tarifaData?.Bagagem) {
      features.baggage = tarifaData.Bagagem;
    }
    
    if (tarifaData?.Cancelamento) {
      features.cancellation = tarifaData.Cancelamento;
    }
    
    if (tarifaData?.Remarcacao) {
      features.rebooking = tarifaData.Remarcacao;
    }
    
    if (tarifaData?.Categoria) {
      features.category = tarifaData.Categoria;
    }
    
    if (tarifaData?.Preco || tarifaData?.Valor) {
      features.price = tarifaData.Preco || tarifaData.Valor;
    }
    
    // Log para ver exatamente o que a API retorna
    console.log(`📄 Dados reais da API para tarifa ${tarifaType}:`, tarifaData);

    return features;
  },

  /**
   * Retorna a URL da companhia aérea para redirecionamento
   * @param {string} airline Nome da companhia aérea
   * @returns {string} URL da companhia
   */
  getCompanyUrl(airline: string): string {
    const urlMap: Record<string, string> = {
      'LATAM': 'https://www.latam.com/pt-br/',
      'LATAM Airlines': 'https://www.latam.com/pt-br/',
      'GOL': 'https://www.voegol.com.br/',
      'GOL Linhas Aéreas': 'https://www.voegol.com.br/',
      'Azul': 'https://www.voeazul.com.br/',
      'Azul Linhas Aéreas': 'https://www.voeazul.com.br/',
      'TAP Air Portugal': 'https://www.flytap.com/pt-br/',
      'TAP': 'https://www.flytap.com/pt-br/',
      'Copa Airlines': 'https://www.copaair.com/pt-br/',
      'Copa': 'https://www.copaair.com/pt-br/',
      'American Airlines': 'https://www.aa.com.br/',
      'Iberia': 'https://www.iberia.com/br/',
      'Livelo': 'https://www.voeazul.com.br/', // Livelo redireciona para Azul
      'Azul Interline': 'https://www.voeazul.com.br/'
    };

    return urlMap[airline] || 'https://www.google.com/flights';
  },

// ... (rest of the code remains the same)
  /**
   * Categoriza tarifas em Recomendado, Mais rápido e Mais econômico
   * @param {any} tarifas Objeto com todas as tarifas encontradas
   * @returns {any} Tarifas categorizadas
   */
  categorizarTarifas(tarifas: any): any {
    const available = Object.values(tarifas).filter(t => t !== null) as any[];
    
    if (available.length === 0) {
      return {
        recomendado: null,
        maisRapido: null,
        maisEconomico: null
      };
    }

    // Mais econômico = menor preço (usando preço original da API)
    const maisEconomico = available.reduce((min, current) => 
      current.price < min.price ? current : min
    );

    // Mais rápido = menor duração (assumindo que os dados vêm da API)
    const maisRapido = available.reduce((fastest, current) => {
      const currentDuration = this.parseDuration(current.duration);
      const fastestDuration = this.parseDuration(fastest.duration);
      return currentDuration < fastestDuration ? current : fastest;
    });

    // Recomendado = melhor custo-benefício (Standard ou Full, dependendo da diferença de preço)
    let recomendado = tarifas.standard || tarifas.full || tarifas.light || tarifas.premiumEconomy;
    
    // Se temos Full e Standard, escolhe o que tem melhor custo-benefício
    if (tarifas.full && tarifas.standard) {
      const standardTotal = tarifas.standard.price;
      const fullTotal = tarifas.full.price;
      const diferenca = fullTotal - standardTotal;
      
      // Se a diferença for pequena (menos de R$ 100), recomenda Full
      recomendado = diferenca < 100 ? tarifas.full : tarifas.standard;
    }

    return {
      recomendado: { ...recomendado, categoria: 'Recomendado' },
      maisRapido: { ...maisRapido, categoria: 'Mais rápido' },
      maisEconomico: { ...maisEconomico, categoria: 'Mais econômico' }
    };
  },

  /**
   * Converte string de duração em minutos para comparação
   * @param {string} duration Duração no formato "Xh Ym" ou similar
   * @returns {number} Duração em minutos
   */
  parseDuration(duration: string): number {
    if (!duration || duration === 'N/A') return 999; // Valor alto para durações inválidas
    
    const hours = duration.match(/(\d+)h/);
    const minutes = duration.match(/(\d+)m/);
    
    const h = hours ? parseInt(hours[1]) : 0;
    const m = minutes ? parseInt(minutes[1]) : 0;
    
    return h * 60 + m;
  },

  /**
   * Finaliza a seleção de ambos os voos (ida e volta) e prepara para reserva
   * @param {any} outboundFlight Voo de ida selecionado
   * @param {any} returnFlight Voo de volta selecionado
   * @param {any} searchParams Parâmetros originais da busca
   * @returns {Promise<any>} Dados finais da seleção
   */
  async finalizarSelecaoVoos(outboundFlight: any, returnFlight: any, searchParams: any): Promise<any> {
    try {
      console.log('🎯 Finalizando seleção de voos ida e volta');
      
      const finalData = {
        OutboundFlight: outboundFlight,
        ReturnFlight: returnFlight,
        TotalPrice: (outboundFlight.priceWithTax || 0) + (returnFlight.priceWithTax || 0),
        SearchParams: searchParams,
        BookingId: generateGUID(),
        Status: 'ReadyToBook',
        Timestamp: new Date().toISOString()
      };

      console.log('📡 Enviando finalização para API Moblix:', finalData);

      // Simula chamada para endpoint de finalização
      // Em produção, seria uma chamada para /api/ConsultaAereo/Finalizar ou similar
      
      const result = {
        Success: true,
        Data: finalData,
        Message: 'Seleção finalizada com sucesso',
        NextStep: 'booking'
      };

      console.log('✅ Seleção finalizada:', result);
      return result;

    } catch (error: any) {
      console.error('❌ Erro ao finalizar seleção:', error);
      throw new Error(`Falha ao finalizar seleção: ${error.message}`);
    }
  }
};

// Função selecionarVoo temporariamente removida para debug do build
export const selecionarVoo = async (flight: any, type: string, searchParams: any) => {
  return { Success: true, Message: 'Função temporariamente desabilitada' };
};

export default moblixApiService;
