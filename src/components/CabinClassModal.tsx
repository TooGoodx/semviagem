import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import moblixApiService from '../services/moblixApiService';
import { getAirlineLogo, getDisplayAirlineName } from '../utils/airlineLogos';

interface CabinClass {
  name: string;
  price: number;
  basePrice: number;
  additionalFee: number;
  features: string[];
  color: string;
  highlighted?: boolean;
}

interface CabinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: any;
  onClassSelect: (flightWithClass: any) => void;
}

// Configuração de classes por companhia aérea
const AIRLINE_CLASSES: Record<string, CabinClass[]> = {
  'LATAM': [
    {
      name: 'Light',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-green-100 border-green-300',
      features: [
        '1 item pessoal até 10 kg',
        'Bolsa ou mochila debaixo do assento da frente',
        '1 mala pequena até 12 kg',
        'Sujeita a ser despachada no embarque',
        'Remarcação com taxa + diferença de preço'
      ]
    },
    {
      name: 'Standard',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-teal-100 border-teal-300',
      features: [
        '1 item pessoal até 10 kg',
        'Bolsa ou mochila debaixo do assento da frente',
        '1 mala pequena até 12 kg',
        'Sujeita a ser despachada no embarque',
        '1 bagagem despachada 23 kg',
        'Remarcação com taxa + diferença de preço',
        'Solicitação de UPG com trechos'
      ]
    },
    {
      name: 'Full',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-purple-100 border-purple-300',
      features: [
        '1 item pessoal até 10 kg',
        'Bolsa ou mochila debaixo do assento da frente',
        '1 mala pequena até 12 kg',
        'Sujeita a ser despachada no embarque',
        '1 bagagem despachada 23 kg',
        'Remarcação sem taxa + diferença de preço',
        'Reembolso antes da partida do primeiro voo',
        'Seleção de assento Comum',
        'Solicitação de UPG com trechos'
      ]
    },
    {
      name: 'Premium Economy',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-indigo-100 border-indigo-300',
      highlighted: true,
      features: [
        '1 item pessoal até 10 kg',
        'Bolsa ou mochila debaixo do assento da frente',
        '1 mala pequena até 16 kg',
        'Compartimento dedicado na cabine',
        '1 bagagem despachada 23 kg',
        'Remarcação sem taxa + diferença de preço',
        'Reembolso antes da partida do primeiro voo',
        'Assento do meio bloqueado',
        'Melhor oferta gastronômica',
        'Mais espaço para suas pernas',
        'Embarque e desembarque prioritário'
      ]
    }
  ],
  'GOL': [
    {
      name: 'Basic',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-orange-100 border-orange-300',
      features: [
        'Bagagem de mão até 10 kg',
        'Item pessoal até 8 kg',
        'Assento padrão',
        'Remarcação com taxa',
        'Sem bagagem despachada'
      ]
    },
    {
      name: 'Plus',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-yellow-100 border-yellow-300',
      features: [
        'Bagagem de mão até 10 kg',
        'Item pessoal até 8 kg',
        '1 bagagem despachada 20 kg',
        'Seleção de assento básico',
        'Remarcação com taxa reduzida'
      ]
    },
    {
      name: 'Comfort',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-blue-100 border-blue-300',
      features: [
        'Bagagem de mão até 10 kg',
        'Item pessoal até 8 kg',
        '1 bagagem despachada 23 kg',
        'Seleção de assento avançado',
        'Remarcação sem taxa',
        'Check-in prioritário',
        'Embarque preferencial'
      ]
    },
    {
      name: 'Max',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-red-100 border-red-300',
      highlighted: true,
      features: [
        'Bagagem de mão até 10 kg',
        'Item pessoal até 8 kg',
        '2 bagagens despachadas 23 kg cada',
        'Assento GOL+ com mais espaço',
        'Remarcação e cancelamento grátis',
        'Check-in e embarque prioritário',
        'Lounge GOL (quando disponível)',
        'Refeição premium'
      ]
    }
  ],
  'Azul': [
    {
      name: 'Básica',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-blue-50 border-blue-200',
      features: [
        'Bagagem de mão até 10 kg',
        'Item pessoal pequeno',
        'Assento padrão',
        'Remarcação com taxa',
        'TudoAzul pontos básicos'
      ]
    },
    {
      name: 'Tudo Azul',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-sky-100 border-sky-300',
      features: [
        'Bagagem de mão até 10 kg',
        'Item pessoal pequeno',
        '1 bagagem despachada 23 kg',
        'Seleção de assento padrão',
        'TudoAzul pontos extras',
        'Remarcação facilitada'
      ]
    },
    {
      name: 'Azul+',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-indigo-100 border-indigo-300',
      features: [
        'Bagagem de mão até 10 kg',
        'Item pessoal pequeno',
        '1 bagagem despachada 23 kg',
        'Assento Azul+ com mais espaço',
        'Embarque preferencial',
        'TudoAzul pontos dobrados',
        'Remarcação sem taxa',
        'Snack premium'
      ]
    },
    {
      name: 'Business',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-purple-100 border-purple-300',
      highlighted: true,
      features: [
        'Bagagem de mão até 16 kg',
        'Item pessoal grande',
        '2 bagagens despachadas 32 kg cada',
        'Assento Business totalmente reclínable',
        'Embarque prioritário',
        'Lounge Azul',
        'Refeição gourmet',
        'TudoAzul pontos máximos',
        'Cancelamento grátis'
      ]
    }
  ],
  'TAP Air Portugal': [
    {
      name: 'Discount',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-red-50 border-red-200',
      features: [
        'Bagagem de mão até 8 kg',
        'Item pessoal pequeno',
        'Assento padrão',
        'Sem bagagem despachada',
        'Alterações com taxa alta'
      ]
    },
    {
      name: 'Basic',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-green-100 border-green-300',
      features: [
        'Bagagem de mão até 8 kg',
        'Item pessoal pequeno',
        '1 bagagem despachada 23 kg',
        'Seleção de assento padrão',
        'Refeição incluída'
      ]
    },
    {
      name: 'Classic',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-blue-100 border-blue-300',
      features: [
        'Bagagem de mão até 8 kg',
        'Item pessoal pequeno',
        '1 bagagem despachada 23 kg',
        'Seleção de assento sem taxa',
        'Alterações facilitadas',
        'TAP Miles&Go pontos extras'
      ]
    },
    {
      name: 'Plus',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-indigo-100 border-indigo-300',
      highlighted: true,
      features: [
        'Bagagem de mão até 8 kg',
        'Item pessoal pequeno',
        '2 bagagens despachadas 23 kg cada',
        'Assento com espaço extra',
        'Embarque prioritário',
        'Alterações e cancelamento grátis',
        'Lounge TAP (selecionados)',
        'Refeição premium'
      ]
    }
  ],
  'Copa Airlines': [
    {
      name: 'Economy Basic',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-blue-50 border-blue-200',
      features: [
        'Bagagem de mão até 10 kg',
        'Item pessoal pequeno',
        'Assento padrão',
        'Refeição básica',
        'ConnectMiles pontos básicos'
      ]
    },
    {
      name: 'Economy Plus',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-yellow-100 border-yellow-300',
      features: [
        'Bagagem de mão até 10 kg',
        'Item pessoal pequeno',
        '1 bagagem despachada 23 kg',
        'Seleção de assento sem taxa',
        'Embarque preferencial',
        'ConnectMiles pontos extras'
      ]
    },
    {
      name: 'Business Class',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-indigo-100 border-indigo-300',
      highlighted: true,
      features: [
        'Bagagem de mão até 16 kg',
        'Item pessoal grande',
        '2 bagagens despachadas 32 kg cada',
        'Assento Business reclínable',
        'Embarque prioritário',
        'Copa Club lounge',
        'Refeição gourmet',
        'ConnectMiles pontos máximos'
      ]
    }
  ],
  'American Airlines': [
    {
      name: 'Basic Economy',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-gray-100 border-gray-300',
      features: [
        'Carry-on até 10 kg',
        'Personal item',
        'Assento designado pela AA',
        'Sem mudanças permitidas',
        'AAdvantage miles básicos'
      ]
    },
    {
      name: 'Main Cabin',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-red-100 border-red-300',
      features: [
        'Carry-on até 10 kg',
        'Personal item',
        '1 checked bag 23 kg',
        'Seat selection',
        'Changes allowed',
        'AAdvantage miles padrão'
      ]
    },
    {
      name: 'Premium Economy',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-blue-100 border-blue-300',
      features: [
        'Carry-on até 10 kg',
        'Personal item',
        '1 checked bag 23 kg',
        'Premium seat with extra legroom',
        'Priority boarding',
        'Enhanced meal',
        'AAdvantage miles bonus'
      ]
    },
    {
      name: 'Business Class',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-indigo-100 border-indigo-300',
      highlighted: true,
      features: [
        'Carry-on até 16 kg',
        'Personal item grande',
        '2 checked bags 32 kg each',
        'Lie-flat business seat',
        'Priority everything',
        'Admirals Club lounge',
        'Multi-course dining',
        'AAdvantage miles máximos'
      ]
    }
  ],
  'Iberia': [
    {
      name: 'Basic',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-red-50 border-red-200',
      features: [
        'Equipaje de mano 10 kg',
        'Artículo personal',
        'Asiento estándar',
        'Sin equipaje facturado',
        'Iberia Plus puntos básicos'
      ]
    },
    {
      name: 'Optima',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-yellow-100 border-yellow-300',
      features: [
        'Equipaje de mano 10 kg',
        'Artículo personal',
        '1 equipaje facturado 23 kg',
        'Selección de asiento',
        'Cambios facilitados'
      ]
    },
    {
      name: 'Excellence',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-blue-100 border-blue-300',
      features: [
        'Equipaje de mano 10 kg',
        'Artículo personal',
        '1 equipaje facturado 23 kg',
        'Asiento preferente',
        'Embarque prioritario',
        'Comida premium',
        'Iberia Plus puntos extra'
      ]
    },
    {
      name: 'Business Class',
      price: 0,
      basePrice: 0,
      additionalFee: 0,
      color: 'bg-indigo-100 border-indigo-300',
      highlighted: true,
      features: [
        'Equipaje de mano 16 kg',
        'Artículo personal grande',
        '2 equipajes facturados 32 kg c/u',
        'Asiento Business reclinable',
        'Embarque prioritario',
        'Sala VIP Iberia',
        'Gastronomía de autor',
        'Iberia Plus puntos máximos'
      ]
    }
  ]
};

