import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import FlightResultCard from './FlightResultCard';
import InteractiveFilters from './InteractiveFilters';
import SelectionModal from './SelectionModal';
import ReturnFlightModal from './ReturnFlightModal';
import { useSelection, SelectionContext } from '../context/SelectionContext';
import { useNavigate } from 'react-router-dom';
import { getAirlineLogo, getDisplayAirlineName } from '../utils/airlineLogos';
import CompactFlightCard from './CompactFlightCard';
import moblixApiService from '../services/moblixApiService';
import { logger } from '../utils/logger';
import { getAirlineLinks, normalizeAirlineName } from '../data/airlineLinks';

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
  airline?: string; // Opcional - usado apenas quando enableAirlineFilter=true
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
  returnFlights?: Flight[]; // 🆕 Nova prop para voos de volta
  searchParams: SearchParams;
  onNewSearch: () => void;
  onFlightSelect?: (flight: Flight, type: 'outbound' | 'return') => void;
  onFiltersChange?: (newParams: Partial<SearchParams>) => void;
  onNewSearchWithFilters?: (newParams: SearchParams) => void;
  isSearching?: boolean;
  isReturnSection?: boolean;
  isFinalSummary?: boolean;
  hideFilters?: boolean;

  // NOVAS PROPS para controlar comportamentos específicos
  variant?: 'home' | 'search';
  enablePreFetch?: boolean;
  enableAdvancedSorting?: boolean;
  enableAirlineFilter?: boolean;
  showCompactCard?: boolean;
}

interface SelectedFlights {
  outbound: Flight | null;
  return: Flight | null;
}

