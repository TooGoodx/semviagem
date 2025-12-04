import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Users, Plane, Calendar, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSelection } from '../context/SelectionContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import toast from 'react-hot-toast';
import moblixApiService from '../services/moblixApiService';
import FlightResults from '../components/FlightResultsHome';
import CustomCalendar from '../components/CustomCalendar';
import FlightLoadingOverlay from '../components/FlightLoadingOverlay';

// Interfaces
interface Airport {
  Iata: string;
  Nome: string;
  Pais: string;
  Cidade?: string;
  Grupo?: string;
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

const BuscarVoos: React.FC = () => {
  const { clear } = useSelection();
  const { isAuthenticated } = useAuth();
  const { isPremium } = useSubscription();

  // Estados para busca de voos
  const [isLoading, setIsLoading] = useState(false);
  const [showFlightResults, setShowFlightResults] = useState(false);
  const [outboundFlightResults, setOutboundFlightResults] = useState<any[]>([]);
  const [returnFlightResults, setReturnFlightResults] = useState<any[]>([]);

  const { selected: selectedFlights, setOutbound, setReturn, clear: clearSelection } = useSelection();
  const [airportSuggestions, setAirportSuggestions] = useState<{
    origin: Airport[];
    destination: Airport[];
  }>({ origin: [], destination: [] });

  const abortControllerRef = useRef<AbortController | null>(null);

  // ✅ NOVO: AbortController para cancelar busca de voos
  const searchAbortControllerRef = useRef<AbortController | null>(null);

  const [showAirportSuggestions, setShowAirportSuggestions] = useState<{
    origin: boolean;
    destination: boolean;
  }>({ origin: false, destination: false });

  const [isLoadingAirports, setIsLoadingAirports] = useState<{
    origin: boolean;
    destination: boolean;
  }>({ origin: false, destination: false });

  const [skipAutoSearch, setSkipAutoSearch] = useState<{
    origin: boolean;
    destination: boolean;
  }>({ origin: false, destination: false });

  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  const [showFullForm, setShowFullForm] = useState(false);

  const [calendarConfig, setCalendarConfig] = useState<{
    type: 'ida' | 'volta';
    show: boolean;
    title: string;
  }>({ type: 'ida', show: false, title: '' });

  const [searchParams, setSearchParams] = useState<SearchParams>({
    origem: '',
    destino: '',
    ida: '',
    volta: '',
    adultos: 1,
    criancas: 0,
    bebes: 0,
    companhia: -1,
    tipoPagamento: 'ambos',
    orderBy: 'preco',
    soIda: false,
    classe: 'economica'
  });

  const [showLoadingSidebar, setShowLoadingSidebar] = useState(false);

  // Auto-scroll to return flights after selecting outbound
  useEffect(() => {
    if (selectedFlights.outbound && returnFlightResults.length > 0) {
      const el = document.getElementById('return-flights');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedFlights.outbound, returnFlightResults.length]);

  useEffect(() => {
    const flag = localStorage.getItem('reopenSelectionAfterSearch');
    if (flag === 'true' && returnFlightResults.length > 0) {
      const el = document.getElementById('return-flights');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      try { localStorage.removeItem('reopenSelectionAfterSearch'); } catch {}
      toast.success('Agora escolha seu voo de volta.');
    }
  }, [returnFlightResults.length]);

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '';

    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);

      return date.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
      }).replace(',', '');
    } catch {
      return dateString;
    }
  };

  const handleCalendarDateSelect = (date: Date, type: 'ida' | 'volta') => {
    const formattedDate = date.toISOString().split('T')[0];

    if (type === 'ida') {
      setSearchParams(prev => ({ ...prev, ida: formattedDate }));

      // Se nova data de ida é posterior à volta, LIMPAR a volta
      if (!searchParams.soIda && searchParams.volta && formattedDate > searchParams.volta) {
        setSearchParams(prev => ({ ...prev, volta: '' }));
        toast('Data de ida atualizada. Por favor, selecione uma nova data de volta.', {
          icon: 'ℹ️',
          duration: 3000
        });
      }

      if (!searchParams.soIda) {
        setCalendarConfig(prev => ({
          ...prev,
          type: 'volta',
          title: 'Selecionar data de volta'
        }));
        return;
      }
    } else {
      if (searchParams.ida && formattedDate < searchParams.ida) {
        toast.error('A data de volta não pode ser anterior à data de ida.');
        return;
      }
      setSearchParams(prev => ({ ...prev, volta: formattedDate }));
    }

    setCalendarConfig(prev => ({ ...prev, show: false }));
  };

  const handleCalendarClose = () => {
    setCalendarConfig(prev => ({ ...prev, show: false }));
  };

  // Global airport database
  const globalAirports: Airport[] = [
    // BRASIL
    { Iata: 'GRU', Nome: 'Aeroporto Internacional de São Paulo/Guarulhos', Pais: 'Brasil', Cidade: 'São Paulo', Grupo: 'sao-paulo' },
    { Iata: 'CGH', Nome: 'Aeroporto de São Paulo/Congonhas', Pais: 'Brasil', Cidade: 'São Paulo', Grupo: 'sao-paulo' },
    { Iata: 'VCP', Nome: 'Aeroporto de Viracopos - Campinas', Pais: 'Brasil', Cidade: 'São Paulo', Grupo: 'sao-paulo' },
    { Iata: 'GIG', Nome: 'Aeroporto Internacional do Rio de Janeiro/Galeão', Pais: 'Brasil', Cidade: 'Rio de Janeiro', Grupo: 'rio-janeiro' },
    { Iata: 'SDU', Nome: 'Aeroporto Santos Dumont', Pais: 'Brasil', Cidade: 'Rio de Janeiro', Grupo: 'rio-janeiro' },
    { Iata: 'CNF', Nome: 'Aeroporto Internacional de Belo Horizonte/Confins', Pais: 'Brasil', Cidade: 'Belo Horizonte', Grupo: 'belo-horizonte' },
    { Iata: 'PLU', Nome: 'Aeroporto da Pampulha', Pais: 'Brasil', Cidade: 'Belo Horizonte', Grupo: 'belo-horizonte' },
    { Iata: 'BSB', Nome: 'Aeroporto Internacional de Brasília', Pais: 'Brasil', Cidade: 'Brasília' },
    { Iata: 'SSA', Nome: 'Aeroporto Internacional de Salvador', Pais: 'Brasil', Cidade: 'Salvador' },
    { Iata: 'FOR', Nome: 'Aeroporto Internacional de Fortaleza', Pais: 'Brasil', Cidade: 'Fortaleza' },
    { Iata: 'REC', Nome: 'Aeroporto Internacional do Recife', Pais: 'Brasil', Cidade: 'Recife' },
    { Iata: 'POA', Nome: 'Aeroporto Internacional de Porto Alegre', Pais: 'Brasil', Cidade: 'Porto Alegre' },
    { Iata: 'BEL', Nome: 'Aeroporto Internacional de Belém', Pais: 'Brasil', Cidade: 'Belém' },
    { Iata: 'MAO', Nome: 'Aeroporto Internacional Eduardo Gomes - Manaus', Pais: 'Brasil', Cidade: 'Manaus' },
    { Iata: 'CWB', Nome: 'Aeroporto Internacional Afonso Pena - Curitiba', Pais: 'Brasil', Cidade: 'Curitiba' },
    { Iata: 'VIX', Nome: 'Aeroporto de Vitória', Pais: 'Brasil', Cidade: 'Vitória' },
    { Iata: 'FLN', Nome: 'Aeroporto Internacional de Florianópolis', Pais: 'Brasil', Cidade: 'Florianópolis' },
    { Iata: 'NAT', Nome: 'Aeroporto Internacional de Natal', Pais: 'Brasil', Cidade: 'Natal' },

    // INTERNACIONAL
    { Iata: 'MAD', Nome: 'Aeroporto Adolfo Suárez Madrid-Barajas', Pais: 'Espanha' },
    { Iata: 'BCN', Nome: 'Aeroporto de Barcelona-El Prat', Pais: 'Espanha' },
    { Iata: 'LIS', Nome: 'Aeroporto Humberto Delgado - Lisboa', Pais: 'Portugal' },
    { Iata: 'OPO', Nome: 'Aeroporto Francisco Sá Carneiro - Porto', Pais: 'Portugal' },
    { Iata: 'CDG', Nome: 'Aeroporto Charles de Gaulle - Paris', Pais: 'França', Cidade: 'Paris', Grupo: 'paris' },
    { Iata: 'ORY', Nome: 'Aeroporto de Orly - Paris', Pais: 'França', Cidade: 'Paris', Grupo: 'paris' },
    { Iata: 'FCO', Nome: 'Aeroporto Leonardo da Vinci - Roma', Pais: 'Itália', Cidade: 'Roma', Grupo: 'roma' },
    { Iata: 'MXP', Nome: 'Aeroporto de Milão-Malpensa', Pais: 'Itália', Cidade: 'Milão', Grupo: 'milao' },
    { Iata: 'LHR', Nome: 'Aeroporto de Heathrow - Londres', Pais: 'Reino Unido', Cidade: 'Londres', Grupo: 'londres' },
    { Iata: 'LGW', Nome: 'Aeroporto de Gatwick - Londres', Pais: 'Reino Unido', Cidade: 'Londres', Grupo: 'londres' },
    { Iata: 'FRA', Nome: 'Aeroporto de Frankfurt am Main', Pais: 'Alemanha', Cidade: 'Frankfurt' },
    { Iata: 'AMS', Nome: 'Aeroporto Amsterdam Schiphol', Pais: 'Holanda', Cidade: 'Amsterdam' },
    { Iata: 'JFK', Nome: 'Aeroporto John F. Kennedy - Nova York', Pais: 'Estados Unidos', Cidade: 'Nova York', Grupo: 'nova-york' },
    { Iata: 'LAX', Nome: 'Aeroporto Internacional de Los Angeles', Pais: 'Estados Unidos', Cidade: 'Los Angeles', Grupo: 'los-angeles' },
    { Iata: 'MIA', Nome: 'Aeroporto Internacional de Miami', Pais: 'Estados Unidos', Cidade: 'Miami' },
    { Iata: 'EZE', Nome: 'Aeroporto Internacional Ezeiza - Buenos Aires', Pais: 'Argentina', Cidade: 'Buenos Aires', Grupo: 'buenos-aires' },
    { Iata: 'LIM', Nome: 'Aeroporto Internacional Jorge Chávez - Lima', Pais: 'Peru', Cidade: 'Lima' },
  ];

  const searchAirportsWithValue = useCallback(async (field: 'origin' | 'destination', searchValue: string) => {
    if (searchValue.length < 2) {
      setAirportSuggestions(prev => ({ ...prev, [field]: [] }));
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoadingAirports(prev => ({ ...prev, [field]: true }));

    try {
      const localFiltered = globalAirports.filter(airport =>
        airport.Nome.toLowerCase().includes(searchValue.toLowerCase()) ||
        airport.Iata.toLowerCase().includes(searchValue.toLowerCase()) ||
        airport.Pais.toLowerCase().includes(searchValue.toLowerCase()) ||
        (airport.Cidade && airport.Cidade.toLowerCase().includes(searchValue.toLowerCase()))
      );

      let finalResults: Airport[] = [];

      if (localFiltered.length > 0) {
        const groupedResults = localFiltered.sort((a, b) => {
          if (a.Cidade && !b.Cidade) return -1;
          if (!a.Cidade && b.Cidade) return 1;

          if (a.Cidade && b.Cidade) {
            if (a.Grupo && !b.Grupo) return -1;
            if (!a.Grupo && b.Grupo) return 1;

            if (a.Grupo && b.Grupo) {
              return a.Cidade.localeCompare(b.Cidade, 'pt-BR');
            }
          }

          return a.Nome.localeCompare(b.Nome, 'pt-BR');
        });

        finalResults = groupedResults.slice(0, 8);
      } else {
        try {
          if (signal.aborted) {
            return;
          }

          const apiResponse = await moblixApiService.buscarAeroportos(searchValue);

          if (signal.aborted) {
            return;
          }

          if (apiResponse && apiResponse.Data && Array.isArray(apiResponse.Data) && apiResponse.Data.length > 0) {
            finalResults = apiResponse.Data.map((airport: any) => ({
              Iata: airport.Iata,
              Nome: airport.Nome,
              Pais: airport.Pais,
              Cidade: airport.Cidade
            })).slice(0, 8);
          }
        } catch (apiError: any) {
          if (apiError.name === 'AbortError') {
            return;
          }
          console.warn('⚠️ Erro na API Moblix:', apiError);
        }
      }

      if (signal.aborted) {
        return;
      }

      setAirportSuggestions(prev => ({ ...prev, [field]: finalResults }));

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('❌ Erro geral na busca:', error);
      setAirportSuggestions(prev => ({ ...prev, [field]: [] }));
    } finally {
      if (!signal.aborted) {
        setIsLoadingAirports(prev => ({ ...prev, [field]: false }));
      }
    }
  }, []);

  const handleInputFocus = (field: 'origin' | 'destination') => {
    setShowAirportSuggestions(prev => ({ ...prev, [field]: true }));
    const searchValue = field === 'origin' ? searchParams.origem : searchParams.destino;
    if (searchValue.length >= 2) {
      searchAirportsWithValue(field, searchValue);
    }
  };

  const handleBlur = (field: 'origin' | 'destination') => {
    setTimeout(() => {
      setShowAirportSuggestions(prev => ({ ...prev, [field]: false }));
    }, 500);
  };

  const selectAirport = (airport: Airport, field: 'origin' | 'destination') => {
    const getCityFromAirportName = (name: string): string => {
      const specialCases: Record<string, string> = {
        'Santos Dumont': 'Rio de Janeiro',
        'Congonhas': 'São Paulo',
        'Guarulhos': 'São Paulo',
        'Galeão': 'Rio de Janeiro',
        'Confins': 'Belo Horizonte',
      };

      for (const [key, city] of Object.entries(specialCases)) {
        if (name.includes(key)) {
          return city;
        }
      }

      return airport.Cidade || airport.Pais;
    };

    const city = getCityFromAirportName(airport.Nome);
    const displayValue = `${city} (${airport.Iata})`;

    setShowAirportSuggestions(prev => ({ ...prev, [field]: false }));
    setSkipAutoSearch(prev => ({ ...prev, [field]: true }));

    const inputRef = field === 'origin' ? originInputRef : destinationInputRef;
    if (inputRef.current) {
      inputRef.current.value = displayValue;
    }

    if (field === 'origin') {
      setSearchParams(prev => ({ ...prev, origem: displayValue }));
    } else {
      setSearchParams(prev => ({ ...prev, destino: displayValue }));
    }

    setForceUpdateCounter(prev => prev + 1);

    setTimeout(() => {
      setSkipAutoSearch(prev => ({ ...prev, [field]: false }));
    }, 800);
  };

  const extractIataCode = (airportValue: string): string => {
    if (!airportValue) return '';

    const parenMatch = airportValue.match(/\(([A-Z]{3})\)/);
    if (parenMatch && parenMatch[1]) {
      return parenMatch[1].trim().toUpperCase();
    }

    if (airportValue.includes(' - ')) {
      return airportValue.split(' - ')[0].trim().toUpperCase();
    }

    if (/^[A-Za-z]{3}$/.test(airportValue.trim())) {
      return airportValue.trim().toUpperCase();
    }

    return '';
  };

  const normalizeFlights = (rawFlights: any[], paramsForNorm: SearchParams) => {
    if (!Array.isArray(rawFlights)) return [];

    const normalizedFlights = rawFlights.map((flight: any) => {
      let finalPrice = 0;
      let isMilesFlag = false;

      if (flight.PontosAdulto && typeof flight.PontosAdulto === 'number' && flight.PontosAdulto > 0) {
        finalPrice = flight.PontosAdulto;
        isMilesFlag = true;
      } else if (flight.segments?.[0]?.PontosAdulto && typeof flight.segments[0].PontosAdulto === 'number' && flight.segments[0].PontosAdulto > 0) {
        finalPrice = flight.segments[0].PontosAdulto;
        isMilesFlag = true;
      } else if (flight.fareGroup?.priceWithTax && typeof flight.fareGroup.priceWithTax === 'number' && flight.fareGroup.priceWithTax > 0) {
        finalPrice = flight.fareGroup.priceWithTax;
      } else if (flight.priceWithTax && typeof flight.priceWithTax === 'number' && flight.priceWithTax > 0) {
        finalPrice = flight.priceWithTax;
      } else if (flight.price && typeof flight.price === 'number' && flight.price > 0) {
        finalPrice = flight.price;
      } else {
        return null;
      }

      const firstSegment = flight.segments?.[0];
      const lastSegment = flight.segments?.[flight.segments.length - 1];
      const departure = firstSegment?.departure || flight.Origem || extractIataCode(paramsForNorm.origem) || 'GRU';
      const arrival = lastSegment?.arrival || flight.Destino || extractIataCode(paramsForNorm.destino) || 'CNF';

      let normalizedSegments: any[] = [];
      if (flight.segments && Array.isArray(flight.segments)) {
        normalizedSegments = flight.segments.map((segment: any) => ({
          ...segment,
          departure: segment.departure || segment.Origem || departure,
          arrival: segment.arrival || segment.Destino || arrival,
          departureDate: segment.departureDate,
          arrivalDate: segment.arrivalDate,
          duration: segment.duration || '2h 30m',
          legs: segment.legs || []
        }));
      }

      const extractedOrigem = flight.Origem || departure;
      const extractedDestino = flight.Destino || arrival;

      return {
        ...flight,
        price: finalPrice,
        priceWithTax: finalPrice,
        totalPrice: finalPrice,
        isMiles: isMilesFlag,
        departure: extractedOrigem,
        arrival: extractedDestino,
        Origem: extractedOrigem,
        Destino: extractedDestino,
        airline: flight.airline || flight.CompanhiaAerea || 'Companhia Aérea',
        CompanhiaAerea: flight.CompanhiaAerea || flight.airline || 'Companhia Aérea',
        NumeroVoo: flight.NumeroVoo || flight.numeroVoo || 'LA001',
        segments: normalizedSegments,
        numeroVoo: flight.numeroVoo || 'LA001'
      };
    }).filter((flight: any) => flight !== null);

    return normalizedFlights;
  };

  const performSearch = async (params: SearchParams) => {
    if (!params.soIda && params.volta && params.ida && params.volta < params.ida) {
      toast.error('A data de volta não pode ser anterior à data de ida.');
      return;
    }

    // ✅ NOVO: Cancelar busca anterior se existir
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }

    // ✅ NOVO: Criar novo AbortController para esta busca
    searchAbortControllerRef.current = new AbortController();
    const signal = searchAbortControllerRef.current.signal;

    setIsLoading(true);
    setShowLoadingSidebar(true);

    try {
      const origemIata = extractIataCode(params.origem) || params.origem?.toUpperCase();
      const destinoIata = extractIataCode(params.destino) || params.destino?.toUpperCase();

      if (params.soIda || !params.volta) {
        const resultIda = await moblixApiService.consultarVoos({
          origem: origemIata,
          destino: destinoIata,
          ida: params.ida,
          adultos: params.adultos,
          criancas: params.criancas,
          bebes: params.bebes,
          companhia: -1,
          tipoPagamento: params.tipoPagamento,
          classe: params.classe
        }, signal); // ✅ NOVO: Passa signal para permitir cancelamento

        const rawOut = Array.isArray(resultIda?.flights) ? resultIda.flights :
                       Array.isArray(resultIda) ? resultIda :
                       (resultIda?.Data?.[0]?.flights ?? resultIda?.Data?.[0]?.Ida ?? resultIda?.Data ?? []);

        const normalizedOut = normalizeFlights(rawOut, params);

        setOutboundFlightResults(normalizedOut);
        setReturnFlightResults([]);
        setShowFlightResults(true);

        if (normalizedOut.length === 0) {
          toast('Nenhum voo encontrado para os critérios selecionados.', { icon: 'ℹ️', duration: 4000 });
        } else {
          toast.success('Resultados atualizados!');
        }
        return;
      }

      const [outcomeIda, outcomeVolta] = await Promise.allSettled([
        moblixApiService.consultarVoos({
          origem: origemIata,
          destino: destinoIata,
          ida: params.ida,
          adultos: params.adultos,
          criancas: params.criancas,
          bebes: params.bebes,
          companhia: -1,
          tipoPagamento: params.tipoPagamento,
          classe: params.classe
        }, signal), // ✅ NOVO: Passa signal para permitir cancelamento
        moblixApiService.consultarVoos({
          origem: destinoIata,
          destino: origemIata,
          ida: params.volta,
          adultos: params.adultos,
          criancas: params.criancas,
          bebes: params.bebes,
          companhia: -1,
          tipoPagamento: params.tipoPagamento,
          classe: params.classe
        }, signal) // ✅ NOVO: Passa signal para permitir cancelamento
      ]);

      const resultIda = outcomeIda.status === 'fulfilled' ? outcomeIda.value : null;
      const resultVolta = outcomeVolta.status === 'fulfilled' ? outcomeVolta.value : null;

      const rawOut = Array.isArray(resultIda?.flights) ? resultIda.flights :
                     Array.isArray(resultIda) ? resultIda :
                     (resultIda?.Data?.[0]?.flights ?? resultIda?.Data?.[0]?.Ida ?? resultIda?.Data ?? []);

      const normalizedOut = normalizeFlights(rawOut, params);

      const rawRet = Array.isArray(resultVolta?.flights) ? resultVolta.flights :
                     Array.isArray(resultVolta) ? resultVolta :
                     (resultVolta?.Data?.[0]?.flights ?? resultVolta?.Data?.[0]?.Ida ?? resultVolta?.Data ?? []);

      const normalizedRet = normalizeFlights(rawRet, {
        ...params,
        origem: params.destino,
        destino: params.origem,
        ida: params.volta,
        volta: ''
      });

      setOutboundFlightResults(normalizedOut);
      setReturnFlightResults(normalizedRet);
      setShowFlightResults(true);

      const noOutbound = normalizedOut.length === 0;
      const noReturn = normalizedRet.length === 0;
      if (noOutbound && noReturn) {
        toast('Nenhum voo encontrado para os critérios selecionados.', { icon: 'ℹ️', duration: 4000 });
      } else {
        toast.success('Resultados atualizados!');
      }
    } catch (error: any) {
      // ✅ NOVO: Tratar cancelamento silenciosamente
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        console.log('🚫 Busca cancelada pelo usuário');
        return; // Sair silenciosamente, sem toast
      }

      // Erro real - manter comportamento original
      console.error('❌ Erro na busca:', error);
      toast.error(`Erro ao buscar voos: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setShowLoadingSidebar(false);
      }, 800);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      clear();
      localStorage.removeItem('flightSelections');
      localStorage.removeItem('originalPurchase');
      localStorage.removeItem('precoMinimoVolta');
      localStorage.removeItem('reopenSelectionAfterSearch');
    } catch {}

    setShowFlightResults(false);
    setOutboundFlightResults([]);
    setReturnFlightResults([]);
    clearSelection();

    await performSearch(searchParams);
  };

  const handleNewSearch = () => {
    try {
      clear();
      localStorage.removeItem('flightSelections');
      localStorage.removeItem('originalPurchase');
      localStorage.removeItem('precoMinimoVolta');
      localStorage.removeItem('reopenSelectionAfterSearch');
    } catch {}

    setShowFlightResults(false);
    setOutboundFlightResults([]);
    setReturnFlightResults([]);
    clearSelection();
    setIsLoading(false);
    setShowLoadingSidebar(false);

    setTimeout(() => {
      setShowFlightResults(false);
      clearSelection();
    }, 100);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFlightSelect = (flight: any, type: 'outbound' | 'return') => {
    if (type === 'outbound') {
      setOutbound(flight);
      toast.success('Voo de ida selecionado! Agora escolha seu voo de volta.');
    } else if (type === 'return') {
      setReturn(flight);
      toast.success('Voos selecionados com sucesso!');
    }
  };

  const handleFiltersChange = (newFilterParams: Partial<SearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...newFilterParams
    }));
  };

  const handleNewSearchWithFilters = (currentParams: SearchParams) => {
    setSearchParams(currentParams);
    setTimeout(() => {
      handleFormSubmit(new Event('submit') as any);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2f6] pb-16">
      {isLoading && <FlightLoadingOverlay />}

      <div className="container mx-auto px-8 sm:px-12 lg:px-16 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Card de Busca */}
          <Card className="bg-white shadow-2xl border-0 rounded-3xl">
            <CardContent className="p-10 md:p-12">
              <form onSubmit={handleFormSubmit}>
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-left">Para onde você quer ir?</h3>

                  {/* Toggle Ida e Volta / Somente Ida */}
                  <div className="flex items-center space-x-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setSearchParams(prev => ({ ...prev, soIda: false }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        !searchParams.soIda
                          ? 'text-white border-2'
                          : 'text-white hover:opacity-80'
                      }`}
                      style={{
                        backgroundColor: !searchParams.soIda ? '#F0C72F' : '#4896C7',
                        borderColor: !searchParams.soIda ? '#F0C72F' : '#4896C7'
                      }}
                    >
                      ✓ Ida e volta
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchParams(prev => ({ ...prev, soIda: true, volta: '' }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        searchParams.soIda
                          ? 'text-white border-2'
                          : 'text-white hover:opacity-80'
                      }`}
                      style={{
                        backgroundColor: searchParams.soIda ? '#F0C72F' : '#4896C7',
                        borderColor: searchParams.soIda ? '#F0C72F' : '#4896C7'
                      }}
                    >
                      Somente ida
                    </button>
                  </div>
                </div>

                {/* Primeira linha: Origem e Destino */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" style={{textAlign: 'left'}}>
                  {/* Origin */}
                  <div className="space-y-2" style={{textAlign: 'left'}}>
                    <label className="block text-base font-semibold text-gray-700 mb-3" style={{textAlign: 'left'}}>De</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        ref={originInputRef}
                        key={`origin-${forceUpdateCounter}`}
                        placeholder="Insira uma origem"
                        value={searchParams.origem}
                        onClick={() => {
                          // ✅ NOVO: Cancelar busca ao clicar no campo
                          if (searchAbortControllerRef.current) {
                            searchAbortControllerRef.current.abort();
                            setIsLoading(false);
                            setShowLoadingSidebar(false);
                          }
                        }}
                        onChange={(e) => {
                          const currentValue = e.target.value;
                          setSearchParams(prev => ({ ...prev, origem: currentValue }));

                          if (currentValue.length > 0 && !showFullForm) {
                            setShowFullForm(true);
                          }

                          setTimeout(() => searchAirportsWithValue('origin', currentValue), 100);
                        }}
                        className="pl-12 pr-6 py-4 h-14 text-base border-gray-300 rounded-lg transition-all duration-200"
                        style={{
                          borderColor: '#d1d5db'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4896C7';
                          e.target.style.boxShadow = '0 0 0 2px rgba(72, 150, 199, 0.2)';
                          handleInputFocus('origin');
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                          handleBlur('origin');
                        }}
                      />

                      {/* Origin Suggestions */}
                      {showAirportSuggestions.origin && (
                        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {isLoadingAirports.origin ? (
                            <div className="p-3 text-center text-gray-500 text-sm">Buscando aeroportos...</div>
                          ) : airportSuggestions.origin.length > 0 ? (
                            airportSuggestions.origin.map((airport, index) => (
                              <div
                                key={`${airport.Iata}-${index}`}
                                onClick={() => selectAirport(airport, 'origin')}
                                className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors"
                              >
                                <div className="font-medium text-gray-900">{airport.Iata} - {airport.Nome}</div>
                                <div className="text-sm text-gray-500">{airport.Cidade}, {airport.Pais}</div>
                              </div>
                            ))
                          ) : searchParams.origem.length >= 2 ? (
                            <div className="p-3 text-center text-gray-500 text-sm">Nenhum aeroporto encontrado</div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="space-y-2" style={{textAlign: 'left'}}>
                    <label className="block text-base font-semibold text-gray-700 mb-3" style={{textAlign: 'left'}}>Para</label>
                    <div className="relative">
                      <Plane className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        ref={destinationInputRef}
                        key={`destination-${forceUpdateCounter}`}
                        placeholder="Insira um destino"
                        value={searchParams.destino}
                        onClick={() => {
                          // ✅ NOVO: Cancelar busca ao clicar no campo
                          if (searchAbortControllerRef.current) {
                            searchAbortControllerRef.current.abort();
                            setIsLoading(false);
                            setShowLoadingSidebar(false);
                          }
                        }}
                        onChange={(e) => {
                          const currentValue = e.target.value;
                          setSearchParams(prev => ({ ...prev, destino: currentValue }));

                          if (currentValue.length > 0 && !showFullForm) {
                            setShowFullForm(true);
                          }

                          setTimeout(() => searchAirportsWithValue('destination', currentValue), 100);
                        }}
                        className="pl-12 pr-6 py-4 h-14 text-base border-gray-300 rounded-lg transition-all duration-200"
                        style={{
                          borderColor: '#d1d5db'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4896C7';
                          e.target.style.boxShadow = '0 0 0 2px rgba(72, 150, 199, 0.2)';
                          handleInputFocus('destination');
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                          handleBlur('destination');
                        }}
                      />

                      {/* Destination Suggestions */}
                      {showAirportSuggestions.destination && (
                        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {isLoadingAirports.destination ? (
                            <div className="p-3 text-center text-gray-500 text-sm">Buscando aeroportos...</div>
                          ) : airportSuggestions.destination.length > 0 ? (
                            airportSuggestions.destination.map((airport, index) => (
                              <div
                                key={`${airport.Iata}-${index}`}
                                onClick={() => selectAirport(airport, 'destination')}
                                className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors"
                              >
                                <div className="font-medium text-gray-900">{airport.Iata} - {airport.Nome}</div>
                                <div className="text-sm text-gray-500">{airport.Cidade}, {airport.Pais}</div>
                              </div>
                            ))
                          ) : searchParams.destino.length >= 2 ? (
                            <div className="p-3 text-center text-gray-500 text-sm">Nenhum aeroporto encontrado</div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Formulário expandido */}
                {showFullForm && (
                  <>
                    {/* Segunda linha: Datas e Passageiros */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      {/* Ida */}
                      <div className="md:col-span-1">
                        <label className="block text-base font-semibold text-gray-700 mb-3" style={{textAlign: 'left'}}>Ida</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <div
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              // ✅ NOVO: Cancelar busca ao clicar no campo
                              if (searchAbortControllerRef.current) {
                                searchAbortControllerRef.current.abort();
                                setIsLoading(false);
                                setShowLoadingSidebar(false);
                              }

                              setCalendarConfig({type: 'ida', show: true, title: 'Selecionar data de ida'});
                            }}
                            className="relative w-full px-6 py-4 pl-12 h-14 text-base bg-white border border-gray-300 rounded-l-lg rounded-r-none border-r-0 cursor-pointer hover:border-blue-400 transition-colors flex items-center"
                          >
                            <span className="text-gray-900 text-sm">
                              {searchParams.ida ? formatDisplayDate(searchParams.ida) : 'dd/mm/aaaa'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Volta */}
                      <div className="md:col-span-1">
                        <label className="block text-base font-semibold text-gray-700 mb-3" style={{textAlign: 'left'}}>Volta</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <div
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              // ✅ NOVO: Cancelar busca ao clicar no campo
                              if (searchAbortControllerRef.current) {
                                searchAbortControllerRef.current.abort();
                                setIsLoading(false);
                                setShowLoadingSidebar(false);
                              }

                              if (!searchParams.soIda) {
                                setCalendarConfig({type: 'volta', show: true, title: 'Selecionar data de volta'});
                              }
                            }}
                            className={`relative w-full px-6 py-4 pl-12 h-14 text-base border border-gray-300 rounded-none border-r-0 transition-colors flex items-center ${
                              searchParams.soIda
                                ? 'bg-gray-100 cursor-not-allowed'
                                : 'bg-white cursor-pointer hover:border-blue-400'
                            }`}
                          >
                            <span className={`text-sm ${searchParams.soIda ? 'text-gray-400' : 'text-gray-900'}`}>
                              {searchParams.soIda
                                ? 'Somente ida'
                                : (searchParams.volta ? formatDisplayDate(searchParams.volta) : 'dd/mm/aaaa')
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Passageiros */}
                      <div className="md:col-span-1">
                        <label className="block text-base font-semibold text-gray-700 mb-3" style={{textAlign: 'left'}}>Passageiros</label>
                        <div className="relative">
                          <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <select
                            value={searchParams.adultos}
                            onClick={() => {
                              // ✅ NOVO: Cancelar busca ao clicar no campo
                              if (searchAbortControllerRef.current) {
                                searchAbortControllerRef.current.abort();
                                setIsLoading(false);
                                setShowLoadingSidebar(false);
                              }
                            }}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, adultos: Number(e.target.value) }))}
                            className="w-full pl-12 pr-6 py-4 h-14 text-base border border-gray-300 rounded-r-lg rounded-l-none focus:border-blue-500 focus:ring-blue-500 bg-white appearance-none"
                          >
                            <option value={1}>1 adulto</option>
                            <option value={2}>2 adultos</option>
                            <option value={3}>3 adultos</option>
                            <option value={4}>4 adultos</option>
                            <option value={5}>5+ adultos</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Terceira linha: Tipo de Voos */}
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="block text-base font-semibold text-gray-700 mb-3" style={{textAlign: 'left'}}>Tipo de Voos</label>
                        <div className="relative">
                          <Sparkles className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <select
                            value={searchParams.classe}
                            onClick={() => {
                              // ✅ NOVO: Cancelar busca ao clicar no campo
                              if (searchAbortControllerRef.current) {
                                searchAbortControllerRef.current.abort();
                                setIsLoading(false);
                                setShowLoadingSidebar(false);
                              }
                            }}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, classe: e.target.value as 'economica' | 'executiva' | 'primeira' }))}
                            className="w-full pl-12 pr-6 py-4 h-14 text-base border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 bg-white appearance-none"
                          >
                            <option value="economica">Economica</option>
                            <option value="executiva">Executiva</option>
                            <option value="primeira">Primeira</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Checkbox milhas + dinheiro */}
                    <div className="mb-6">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={searchParams.tipoPagamento === 'ambos'}
                          onClick={() => {
                            // ✅ NOVO: Cancelar busca ao clicar no campo
                            if (searchAbortControllerRef.current) {
                              searchAbortControllerRef.current.abort();
                              setIsLoading(false);
                              setShowLoadingSidebar(false);
                            }
                          }}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSearchParams(prev => ({ ...prev, tipoPagamento: 'ambos' }));
                            } else {
                              setSearchParams(prev => ({ ...prev, tipoPagamento: 'dinheiro' }));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700">Usar <span className="font-medium">milhas + dinheiro</span></span>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-300 disabled:to-red-400 text-white font-semibold px-10 py-5 h-auto text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                          Buscando voos...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-6 w-6" />
                          Procurar voos
                        </>
                      )}
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Resultados - Sequential flow: show return only after outbound is selected */}
          {showFlightResults && (outboundFlightResults.length > 0 || returnFlightResults.length > 0) && (
            <div className="mt-8 space-y-8">
              {/* Voos de ida - shown when no outbound is selected */}
              {outboundFlightResults.length > 0 && !selectedFlights.outbound && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Voos de ida</h2>
                  <FlightResults
                    flights={outboundFlightResults}
                    searchParams={searchParams}
                    onNewSearch={handleNewSearch}
                    onFlightSelect={handleFlightSelect}
                    onFiltersChange={handleFiltersChange}
                    onNewSearchWithFilters={handleNewSearchWithFilters}
                    isSearching={isLoading}
                  />
                </div>
              )}

              {/* Voos de volta - shown when outbound is selected but no return is selected */}
              {returnFlightResults.length > 0 && selectedFlights.outbound && !selectedFlights.return && (
                <div id="return-flights">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Voos de volta</h2>
                  <FlightResults
                    flights={returnFlightResults}
                    searchParams={{
                      ...searchParams,
                      origem: searchParams.destino,
                      destino: searchParams.origem,
                      ida: searchParams.volta,
                      volta: ''
                    }}
                    onNewSearch={handleNewSearch}
                    onFlightSelect={handleFlightSelect}
                    onFiltersChange={handleFiltersChange}
                    onNewSearchWithFilters={handleNewSearchWithFilters}
                    isSearching={isLoading}
                    isReturnSection={true}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Calendar Modal */}
      {calendarConfig.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCalendarClose} />
          <div className="relative bg-white rounded-3xl shadow-xl p-6 max-w-2xl w-full">
            <CustomCalendar
              title={calendarConfig.title}
              selectedDate={calendarConfig.type === 'ida' ? searchParams.ida : searchParams.volta}
              selectedDates={[searchParams.ida, searchParams.volta].filter(Boolean)} // ✅ NOVO: Passa ambas as datas
              onDateSelect={(date) => handleCalendarDateSelect(date, calendarConfig.type)}
              onClose={handleCalendarClose}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BuscarVoos;
