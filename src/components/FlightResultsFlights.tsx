import React, { useState, useEffect, useRef, useMemo } from 'react';
import FlightResultCard from './FlightResultCard';
import InteractiveFilters from './InteractiveFilters';
import SelectionModal from './SelectionModal';
import ReturnFlightModal from './ReturnFlightModal';
import { useSelection } from '../context/SelectionContext';
import { useNavigate } from 'react-router-dom';
import { getAirlineLogo, getDisplayAirlineName } from '../utils/airlineLogos';

// Interfaces
interface Airport {
  Iata: string;
  Nome: string;
  Pais: string;
}

interface SearchParams {
  origem: string;
  destino: string;
  ida: string;
  volta: string;
  adultos: number;
  criancas: number;
  bebes: number;
  companhia: number;
  tipoPagamento: 'ambos' | 'milhas' | 'dinheiro';
  orderBy: 'tempo' | 'preco' | 'custo-beneficio';
  soIda: boolean;
  classe: 'economica' | 'executiva' | 'primeira';
}

interface Flight {
  segments: any[];
  price: number;
  priceWithTax: number;
  totalPrice: number;
  isMiles: boolean;
  airline: string;
  numeroVoo: string;
}

interface FlightResultsProps {
  flights: Flight[];
  searchParams: SearchParams;
  onNewSearch: () => void;
  onFlightSelect?: (flight: Flight, type: 'outbound' | 'return') => void;
  onFiltersChange?: (newParams: Partial<SearchParams>) => void;
  onNewSearchWithFilters?: (newParams: SearchParams) => void;
  isSearching?: boolean;
  isReturnSection?: boolean;
  isFinalSummary?: boolean;
  hideFilters?: boolean;
}

interface SelectedFlights {
  outbound: Flight | null;
  return: Flight | null;
}