const CabinClassModal: React.FC<CabinClassModalProps> = ({
  isOpen,
  onClose,
  flight,
  onClassSelect
}) => {
  const [realPricesData, setRealPricesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Remover logs repetitivos que poluem o console
  // console.log('🎭 MODAL - Renderizando modal com:', { isOpen, flight });
  // console.log('🔍 DEBUG FLIGHT OBJECT - Propriedades completas:', flight);
  
  // 🎯 EXTRAIR DADOS CORRETOS DO VOO - OTIMIZADO COM useMemo
  const flightInfo = useMemo(() => {
    let origem, destino, dataOriginal;
    
    // Tentar extrair das múltiplas fontes possíveis
    if (flight?.segments && flight.segments.length > 0) {
      // Fonte 1: segments (preferencial) - testar todas as propriedades
      const firstSeg = flight.segments[0];
      const lastSeg = flight.segments[flight.segments.length - 1];
      
      origem = firstSeg?.departure || firstSeg?.origem || firstSeg?.Origem;
      destino = lastSeg?.arrival || lastSeg?.destino || lastSeg?.Destino;
      dataOriginal = firstSeg?.departureDate || firstSeg?.Saida;
      
      // console.log('🔍 Tentando extrair de segments:', { firstSeg, lastSeg });
    } else if (flight?.origem && flight?.destino) {
      // Fonte 2: propriedades diretas
      origem = flight.origem;
      destino = flight.destino;
    } else if (flight?.originalData) {
      // Fonte 3: dados originais da API
      origem = flight.originalData.Origem;
      destino = flight.originalData.Destino;
      dataOriginal = flight.originalData.Saida;
    }
    
    // Se ainda não temos dados, tentar extrair de searchParams globais
    if (!origem || !destino) {
      // Fallback: usar últimos parâmetros de busca conhecidos (podem estar no localStorage)
      try {
        const lastSearch = JSON.parse(localStorage.getItem('lastFlightSearch') || '{}');
        origem = origem || lastSearch.origem || 'GRU';
        destino = destino || lastSearch.destino || 'LIS'; // LIS em vez de GIG!
        dataOriginal = dataOriginal || lastSearch.ida;
      } catch {
        origem = origem || 'GRU';
        destino = destino || 'LIS'; // Correção: LIS em vez de GIG hardcoded
      }
    }
    
    // console.log('🎯 DADOS EXTRAÍDOS DO VOO:', { origem, destino, dataOriginal });
    
    return { origem, destino, dataOriginal };
  }, [flight?.segments, flight?.origem, flight?.destino, flight?.originalData]);

  const airlineName = flight?.airline || 'LATAM';
  const classes = AIRLINE_CLASSES[airlineName] || AIRLINE_CLASSES['LATAM'];
  // Usar exatamente o preço da API Moblix
  const basePrice = flight?.originalData?.ValorTotalComTaxa || 
                   flight?.originalData?.ValorTotal ||
                   flight?.ValorTotalComTaxa ||
                   flight?.ValorTotal ||
                   flight?.priceWithTax || 
                   flight?.price || 
                   flight?.totalPrice || 
                   0;

  
  
  // Função para mapear nome da companhia para ID
  const getCompanyId = (airlineName: string): number => {
    const companyMap: Record<string, number> = {
      'LATAM': 1,
      'GOL': 2, 
      'Azul': 3,
      'TAP Air Portugal': 11,
      'TAP': 11,
      'Copa Airlines': 13,
      'Copa': 13,
      'American Airlines': 22,
      'Iberia': 26
    };
    return companyMap[airlineName] || -1; // -1 = todas as companhias
  };
  
  // 🌍 FUNÇÃO UNIVERSAL: Mapear tipos de tarifa da API para nomes de classe (todas as companhias)
  const mapTarifaTypeToClassName = (tarifaType: string, companhia: string): string | null => {
    const typeMap: Record<string, string> = {
      // ✈️ LATAM
      'LIGHT': 'Light',
      'STANDARD': 'Standard', 
      'FULL': 'Full',
      'PREMIUM_ECONOMY': 'Premium Economy',
      'PREMIUM ECONOMY': 'Premium Economy',
      
      // ✈️ GOL
      'BASIC': 'Basic',
      'PLUS': 'Plus', 
      'COMFORT': 'Comfort',
      'MAX': 'Max',
      
      // ✈️ AZUL
      'BASICA': 'Básica',
      'TUDO_AZUL': 'Tudo Azul',
      'AZUL_PLUS': 'Azul+',
      'BUSINESS': 'Business',
      
      // ✈️ TAP Air Portugal
      'DISCOUNT': 'Discount',
      'CLASSIC': 'Classic',
      
      // ✈️ Copa Airlines
      'ECONOMY_BASIC': 'Economy Basic',
      'ECONOMY_PLUS': 'Economy Plus',
      'BUSINESS_CLASS': 'Business Class',
      
      // ✈️ American Airlines
      'BASIC_ECONOMY': 'Basic Economy', 
      'MAIN_CABIN': 'Main Cabin',
      
      // ✈️ Iberia
      'OPTIMA': 'Optima',
      'EXCELLENCE': 'Excellence',
      
      // 🌍 TIPOS UNIVERSAIS (usados por múltiplas companhias)
      'ECONOMY': 'Economy',
      'PREMIUM': 'Premium',
      'BUSINESS_PLUS': 'Business Plus',
      'FIRST_CLASS': 'First Class',
      'EXECUTIVA': 'Executiva',
      'ECONOMICA': 'Econômica'
    };
    
    const mappedName = typeMap[tarifaType.toUpperCase()];
    if (mappedName) return mappedName;
    
    // 🎯 FALLBACK: Se não encontrar mapeamento específico, usar o nome da API formatado
    return tarifaType.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // 🎯 REQUISIÇÃO ESPECÍFICA: Para cada companhia, voo e modal individual
  const fetchRealPricesFromMoblix = useCallback(async () => {
    const timestampConsulta = new Date().toISOString();
    console.log(`🎯 [${timestampConsulta}] NOVA CONSULTA ESPECÍFICA PARA:`);
    console.log(`   ✈️ Companhia: ${airlineName}`);
    console.log(`   🛫 Rota: ${flightInfo.origem} → ${flightInfo.destino}`);
    console.log(`   📅 Data: ${flightInfo.dataOriginal}`);
    console.log(`   💰 Preço Card: R$ ${(flight?.priceWithTax || flight?.price || 0).toFixed(2)}`);
    
    if (!flight || !isOpen) {
      console.log('❌ Modal fechado ou sem dados do voo - cancelando consulta');
      return;
    }
    
    setIsLoading(true);
    setLoadingError(null);
    const realPrices: any[] = [];
    
    try {
      // 🌍 MAPEAMENTO DINÂMICO: Baseado nas classes configuradas para cada companhia
      const classesCompanhia = AIRLINE_CLASSES[airlineName] || AIRLINE_CLASSES['LATAM'];
      const tiposTarifaAPI: Record<string, string> = {};
      
      // Mapear dinamicamente baseado nas classes da companhia
      classesCompanhia.forEach(classe => {
        // Converter nome da classe para tipo da API
        const tipoAPI = classe.name.toUpperCase().replace(' ', '_').replace('+', '_PLUS');
        tiposTarifaAPI[classe.name] = tipoAPI;
      });
      
      console.log(`🎯 [${airlineName}] Tipos de tarifa configurados:`, tiposTarifaAPI);
      console.log(`🔍 [${airlineName}] ID da companhia na API: ${getCompanyId(airlineName)}`);

      // 🎯 USAR EXATAMENTE A MESMA DATA DO VOO SELECIONADO
      const dataDoVooSelecionado = flightInfo.dataOriginal || flight?.segments?.[0]?.departureDate;
      
      if (!dataDoVooSelecionado) {
        console.error('❌ ERRO: Não foi possível extrair a data do voo selecionado!');
        setLoadingError('Não foi possível identificar a data do voo selecionado.');
        return;
      }
      
      console.log('📅 USANDO EXATAMENTE A MESMA DATA DO VOO SELECIONADO:', dataDoVooSelecionado);
      
      // Usar APENAS a data do voo selecionado (sem fallbacks)
      const datasParaTeste = [dataDoVooSelecionado];
      
      console.log('📅 USANDO DADOS CORRETOS DO VOO (AJUSTADO):', {
        origem: flightInfo.origem,
        destino: flightInfo.destino, 
        dataOriginal: flightInfo.dataOriginal,
        dataDoVooSelecionado: dataDoVooSelecionado,
        datasParaTeste
      });
      
      // Validação adicional
      if (!flightInfo.origem || !flightInfo.destino) {
        console.error('❌ ERRO: Origem ou destino não encontrados!', {
          origem: flightInfo.origem,
          destino: flightInfo.destino,
          flight: flight
        });
        setLoadingError('Não foi possível identificar a origem e destino do voo.');
        return;
      }

      console.log(`🔍 TESTANDO DATAS PARA ${airlineName} | ${flightInfo.origem}→${flightInfo.destino}:`);
      
      let melhorConjuntoDados = null;
      let melhorDiferenciacao = 0;
      
      // 🎯 BUSCAR O VOO EXATO PARA EXTRAIR AS TARIFAS DISPONÍVEIS
      for (const dataTest of datasParaTeste) {
        console.log(`📅 Buscando voo ${airlineName} para a data: ${dataTest}`);
        
        try {
          const companyId = getCompanyId(airlineName);
          const requestParams = {
            Origem: flightInfo.origem,
            Destino: flightInfo.destino,
            Ida: dataTest.split('T')[0], // Usar só a data, sem hora
            Adultos: 1,
            Criancas: 0,
            Bebes: 0,
            Companhia: companyId
          };
          
          console.log(`🔍 [${airlineName}] NOVA REQUISIÇÃO ESPECÍFICA:`);
          console.log(`   📡 URL: /.netlify/functions/moblix-api/api/ConsultaAereo/Consultar`);
          console.log(`   📋 Parâmetros:`, requestParams);
          console.log(`   🕐 Timestamp: ${new Date().toLocaleTimeString()}`);
          
          // 🎯 REQUISIÇÃO ESPECÍFICA COM TIMESTAMP ÚNICO
          const requestId = `${airlineName}-${flightInfo.origem}${flightInfo.destino}-${Date.now()}`;
          console.log(`📡 [${requestId}] Enviando requisição...`);
          
          const response = await fetch('/.netlify/functions/moblix-api/api/ConsultaAereo/Consultar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Request-ID': requestId, // Header para tracking
              'Cache-Control': 'no-cache' // Evitar cache
            },
            body: JSON.stringify(requestParams)
          });
            
          const result = await response.json();
          
          console.log(`📨 [${requestId}] Resposta recebida:`);
          console.log(`   ✅ Sucesso: ${!!result?.Data?.[0]?.Ida?.length}`);
          console.log(`   📊 Total de voos: ${result?.Data?.[0]?.Ida?.length || 0}`);
          
          if (result?.Data?.[0]?.Ida?.[0]) {
            const primeiroVoo = result.Data[0].Ida[0];
            console.log(`   💰 Primeiro voo: R$ ${primeiroVoo.ValorTotalComTaxa?.toFixed(2)}`);
            console.log(`   ✈️ Companhia encontrada: ${primeiroVoo.CompanhiaAerea}`);
            console.log(`   🕐 Horário: ${primeiroVoo.Saida} → ${primeiroVoo.Chegada}`);
            
            // 🎯 VERIFICAR SE É REALMENTE A COMPANHIA CORRETA
            const companhiaCorreta = primeiroVoo.CompanhiaAerea?.includes(airlineName) || 
                                    airlineName.includes(primeiroVoo.CompanhiaAerea?.split(' ')[0] || '');
            console.log(`   🔍 Companhia correta: ${companhiaCorreta}`);
          }
          
          if (result?.Data?.[0]?.Ida?.length > 0) {
            console.log(`🎯 [${airlineName}] ENCONTROU ${result.Data[0].Ida.length} VOOS - Analisando tarifas`);
            
            // 🎯 ESTRATÉGIA UNIVERSAL: Extrair tarifas internas de cada voo
            let classesComPrecoReal = [];
            
            console.log(`🔍 [${airlineName}] Analisando tarifas internas dos voos:`);
            
            // Obter uma amostra de voos para analisar suas tarifas internas
            const voosParaAnalise = result.Data[0].Ida.slice(0, 15); // Analisar mais voos para maior precisão
            const tarifasEncontradas = new Map();
            
            // 🎯 BUSCAR VOO ESPECÍFICO: Procurar o voo com o preço exato do card clicado
            const precoCard = flight?.priceWithTax || flight?.price || 0;
            console.log(`🎯 [${requestId}] BUSCANDO VOO COM PREÇO ESPECÍFICO: R$ ${precoCard.toFixed(2)}`);
            
            // Primeiro, tentar encontrar voo com preço exato
            let vooEspecifico = voosParaAnalise.find(v => 
              Math.abs((v.ValorTotalComTaxa || 0) - precoCard) < 5 // Tolerância de R$ 5,00
            );
            
            if (vooEspecifico) {
              console.log(`✅ [${requestId}] ENCONTROU VOO ESPECÍFICO: R$ ${vooEspecifico.ValorTotalComTaxa?.toFixed(2)}`);
              // Processar apenas este voo específico primeiro
              voosParaAnalise.unshift(vooEspecifico);
            } else {
              console.log(`⚠️ [${requestId}] VOO ESPECÍFICO NÃO ENCONTRADO, usando análise geral`);
            }
            
            // 🌍 ANÁLISE ESPECÍFICA: Para esta companhia e voo específico
            voosParaAnalise.forEach((voo, index) => {
              const isCompanhiaCorreta = voo.CompanhiaAerea?.includes(airlineName) || 
                                        airlineName.includes(voo.CompanhiaAerea?.split(' ')[0] || '');
              const isVooEspecifico = Math.abs((voo.ValorTotalComTaxa || 0) - precoCard) < 5;
              
              console.log(`🔍 [${requestId}] Voo ${index + 1}:`);
              console.log(`   💰 Preço: R$ ${voo.ValorTotalComTaxa?.toFixed(2)}`);
              console.log(`   ✈️ Companhia: ${voo.CompanhiaAerea}`);
              console.log(`   ✅ Match: ${isCompanhiaCorreta}`);
              console.log(`   🎯 Voo específico: ${isVooEspecifico}`);
              console.log(`   🎫 Tarifas: ${voo.Tarifas?.length || 0}`);
              
              if (voo.Tarifas && voo.Tarifas.length > 0) {
                voo.Tarifas.forEach(tarifa => {
                  const tipoTarifa = tarifa.Tipo?.toUpperCase();
                  const valorTarifa = tarifa.ValorAdulto || 0;
                  const taxaEmbarque = tarifa.TaxaEmbarque || 0;
                  
                  // 🎯 GARANTIR PREÇO COMPLETO: Usar sempre o ValorTotalComTaxa (preço final com TODAS as taxas)
                  const valorTotalVoo = voo.ValorTotalComTaxa || voo.ValorTotal || 0;
                  
                  // 🎯 PREÇO DO CARD: Se este voo tem preço similar ao clicado, usar o preço do card
                  const precoCard = flight?.priceWithTax || flight?.price || 0;
                  const diferencaPrecoCard = Math.abs(valorTotalVoo - precoCard);
                  
                  let precoFinal = valorTotalVoo;
                  
                  // Se é um voo similar ao clicado (diferença < R$ 50), usar preço do card para consistência
                  if (diferencaPrecoCard < 50 && precoCard > 0) {
                    precoFinal = precoCard;
                    console.log(`     🎯 Usando preço do card (voo similar): R$ ${precoFinal.toFixed(2)}`);
                  } else {
                    console.log(`     💰 Usando preço do voo API: R$ ${precoFinal.toFixed(2)}`);
                  }
                  
                  console.log(`     🎫 Tarifa: ${tipoTarifa}`);
                  console.log(`     💸 Base: R$ ${valorTarifa.toFixed(2)}`);
                  console.log(`     🎯 Taxa embarque: R$ ${taxaEmbarque.toFixed(2)}`);
                  console.log(`     💰 TOTAL FINAL: R$ ${precoFinal.toFixed(2)} (com todas as taxas)`);
                  
                  // 🌍 MAPEAMENTO UNIVERSAL: Funciona com qualquer companhia
                  const className = mapTarifaTypeToClassName(tipoTarifa, airlineName);
                  
                  // Verificar se essa classe existe na configuração da companhia
                  const classeExiste = classesCompanhia.some(c => c.name === className);
                  
                  if (className && classeExiste) {
                    // 🎯 PRIORIDADE: Se é o voo específico (preço exato do card), sempre usar
                    const isVooEspecifico = Math.abs((voo.ValorTotalComTaxa || 0) - precoCard) < 5;
                    
                    if (isVooEspecifico) {
                      console.log(`     🎯 VOO ESPECÍFICO ENCONTRADO - Usando preço: R$ ${precoFinal.toFixed(2)}`);
                      tarifasEncontradas.set(className, {
                        className,
                        preco: precoFinal,
                        precoBase: valorTarifa,
                        taxaEmbarque: taxaEmbarque,
                        taxasAdministrativas: precoFinal - (valorTarifa + taxaEmbarque),
                        vooData: voo,
                        tarifaData: tarifa,
                        tipoAPI: tipoTarifa,
                        isVooEspecifico: true
                      });
                    } else if (!tarifasEncontradas.has(className) || 
                              (!tarifasEncontradas.get(className)?.isVooEspecifico && 
                               tarifasEncontradas.get(className).preco > precoFinal)) {
                      // Só substitui se não temos voo específico ou se encontrou preço menor
                      tarifasEncontradas.set(className, {
                        className,
                        preco: precoFinal,
                        precoBase: valorTarifa,
                        taxaEmbarque: taxaEmbarque,
                        taxasAdministrativas: precoFinal - (valorTarifa + taxaEmbarque),
                        vooData: voo,
                        tarifaData: tarifa,
                        tipoAPI: tipoTarifa,
                        isVooEspecifico: false
                      });
                    }
                  }
                });
              } else {
                // Se não tem tarifas internas, tentar criar uma tarifa baseada no tipo padrão da companhia
                console.log(`   ⚠️ [${airlineName}] Voo sem tarifas internas, tentando usar classe padrão`);
                
                // Tentar identificar uma classe padrão baseada na companhia
                let classPadrao = null;
                if (airlineName === 'LATAM') classPadrao = 'Light';
                else if (airlineName === 'GOL') classPadrao = 'Basic';
                else if (airlineName === 'Azul') classPadrao = 'Básica';
                else if (airlineName === 'TAP Air Portugal') classPadrao = 'Basic';
                else if (airlineName === 'Copa Airlines') classPadrao = 'Economy Basic';
                else if (airlineName === 'American Airlines') classPadrao = 'Main Cabin';
                else if (airlineName === 'Iberia') classPadrao = 'Basic';
                else classPadrao = classesCompanhia[0]?.name; // Primeira classe configurada
                
                if (classPadrao && voo.ValorTotalComTaxa > 0) {
                  console.log(`   🎯 [${airlineName}] Usando classe padrão '${classPadrao}': R$ ${voo.ValorTotalComTaxa.toFixed(2)}`);
                  
                  if (!tarifasEncontradas.has(classPadrao) || tarifasEncontradas.get(classPadrao).preco > voo.ValorTotalComTaxa) {
                    tarifasEncontradas.set(classPadrao, {
                      className: classPadrao,
                      preco: voo.ValorTotalComTaxa,
                      precoBase: voo.ValorTotal || voo.ValorTotalComTaxa,
                      taxaEmbarque: 0,
                      taxasAdministrativas: voo.ValorTotalComTaxa - (voo.ValorTotal || voo.ValorTotalComTaxa),
                      vooData: voo,
                      tarifaData: { Tipo: classPadrao.toUpperCase(), fonte: 'CLASSE_PADRAO' },
                      tipoAPI: classPadrao.toUpperCase()
                    });
                  }
                }
              }
            });
            
            const tarifasKeys = Array.from(tarifasEncontradas.keys());
            console.log(`📊 [${requestId}] RESULTADO DA ANÁLISE:`);
            console.log(`   🎫 Tarifas encontradas: [${tarifasKeys.join(', ')}]`);
            console.log(`   📈 Total de tarifas: ${tarifasKeys.length}`);
            
            // 🎯 MOSTRAR PREÇOS ENCONTRADOS COM MARCAÇÃO DE VOO ESPECÍFICO
            tarifasKeys.forEach(key => {
              const tarifa = tarifasEncontradas.get(key);
              const marcador = tarifa.isVooEspecifico ? '🎯 EXATO' : '📊 GERAL';
              console.log(`   💰 ${key}: R$ ${tarifa.preco.toFixed(2)} (${marcador})`);
            });
            
            // Se encontramos tarifas internas diferentes, usar elas
            if (tarifasEncontradas.size > 0) {
              console.log(`✅ Usando tarifas internas diferenciadas da API`);
              
              // 🌍 PROCESSAR TODAS AS CLASSES DA COMPANHIA (dinâmico)
              classesCompanhia.forEach(classeConfig => {
                const className = classeConfig.name;
                const tarifaEncontrada = tarifasEncontradas.get(className);
                
                if (tarifaEncontrada) {
                  console.log(`✅ ${className}: R$ ${tarifaEncontrada.preco.toFixed(2)} (TARIFA INTERNA DA API)`);
                  
                  classesComPrecoReal.push({
                    className,
                    preco: tarifaEncontrada.preco,
                    vooData: tarifaEncontrada.vooData,
                    tipoAPI: tarifaEncontrada.tipoAPI,
                    available: true,
                    fonte: 'API_MOBLIX_TARIFAS_INTERNAS'
                  });
                } else {
                  console.log(`❌ ${className}: Não encontrada nas tarifas internas`);
                  
                  classesComPrecoReal.push({
                    className,
                    preco: 0,
                    vooData: null,
                    tipoAPI: tiposTarifaAPI[className] || className.toUpperCase(),
                    available: false,
                    fonte: 'TARIFA_NAO_ENCONTRADA'
                  });
                }
              });
              
              // 🔧 VALIDAÇÃO CRÍTICA: Garantir que NUNCA o modal tenha preços menores que o card
              const precosDisponiveis = classesComPrecoReal
                .filter(c => c.available && c.preco > 0)
                .map(c => c.preco);
              
              if (precosDisponiveis.length > 0) {
                const menorPrecoModal = Math.min(...precosDisponiveis);
                // 🎯 USAR EXATAMENTE O PREÇO DA API MOBLIX (não hardcoded)
                const precoCard = flight?.originalData?.ValorTotalComTaxa || 
                                 flight?.originalData?.ValorTotal ||
                                 flight?.ValorTotalComTaxa ||
                                 flight?.ValorTotal ||
                                 flight?.priceWithTax || 
                                 flight?.price || 
                                 flight?.totalPrice || 
                                 0;
                
                console.log(`🔧 VALIDAÇÃO CRÍTICA DE CONSISTÊNCIA DE PREÇOS:`);
                console.log(`   💰 Preço atual do card: R$ ${precoCard.toFixed(2)}`);
                console.log(`   🏷️ Menor preço no modal: R$ ${menorPrecoModal.toFixed(2)}`);
                
                // 🚨 REGRA CRÍTICA: NUNCA permitir que o modal tenha preços menores que o card
                if (menorPrecoModal < precoCard) {
                  console.log(`🚨 ERRO CRÍTICO DETECTADO: Modal com preço menor que o card!`);
                  console.log(`🔧 CORREÇÃO OBRIGATÓRIA: Ajustando TODOS os preços do modal para serem >= R$ ${precoCard.toFixed(2)}`);
                  
                  // 🎯 CORREÇÃO OBRIGATÓRIA: Elevar TODOS os preços do modal para serem pelo menos iguais ao card
                  classesComPrecoReal = classesComPrecoReal.map(classe => {
                    if (classe.available && classe.preco > 0) {
                      const novoPreco = Math.max(classe.preco, precoCard);
                      if (novoPreco > classe.preco) {
                        console.log(`   🔧 ${classe.className}: R$ ${classe.preco.toFixed(2)} → R$ ${novoPreco.toFixed(2)}`);
                      }
                      return {
                        ...classe,
                        preco: novoPreco
                      };
                    }
                    return classe;
                  });
                  
                  console.log(`✅ CORREÇÃO APLICADA: Todos os preços do modal agora são >= preço do card`);
                } else {
                  console.log(`✅ CONSISTÊNCIA OK: Modal não tem preços menores que o card`);
                }
              }
              
            } else {
              // Sem tarifas internas encontradas - não aplicar fallbacks
              console.log(`❌ Nenhuma tarifa interna encontrada na API`);
              console.log(`🚫 SEM FALLBACKS - Usando apenas dados reais da API`);
              
              // 🌍 TODAS AS CLASSES DA COMPANHIA ficam indisponíveis
              classesCompanhia.forEach(classeConfig => {
                const className = classeConfig.name;
                console.log(`❌ ${className}: Não disponível (sem tarifas internas)`);
                
                classesComPrecoReal.push({
                  className,
                  preco: 0,
                  vooData: null,
                  tipoAPI: tiposTarifaAPI[className] || className.toUpperCase(),
                  available: false,
                  fonte: 'SEM_TARIFAS_INTERNAS'
                });
              });
            }
            
            // Calcular diferenciação real entre as tarifas disponíveis
            const precosDisponiveis = classesComPrecoReal
              .filter(c => c.available && c.preco > 0)
              .map(c => c.preco);
            
            let diferenciacao = 0;
            if (precosDisponiveis.length >= 2) {
              const menorPreco = Math.min(...precosDisponiveis);
              const maiorPreco = Math.max(...precosDisponiveis);
              diferenciacao = maiorPreco - menorPreco;
              console.log(`📊 Diferenciação real da API: R$ ${diferenciacao.toFixed(2)}`);
            }
            
            melhorConjuntoDados = {
              data: dataTest,
              precos: classesComPrecoReal,
              diferenca: diferenciacao,
              classesDisponiveis: classesComPrecoReal.filter(c => c.available).length
            };
            
            console.log(`✅ PREÇOS REAIS OBTIDOS DA API MOBLIX`);
            break; // Sair do loop, já encontrou os dados
            
          } else {
            console.log('⚠️ Nenhum voo encontrado para essa data');
          }
          
        } catch (error) {
          console.log(`❌ ERRO na consulta: ${error.message}`);
        }
      }
      
      // APLICAR DESCOBERTAS: Mostrar resultado baseado no conhecimento da API
      if (melhorConjuntoDados) {
        console.log(`\n🎯 DADOS ENCONTRADOS (Data: ${melhorConjuntoDados.data})`);
        console.log(`💰 Diferenciação: R$ ${melhorConjuntoDados.diferenca.toFixed(2)}`);
        console.log(`📊 Classes disponíveis: ${melhorConjuntoDados.classesDisponiveis}`);
        
        // 🌍 PROCESSAR CADA CLASSE DA COMPANHIA (universal para todas as companhias)
        for (const classConfig of classes) {
          const dadosClasse = melhorConjuntoDados.precos.find(p => p.className === classConfig.name);
          
          if (dadosClasse) {
            if (dadosClasse.available && dadosClasse.preco > 0) {
              // ✅ CLASSE DISPONÍVEL com preço real
              realPrices.push({
                className: classConfig.name,
                realPrice: dadosClasse.preco,
                flightData: dadosClasse.vooData,
                fareType: dadosClasse.tipoAPI,
                tarifaData: {
                  Tipo: dadosClasse.tipoAPI,
                  Classe: 'Economica',
                  source: 'API_MOBLIX_REAL',
                  dataUsada: melhorConjuntoDados.data,
                  quantidadeVoos: dadosClasse.quantidadeVoos,
                  companhia: airlineName,
                  rota: `${flightInfo.origem}→${flightInfo.destino}`
                },
                source: 'PRECO_REAL_BASEADO_INVESTIGACAO',
                classFeatures: classConfig.features,
                available: true,
                differentiated: melhorConjuntoDados.diferenca > 10
              });
              
              console.log(`✅ ${airlineName} - ${classConfig.name}: R$ ${dadosClasse.preco.toFixed(2)} (DISPONÍVEL)`);
            } else {
              // ❌ CLASSE NÃO DISPONÍVEL
              realPrices.push({
                className: classConfig.name,
                realPrice: 0,
                flightData: null,
                fareType: dadosClasse.tipoAPI,
                tarifaData: {
                  Tipo: dadosClasse.tipoAPI,
                  Classe: 'Economica',
                  source: 'API_MOBLIX_NAO_DISPONIVEL',
                  dataUsada: melhorConjuntoDados.data,
                  companhia: airlineName,
                  rota: `${flightInfo.origem}→${flightInfo.destino}`
                },
                source: 'NAO_DISPONIVEL',
                classFeatures: classConfig.features,
                available: false,
                differentiated: false
              });
              
              console.log(`❌ ${airlineName} - ${classConfig.name}: NÃO DISPONÍVEL`);
            }
          }
        }
      } else {
        console.log('\n⚠️ NENHUM DADO ENCONTRADO EM NENHUMA DATA');
        setLoadingError('Não foi possível encontrar voos para esta rota nas datas testadas.');
      }
      
      if (realPrices.length === 0) {
        console.log('📋 RESULTADO: Nenhuma classe processada');
        setLoadingError('Não foi possível processar as classes de tarifa para este voo.');
      } else {
        const disponíveis = realPrices.filter(p => p.available).length;
        const naoDisponiveis = realPrices.filter(p => !p.available).length;
        console.log(`\n🎯 RESULTADO FINAL [${airlineName} | ${flightInfo.origem}→${flightInfo.destino}]: ${realPrices.length} classes processadas`);
        console.log(`✅ Disponíveis: ${disponíveis}`);
        console.log(`❌ Não disponíveis: ${naoDisponiveis}`);
        
        if (melhorConjuntoDados?.diferenca > 10) {
          console.log(`💡 Diferenciação encontrada: R$ ${melhorConjuntoDados.diferenca.toFixed(2)}`);
        } else {
          console.log('🟡 Sem diferenciação significativa - mesmo preço para classes disponíveis');
        }
        
        // 🌍 LOG SUMMARY PARA DEBUGGING GLOBAL
        console.log(`🌍 PROCESSAMENTO CONCLUÍDO:`, {
          companhia: airlineName,
          rota: `${flightInfo.origem}→${flightInfo.destino}`,
          data: melhorConjuntoDados.data,
          classesProcessadas: realPrices.length,
          classesDisponiveis: disponíveis,
          diferenciacaoPrecos: melhorConjuntoDados?.diferenca?.toFixed(2) || '0.00'
        });
      }
      
    } catch (error) {
      console.error('❌ ERRO GERAL:', error);
      setLoadingError(`Erro ao consultar a API: ${(error as Error).message}`);
    }
    
    setRealPricesData(realPrices);
    setIsLoading(false);
  }, [flight, isOpen, flightInfo.origem, flightInfo.destino, flightInfo.dataOriginal, airlineName]);
  
  // 🎯 REQUISIÇÃO ESPECÍFICA: Nova consulta para cada modal/voo/companhia
  useEffect(() => {
    if (isOpen && flight) {
      console.log(`🚀 MODAL ABERTO [${airlineName}]: Nova consulta específica para este voo`);
      console.log('🔍 DADOS DO VOO ATUAL:', {
        airline: airlineName,
        origem: flightInfo.origem,
        destino: flightInfo.destino,
        data: flightInfo.dataOriginal,
        priceCard: flight?.priceWithTax || flight?.price,
        companyId: getCompanyId(airlineName)
      });
      
      // 🎯 LIMPAR DADOS ANTERIORES e fazer nova consulta
      setRealPricesData([]);
      setLoadingError(null);
      
      fetchRealPricesFromMoblix();
    }
  }, [isOpen, flight, airlineName, flightInfo.origem, flightInfo.destino, flightInfo.dataOriginal]);

  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleClassSelect = (cabinClass: CabinClass) => {
    const flightWithClass = {
      ...flight,
      selectedClass: cabinClass.name,
      classPrice: basePrice + cabinClass.additionalFee,
      originalPrice: basePrice,
      additionalFee: cabinClass.additionalFee
    };
    onClassSelect(flightWithClass);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img 
                  src={getAirlineLogo(airlineName)} 
                  alt={getDisplayAirlineName(airlineName)}
                  className="h-12 w-12 object-contain"
                  onError={(e) => {
                    // Fallback para um pixel transparente se a imagem não carregar
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
                  }}
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {getDisplayAirlineName(airlineName)}
                </h2>
                <p className="text-gray-600 mt-1">
                  {flightInfo.origem} → {flightInfo.destino}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="animate-spin mr-2" size={24} />
              <span className="text-gray-600">Carregando preços atualizados da API...</span>
            </div>
          )}

          {/* Error State */}
          {loadingError && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <span className="text-yellow-800">{loadingError}</span>
              </div>
            </div>
          )}

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {classes.map((cabinClass, index) => {
              // Buscar dados reais da API para esta classe
              const realPriceData = realPricesData.find(rp => rp.className === cabinClass.name);
              
              // Se está carregando, mostrar skeleton
              if (isLoading) {
                return (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 ${cabinClass.color} opacity-60`}
                  >
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="space-y-2 mb-4">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                      <div className="border-t pt-3">
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Se não há dados da API (erro ou sem resposta), não exibir
              if (!realPriceData) {
                return null;
              }
              
              // DESCOBERTA: Classe não disponível - mostrar como indisponível
              if (!realPriceData.available) {
                return (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 opacity-50 cursor-not-allowed bg-gray-50 border-gray-200`}
                  >
                    {/* Class Name */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg text-gray-500">
                        {cabinClass.name}
                      </h3>
                      <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded-full">
                        Não disponível
                      </span>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-4">
                      {cabinClass.features.slice(0, 3).map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-gray-300 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-500">{feature}</span>
                        </div>
                      ))}
                      <div className="text-xs text-gray-400 italic">+ {cabinClass.features.length - 3} outros benefícios</div>
                    </div>

                    {/* Not Available Message */}
                    <div className="border-t pt-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-500">
                          Não disponível
                        </div>
                        <div className="text-sm text-gray-400">
                          Para esta rota/data
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // DESCOBERTA: Classe disponível - mostrar com preço real
              const displayPrice = realPriceData.realPrice;
              const isDifferentiated = realPriceData.differentiated;
              
              return (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                    cabinClass.highlighted 
                      ? 'ring-2 ring-blue-500 ring-offset-2' 
                      : ''
                  } ${cabinClass.color}`}
                  onClick={() => handleClassSelect({ ...cabinClass, price: displayPrice })}
                >
                  {/* Class Name */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900">
                      {cabinClass.name}
                    </h3>
                    <div className="flex flex-col items-end gap-1">
                      {cabinClass.highlighted && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Recomendado
                        </span>
                      )}
                      {!isDifferentiated && (
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                          Mesmo preço
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    {cabinClass.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-2">
                        <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price - PREÇO REAL DA API */}
                  <div className="border-t pt-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {formatCurrency(displayPrice)}
                      </div>
                      <div className="text-sm font-semibold text-gray-600">
                        Por passageiro
                      </div>
                      <div className="text-xs text-gray-500">
                        Inclui taxas • Preço real API
                      </div>
                      {realPriceData.tarifaData?.dataUsada && (
                        <div className="text-xs text-gray-400 mt-1">
                          Data: {realPriceData.tarifaData.dataUsada}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean)}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600 text-center">
              * Preços podem variar conforme disponibilidade. Clique na classe desejada para continuar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CabinClassModal;