const FlightResults: React.FC<FlightResultsProps> = ({
  flights,
  returnFlights, // 🆕 Nova prop
  searchParams,
  onNewSearch,
  onFlightSelect,
  onFiltersChange,
  onNewSearchWithFilters,
  isSearching = false,
  isReturnSection = false,
  isFinalSummary = false,
  hideFilters = false,

  // Valores padrão para novas props
  variant = 'search',
  enablePreFetch = false,
  enableAdvancedSorting = false,
  enableAirlineFilter = false,
  showCompactCard = false
}) => {
  // Estado global de seleção
  const { selected: selectedFlights, setOutbound, setReturn, clear } = useSelection();

  const navigate = useNavigate();

  // Estados locais (declarados antes de serem usados)
  const [displayedFlights, setDisplayedFlights] = useState<Flight[]>([]);
  const [isSelectingReturn, setIsSelectingReturn] = useState(false);
  const [internalReturnFlights, setInternalReturnFlights] = useState<Flight[]>([]);
  const [selectedOutboundForReturn, setSelectedOutboundForReturn] = useState<Flight | null>(null);
  const [shouldAutoOpenReturnModal, setShouldAutoOpenReturnModal] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [showFinalSelection, setShowFinalSelection] = useState(false);

  // 🆕 STATE MACHINE - Determina automaticamente qual etapa estamos e quais voos mostrar
  const flightState = useMemo(() => {
    // ETAPA 3: Resumo Final (ambos selecionados)
    if (selectedFlights.outbound && selectedFlights.return) {
      return {
        step: 'summary' as const,
        flights: [],
        showSummary: true,
        isSelectingOutbound: false,
        isSelectingReturn: false
      };
    }

    // ETAPA 2: Selecionando volta (ida já selecionada + temos voos de volta)
    if (selectedFlights.outbound && !selectedFlights.return) {
      const returnFlightsToUse = returnFlights || internalReturnFlights;
      if (returnFlightsToUse && returnFlightsToUse.length > 0) {
        return {
          step: 'return' as const,
          flights: returnFlightsToUse,
          showSummary: false,
          isSelectingOutbound: false,
          isSelectingReturn: true
        };
      }
    }

    // ETAPA 1: Selecionando ida (estado inicial)
    return {
      step: 'outbound' as const,
      flights: flights,
      showSummary: false,
      isSelectingOutbound: true,
      isSelectingReturn: false
    };
  }, [selectedFlights.outbound, selectedFlights.return, flights, returnFlights, internalReturnFlights]);

  // 🔍 DEBUG - Log dos estados principais (apenas se variant="home")
  useEffect(() => {
    if (variant === 'home') {
      logger.debug('DEBUG - Estados atuais:', {
        hasOutbound: !!selectedFlights.outbound,
        hasReturn: !!selectedFlights.return,
        outboundAirline: selectedFlights.outbound?.airline || 'N/A',
        returnAirline: selectedFlights.return?.airline || 'N/A',
        shouldShowSummary: !!(selectedFlights.outbound && selectedFlights.return)
      });
    }
  }, [variant, selectedFlights.outbound, selectedFlights.return]);

  // 🔍 DEBUG - Log específico da condição de renderização do resumo
  useEffect(() => {
    const shouldShow = !!(selectedFlights.outbound && selectedFlights.return);
    logger.debug('🔍 RESUMO DEBUG:', {
      showFinalSelection,
      hasOutbound: !!selectedFlights.outbound,
      hasReturn: !!selectedFlights.return,
      shouldShowSummary: shouldShow,
      selectedFlights: {
        outbound: selectedFlights.outbound ? 'exists' : 'null',
        return: selectedFlights.return ? 'exists' : 'null'
      }
    });
  }, [selectedFlights.outbound, selectedFlights.return, showFinalSelection]);

  // 🔥 DEBUG - Rastrear re-renderizações do FlightResults
  useEffect(() => {
    console.log('🔥 FLIGHTRESULTS - RENDERIZOU com selectedFlights:', {
      outbound: selectedFlights.outbound?.airline || 'NULL',
      return: selectedFlights.return?.airline || 'NULL',
      outboundPrice: selectedFlights.outbound?.totalPrice || 'N/A',
      returnPrice: selectedFlights.return?.totalPrice || 'N/A',
      timestamp: new Date().toISOString()
    });
  }, [selectedFlights]);

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
        logger.debug(`Summary Debug - ${label}: vazio/null`);
        return;
      }
      const segs = Array.isArray(flight.segments) ? flight.segments : [];
      const first = segs[0] || {};
      const last = segs.length ? segs[segs.length - 1] : {};
      logger.debug(`Summary Debug - ${label}:`, {
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
      logger.error(`Summary Debug - ${label}: erro ao inspecionar`, e);
    }
  };

  // Logar sempre que as seleções mudarem
  useEffect(() => {
    if (selectedFlights.outbound) debugFlight('OUTBOUND', selectedFlights.outbound);
    if (selectedFlights.return) debugFlight('RETURN', selectedFlights.return);
  }, [selectedFlights.outbound, selectedFlights.return]);

  // Helper: Converter duração string "2h 30m" para minutos
  const parseDurationToMinutes = (durationStr: string): number => {
    if (!durationStr || durationStr === 'N/A') return 999999; // Valor alto para ordenação

    try {
      const hoursMatch = durationStr.match(/(\d+)h/);
      const minutesMatch = durationStr.match(/(\d+)m/);

      const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

      return (hours * 60) + minutes;
    } catch {
      return 999999; // Valor alto para ordenação em caso de erro
    }
  };

  // Ordenar voos baseado no filtro selecionado (condicional: avançado vs simples)
  const sortedFlights = useMemo(() => {
    if (enableAdvancedSorting) {
      // ORDENAÇÃO AVANÇADA (variant="home")
      return [...flights].sort((a, b) => {
        const priceA = a.priceWithTax || a.price || a.totalPrice || 0;
        const priceB = b.priceWithTax || b.price || b.totalPrice || 0;

        if (searchParams.orderBy === 'preco') {
          // Mais barato: ordenar por preço (menor primeiro)
          return priceA - priceB;
        }

        if (searchParams.orderBy === 'tempo') {
          // Mais rápido: ordenar por duração (menor primeiro)
          const durationA = parseDurationToMinutes(a.segments?.[0]?.duration || '');
          const durationB = parseDurationToMinutes(b.segments?.[0]?.duration || '');
          return durationA - durationB;
        }

        if (searchParams.orderBy === 'custo-beneficio') {
          // Melhor custo-benefício: menor ratio preço/tempo
          const durationA = parseDurationToMinutes(a.segments?.[0]?.duration || '');
          const durationB = parseDurationToMinutes(b.segments?.[0]?.duration || '');

          // Evitar divisão por zero
          if (durationA === 0 || durationB === 0) {
            return priceA - priceB; // Fallback para preço
          }

          const ratioA = priceA / durationA;
          const ratioB = priceB / durationB;
          return ratioA - ratioB;
        }

        // Fallback: ordenar por preço
        return priceA - priceB;
      });
    } else {
      // ORDENAÇÃO SIMPLES (variant="search")
      return [...flights].sort((a, b) => {
        const priceA = a.priceWithTax || a.price || a.totalPrice || 0;
        const priceB = b.priceWithTax || b.price || b.totalPrice || 0;
        return priceA - priceB;
      });
    }
  }, [flights, searchParams.orderBy, enableAdvancedSorting]);

  // Filtrar por CIA Aérea se selecionada (condicional)
  const filteredByAirline = useMemo(() => {
    if (!enableAirlineFilter || !searchParams.airline || searchParams.airline === 'todas') {
      return sortedFlights;
    }

    logger.debug('Filtrando por CIA Aérea:', searchParams.airline);

    return sortedFlights.filter(flight => {
      // Tentar extrair nome da companhia de diferentes campos possíveis
      const airlineName = (flight as any).validatingBy?.name ||
                         flight.airline ||
                         (flight as any).CompanhiaAerea ||
                         (flight as any).segments?.[0]?.legs?.[0]?.operatedBy?.name ||
                         (flight as any).segments?.[0]?.legs?.[0]?.managedBy?.name;

      const matches = airlineName === searchParams.airline;

      if (matches) {
        logger.debug('Voo match:', { airlineName, flight: flight.numeroVoo });
      }

      return matches;
    });
  }, [sortedFlights, searchParams.airline, enableAirlineFilter]);

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

  // ✅ ESTADOS PARA PRE-FETCH DE VOOS DE VOLTA (apenas se enablePreFetch=true)
  const [voosVoltaPrefetched, setVoosVoltaPrefetched] = useState<Flight[]>([]);
  const returnFlightsPrefetched = useRef(false);
  const [isPrefetchingReturn, setIsPrefetchingReturn] = useState(false);

  // 🚀 AUTO MODAL: Desabilitado - usando inline replacement
  useEffect(() => {
    // Modal automático desabilitado para usar inline replacement
    if (shouldAutoOpenReturnModal) {
      setShouldAutoOpenReturnModal(false); // Reset flag
    }
  }, [shouldAutoOpenReturnModal]);

  // 🔄 RESET: Quando novos voos chegam, reseta a exibição com ordenação
  useEffect(() => {
    // ✅ CRITICAL: Não resetar se ambos os voos já foram selecionados (ida e volta)
    if (selectedFlights.outbound && selectedFlights.return) {
      logger.debug('PROTEÇÃO FORTE: Ambos voos selecionados - NUNCA resetar');
      return;
    }

    // ✅ CRITICAL: Não resetar se showFinalSelection está ativo (resultado final)
    if (showFinalSelection) {
      logger.debug('PROTEÇÃO: useEffect bloqueado - showFinalSelection ativo');
      return;
    }

    // ✅ CRITICAL: Não resetar se estamos selecionando voos de volta
    if (isSelectingReturn && internalReturnFlights.length > 0) {
      logger.debug('PROTEÇÃO: Selecionando volta - não resetar');
      return;
    }

    // Reset selection state when new flights arrive (ensure we start with outbound flights)
    // Only reset if we're not in the middle of selecting return flights
    if (!isSelectingReturn) {
      setIsSelectingReturn(false);
      setInternalReturnFlights([]);
    }

    // Helper function to apply airline filter
    const applyAirlineFilter = (flightsList: Flight[]) => {
      if (!enableAirlineFilter || !searchParams.airline || searchParams.airline === 'todas') {
        return flightsList;
      }
      return flightsList.filter(flight => {
        const airlineName = (flight as any).validatingBy?.name ||
                           flight.airline ||
                           (flight as any).CompanhiaAerea ||
                           (flight as any).segments?.[0]?.legs?.[0]?.operatedBy?.name ||
                           (flight as any).segments?.[0]?.legs?.[0]?.managedBy?.name;
        return airlineName === searchParams.airline;
      });
    };

    // Apply airline filter to all flights first
    const airlineFilteredFlights = applyAirlineFilter(flights);

    // ✅ CRITICAL FIX: SEMPRE preservar AMBOS os tipos quando o filtro está definido como "ambos"
    const isShowingBothTypes = searchParams.tipoPagamento === 'ambos';

    if (isShowingBothTypes) {
      // 📊 MODO DUAS COLUNAS: Separar dinheiro e milhas MAS PRESERVAR AMBOS
      const flightsMoney = airlineFilteredFlights.filter(f => !f.isMiles).sort((a, b) => {
        const priceA = a.priceWithTax || a.price || a.totalPrice || 0;
        const priceB = b.priceWithTax || b.price || b.totalPrice || 0;
        return priceA - priceB;
      });

      const flightsMiles = airlineFilteredFlights.filter(f => f.isMiles).sort((a, b) => {
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
          logger.warn('Erro ao ler originalPurchase:', error);
        }

        return true; // Padrão: dinheiro primeiro
      })();

      // ✅ CRÍTICO: Aplicar filtros apenas quando tipoPagamento NÃO é "ambos"
      let filteredFlights = airlineFilteredFlights;
      if (searchParams.tipoPagamento === 'dinheiro') {
        filteredFlights = airlineFilteredFlights.filter(f => !f.isMiles);
        logger.debug('Filtrando apenas voos em DINHEIRO:', filteredFlights.length);
      } else if (searchParams.tipoPagamento === 'milhas') {
        filteredFlights = airlineFilteredFlights.filter(f => f.isMiles);
        logger.debug('Filtrando apenas voos em MILHAS:', filteredFlights.length);
      } else {
        // Caso padrão: manter todos os voos
        logger.debug('Mantendo TODOS os tipos de voo:', filteredFlights.length);
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

      logger.debug('Voos filtrados e ordenados:', {
        tipoFiltro: searchParams.tipoPagamento,
        total: sortedFlights.length,
        primeiro: sortedFlights[0] ? (!sortedFlights[0].isMiles ? 'dinheiro' : 'milhas') : 'nenhum'
      });

      // Mostrar apenas os 10 primeiros inicialmente quando há filtro específico
      setDisplayedFlights(filteredByAirline.slice(0, 10));
    }

    setCurrentPage(0);
    setIsLoadingMore(false);
    // Resetar paginação por seção (dinheiro e milhas)
    setMoneyPage(0);
    setMilesPage(0);

    // Quando estamos selecionando a VOLTA, os voos recebidos são os de volta da API
    if (isSelectingReturn && !showFinalSelection) {
      setInternalReturnFlights(flights);
    }

    // 🔁 Após busca da VOLTA: apenas orientar o usuário, sem auto-selecionar voos
    try {
      if (isReturnSection && !showFinalSelection) {
        const shouldReopen = localStorage.getItem('reopenSelectionAfterSearch') === 'true';
        if (shouldReopen && flights && flights.length > 0) {
          // Limpa a flag e orienta o usuário a escolher manualmente
          localStorage.removeItem('reopenSelectionAfterSearch');
          logger.info('Retorno disponível. Aguarde o usuário escolher o voo de volta.');
        }
      }
    } catch {}
  }, [flights, selectedFlights.outbound, searchParams.tipoPagamento, searchParams.airline, showFinalSelection, enableAirlineFilter]); // removido isSelectingReturn para evitar loop

  // ✅ PRE-FETCH AUTOMÁTICO: Buscar voos de volta em background (condicional)
  useEffect(() => {
    if (!enablePreFetch) return; // Skip se pre-fetch não estiver habilitado

    const prefetchReturnFlights = async () => {
      // Condições para executar pre-fetch:
      // 1. Temos voos de ida carregados
      // 2. É ida e volta (não somente ida)
      // 3. Ainda não fizemos pre-fetch
      // 4. Não estamos em seleção final
      if (
        flights.length > 0 &&
        !searchParams.soIda &&
        !returnFlightsPrefetched.current &&
        !showFinalSelection
      ) {
        logger.debug('[PRE-FETCH] Iniciando busca automática de voos de volta em background...');
        setIsPrefetchingReturn(true);

        try {
          // Extrair código IATA do formato "Cidade (IATA)"
          const extractIATA = (cityString: string): string => {
            if (!cityString) return '';
            const parenMatch = cityString.match(/\(([A-Z]{3})\)/);
            if (parenMatch && parenMatch[1]) {
              return parenMatch[1].trim().toUpperCase();
            }
            if (cityString.includes(' - ')) {
              return cityString.split(' - ')[0].trim().toUpperCase();
            }
            if (/^[A-Za-z]{3}$/.test(cityString.trim())) {
              return cityString.trim().toUpperCase();
            }
            return cityString.trim().toUpperCase();
          };

          // Preparar parâmetros para voo de volta (INVERTER origem/destino)
          const returnParams = {
            origem: extractIATA(searchParams.destino), // INVERTIDO
            destino: extractIATA(searchParams.origem),  // INVERTIDO
            ida: searchParams.volta || searchParams.ida, // Data de volta como nova ida
            adultos: searchParams.adultos || 1,
            criancas: searchParams.criancas || 0,
            bebes: searchParams.bebes || 0,
            companhia: searchParams.companhia || -1,
            classe: searchParams.classe || 'economica',
            soIda: true // Buscar só ida (que será a volta)
          };

          logger.debug('[PRE-FETCH] Parâmetros invertidos:', returnParams);

          // Buscar voos de volta com timeout de 10 segundos
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 10000)
          );

          const apiPromise = moblixApiService.consultarVoos(returnParams);

          const apiResponse = await Promise.race([apiPromise, timeoutPromise]);

          if (apiResponse?.flights && Array.isArray(apiResponse.flights) && apiResponse.flights.length > 0) {
            // Processar voos de volta
            const processedReturnFlights = apiResponse.flights.map((flight: any, index: number) => ({
              ...flight,
              flightId: flight.flightId || `return_prefetch_${index}`,
              flightDirection: 'return',
              isReturnFlight: true
            }));

            logger.success(`[PRE-FETCH] ${processedReturnFlights.length} voos de volta pré-carregados com sucesso!`);
            setVoosVoltaPrefetched(processedReturnFlights);
            returnFlightsPrefetched.current = true;
          } else {
            logger.warn('[PRE-FETCH] API não retornou voos de volta');
          }
        } catch (error) {
          logger.warn('[PRE-FETCH] Erro ao buscar voos de volta (não crítico):', error);
          // Não bloquear UI - usuário poderá buscar manualmente depois
        } finally {
          setIsPrefetchingReturn(false);
        }
      }
    };

    prefetchReturnFlights();
  }, [flights, searchParams.soIda, showFinalSelection, enablePreFetch]);

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
    // Normalize airline name and get links
    const normalizedName = normalizeAirlineName(flight.airline);
    const airlineLinks = getAirlineLinks(normalizedName);

    if (!airlineLinks) {
      console.warn(`No links found for airline: ${flight.airline}`);
      // Fallback to existing function
      const fallbackUrl = getAirlineWebsite(flight.airline || '');
      if (typeof window !== 'undefined') window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Use 'redeem' link for miles flights, 'search' for cash flights
    const targetUrl = flight.isMiles ? airlineLinks.redeem : airlineLinks.search;

    console.log(`Opening ${flight.isMiles ? 'redeem' : 'search'} URL for ${normalizedName}: ${targetUrl}`);
    if (typeof window !== 'undefined') window.open(targetUrl, '_blank', 'noopener,noreferrer');
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

    const newFlights = filteredByAirline.slice(startIndex, endIndex);
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
    setDisplayedFlights(filteredByAirline);
    setCurrentPage(Math.ceil(filteredByAirline.length / flightsPerPage) - 1);
  };

  // Check if there are more flights to load
  const hasMoreFlights = () => {
    return displayedFlights.length < filteredByAirline.length;
  };

  // Check if we should show "Load All" option (for small lists)
  const shouldShowLoadAll = () => {
    const remaining = filteredByAirline.length - displayedFlights.length;
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

  // Nova função para lidar com a escolha do voo de ida (condicional: com ou sem pre-fetch)
  const handleChooseOutbound = async (flight: Flight) => {
    logger.debug('handleChooseOutbound INICIADO:', flight?.airline);
    logger.debug('setOutbound function:', typeof setOutbound);
    logger.debug('[SELEÇÃO] Voo de ida escolhido:', flight);

    // Se a busca é SOMENTE IDA
    if (searchParams.soIda) {
      setOutbound(flight);
      logger.success('setOutbound EXECUTADO (somente ida)');
      setReturn(null);
      setIsSelectingReturn(false);
      onFlightSelect?.(flight, 'outbound');
      navigate('/#resumo');
      return;
    }

    // Para IDA E VOLTA: selecionar voo de ida
    setOutbound(flight);
    logger.success('setOutbound EXECUTADO (ida e volta)');
    setSelectedOutboundForReturn(flight);
    setIsSelectionModalOpen(false);
    setSelectionModalFlight(null);

    // ✅ COMPORTAMENTO CONDICIONAL: Pre-fetch vs Busca em tempo real
    if (enablePreFetch && voosVoltaPrefetched.length > 0) {
      // VARIANT="HOME": Usar voos de volta pré-carregados (INSTANTÂNEO)
      logger.success(`[INLINE] Usando ${voosVoltaPrefetched.length} voos de volta PRÉ-CARREGADOS (instantâneo)`);

      setInternalReturnFlights(voosVoltaPrefetched);
      setIsSelectingReturn(true);
      setDisplayedFlights(voosVoltaPrefetched);

      // Scroll suave para o topo
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      // VARIANT="SEARCH" OU FALLBACK: Buscar voos de volta agora
      logger.debug('[FALLBACK] Pre-fetch não disponível, buscando voos de volta agora...');

      try {
        const extractIATA = (cityString: string): string => {
          if (!cityString) return '';
          const parenMatch = cityString.match(/\(([A-Z]{3})\)/);
          if (parenMatch && parenMatch[1]) return parenMatch[1].trim().toUpperCase();
          if (cityString.includes(' - ')) return cityString.split(' - ')[0].trim().toUpperCase();
          if (/^[A-Za-z]{3}$/.test(cityString.trim())) return cityString.trim().toUpperCase();
          return cityString.trim().toUpperCase();
        };

        const returnParams = {
          origem: extractIATA(searchParams.destino),
          destino: extractIATA(searchParams.origem),
          ida: searchParams.volta || searchParams.ida,
          adultos: searchParams.adultos || 1,
          criancas: searchParams.criancas || 0,
          bebes: searchParams.bebes || 0,
          companhia: searchParams.companhia || -1,
          classe: searchParams.classe || 'economica',
          soIda: true
        };

        const apiResponse = await moblixApiService.consultarVoos(returnParams);

        if (apiResponse?.flights && apiResponse.flights.length > 0) {
          const processedFlights = apiResponse.flights.map((f: any, i: number) => ({
            ...f,
            flightId: f.flightId || `return_fallback_${i}`,
            flightDirection: 'return',
            isReturnFlight: true
          }));

          setInternalReturnFlights(processedFlights);
          setIsSelectingReturn(true);
          setDisplayedFlights(processedFlights);
        }
      } catch (error) {
        logger.error('[FALLBACK] Erro ao buscar voos de volta:', error);
      }
    }

    onFlightSelect?.(flight, 'outbound');
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
    logger.debug('handleChooseReturn INICIADO:', flight?.airline);
    logger.debug('setReturn function:', typeof setReturn);
    logger.debug('Selecionando voo de volta:', flight);

    // Definir os voos finais PRIMEIRO, antes de limpar os estados
    const outboundFlight = selectedFlights.outbound;
    if (outboundFlight) {
      logger.success('Definindo voos finais', { ida: outboundFlight, volta: flight });

      // CRÍTICO: Atualizar todos os estados SINCRONAMENTE para ir direto ao modal final
      setReturn(flight);
      logger.success('setReturn EXECUTADO');
      setShowFinalSelection(true);
      setIsSelectingReturn(false);
      setInternalReturnFlights([]);
      setSelectedOutboundForReturn(null);

      // FORÇAR exibição do modal final imediatamente
      setDisplayedFlights([outboundFlight, flight]);

      logger.success('RESULTADO FINAL ATIVADO: showFinalSelection=true, displayedFlights=[ida,volta]');
      logger.success('ESTADO FINAL: isSelectingReturn=false, showFinalSelection=true');

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

  // Handle flight selection - AGORA PROCESSA DIFERENTES TIPOS DE EVENTOS
  const handleFlightSelect = async (flightOrEvent: Flight | any) => {
    logger.debug('FlightResults - handleFlightSelect chamado:', flightOrEvent);

    // Verificar se é um evento especial (com type) ou um voo normal
    if (flightOrEvent && typeof flightOrEvent === 'object' && flightOrEvent.type) {
      const event = flightOrEvent;

      switch (event.type) {
        case 'CHOOSE_OUTBOUND':
          // Lidar com escolha de voo de ida do botão "Escolher"
          logger.debug('Processando escolha de voo de ida via botão Escolher');
          handleChooseOutbound(event.flight);
          break;
        case 'CHOOSE_RETURN':
          logger.debug('Processando escolha de voo de volta via botão Escolher');
          handleChooseReturn(event.flight);
          break;

        case 'SEARCH_RETURN_FLIGHTS':
          logger.debug('Iniciando busca de voos de volta...', event.searchParams);
          logger.debug('Preço do voo de ida selecionado:', event.originalPurchase?.price);

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

          logger.debug('Preço mínimo numérico para voos de volta:', precoMinimoNumerico);

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
          logger.success('Mostrando mensagem de sucesso:', event.message);
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              alert(`✨ ${event.message}`);
            }, 500);
          }
          break;

        default:
          logger.warn('Tipo de evento não reconhecido:', event.type);
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
        logger.debug('SELEÇÃO DIRETA DE VOLTA - TRANSIÇÃO AUTOMÁTICA');

        // Atualizar estados para transição automática
        setReturn(flight);
        setShowFinalSelection(true);
        setIsSelectingReturn(false);
        setInternalReturnFlights([]);
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
    setInternalReturnFlights([]);
    setShowFinalSelection(false); // Reset flag de seleção final
    setShouldAutoOpenReturnModal(false); // Reset flag do modal automático
  };

  // Get current flights to display based on selection state - MEMOIZED to prevent infinite loops
  const getCurrentFlights = useMemo(() => {
    // PRIORIDADE ABSOLUTA: Se ambos os voos estão selecionados, SEMPRE mostrar resultado final
    if (selectedFlights.outbound && selectedFlights.return) {
      logger.success('AMBOS VOOS SELECIONADOS - Mostrando resultado final');
      return [selectedFlights.outbound, selectedFlights.return];
    }

    // PRIORIDADE 1: Se estamos selecionando volta e temos voos de volta, mas NÃO temos volta selecionada
    const returnFlightsToUse = returnFlights || internalReturnFlights;
    if (isSelectingReturn && returnFlightsToUse.length > 0 && !selectedFlights.return) {
      logger.debug('Mostrando voos de volta para seleção');
      return returnFlightsToUse;
    }

    // PRIORIDADE 2: Caso padrão - mostrar voos de ida
    logger.debug('Mostrando voos de ida');
    return displayedFlights;
  }, [isSelectingReturn, returnFlights, internalReturnFlights, selectedFlights.outbound, selectedFlights.return, displayedFlights]);

  // Get current displayed flights
  const getCurrentDisplayedFlights = () => {
    // Se estamos selecionando volta, mostrar voos de volta
    const returnFlightsToUse = returnFlights || internalReturnFlights;
    if (isSelectingReturn && returnFlightsToUse.length > 0) {
      return returnFlightsToUse;
    }
    // Sempre mostrar voos de ida primeiro (displayedFlights são os voos originais)
    return displayedFlights;
  };

  // Handle filter changes
  const handleFiltersChange = (newFilterParams: any) => {
    logger.debug('Filtros alterados:', newFilterParams);
    onFiltersChange?.(newFilterParams);
  };

  // Handle new search with filters
  const handleNewSearchWithFilters = () => {
    logger.debug('Nova busca solicitada com filtros atuais');
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
      <div className="mx-auto px-6" style={{ maxWidth: '1600px' }}>
        {/* Filtros Interativos */}
        <InteractiveFilters
          searchParams={{
            adultos: searchParams.adultos,
            criancas: searchParams.criancas,
            bebes: searchParams.bebes,
            tipoPagamento: searchParams.tipoPagamento,
            orderBy: searchParams.orderBy,
            soIda: searchParams.soIda,
            airline: enableAirlineFilter ? searchParams.airline : undefined
          }}
          onFiltersChange={handleFiltersChange}
          onNewSearch={handleNewSearchWithFilters}
          isLoading={isSearching}
          flights={enableAirlineFilter ? flights : undefined}
        />

        {/* Header com resumo dos resultados */}
        <div className="bg-white p-6 mb-6">
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

          {flightState.showSummary ? (
            <>
              <div
                className="flex justify-between items-center mb-6"
                data-final-summary
              >
                <div>
                  <h2 className="text-2xl font-bold text-[#060D1C] mb-2">
                    ✈️ Voos Selecionados
                  </h2>
                  <p className="text-gray-600">Seus voos de ida e volta escolhidos</p>
                </div>

                <div className="flex space-x-2">
                  {(selectedFlights.outbound && !searchParams.soIda) && (
                    <button
                      onClick={resetSelection}
                      className="px-6 py-3 bg-[#E4E4E4] text-[#060D1C] rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Recomeçar seleção
                    </button>
                  )}
                  <button
                    onClick={onNewSearch}
                    className="px-6 py-3 bg-[#E4E4E4] text-[#060D1C] rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Nova Busca Completa
                  </button>
                </div>
              </div>

              {/* Resumo Final - Ida e Volta Selecionados */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Voo de Ida Section */}
                  <div className="space-y-4">
                    {/* Booking Button Above Card */}
                    {selectedFlights.outbound && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => goToAirlineSite(selectedFlights.outbound!)}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                          style={{ minHeight: '44px' }}
                        >
                          Emitir Passagem de Ida
                        </button>
                      </div>
                    )}

                    {/* Voo de Ida Card */}
                    <div className="bg-white rounded-lg shadow-lg border-2 border-[#F0C72F]">
                      <div className="bg-[#F0C72F] px-4 py-2 rounded-t-lg">
                        <h4 className="text-lg font-semibold text-[#060D1C] mb-3">
                          Voo de Ida
                        </h4>
                      </div>
                      {(selectedFlights.outbound || displayedFlights[0]) && (
                        <FlightResultCard
                          flight={selectedFlights.outbound || displayedFlights[0]}
                          isSelected={true}
                          fromLabel={getIata(searchParams.origem)}
                          toLabel={getIata(searchParams.destino)}
                          selectionMessage={''}
                          allFlights={filteredByAirline}
                          isRoundTrip={!searchParams.soIda}
                          isSelectingReturn={false}
                          selectedOutboundFlight={selectedFlights.outbound || displayedFlights[0]}
                          onChooseOutbound={undefined}
                          onChooseReturn={undefined}
                          isFinalSummary={true}
                        />
                      )}
                    </div>
                  </div>

                  {/* Voo de Volta Section */}
                  <div className="space-y-4">
                    {/* Booking Button Above Card */}
                    {selectedFlights.return && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => goToAirlineSite(selectedFlights.return!)}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                          style={{ minHeight: '44px' }}
                        >
                          Emitir Passagem de Volta
                        </button>
                      </div>
                    )}

                    {/* Voo de Volta Card */}
                    <div className="bg-white rounded-lg shadow-lg border-2 border-[#F0C72F]">
                      <div className="bg-[#F0C72F] px-4 py-2 rounded-t-lg">
                        <h4 className="text-lg font-semibold text-[#060D1C] mb-3">
                          Voo de Volta
                        </h4>
                      </div>
                      {(selectedFlights.return || displayedFlights[1]) && (
                        <FlightResultCard
                          flight={selectedFlights.return || displayedFlights[1]}
                          isSelected={true}
                          fromLabel={getIata(searchParams.destino)}
                          toLabel={getIata(searchParams.origem)}
                          selectionMessage={''}
                          allFlights={filteredByAirline}
                          isRoundTrip={!searchParams.soIda}
                          isSelectingReturn={false}
                          selectedOutboundFlight={selectedFlights.outbound || displayedFlights[0]}
                          onChooseOutbound={undefined}
                          onChooseReturn={undefined}
                          isFinalSummary={true}
                        />
                      )}
                    </div>
                  </div>

                </div>

                {/* Info text below cards */}
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    Você será redirecionado para o site oficial da companhia aérea para finalizar sua compra.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
                  {/* Header com título e botões */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {isSelectingReturn ? 'Voos de volta' : `${getCurrentFlights.length} voos encontrados`}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {isSelectingReturn
                          ? `${searchParams.destino} → ${searchParams.origem} • ${searchParams.volta || searchParams.ida}`
                          : `${searchParams.origem} → ${searchParams.destino} • ${searchParams.ida}`}
                        {searchParams.volta && !isSelectingReturn && ` • Volta: ${searchParams.volta}`}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {(selectedFlights.outbound && !searchParams.soIda) && (
                        <button
                          onClick={resetSelection}
                          className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Recomeçar
                        </button>
                      )}
                      <button
                        onClick={onNewSearch}
                        className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Nova busca
                      </button>
                    </div>
                  </div>

                  {/* REMOVED: Compact card showing selected IDA flight - cleaner UX without green box */}
                  {false && showCompactCard && isSelectingReturn && !showFinalSelection && selectedFlights.outbound && (
                    <div className="mb-6">
                      <CompactFlightCard
                        flight={selectedFlights.outbound}
                        onChangeClick={resetSelection}
                        fromLabel={getIata(searchParams.origem)}
                        toLabel={getIata(searchParams.destino)}
                      />

                      {/* Título da seção de voos de volta */}
                      <h2 className="text-2xl font-bold text-[#060D1C] mt-6 mb-4">
                        Escolha um voo de volta
                      </h2>
                    </div>
                  )}

                  {/* Clean section title for return flights */}
                  {isSelectingReturn && !showFinalSelection && selectedFlights.outbound && (
                    <h2 className="text-2xl font-bold text-[#060D1C] mb-6">
                      Escolha um voo de volta
                    </h2>
                  )}

                  {/* Grid de duas colunas: Dinheiro e Milhas */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Coluna 1: Voos em Dinheiro */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                        Dinheiro ({getCurrentFlights.filter((f: any) => !f.isMiles).length} voos)
                      </h3>
                      <div className="space-y-2">
                        {getCurrentFlights
                          .filter((f: any) => !f.isMiles)
                          .slice(currentPage * flightsPerPage, (currentPage + 1) * flightsPerPage)
                          .map((flight: any, index: number) => (
                            <FlightResultCard
                              key={`money-flight-${flight.rateToken || index}`}
                              flight={flight}
                              isSelected={false}
                              fromLabel={flight.segments?.[0]?.departure || (isSelectingReturn ? getIata(searchParams.destino) : getIata(searchParams.origem))}
                              toLabel={flight.segments?.[flight.segments.length - 1]?.arrival || (isSelectingReturn ? getIata(searchParams.origem) : getIata(searchParams.destino))}
                              selectionMessage={getSelectionMessage(flight)}
                              allFlights={filteredByAirline}
                              isRoundTrip={!searchParams.soIda}
                              isSelectingReturn={isSelectingReturn}
                              selectedOutboundFlight={selectedFlights.outbound}
                              onChooseOutbound={!isSelectingReturn && !selectedFlights.outbound ? handleChooseOutbound : undefined}
                              onChooseReturn={isSelectingReturn || (selectedFlights.outbound && !selectedFlights.return) ? handleChooseReturn : undefined}
                              isFinalSummary={!!(selectedFlights.outbound && selectedFlights.return)}
                            />
                          ))}
                      </div>

                    </div>

                    {/* Coluna 2: Voos em Milhas */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                        Milhas ({getCurrentFlights.filter((f: any) => f.isMiles).length} voos)
                      </h3>
                      <div className="space-y-2">
                        {getCurrentFlights
                          .filter((f: any) => f.isMiles)
                          .slice(currentPage * flightsPerPage, (currentPage + 1) * flightsPerPage)
                          .map((flight: any, index: number) => (
                            <FlightResultCard
                              key={`miles-flight-${flight.rateToken || index}`}
                              flight={flight}
                              isSelected={false}
                              fromLabel={flight.segments?.[0]?.departure || (isSelectingReturn ? getIata(searchParams.destino) : getIata(searchParams.origem))}
                              toLabel={flight.segments?.[flight.segments.length - 1]?.arrival || (isSelectingReturn ? getIata(searchParams.origem) : getIata(searchParams.destino))}
                              selectionMessage={getSelectionMessage(flight)}
                              allFlights={filteredByAirline}
                              isRoundTrip={!searchParams.soIda}
                              isSelectingReturn={isSelectingReturn}
                              selectedOutboundFlight={selectedFlights.outbound}
                              onChooseOutbound={!isSelectingReturn && !selectedFlights.outbound ? handleChooseOutbound : undefined}
                              onChooseReturn={isSelectingReturn || (selectedFlights.outbound && !selectedFlights.return) ? handleChooseReturn : undefined}
                              isFinalSummary={!!(selectedFlights.outbound && selectedFlights.return)}
                            />
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Paginação minimalista com números */}
                  {getCurrentFlights.length > flightsPerPage && (() => {
                    const totalPages = Math.ceil(getCurrentFlights.length / flightsPerPage);
                    const maxVisiblePages = 5;
                    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

                    // Ajustar startPage se estiver no final
                    if (endPage - startPage < maxVisiblePages - 1) {
                      startPage = Math.max(0, endPage - maxVisiblePages + 1);
                    }

                    const visiblePages = Array.from(
                      { length: endPage - startPage + 1 },
                      (_, i) => startPage + i
                    );

                    return (
                      <div className="mt-6 flex justify-center items-center gap-2">
                        {/* Botão Anterior */}
                        <button
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          disabled={currentPage === 0}
                          className="w-8 h-8 rounded-full text-sm transition-colors text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Página anterior"
                        >
                          ←
                        </button>

                        {/* Números de página */}
                        {visiblePages.map((i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`w-8 h-8 text-sm transition-colors ${
                              currentPage === i
                                ? 'font-bold text-[#4896C7]'
                                : 'text-gray-600 hover:text-[#4896C7]'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}

                        {/* Botão Próximo */}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                          disabled={currentPage === totalPages - 1}
                          className="w-8 h-8 rounded-full text-sm transition-colors text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Próxima página"
                        >
                          →
                        </button>
                      </div>
                    );
                  })()}
            </>
          )}

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