const FlightResults: React.FC<FlightResultsProps> = ({ 
  flights, 
  searchParams, 
  onNewSearch, 
  onFlightSelect, 
  onFiltersChange,
  onNewSearchWithFilters,
  isSearching = false,
  isReturnSection = false,
  isFinalSummary = false,
  hideFilters = false
}) => {
  // Estado global de seleção
  const { selected: selectedFlights, setOutbound, setReturn, clear } = useSelection();
  const navigate = useNavigate();

  // Listener para abrir modal da volta
  useEffect(() => {
    const handleOpenReturnModal = (event: CustomEvent) => {
      // Em vez de abrir modal, trocar para modo de seleção de volta
      setIsSelectingReturn(true);
    };

    window.addEventListener('open-return-modal', handleOpenReturnModal as EventListener);
    
    return () => {
      window.removeEventListener('open-return-modal', handleOpenReturnModal as EventListener);
    };
  }, []);

  // Extrai rota e horários somente a partir de campos reais do voo selecionado
  const getRouteAndTimes = (flight?: any) => {
    if (!flight) return { from: '', to: '', depISO: '', arrISO: '' };
    
    // Prioriza dados dos segments que contêm os horários exatos da API
    const segments = flight.segments || [];
    const firstSegment = segments[0] || {};
    const lastSegment = segments[segments.length - 1] || {};
    
    const from = firstSegment.departure || firstSegment.origem || flight.Origem || flight.departure || '';
    const to = lastSegment.arrival || lastSegment.destino || flight.Destino || flight.arrival || '';
    const depISO = firstSegment.departureDate || flight.Saida || flight.departureDate || '';
    const arrISO = lastSegment.arrivalDate || flight.Chegada || flight.arrivalDate || '';
    
    return { from, to, depISO, arrISO };
  };

  // Utilitário de debug para inspecionar campos reais do voo
  const debugFlight = (label: string, flight: any) => {
    try {
      if (!flight) {
        console.log(`🧪 Summary Debug - ${label}: vazio/null`);
        return;
      }
      const segs = Array.isArray(flight.segments) ? flight.segments : [];
      const first = segs[0] || {};
      const last = segs.length ? segs[segs.length - 1] : {};
      console.log(`🧪 Summary Debug - ${label}:`, {
        Origem: flight.Origem,
        Destino: flight.Destino,
        Saida: flight.Saida,
        Chegada: flight.Chegada,
        departure: flight.departure,
        arrival: flight.arrival,
        departureDate: flight.departureDate,
        arrivalDate: flight.arrivalDate,
        segments_len: segs.length,
        seg0: { origem: first.origem, destino: first.destino, departureDate: first.departureDate, arrivalDate: first.arrivalDate },
        segLast: { origem: last.origem, destino: last.destino, departureDate: last.departureDate, arrivalDate: last.arrivalDate }
      });
    } catch (e) {
      console.log(`🧪 Summary Debug - ${label}: erro ao inspecionar`, e);
    }
  };

  // Logar sempre que as seleções mudarem
  useEffect(() => {
    if (selectedFlights.outbound) debugFlight('OUTBOUND', selectedFlights.outbound);
    if (selectedFlights.return) debugFlight('RETURN', selectedFlights.return);
  }, [selectedFlights.outbound, selectedFlights.return]);
  // Ordenar voos por preço (do menor para o maior) antes de exibir
  const sortedFlights = [...flights].sort((a, b) => {
    const priceA = a.priceWithTax || a.price || a.totalPrice || 0;
    const priceB = b.priceWithTax || b.price || b.totalPrice || 0;
    return priceA - priceB;
  });

  // Estados locais
  const [displayedFlights, setDisplayedFlights] = useState<Flight[]>(sortedFlights.slice(0, 10));
  const [isSelectingReturn, setIsSelectingReturn] = useState(false);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [selectedOutboundForReturn, setSelectedOutboundForReturn] = useState<Flight | null>(null);
  const [shouldAutoOpenReturnModal, setShouldAutoOpenReturnModal] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [showFinalSelection, setShowFinalSelection] = useState(false);
  
  // Modal de seleção apenas para VOOS DE VOLTA
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectionModalFlight, setSelectionModalFlight] = useState<Flight | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const flightsPerPage = 10;
  
  // Estados para paginação separada de milhas e dinheiro
  const [moneyPage, setMoneyPage] = useState(0);
  const [milesPage, setMilesPage] = useState(0);
  const [isLoadingMoreMoney, setIsLoadingMoreMoney] = useState(false);
  const [isLoadingMoreMiles, setIsLoadingMoreMiles] = useState(false);
  const itemsPerSection = 10; // 10 voos por seção (milhas ou dinheiro)
  
  // Ref para preservar scroll ao alterar filtros
  const scrollPositionRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 🚀 AUTO MODAL: Desabilitado - usando inline replacement
  useEffect(() => {
    // Modal automático desabilitado para usar inline replacement
    if (shouldAutoOpenReturnModal) {
      setShouldAutoOpenReturnModal(false); // Reset flag
    }
  }, [shouldAutoOpenReturnModal]);

  // 🔄 RESET: Quando novos voos chegam, reseta a exibição com ordenação
  useEffect(() => {
    // ✅ CRITICAL: Não resetar se showFinalSelection está ativo (resultado final)
    if (showFinalSelection) {
      console.log('🛡️ PROTEÇÃO: useEffect bloqueado - showFinalSelection ativo');
      return;
    }
    
    // ✅ CRITICAL: Não resetar se ambos os voos já foram selecionados (ida e volta)
    if (showFinalSelection || (selectedFlights.outbound && selectedFlights.return && !isSelectingReturn)) {
      console.log('🛡️ PROTEÇÃO: Ambos voos selecionados - não resetar');
      return;
    }
    
    // ✅ CRITICAL: Não resetar se estamos selecionando voos de volta
    if (isSelectingReturn && returnFlights.length > 0) {
      console.log('🛡️ PROTEÇÃO: Selecionando volta - não resetar');
      return;
    }
    
    // Reset selection state when new flights arrive (ensure we start with outbound flights)
    // Only reset if we're not in the middle of selecting return flights
    if (!isSelectingReturn) {
      setIsSelectingReturn(false);
      setReturnFlights([]);
    }
    
    // ✅ CRITICAL FIX: SEMPRE preservar AMBOS os tipos quando o filtro está definido como "ambos"
    const isShowingBothTypes = searchParams.tipoPagamento === 'ambos';
    
    if (isShowingBothTypes) {
      // 📊 MODO DUAS COLUNAS: Separar dinheiro e milhas MAS PRESERVAR AMBOS
      const flightsMoney = flights.filter(f => !f.isMiles).sort((a, b) => {
        const priceA = a.priceWithTax || a.price || a.totalPrice || 0;
        const priceB = b.priceWithTax || b.price || b.totalPrice || 0;
        return priceA - priceB;
      });
      
      const flightsMiles = flights.filter(f => f.isMiles).sort((a, b) => {
        const priceA = a.priceWithTax || a.price || a.totalPrice || 0;
        const priceB = b.priceWithTax || b.price || b.totalPrice || 0;
        return priceA - priceB;
      });
      
      // 🎯 FIX CRÍTICO: Manter TODOS os voos (dinheiro + milhas) visíveis
      // Não fazer intercalação, apenas manter todos disponíveis
      const allFlights = [...flightsMoney, ...flightsMiles].sort((a, b) => {
        const priceA = a.priceWithTax || a.price || a.totalPrice || 0;
        const priceB = b.priceWithTax || b.price || b.totalPrice || 0;
        return priceA - priceB;
      });
      
      // Modo duas colunas ativado - PRESERVANDO AMBOS
      
      // ✅ Preservar TODOS os voos, não apenas uma amostra
      setDisplayedFlights(allFlights);
    } else {
      // 🎯 MODO TRADICIONAL: Filtros específicos (apenas quando não é "ambos")
      const vooPrincipalEmDinheiro = (() => {
        // Se temos um voo de ida selecionado, usar seu tipo
        if (selectedFlights.outbound) {
          return !selectedFlights.outbound.isMiles;
        }
        
        // Filtrar por tipo de pagamento selecionado
        if (searchParams.tipoPagamento === 'dinheiro') {
          return true; // Priorizar dinheiro
        }
        if (searchParams.tipoPagamento === 'milhas') {
          return false; // Priorizar milhas
        }
        
        // Se não, verificar dados salvos
        try {
          const originalPurchase = localStorage.getItem('originalPurchase');
          if (originalPurchase) {
            const purchaseData = JSON.parse(originalPurchase);
            return !purchaseData.isMiles;
          }
        } catch (error) {
          console.log('⚠️ Erro ao ler originalPurchase:', error);
        }
        
        return true; // Padrão: dinheiro primeiro
      })();
      
      // ✅ CRÍTICO: Aplicar filtros apenas quando tipoPagamento NÃO é "ambos"
      let filteredFlights = flights;
      if (searchParams.tipoPagamento === 'dinheiro') {
        filteredFlights = flights.filter(f => !f.isMiles);
        console.log('🔍 Filtrando apenas voos em DINHEIRO:', filteredFlights.length);
      } else if (searchParams.tipoPagamento === 'milhas') {
        filteredFlights = flights.filter(f => f.isMiles);
        console.log('🔍 Filtrando apenas voos em MILHAS:', filteredFlights.length);
      } else {
        // Caso padrão: manter todos os voos
        console.log('🔍 Mantendo TODOS os tipos de voo:', filteredFlights.length);
      }
      
      const sortedFlights = [...filteredFlights].sort((a, b) => {
        const isAMoney = !a.isMiles;
        const isBMoney = !b.isMiles;
        
        // Se um é dinheiro e outro é milhas, priorizar baseado no padrão estabelecido
        if (isAMoney !== isBMoney) {
          if (vooPrincipalEmDinheiro) {
            return isAMoney ? -1 : 1; // Dinheiro primeiro
          } else {
            return isAMoney ? 1 : -1; // Milhas primeiro
          }
        }
        
        // Se ambos são do mesmo tipo, ordenar por preço
        const priceA = a.priceWithTax || a.price || a.totalPrice || 0;
        const priceB = b.priceWithTax || b.price || b.totalPrice || 0;
        return priceA - priceB;
      });
      
      console.log('📋 Voos filtrados e ordenados:', {
        tipoFiltro: searchParams.tipoPagamento,
        total: sortedFlights.length,
        primeiro: sortedFlights[0] ? (!sortedFlights[0].isMiles ? 'dinheiro' : 'milhas') : 'nenhum'
      });
      
      // Mostrar apenas os 10 primeiros inicialmente quando há filtro específico
      setDisplayedFlights(sortedFlights.slice(0, 10));
    }
    
    setCurrentPage(0);
    setIsLoadingMore(false);
    // Resetar paginação por seção (dinheiro e milhas)
    setMoneyPage(0);
    setMilesPage(0);

    // Quando estamos selecionando a VOLTA, os voos recebidos são os de volta da API
    if (isSelectingReturn && !showFinalSelection) {
      setReturnFlights(flights);
    }

    // 🔁 Após busca da VOLTA: apenas orientar o usuário, sem auto-selecionar voos
    try {
      if (isReturnSection && !showFinalSelection) {
        const shouldReopen = localStorage.getItem('reopenSelectionAfterSearch') === 'true';
        if (shouldReopen && flights && flights.length > 0) {
          // Limpa a flag e orienta o usuário a escolher manualmente
          localStorage.removeItem('reopenSelectionAfterSearch');
          console.log('ℹ️ Retorno disponível. Aguarde o usuário escolher o voo de volta.');
        }
      }
    } catch {}
  }, [flights, selectedFlights.outbound, searchParams.tipoPagamento, showFinalSelection]); // removido isSelectingReturn para evitar loop

  // Format functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Extrai código IATA (ex.: "São Paulo (GRU)" -> "GRU")
  const getIata = (label?: string) => {
    if (!label) return label || '';
    const m = label.match(/\(([A-Z]{3})\)/);
    return m ? m[1] : label;
  };

  // Website da companhia aérea
  const getAirlineWebsite = (airlineName: string): string => {
    const sites: Record<string, string> = {
      'LATAM': 'https://www.latamairlines.com',
      'LATAM Airlines': 'https://www.latamairlines.com',
      'GOL': 'https://www.voegol.com.br',
      'GOL Linhas Aéreas': 'https://www.voegol.com.br',
      'Azul': 'https://www.voeazul.com.br',
      'Azul Linhas Aéreas': 'https://www.voeazul.com.br',
      'TAP Air Portugal': 'https://www.flytap.com',
      'TAP': 'https://www.flytap.com',
      'Copa Airlines': 'https://www.copaair.com',
      'Copa': 'https://www.copaair.com',
      'American Airlines': 'https://www.aa.com',
      'Iberia': 'https://www.iberia.com',
      'Livelo': 'https://www.azul.viagenslivelo.com.br',
      'Interline Azul': 'https://www.voeazul.com.br'
    };
    return sites[airlineName] || 'https://www.google.com/search?q=' + encodeURIComponent(airlineName + ' site oficial');
  };

  const goToAirlineSite = (flight: Flight) => {
    const url = getAirlineWebsite(flight.airline || '');
    if (typeof window !== 'undefined') window.open(url, '_blank');
  };

  const formatMiles = (value: number) => {
    return `${value.toLocaleString()} milhas`;
  };

  const formatTime = (dateString: string | undefined | null) => {
    if (!dateString || dateString === 'N/A') {
      return '--:--';
    }
    
    try {
      // Se já está no formato HH:MM, retornar diretamente
      if (/^\d{2}:\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return '--:--';
      }
      
      // Usar horário local para manter consistência com o timezone do usuário
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      return formattedTime;
    } catch (error) {
      return '--:--';
    }
  };

  const getTotalDuration = (segments: any[]) => {
    if (!segments || segments.length === 0) return 'N/A';
    return segments[0]?.duration || '2h 00m';
  };

  const getDisplayAirlineName = (flight: Flight) => {
    // Priorizar dados da API Moblix (validatingBy.name) sobre flight.airline
    const airlineName = (flight as any).validatingBy?.name || 
                       (flight as any).segments?.[0]?.legs?.[0]?.operatedBy?.name || 
                       (flight as any).segments?.[0]?.legs?.[0]?.managedBy?.name ||
                       flight.airline || 
                       'Companhia Aérea';
    
    return airlineName;
  };


  const formatFlightType = (flight: Flight) => {
    if (flight.isMiles) {
      return {
        icon: '✈️',
        text: 'Milhas',
        cssClass: 'bg-blue-100 text-blue-800',
        description: 'Voo pago com milhas'
      };
    }
    return {
      icon: '💰',
      text: 'Dinheiro',
      cssClass: 'bg-green-100 text-green-800',
      description: 'Voo pago em dinheiro'
    };
  };

  // Load more flights function with loading state and smooth scroll
  const loadMoreFlights = async () => {
    setIsLoadingMore(true);
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const nextPage = currentPage + 1;
    const startIndex = nextPage * flightsPerPage;
    const endIndex = startIndex + flightsPerPage;
    
    const newFlights = sortedFlights.slice(startIndex, endIndex);
    const currentFlightsCount = displayedFlights.length;
    
    setDisplayedFlights(prev => [...prev, ...newFlights]);
    setCurrentPage(nextPage);
    setIsLoadingMore(false);
    
    // Smooth scroll to the first newly loaded flight after a small delay
    setTimeout(() => {
      const flightElements = document.querySelectorAll('.flight-card');
      const targetElement = flightElements[currentFlightsCount];
      if (targetElement) {
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  // Load all remaining flights function
  const loadAllFlights = () => {
    setDisplayedFlights(sortedFlights);
    setCurrentPage(Math.ceil(sortedFlights.length / flightsPerPage) - 1);
  };

  // Check if there are more flights to load
  const hasMoreFlights = () => {
    return displayedFlights.length < sortedFlights.length;
  };

  // Check if we should show "Load All" option (for small lists)
  const shouldShowLoadAll = () => {
    const remaining = sortedFlights.length - displayedFlights.length;
    return remaining > 0 && remaining <= 15; // Show "Load All" if 15 or fewer flights remain
  };
  
  // Funções para carregar mais voos por seção
  const loadMoreMoneyFlights = async () => {
    setIsLoadingMoreMoney(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setMoneyPage(prev => prev + 1);
    setIsLoadingMoreMoney(false);
  };
  
  const loadMoreMilesFlights = async () => {
    setIsLoadingMoreMiles(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setMilesPage(prev => prev + 1);
    setIsLoadingMoreMiles(false);
  };
  
  // Verificar se há mais voos para carregar por seção
  const hasMoreMoneyFlights = () => {
    const moneyFlights = getCurrentDisplayedFlights().filter(f => !f.isMiles);
    const displayedMoneyCount = (moneyPage + 1) * itemsPerSection;
    return moneyFlights.length > displayedMoneyCount;
  };
  
  const hasMoreMilesFlights = () => {
    const milesFlights = getCurrentDisplayedFlights().filter(f => f.isMiles);
    const displayedMilesCount = (milesPage + 1) * itemsPerSection;
    return milesFlights.length > displayedMilesCount;
  };

  // Nova função para lidar com a escolha do voo de ida
  const handleChooseOutbound = async (flight: Flight) => {
    
    // Se a busca é SOMENTE IDA, não devemos iniciar nova busca de volta
    if (searchParams.soIda) {
      setOutbound(flight);
      setReturn(null);
      setIsSelectingReturn(false);
      onFlightSelect?.(flight, 'outbound');
      // Viagem só de ida -> ir ao resumo na one-page
      navigate('/#resumo');
      return; // Evita qualquer nova busca
    }

    // Para ida e volta: selecionar voo de ida e buscar voos de volta
    setOutbound(flight);
    setSelectedOutboundForReturn(flight);
    
    // Fechar qualquer modal que possa estar aberto
    setIsSelectionModalOpen(false);
    setSelectionModalFlight(null);
    
    // Buscar voos de volta dos dados já carregados ou do localStorage
    let availableReturnFlights: Flight[] = [];
    
    try {
      // Fazer requisição real para API Moblix para voos de volta
      console.log('🔄 Fazendo requisição real para API Moblix - voos de volta');
      
      // Importar o serviço da API Moblix
      const { default: moblixApiService } = await import('../services/moblixApiService');
      
      // Função para extrair código IATA do formato "Cidade (IATA)" ou outros formatos
      const extractIATA = (cityString: string): string => {
        if (!cityString) return '';
        
        // Padrão: "Cidade (IATA)" -> extrair apenas IATA
        const parenMatch = cityString.match(/\(([A-Z]{3})\)/);
        if (parenMatch && parenMatch[1]) {
          return parenMatch[1].trim().toUpperCase();
        }
        
        // Se o valor contém " - ", pega apenas a primeira parte (código IATA)
        if (cityString.includes(' - ')) {
          return cityString.split(' - ')[0].trim().toUpperCase();
        }
        
        // Se for exatamente 3 letras, assume que já é IATA
        if (/^[A-Za-z]{3}$/.test(cityString.trim())) {
          return cityString.trim().toUpperCase();
        }
        
        // Fallback: retorna o valor original
        return cityString.trim().toUpperCase();
      };

      // Preparar parâmetros para voo de volta (inverter origem e destino)
      const returnParams = {
        origem: extractIATA(searchParams.destino), // Extrair IATA e inverter
        destino: extractIATA(searchParams.origem), // Extrair IATA e inverter
        ida: searchParams.volta || searchParams.ida, // Usar data de volta se disponível
        adultos: searchParams.adultos || 1,
        criancas: searchParams.criancas || 0,
        bebes: searchParams.bebes || 0,
        companhia: searchParams.companhia || -1,
        classe: searchParams.classe || 'economica'
      };
      
      console.log('🔄 DEBUG: Parâmetros de busca de volta:', returnParams);
      console.log('🔄 DEBUG: Origem original:', searchParams.origem);
      console.log('🔄 DEBUG: Destino original:', searchParams.destino);
      console.log('🔄 DEBUG: Origem volta (era destino):', returnParams.origem);
      console.log('🔄 DEBUG: Destino volta (era origem):', returnParams.destino);
      
      console.log('🛫 Buscando voos de volta com parâmetros:', returnParams);
      
      // Fazer requisição para API Moblix
      const apiResponse = await moblixApiService.consultarVoos(returnParams);
      
      if (apiResponse?.flights && Array.isArray(apiResponse.flights) && apiResponse.flights.length > 0) {
        // Log da estrutura da API para debug
        console.log('🔍 DEBUG API RESPONSE - Estrutura completa:', apiResponse);
        console.log('🔍 DEBUG API RESPONSE - Primeiro voo:', apiResponse.flights[0]);
        console.log('🔍 DEBUG API RESPONSE - Segments do primeiro voo:', apiResponse.flights[0]?.segments);
        console.log('🔍 DEBUG API RESPONSE - PontosAdulto do primeiro segment:', apiResponse.flights[0]?.segments?.[0]?.PontosAdulto);
        
        // Processar voos de volta da API - usar dados reais da resposta
        availableReturnFlights = apiResponse.flights.map((flight: any, index: number) => {
          // Usar dados reais dos segments da API
          const segment = flight.segments?.[0] || {};
          const hasPoints = segment.PontosAdulto > 0;
          
          const baseFlightData = {
            flightId: `return_api_${index}`,
            isReturnFlight: true,
            flightDirection: 'return',
            airline: flight.validatingBy?.name || 'LATAM',
            numeroVoo: segment.legs?.[0]?.flightNumber || `LA${3000 + index}`,
            segments: [{
              departure: segment.departure || 'GIG',
              arrival: segment.arrival || 'GRU',
              origem: segment.departure || 'GIG',
              destino: segment.arrival || 'GRU',
              departureDate: segment.departureDate,
              arrivalDate: segment.arrivalDate,
              duration: segment.duration || 70,
              legs: segment.legs
            }],
            validatingBy: flight.validatingBy,
            fareGroup: flight.fareGroup
          };
          
          return [
            // Versão em dinheiro
            {
              ...baseFlightData,
              flightId: `return_money_${index}`,
              price: flight.fareGroup?.priceWithTax || 200,
              priceWithTax: flight.fareGroup?.priceWithTax || 200,
              totalPrice: flight.fareGroup?.priceWithTax || 200,
              isMiles: false
            },
            // Versão em milhas (apenas se tiver pontos)
            ...(hasPoints ? [{
              ...baseFlightData,
              flightId: `return_miles_${index}`,
              price: segment.PontosAdulto || 8000,
              priceWithTax: segment.PontosAdulto || 8000,
              totalPrice: segment.PontosAdulto || 8000,
              isMiles: true
            }] : [])
          ];
        }).flat();
        
        console.log('✅ Voos de volta obtidos da API Moblix:', availableReturnFlights.length);
        console.log('🔍 DEBUG: Primeiro voo de volta:', availableReturnFlights[0]);
        console.log('🔍 DEBUG: Rota do primeiro voo de volta:', availableReturnFlights[0]?.segments?.[0]?.origem, '→', availableReturnFlights[0]?.segments?.[availableReturnFlights[0]?.segments?.length - 1]?.destino);
        
        // Log detalhado dos valores de milhas para debug
        availableReturnFlights.forEach((flight, index) => {
          if (flight.isMiles) {
            console.log(`🔍 DEBUG MILHAS - Voo ${index}:`, {
              flightId: (flight as any).flightId,
              isMiles: flight.isMiles,
              price: flight.price,
              priceWithTax: flight.priceWithTax,
              totalPrice: flight.totalPrice,
              originalSegmentPoints: apiResponse.flights[Math.floor(index/2)]?.segments?.[0]?.PontosAdulto
            });
          }
        });
      } else {
        console.log('⚠️ Nenhum voo de volta encontrado na API');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar voos de volta na API:', error);
    }
    
    // Se não conseguiu da API, fazer nova busca via componente pai
    if (availableReturnFlights.length === 0) {
      console.log('🔄 Nenhum voo de volta da API - solicitando nova busca ao componente pai');
      
      // Notificar o componente pai para fazer nova busca de volta
      if (onNewSearchWithFilters) {
        const returnSearchParams = {
          ...searchParams,
          origem: getIata(searchParams.destino), // Inverter origem/destino
          destino: getIata(searchParams.origem),
          ida: searchParams.volta || searchParams.ida, // Usar data de volta
          volta: '', // Limpar volta pois agora é só ida
          soIda: true // Buscar apenas ida (que será a volta)
        };
        
        console.log('🔄 Solicitando nova busca com parâmetros:', returnSearchParams);
        onNewSearchWithFilters(returnSearchParams);
        return; // Sair da função e aguardar nova busca
      }
      
      // Fallback: criar voos de volta completamente diferentes
      console.log('⚠️ Criando voos de volta diferentes usando fallback');
      
      const returnFlightTemplates = [
        { time: '06:30', arrival: '13:45', price: 0.7, miles: 9500, duration: '7h 15m', connections: '1 conexão' },
        { time: '09:15', arrival: '16:20', price: 0.6, miles: 8200, duration: '7h 5m', connections: '2 conexões' },
        { time: '14:40', arrival: '21:55', price: 0.75, miles: 10200, duration: '7h 15m', connections: 'Direto' },
        { time: '18:20', arrival: '01:35', price: 0.65, miles: 8800, duration: '7h 15m', connections: '1 conexão' },
        { time: '22:10', arrival: '05:25', price: 0.8, miles: 11000, duration: '7h 15m', connections: '2 conexões' }
      ];
      
      availableReturnFlights = returnFlightTemplates.map((template, index) => {
        const basePrice = displayedFlights[0]?.price || 400;
        const newPrice = Math.floor(basePrice * template.price);
        
        return [
          // Versão dinheiro
          {
            flightId: `return_money_${index}`,
            price: newPrice,
            priceWithTax: newPrice,
            totalPrice: newPrice,
            isMiles: false,
            airline: 'LATAM Airlines',
            numeroVoo: `LA${3000 + index}`,
            segments: [{
              departure: getIata(searchParams.destino),
              arrival: getIata(searchParams.origem),
              origem: getIata(searchParams.destino),
              destino: getIata(searchParams.origem),
              departureDate: searchParams.volta || searchParams.ida,
              arrivalDate: searchParams.volta || searchParams.ida,
              departureTime: template.time,
              arrivalTime: template.arrival,
              duration: template.duration,
              connections: template.connections
            }]
          },
          // Versão milhas
          {
            flightId: `return_miles_${index}`,
            price: template.miles,
            priceWithTax: template.miles,
            totalPrice: template.miles,
            isMiles: true,
            airline: 'LATAM Airlines',
            numeroVoo: `LA${3000 + index}`,
            segments: [{
              departure: getIata(searchParams.destino),
              arrival: getIata(searchParams.origem),
              origem: getIata(searchParams.destino),
              destino: getIata(searchParams.origem),
              departureDate: searchParams.volta || searchParams.ida,
              arrivalDate: searchParams.volta || searchParams.ida,
              departureTime: template.time,
              arrivalTime: template.arrival,
              duration: template.duration,
              connections: template.connections
            }]
          }
        ];
      }).flat();
    }
    
    // Armazenar voos de volta e mudar para modo de seleção de volta
    console.log('🔄 Definindo voos de volta no estado:', availableReturnFlights.length);
    console.log('🔄 Estado ANTES da atualização - isSelectingReturn:', isSelectingReturn);
    
    // CRITICAL: Atualizar estados de forma síncrona
    setReturnFlights(availableReturnFlights);
    setIsSelectingReturn(true);
    
    // Forçar re-render após pequeno delay para garantir que estados sejam aplicados
    setTimeout(() => {
      setDisplayedFlights([...availableReturnFlights]);
    }, 10);
    
    console.log('✅ Estado SOLICITADO - isSelectingReturn: true, returnFlights:', availableReturnFlights.length);
    
    // Notificar o componente pai para atualizar os voos exibidos
    if (onFlightSelect) {
      onFlightSelect(flight, 'outbound');
    }
  };

  // Selecionar imediatamente a VOLTA ao clicar em "Escolher" (sem modal)
  const openReturnSelectionModal = (flight: Flight) => {
    
    // Fechar quaisquer modais abertos via evento global (cards)
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sv-close-modals'));
      }
    } catch {}
    
    // Definir o voo de volta e encerrar estado de seleção
    setReturn(flight);
    setIsSelectingReturn(false);
    setIsSelectionModalOpen(false);
    setSelectionModalFlight(null);
    
    // Não navegar para resumo - manter na mesma página
  };

  // Nova função para lidar com a escolha do voo de volta
  const handleChooseReturn = (flight: Flight) => {
    console.log('🎯 Selecionando voo de volta:', flight);
    console.log('🔍 RETURN SELECTION - Miles values:', {
      returnFlight: {
        isMiles: flight.isMiles,
        price: flight.price,
        priceWithTax: flight.priceWithTax,
        totalPrice: flight.totalPrice,
        flightId: (flight as any).flightId
      },
      outboundFlight: selectedFlights.outbound ? {
        isMiles: selectedFlights.outbound.isMiles,
        price: selectedFlights.outbound.price,
        priceWithTax: selectedFlights.outbound.priceWithTax,
        totalPrice: selectedFlights.outbound.totalPrice,
        flightId: (selectedFlights.outbound as any).flightId
      } : null
    });
    
    // Definir os voos finais PRIMEIRO, antes de limpar os estados
    const outboundFlight = selectedFlights.outbound;
    if (outboundFlight) {
      console.log('✅ Definindo voos finais - Ida:', outboundFlight, 'Volta:', flight);
      
      // CRÍTICO: Atualizar todos os estados SINCRONAMENTE para ir direto ao modal final
      setReturn(flight);
      setShowFinalSelection(true);
      setIsSelectingReturn(false);
      setReturnFlights([]);
      setSelectedOutboundForReturn(null);
      
      // FORÇAR exibição do modal final imediatamente
      setDisplayedFlights([outboundFlight, flight]);
      
      console.log('🎯 RESULTADO FINAL ATIVADO: showFinalSelection=true, displayedFlights=[ida,volta]');
      console.log('🎯 ESTADO FINAL: isSelectingReturn=false, showFinalSelection=true');
      
      // Scroll automático para o modal final após um pequeno delay para garantir que o DOM foi atualizado
      setTimeout(() => {
        const finalSummaryElement = document.querySelector('[data-final-summary]');
        if (finalSummaryElement) {
          finalSummaryElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        } else {
          // Fallback: scroll para o topo da seção de resultados
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
      
      // Notificar o componente pai IMEDIATAMENTE
      if (onFlightSelect) {
        onFlightSelect(flight, 'return');
      }
    }
  };

  // Abrir modal ao clicar em "Escolher" na IDA
  const openOutboundSelectionModal = (flight: Flight) => {
    // Sempre usar inline replacement, nunca modal
    handleChooseOutbound(flight);
  };

  // Abrir modal ao clicar em "Escolher" na VOLTA
  // (removido) duplicado de openReturnSelectionModal

  // Modal de confirmação removido; seleção é imediata, não há handler aqui
  
  // Handle flight selection - AGORA PROCESSA DIFERENTES TIPOS DE EVENTOS
  const handleFlightSelect = async (flightOrEvent: Flight | any) => {
    console.log('👍 FlightResults - handleFlightSelect chamado:', flightOrEvent);
    
    // Verificar se é um evento especial (com type) ou um voo normal
    if (flightOrEvent && typeof flightOrEvent === 'object' && flightOrEvent.type) {
      const event = flightOrEvent;
      
      switch (event.type) {
        case 'CHOOSE_OUTBOUND':
          // Lidar com escolha de voo de ida do botão "Escolher"
          console.log('✨ Processando escolha de voo de ida via botão Escolher');
          handleChooseOutbound(event.flight);
          break;
        case 'CHOOSE_RETURN':
          console.log('✨ Processando escolha de voo de volta via botão Escolher');
          handleChooseReturn(event.flight);
          break;
          
        case 'SEARCH_RETURN_FLIGHTS':
          console.log('🔄 Iniciando busca de voos de volta...', event.searchParams);
          console.log('💰 Preço do voo de ida selecionado:', event.originalPurchase?.price);
          
          // Salvar preço mínimo para validação dos voos de volta
          const precoMinimo = event.originalPurchase?.price || 'R$ 0,00';
          // Extrair valor numérico do preço (remover "R$ ", pontos e vírgulas)
          const precoMinimoNumerico = parseFloat(
            precoMinimo.toString()
              .replace('R$', '')
              .replace(/\./g, '')
              .replace(',', '.')
              .trim()
          ) || 0;
          
          console.log('📊 Preço mínimo numérico para voos de volta:', precoMinimoNumerico);
          
          // Notificar o componente pai (Home) para realizar busca de volta
          if (onNewSearchWithFilters) {
            // Salvar informações da compra original + preço mínimo
            localStorage.setItem('originalPurchase', JSON.stringify({
              ...event.originalPurchase,
              precoMinimoNumerico: precoMinimoNumerico
            }));
            
            // Salvar preço mínimo para filtragem posterior
            localStorage.setItem('precoMinimoVolta', precoMinimoNumerico.toString());
            
            // Executar busca de volta
            onNewSearchWithFilters(event.searchParams as SearchParams);
            
            // Mostrar mensagem de sucesso
            setTimeout(() => {
              if (typeof window !== 'undefined') {
                alert(`✨ Parabéns! Voo de ida confirmado com ${event.originalPurchase.airline}!\n\n🔍 Agora estamos buscando voos de volta com preços a partir de ${precoMinimo}...`);
              }
            }, 500);
          }
          break;
          
        case 'SHOW_SUCCESS_MESSAGE':
          console.log('🎉 Mostrando mensagem de sucesso:', event.message);
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              alert(`✨ ${event.message}`);
            }, 500);
          }
          break;
          
        default:
          console.warn('⚠️ Tipo de evento não reconhecido:', event.type);
      }
      
      return; // Early return para eventos especiais
    }
    
    // Lógica original para seleção normal de voos
    const flight = flightOrEvent as Flight;
    
    // Se estamos na seção de volta, sempre tratar como escolha de volta
    if (isReturnSection) {
      setReturn(flight);
      setIsSelectingReturn(false);
      onFlightSelect?.(flight, 'return');
      navigate('/#resumo');
      return;
    }

    if (searchParams.soIda) {
      // Para viagem só de ida, seleciona diretamente
      setOutbound(flight);
      setReturn(null);
      onFlightSelect?.(flight, 'outbound');
    } else {
      // Para ida e volta
      if (!selectedFlights.outbound) {
        // Primeiro seleciona o voo de ida
        setOutbound(flight);

        // Fechar modais nos cards e marcar para reabrir após a busca de volta
        try {
          localStorage.setItem('reopenSelectionAfterSearch', 'true');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sv-close-modals'));
          }
        } catch {}

        // Disparar nova busca REAL para os voos de volta via pai
        setIsSelectingReturn(true);
        setShouldAutoOpenReturnModal(true); // Marcar para abrir modal automaticamente
        const newParams: SearchParams = {
          ...searchParams,
          origem: searchParams.destino,
          destino: searchParams.origem,
          ida: searchParams.volta || searchParams.ida,
          volta: '',
          soIda: false // Manter como ida e volta para preservar os resultados
        } as SearchParams;
        if (onNewSearchWithFilters) {
          onNewSearchWithFilters(newParams);
        } else {
          onNewSearch();
        }

        onFlightSelect?.(flight, 'outbound');
      } else {
        // Segundo seleciona o voo de volta - Transição automática para resumo final
        console.log('🎯 SELEÇÃO DIRETA DE VOLTA - TRANSIÇÃO AUTOMÁTICA');
        
        // Atualizar estados para transição automática
        setReturn(flight);
        setShowFinalSelection(true);
        setIsSelectingReturn(false);
        setReturnFlights([]);
        setSelectedOutboundForReturn(null);
        setDisplayedFlights([selectedFlights.outbound, flight]);
        
        onFlightSelect?.(flight, 'return');
      }
    }
  };

  // Reset selection
  const resetSelection = () => {
    clear();
    setIsSelectingReturn(false);
    setReturnFlights([]);
    setShowFinalSelection(false); // Reset flag de seleção final
    setShouldAutoOpenReturnModal(false); // Reset flag do modal automático
  };

  // Get current flights to display based on selection state - MEMOIZED to prevent infinite loops
  const getCurrentFlights = useMemo(() => {
    // PRIORIDADE ABSOLUTA: Se ambos os voos estão selecionados, SEMPRE mostrar resultado final
    if (selectedFlights.outbound && selectedFlights.return) {
      console.log('✅ AMBOS VOOS SELECIONADOS - Mostrando resultado final');
      return [selectedFlights.outbound, selectedFlights.return];
    }
    
    // PRIORIDADE 1: Se estamos selecionando volta e temos voos de volta, mas NÃO temos volta selecionada
    if (isSelectingReturn && returnFlights.length > 0 && !selectedFlights.return) {
      console.log('🔄 Mostrando voos de volta para seleção');
      return returnFlights;
    }
    
    // PRIORIDADE 2: Caso padrão - mostrar voos de ida
    console.log('📋 Mostrando voos de ida');
    return displayedFlights;
  }, [isSelectingReturn, returnFlights, selectedFlights.outbound, selectedFlights.return, displayedFlights]);

  // Get current displayed flights
  const getCurrentDisplayedFlights = () => {
    // Se estamos selecionando volta, mostrar voos de volta
    if (isSelectingReturn && returnFlights.length > 0) {
      return returnFlights;
    }
    // Sempre mostrar voos de ida primeiro (displayedFlights são os voos originais)
    return displayedFlights;
  };

  // Handle filter changes
  const handleFiltersChange = (newFilterParams: any) => {
    console.log('🎛️ Filtros alterados:', newFilterParams);
    onFiltersChange?.(newFilterParams);
  };

  // Handle new search with filters
  const handleNewSearchWithFilters = () => {
    console.log('🔍 Nova busca solicitada com filtros atuais');
    if (onNewSearchWithFilters) {
      onNewSearchWithFilters(searchParams);
    } else {
      onNewSearch();
    }
  };

  // Get selection message for flight card
  const getSelectionMessage = (flight: Flight) => {
    if (isSelectingReturn) {
      return 'Escolher voo';
    }
    return !searchParams.soIda ? 'Escolher voo de ida' : 'Escolher voo';
  };


  return (
    <div className="flight-results py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filtros Interativos */}
        <InteractiveFilters
          searchParams={{
            adultos: searchParams.adultos,
            criancas: searchParams.criancas,
            bebes: searchParams.bebes,
            tipoPagamento: searchParams.tipoPagamento,
            orderBy: searchParams.orderBy,
            soIda: searchParams.soIda
          }}
          onFiltersChange={handleFiltersChange}
          onNewSearch={handleNewSearchWithFilters}
          isLoading={isSearching}
        />

        {/* Header com resumo dos resultados */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100/50 p-8 mb-8">
          {/* Progresso da seleção (para ida e volta) */}
          {!searchParams.soIda && (
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  selectedFlights.outbound ? 'bg-green-100 text-green-800' : 
                  !isReturnSection ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className="text-sm font-medium">1. Selecione seu voo de ida</span>
                  {selectedFlights.outbound && <span className="text-xs">✓</span>}
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  selectedFlights.return ? 'bg-green-100 text-green-800' : 
                  isReturnSection ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className="text-sm font-medium">2. Selecione seu voo de volta</span>
                  {selectedFlights.return && <span className="text-xs">✓</span>}
                </div>
              </div>
            </div>
          )}

          {selectedFlights.outbound && selectedFlights.return ? (
                // Modal final integrado - substitui as colunas
                <div className="space-y-6">
                  {/* Voo de Ida */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-[#060D1C] mb-4">Voo de Ida</h3>
                    {(() => {
                      console.log('🔍 FINAL SUMMARY - Voo de IDA:', {
                        isMiles: selectedFlights.outbound.isMiles,
                        price: selectedFlights.outbound.price,
                        priceWithTax: selectedFlights.outbound.priceWithTax,
                        totalPrice: selectedFlights.outbound.totalPrice,
                        flightId: (selectedFlights.outbound as any).flightId
                      });
                      return null;
                    })()}
                    <FlightResultCard
                      key={`final-outbound-${selectedFlights.outbound.segments?.[0]?.rateToken || 'outbound'}`}
                      flight={selectedFlights.outbound}
                      isSelected={true}
                      fromLabel={selectedFlights.outbound.segments?.[0]?.departure || getIata(searchParams.origem)}
                      toLabel={selectedFlights.outbound.segments?.[selectedFlights.outbound.segments.length - 1]?.arrival || getIata(searchParams.destino)}
                      selectionMessage="Voo selecionado"
                      allFlights={sortedFlights}
                      isRoundTrip={!searchParams.soIda}
                      isSelectingReturn={false}
                      selectedOutboundFlight={selectedFlights.outbound}
                      onChooseOutbound={undefined}
                      onChooseReturn={undefined}
                      isFinalSummary={true}
                    />
                  </div>

                  {/* Voo de Volta */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-[#060D1C] mb-4">Voo de Volta</h3>
                    {(() => {
                      console.log('🔍 FINAL SUMMARY - Voo de VOLTA:', {
                        isMiles: selectedFlights.return.isMiles,
                        price: selectedFlights.return.price,
                        priceWithTax: selectedFlights.return.priceWithTax,
                        totalPrice: selectedFlights.return.totalPrice,
                        flightId: (selectedFlights.return as any).flightId
                      });
                      return null;
                    })()}
                    <FlightResultCard
                      key={`final-return-${selectedFlights.return.segments?.[0]?.rateToken || 'return'}`}
                      flight={selectedFlights.return}
                      isSelected={true}
                      fromLabel={selectedFlights.return.segments?.[0]?.departure || getIata(searchParams.destino)}
                      toLabel={selectedFlights.return.segments?.[selectedFlights.return.segments.length - 1]?.arrival || getIata(searchParams.origem)}
                      selectionMessage="Voo selecionado"
                      allFlights={sortedFlights}
                      isRoundTrip={!searchParams.soIda}
                      isSelectingReturn={false}
                      selectedOutboundFlight={selectedFlights.outbound}
                      onChooseOutbound={undefined}
                      onChooseReturn={undefined}
                      isFinalSummary={true}
                    />
                  </div>
                </div>
              ) : (
                // Layout de duas colunas: Dinheiro e Milhas (quando ainda selecionando)
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Coluna Dinheiro */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#060D1C] flex items-center">
                      Dinheiro
                    </h3>
                    <span className="text-sm text-gray-600">
                      {getCurrentFlights.filter((f: any) => !f.isMiles).length} voos
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {getCurrentFlights
                      .filter((flight: any) => !flight.isMiles)
                      .slice(moneyPage * 10, (moneyPage + 1) * 10)
                      .map((flight: any, index: number) => (
                        <FlightResultCard
                          key={`money-${flight.rateToken || index}`}
                          flight={flight}
                          isSelected={false}
                          fromLabel={isSelectingReturn ? getIata(searchParams.destino) : getIata(searchParams.origem)}
                          toLabel={isSelectingReturn ? getIata(searchParams.origem) : getIata(searchParams.destino)}
                          selectionMessage={getSelectionMessage(flight)}
                          allFlights={sortedFlights}
                          isRoundTrip={!searchParams.soIda}
                          isSelectingReturn={isSelectingReturn}
                          selectedOutboundFlight={selectedFlights.outbound}
                          onChooseOutbound={!isSelectingReturn && !selectedFlights.outbound ? handleChooseOutbound : undefined}
                          onChooseReturn={isSelectingReturn ? handleChooseReturn : undefined}
                          isFinalSummary={!!(selectedFlights.outbound && selectedFlights.return)}
                        />
                      ))}
                  </div>
                  
                  {/* Paginação para Dinheiro */}
                  {getCurrentFlights.filter((f: any) => !f.isMiles).length > 10 && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t">
                      <button
                        onClick={() => setMoneyPage(moneyPage - 1)}
                        disabled={moneyPage === 0}
                        className="px-4 py-2 bg-[#E4E4E4] text-[#060D1C] rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <span className="text-sm text-gray-600">
                        Página {moneyPage + 1} de {Math.ceil(getCurrentFlights.filter((f: any) => !f.isMiles).length / 10)}
                      </span>
                      <button
                        onClick={() => setMoneyPage(moneyPage + 1)}
                        disabled={(moneyPage + 1) * 10 >= getCurrentFlights.filter((f: any) => !f.isMiles).length}
                        className="px-4 py-2 bg-[#E4E4E4] text-[#060D1C] rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próxima
                      </button>
                    </div>
                  )}
                </div>

                {/* Coluna Milhas */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#060D1C] flex items-center">
                      Milhas
                    </h3>
                    <span className="text-sm text-gray-600">
                      {getCurrentFlights.filter((f: any) => f.isMiles).length} voos
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {getCurrentFlights
                      .filter((flight: any) => flight.isMiles)
                      .slice(milesPage * 10, (milesPage + 1) * 10)
                      .map((flight: any, index: number) => (
                        <FlightResultCard
                          key={`miles-${flight.rateToken || index}`}
                          flight={flight}
                          isSelected={false}
                          fromLabel={isSelectingReturn ? getIata(searchParams.destino) : getIata(searchParams.origem)}
                          toLabel={isSelectingReturn ? getIata(searchParams.origem) : getIata(searchParams.destino)}
                          selectionMessage={getSelectionMessage(flight)}
                          allFlights={sortedFlights}
                          isRoundTrip={!searchParams.soIda}
                          isSelectingReturn={isSelectingReturn}
                          selectedOutboundFlight={selectedFlights.outbound}
                          onChooseOutbound={!isSelectingReturn && !selectedFlights.outbound ? handleChooseOutbound : undefined}
                          onChooseReturn={isSelectingReturn ? handleChooseReturn : undefined}
                          isFinalSummary={!!(selectedFlights.outbound && selectedFlights.return)}
                        />
                      ))}
                  </div>
                  
                  {/* Paginação para Milhas */}
                  {getCurrentFlights.filter((f: any) => f.isMiles).length > 10 && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t">
                      <button
                        onClick={() => setMilesPage(milesPage - 1)}
                        disabled={milesPage === 0}
                        className="px-4 py-2 bg-[#E4E4E4] text-[#060D1C] rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <span className="text-sm text-gray-600">
                        Página {milesPage + 1} de {Math.ceil(getCurrentFlights.filter((f: any) => f.isMiles).length / 10)}
                      </span>
                      <button
                        onClick={() => setMilesPage(milesPage + 1)}
                        disabled={(milesPage + 1) * 10 >= getCurrentFlights.filter((f: any) => f.isMiles).length}
                        className="px-4 py-2 bg-[#E4E4E4] text-[#060D1C] rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próxima
                      </button>
                    </div>
                  )}
                </div>
              </div>
              )}

        {/* Modal de seleção de voo de volta - REMOVIDO COMPLETAMENTE */}
        {/* <ReturnFlightModal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          outboundFlight={selectedOutboundForReturn}
          returnFlights={returnFlights}
          onSelectReturn={handleChooseReturn}
          searchParams={searchParams}
        /> */}

        {/* Modais */}
        <SelectionModal
          isOpen={isSelectionModalOpen}
          flight={selectionModalFlight}
          onClose={() => setIsSelectionModalOpen(false)}
          onConfirm={() => {
            if (selectionModalFlight) {
              handleChooseOutbound(selectionModalFlight);
            }
            setIsSelectionModalOpen(false);
          }}
        />
        </div>
      </div>
    </div>
  );
};

export default FlightResults;
