import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Calendar, Users, Plane, ArrowLeftRight, Sparkles, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelection } from '../context/SelectionContext';
import CustomCalendar from '../components/CustomCalendar';
import moblixApiService from '../services/moblixApiService';
import FlightResults from '../components/FlightResultsFlights';
import FlightLoadingOverlay from '../components/FlightLoadingOverlay';
import SummarySection from '../components/SummarySection';
import { searchAirports as searchAirportsData, Airport as AirportData } from '../data/airports';

// Interfaces
interface Airport {
  Iata: string;
  Nome: string;
  Pais: string;
  Cidade?: string;
  Grupo?: string; // Para agrupar aeroportos da mesma cidade
}

interface AirportGroup {
  cidade: string;
  pais: string;
  airports: Airport[];
  displayName: string;
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
  departure: any;
  arrival: any;
  ProviderSource?: string;
  origem?: string;
  destino?: string;
  Origem?: string;
  Destino?: string;
  Saida?: string;
  Chegada?: string;
  departureDate?: string;
  arrivalDate?: string;
  validatingBy?: {
    name: string;
  };
  flightNumber?: string;
  fareGroup?: {
    priceWithTax: number;
    priceWithoutTax: number;
  };
}

interface FlightDataItem {
  flights?: Flight[];
  [key: string]: any;
}

const Flights: React.FC = () => {
  // Estados para o calendário customizado
  const [calendarConfig, setCalendarConfig] = useState<{
    type: 'ida' | 'volta';
    show: boolean;
    title: string;
  }>({ type: 'ida', show: false, title: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para busca de voos
  const [showFlightResults, setShowFlightResults] = useState(false);
  const [flightResults, setFlightResults] = useState<any[]>([]);
  // Novos estados separados para resultados de ida e volta
  const [outboundFlightResults, setOutboundFlightResults] = useState<any[]>([]);
  const [returnFlightResults, setReturnFlightResults] = useState<any[]>([]);
  
  // Removido: selectedFlights agora vem do useSelection context
  const [airportSuggestions, setAirportSuggestions] = useState<{
    origin: Airport[];
    destination: Airport[];
  }>({ origin: [], destination: [] });
  
  // AbortController para cancelar requisições de aeroportos
  const abortControllerRef = useRef<AbortController | null>(null);
  
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

  // Refs para controlar os valores dos inputs diretamente
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  
  // Estados para o novo loading overlay
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showLoadingSidebar, setShowLoadingSidebar] = useState(false);
  const [messageInterval, setMessageInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Estados adicionais necessários
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [hasLoadedFromHome, setHasLoadedFromHome] = useState(false);
  const [displayedFlights, setDisplayedFlights] = useState<Flight[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [flightsPerPage] = useState(10);
  
  // Selection context
  const { selected: selectedFlights, setOutbound, setReturn, clear } = useSelection();
  
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

  // Estados para controlar se o formulário completo deve ser exibido
  const [showFullForm, setShowFullForm] = useState(false);

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Função auxiliar para formatar data para exibição
  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      // Parse da data YYYY-MM-DD para evitar problemas de timezone
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month é 0-indexed no JS
      
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // Função para lidar com seleção de data do calendário
  const handleCalendarDateSelect = (date: Date, type: 'ida' | 'volta') => {
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
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
    } else {
      // Validar se data de volta não é anterior à ida
      if (searchParams.ida && formattedDate < searchParams.ida) {
        toast.error('A data de volta não pode ser anterior à data de ida.');
        return;
      }
      setSearchParams(prev => ({ ...prev, volta: formattedDate }));
    }
    
    // Fecha o calendário
    setCalendarConfig(prev => ({ ...prev, show: false }));
  };

  // Função para fechar o calendário
  const handleCalendarClose = () => {
    setCalendarConfig(prev => ({ ...prev, show: false }));
  };

  // Auto-scroll to return flights after selecting outbound
  useEffect(() => {
    if (selectedFlights.outbound && returnFlightResults.length > 0) {
      const el = document.getElementById('return-flights');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedFlights.outbound, returnFlightResults.length]);

  // Respect flag set during outbound choose to bring user to return list after a new search
  useEffect(() => {
    const flag = localStorage.getItem('reopenSelectionAfterSearch');
    if (flag === 'true' && returnFlightResults.length > 0) {
      const el = document.getElementById('return-flights');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      try { localStorage.removeItem('reopenSelectionAfterSearch'); } catch {}
      // Small guidance toast
      toast.success('Agora escolha seu voo de volta.');
    }
  }, [returnFlightResults.length]);

  

  // Helper function for fuzzy string matching
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  // Search airports with direct value (fixes timing issues)
  const searchAirportsWithValue = useCallback(async (field: 'origin' | 'destination', value: string) => {
    console.log('🚀 searchAirportsWithValue INICIADA - field:', field, 'value:', value);
    const searchValue = value;
    console.log('🚀 searchAirportsWithValue - searchValue:', searchValue, 'length:', searchValue.length);
    
    if (searchValue.length < 2) {
      console.log('🚫 searchAirportsWithValue - valor muito curto, saindo');
      setAirportSuggestions(prev => ({ ...prev, [field]: [] }));
      return;
    }

    // Check if this is a selected airport format or partial format - skip search
    const selectedAirportPattern = /^.+\s\([A-Z]{0,3}\)?\s*$/;
    const partialSelectedPattern = /^.+\s\([A-Z]{0,2}$/;
    
    if (selectedAirportPattern.test(searchValue) || partialSelectedPattern.test(searchValue)) {
      console.log('🚫 Flights - Valor é aeroporto selecionado ou parcial, pulando busca:', searchValue);
      setAirportSuggestions(prev => ({ ...prev, [field]: [] }));
      return;
    }

    // Check if we have a recently selected airport for this field
    const selectedAirportKey = `${field}_selected_airport`;
    const storedAirport = localStorage.getItem(selectedAirportKey);
    
    if (storedAirport) {
      try {
        const parsedAirport = JSON.parse(storedAirport);
        const storedTime = parsedAirport.timestamp;
        const currentTime = Date.now();
        
        // If stored less than 5 seconds ago and matches current search
        if (currentTime - storedTime < 5000 && 
            parsedAirport.searchTerm && 
            searchValue.toLowerCase().includes(parsedAirport.searchTerm.toLowerCase())) {
          console.log('🔄 Flights - Usando aeroporto armazenado recentemente:', parsedAirport);
          setAirportSuggestions(prev => ({ ...prev, [field]: [] }));
          return;
        }
      } catch (e) {
        // Invalid stored data, continue with search
      }
    }

    setIsLoadingAirports(prev => ({ ...prev, [field]: true }));
    
    try {
      console.log('🔍 Flights - Buscando aeroportos com termo:', searchValue);
      
      // Tenta usar a API Moblix primeiro (com fallback automático para dados locais)
      const apiResponse = await moblixApiService.buscarAeroportos(searchValue);
      console.log('🔍 Flights - Resposta da API Moblix:', apiResponse);
      console.log('🔍 Flights - Tipo da resposta:', typeof apiResponse);
      console.log('🔍 Flights - apiResponse.Data existe?', !!apiResponse?.Data);
      console.log('🔍 Flights - apiResponse.Data é array?', Array.isArray(apiResponse?.Data));
      console.log('🔍 Flights - Conteúdo de apiResponse.Data:', apiResponse?.Data);
      
      if (apiResponse && apiResponse.Data && Array.isArray(apiResponse.Data)) {
        // Converte os dados da API para o formato esperado
        const apiResults: Airport[] = apiResponse.Data.map((airport: any) => ({
          Iata: airport.Iata,
          Nome: airport.Nome,
          Cidade: airport.Cidade,
          Pais: airport.Pais
        }));
        
        console.log('✅ Flights - Usando dados da API/fallback:', apiResults.length, 'aeroportos');
        console.log('🔍 Flights - Dados convertidos:', apiResults);
        
        // Ordena os resultados por prioridade
        const sortedResults = apiResults.sort((a, b) => {
          const searchTerm = searchValue.toLowerCase().trim();
          const aIata = a.Iata.toLowerCase();
          const bIata = b.Iata.toLowerCase();
          
          // Prioridade 1: IATA exato
          if (aIata === searchTerm && bIata !== searchTerm) return -1;
          if (bIata === searchTerm && aIata !== searchTerm) return 1;
          
          // Prioridade 2: IATA começa com o termo
          if (aIata.startsWith(searchTerm) && !bIata.startsWith(searchTerm)) return -1;
          if (bIata.startsWith(searchTerm) && !aIata.startsWith(searchTerm)) return 1;
          
          // Prioridade 3: IATA contém o termo
          if (aIata.includes(searchTerm) && !bIata.includes(searchTerm)) return -1;
          if (bIata.includes(searchTerm) && !aIata.includes(searchTerm)) return 1;
          
          return 0;
        });
        
        const finalResults = sortedResults.slice(0, 8);
        
        // Log dos resultados finais
        console.log('📋 Flights - Total de resultados finais:', finalResults.length);
        console.log('📋 Flights - Resultados finais detalhados:', finalResults);
        if (finalResults.length > 0) {
          finalResults.forEach((airport: Airport, index) => 
            console.log(`  ${index + 1}. ${airport.Iata}: ${airport.Nome} (${airport.Pais})`)
          );
        }
        
        console.log('🔄 Flights - Atualizando estado com:', finalResults);
        setAirportSuggestions(prev => {
          const newState = { ...prev, [field]: finalResults };
          console.log('🔄 Flights - Novo estado airportSuggestions:', newState);
          return newState;
        });
        setIsLoadingAirports(prev => ({ ...prev, [field]: false }));
        return;
      }
      
      // Se chegou aqui, nem a API nem o fallback funcionaram - usar dados locais como último recurso
      console.log('🔄 Flights - Usando dados locais como último recurso');
      const searchResults = searchAirportsData(searchValue);
      console.log('🔍 Flights - Resultados brutos da busca local:', searchResults);
      
      // Converte os resultados para o formato esperado pelo componente
      const localFiltered: Airport[] = searchResults.map((airport: AirportData) => ({
        Iata: airport.iata,
        Nome: airport.name,
        Pais: airport.country,
        Cidade: airport.city
      }));
      
      console.log('📋 Flights - Total de resultados locais:', localFiltered.length);
      
      // Ordena os resultados por prioridade
      const sortedResults = localFiltered.sort((a, b) => {
        const searchTerm = searchValue.toLowerCase().trim();
        const aIata = a.Iata.toLowerCase();
        const bIata = b.Iata.toLowerCase();
        
        // Prioridade 1: IATA exato
        if (aIata === searchTerm && bIata !== searchTerm) return -1;
        if (bIata === searchTerm && aIata !== searchTerm) return 1;
        
        // Prioridade 2: IATA começa com o termo
        if (aIata.startsWith(searchTerm) && !bIata.startsWith(searchTerm)) return -1;
        if (bIata.startsWith(searchTerm) && !aIata.startsWith(searchTerm)) return 1;
        
        // Prioridade 3: IATA contém o termo
        if (aIata.includes(searchTerm) && !bIata.includes(searchTerm)) return -1;
        if (bIata.includes(searchTerm) && !aIata.includes(searchTerm)) return 1;
        
        return 0;
      });
      
      const finalResults = sortedResults.slice(0, 8);
      
      setAirportSuggestions(prev => ({ ...prev, [field]: finalResults }));
      
    } catch (error) {
      console.error('❌ Flights - Erro geral na busca:', error);
      setAirportSuggestions(prev => ({ ...prev, [field]: [] }));
    } finally {
      setIsLoadingAirports(prev => ({ ...prev, [field]: false }));
    }
  }, []);

  // Search airports using hybrid approach (API + local filtering)
  const searchAirports = useCallback(async (field: 'origin' | 'destination') => {
    console.log('🚀 searchAirports INICIADA - field:', field);
    const searchValue = field === 'origin' ? searchParams.origem : searchParams.destino;
    console.log('🚀 searchAirports - searchValue:', searchValue, 'length:', searchValue.length);
    
    if (searchValue.length < 2) {
      console.log('🚫 searchAirports - valor muito curto, saindo');
      setAirportSuggestions(prev => ({ ...prev, [field]: [] }));
      return;
    }

    // Check if this is a selected airport format or partial format - skip search
    const selectedAirportPattern = /^.+\s\([A-Z]{0,3}\)?\s*$/;
    const partialSelectedPattern = /^.+\s\([A-Z]{0,2}$/;
    
    if (selectedAirportPattern.test(searchValue) || partialSelectedPattern.test(searchValue)) {
      console.log('🚫 Flights - Valor é aeroporto selecionado ou parcial, pulando busca:', searchValue);
      setAirportSuggestions(prev => ({ ...prev, [field]: [] }));
      return;
    }

    // Check if we have a recently selected airport for this field
    const selectedAirportKey = `${field}_selected_airport`;
    const storedAirport = sessionStorage.getItem(selectedAirportKey);
    if (storedAirport) {
      try {
        const airportData = JSON.parse(storedAirport);
        const timeDiff = Date.now() - airportData.timestamp;
        // If selected less than 10 seconds ago and search value contains the display value, skip
        if (timeDiff < 10000 && (
          searchValue.includes(airportData.displayValue) || 
          airportData.displayValue.includes(searchValue) ||
          searchValue.toLowerCase().includes(airportData.iata.toLowerCase())
        )) {
          console.log('🚫 Flights - Aeroporto recém selecionado detectado, pulando busca:', airportData);
          setAirportSuggestions(prev => ({ ...prev, [field]: [] }));
          return;
        }
      } catch (e) {
        // Invalid stored data, continue with search
      }
    }

    setIsLoadingAirports(prev => ({ ...prev, [field]: true }));
    
    try {
      console.log('🔍 Flights - Buscando aeroportos com termo:', searchValue);
      
      // Tenta usar a API Moblix primeiro (com fallback automático para dados locais)
      const apiResponse = await moblixApiService.buscarAeroportos(searchValue);
      console.log('🔍 Flights - Resposta da API Moblix:', apiResponse);
      console.log('🔍 Flights - Tipo da resposta:', typeof apiResponse);
      console.log('🔍 Flights - apiResponse.Data existe?', !!apiResponse?.Data);
      console.log('🔍 Flights - apiResponse.Data é array?', Array.isArray(apiResponse?.Data));
      console.log('🔍 Flights - Conteúdo de apiResponse.Data:', apiResponse?.Data);
      
      if (apiResponse && apiResponse.Data && Array.isArray(apiResponse.Data)) {
        // Converte os dados da API para o formato esperado
        const apiResults: Airport[] = apiResponse.Data.map((airport: any) => ({
          Iata: airport.Iata,
          Nome: airport.Nome,
          Cidade: airport.Cidade,
          Pais: airport.Pais
        }));
        
        console.log('✅ Flights - Usando dados da API/fallback:', apiResults.length, 'aeroportos');
        console.log('🔍 Flights - Dados convertidos:', apiResults);
        
        // Ordena os resultados por prioridade
        const sortedResults = apiResults.sort((a, b) => {
          const searchTerm = searchValue.toLowerCase().trim();
          const aIata = a.Iata.toLowerCase();
          const bIata = b.Iata.toLowerCase();
          
          // Prioridade 1: IATA exato
          if (aIata === searchTerm && bIata !== searchTerm) return -1;
          if (bIata === searchTerm && aIata !== searchTerm) return 1;
          
          // Prioridade 2: IATA começa com o termo
          if (aIata.startsWith(searchTerm) && !bIata.startsWith(searchTerm)) return -1;
          if (bIata.startsWith(searchTerm) && !aIata.startsWith(searchTerm)) return 1;
          
          // Prioridade 3: IATA contém o termo
          if (aIata.includes(searchTerm) && !bIata.includes(searchTerm)) return -1;
          if (bIata.includes(searchTerm) && !aIata.includes(searchTerm)) return 1;
          
          return 0;
        });
        
        const finalResults = sortedResults.slice(0, 8);
        
        // Log dos resultados finais
        console.log('📋 Flights - Total de resultados finais:', finalResults.length);
        console.log('📋 Flights - Resultados finais detalhados:', finalResults);
        if (finalResults.length > 0) {
          finalResults.forEach((airport: Airport, index) => 
            console.log(`  ${index + 1}. ${airport.Iata}: ${airport.Nome} (${airport.Pais})`)
          );
        }
        
        console.log('🔄 Flights - Atualizando estado com:', finalResults);
        setAirportSuggestions(prev => {
          const newState = { ...prev, [field]: finalResults };
          console.log('🔄 Flights - Novo estado airportSuggestions:', newState);
          return newState;
        });
        setIsLoadingAirports(prev => ({ ...prev, [field]: false }));
        return;
      }
      
      // Se chegou aqui, nem a API nem o fallback funcionaram - usar dados locais como último recurso
      console.log('🔄 Flights - Usando dados locais como último recurso');
      const searchResults = searchAirportsData(searchValue);
      console.log('🔍 Flights - Resultados brutos da busca local:', searchResults);
      
      // Converte os resultados para o formato esperado pelo componente
      const localFiltered: Airport[] = searchResults.map((airport: AirportData) => ({
        Iata: airport.iata,
        Nome: airport.name,
        Pais: airport.country,
        Cidade: airport.city
      }));
      
      console.log('🔍 Flights - Aeroportos encontrados localmente:', localFiltered.length, localFiltered);
      
      let finalResults: Airport[] = [];
      
      if (localFiltered.length > 0) {
        // Ordena os resultados por prioridade: IATA exato > IATA começa com > IATA contém > resto
        const sortedResults = localFiltered.sort((a, b) => {
          const searchTerm = searchValue.toLowerCase().trim();
          const aIata = a.Iata.toLowerCase();
          const bIata = b.Iata.toLowerCase();
          
          // Prioridade 1: IATA exato
          if (aIata === searchTerm && bIata !== searchTerm) return -1;
          if (bIata === searchTerm && aIata !== searchTerm) return 1;
          
          // Prioridade 2: IATA começa com o termo
          if (aIata.startsWith(searchTerm) && !bIata.startsWith(searchTerm)) return -1;
          if (bIata.startsWith(searchTerm) && !aIata.startsWith(searchTerm)) return 1;
          
          // Prioridade 3: IATA contém o termo
          if (aIata.includes(searchTerm) && !bIata.includes(searchTerm)) return -1;
          if (bIata.includes(searchTerm) && !aIata.includes(searchTerm)) return 1;
          
          return 0;
        });
        
        finalResults = sortedResults.slice(0, 8);
        console.log('🏠 Flights - Usando resultados da busca local ordenados:', finalResults.length);
      } else {
        console.log('⚠️ Flights - Nenhum aeroporto encontrado na busca local para:', searchValue);
        finalResults = [];
      }
      
      // Log dos resultados finais
      console.log('📋 Flights - Total de resultados finais:', finalResults.length);
      if (finalResults.length > 0) {
        finalResults.forEach((airport: Airport, index) => 
          console.log(`  ${index + 1}. ${airport.Iata}: ${airport.Nome} (${airport.Pais})`)
        );
      } else {
        console.log('⚠️ Flights - Nenhum resultado encontrado para:', searchValue);
      }
      
      setAirportSuggestions(prev => ({ ...prev, [field]: finalResults }));
      
    } catch (error) {
      console.error('❌ Flights - Erro geral na busca:', error);
      setAirportSuggestions(prev => ({ ...prev, [field]: [] }));
    } finally {
      setIsLoadingAirports(prev => ({ ...prev, [field]: false }));
    }
  }, []);

  // Handle input focus
  const handleInputFocus = (field: 'origin' | 'destination') => {
    setShowAirportSuggestions(prev => ({ ...prev, [field]: true }));
    searchAirports(field);
  };

  // Handle input blur
  const handleBlur = (field: 'origin' | 'destination') => {
    setTimeout(() => {
      setShowAirportSuggestions(prev => ({ ...prev, [field]: false }));
    }, 150);
  };

  // Normalizador de voos (reutiliza a mesma lógica já existente)
  const normalizeFlights = (rawFlights: any[], paramsForNorm: SearchParams) => {
    if (!Array.isArray(rawFlights)) return [];
    const normalizedFlights = rawFlights.map((flight: any) => {
          // Extração de preço e tipo (milhas/dinheiro)
          let finalPrice = 0;
          let isMilesFlag = false;
          const priceFields = {
            'ValorTotalComTaxa': flight.ValorTotalComTaxa,
            'ValorTotal': flight.ValorTotal, 
            'PrecoAdulto': flight.PrecoAdulto,
            'PontosAdulto': flight.PontosAdulto,
            'Valor': flight.Valor,
            'Preco': flight.Preco,
            'Price': flight.Price,
            'TotalPrice': flight.TotalPrice,
            'segments': flight.segments && flight.segments[0] ? {
              'PontosAdulto': flight.segments[0].PontosAdulto
            } : null
          };
          if (flight.PontosAdulto && typeof flight.PontosAdulto === 'number' && flight.PontosAdulto > 0) {
            finalPrice = flight.PontosAdulto;
            isMilesFlag = true;
          }
          else if (flight.segments?.[0]?.PontosAdulto && typeof flight.segments[0].PontosAdulto === 'number' && flight.segments[0].PontosAdulto > 0) {
            finalPrice = flight.segments[0].PontosAdulto;
            isMilesFlag = true;
          }
          else if (flight.fareGroup?.priceWithTax && typeof flight.fareGroup.priceWithTax === 'number' && flight.fareGroup.priceWithTax > 0) {
            finalPrice = flight.fareGroup.priceWithTax;
          }
          else if (flight.fareGroup?.priceWithoutTax && typeof flight.fareGroup.priceWithoutTax === 'number' && flight.fareGroup.priceWithoutTax > 0) {
            finalPrice = flight.fareGroup.priceWithoutTax;
          }
          else if (flight.priceWithTax && typeof flight.priceWithTax === 'number' && flight.priceWithTax > 0) {
            finalPrice = flight.priceWithTax;
          }
          else if (flight.price && typeof flight.price === 'number' && flight.price > 0) {
            finalPrice = flight.price;
          }
          else if (flight.totalPrice && typeof flight.totalPrice === 'number' && flight.totalPrice > 0) {
            finalPrice = flight.totalPrice;
          }
          else if (flight.ValorTotalComTaxa && typeof flight.ValorTotalComTaxa === 'number' && flight.ValorTotalComTaxa > 0) {
            finalPrice = flight.ValorTotalComTaxa;
          }
          else if (flight.ValorTotal && typeof flight.ValorTotal === 'number' && flight.ValorTotal > 0) {
            finalPrice = flight.ValorTotal;
          }
          else if (flight.PrecoAdulto && typeof flight.PrecoAdulto === 'number' && flight.PrecoAdulto > 0) {
            finalPrice = flight.PrecoAdulto;
          }
          else if (flight.Valor && typeof flight.Valor === 'number' && flight.Valor > 0) {
            finalPrice = flight.Valor;
          }
          else if (flight.Preco && typeof flight.Preco === 'number' && flight.Preco > 0) {
            finalPrice = flight.Preco;
          }
          else if (flight.Price && typeof flight.Price === 'number' && flight.Price > 0) {
            finalPrice = flight.Price;
          }
          else if (flight.TotalPrice && typeof flight.TotalPrice === 'number' && flight.TotalPrice > 0) {
            finalPrice = flight.TotalPrice;
          }
          else {
            return null;
          }

          // Origem/destino e correção de segmentos (principalmente para milhas)
          const firstSegment = flight.segments?.[0];
          const lastSegment = flight.segments?.[flight.segments.length - 1];
          const departure = firstSegment?.departure || firstSegment?.legs?.[0]?.departure || flight.Voos?.[0]?.Origem || 'N/A';
          const arrival = lastSegment?.arrival || lastSegment?.legs?.[lastSegment?.legs?.length - 1]?.arrival || flight.Voos?.[flight.Voos?.length - 1]?.Destino || 'N/A';
          const origemBusca = extractIataCode(paramsForNorm.origem);
          const destinoBusca = extractIataCode(paramsForNorm.destino);

          let normalizedSegments: any[] = [];
          if (flight.segments && Array.isArray(flight.segments)) {
            normalizedSegments = flight.segments.map((segment: any) => {
              let segDeparture = segment.departure || segment.legs?.[0]?.departure || 'N/A';
              let segArrival = segment.arrival || segment.legs?.[segment.legs?.length - 1]?.arrival || 'N/A';
              if (isMilesFlag && origemBusca && destinoBusca) {
                if (segDeparture === destinoBusca && segArrival === origemBusca) {
                  segDeparture = origemBusca;
                  segArrival = destinoBusca;
                }
              }
              return {
                ...segment,
                departure: segDeparture,
                arrival: segArrival,
                departureDate: segment.departureDate || segment.legs?.[0]?.departureDate,
                arrivalDate: segment.arrivalDate || segment.legs?.[segment.legs?.length - 1]?.arrivalDate,
                departureTime: segment.departureTime || segment.legs?.[0]?.departureTime,
                arrivalTime: segment.arrivalTime || segment.legs?.[segment.legs?.length - 1]?.arrivalTime,
                airline: segment.airline || segment.legs?.[0]?.airline,
                flightNumber: segment.flightNumber || segment.legs?.[0]?.flightNumber,
                duration: segment.duration || segment.legs?.[0]?.duration,
                aircraft: segment.aircraft || segment.legs?.[0]?.aircraft,
                rateToken: segment.rateToken || flight.rateToken
              };
            });
          }

          return {
            id: flight.id || `${departure}-${arrival}-${Date.now()}-${Math.random()}`,
            departure,
            arrival,
            departureDate: firstSegment?.departureDate || firstSegment?.legs?.[0]?.departureDate || flight.Voos?.[0]?.DataSaida,
            arrivalDate: lastSegment?.arrivalDate || lastSegment?.legs?.[lastSegment?.legs?.length - 1]?.arrivalDate || flight.Voos?.[flight.Voos?.length - 1]?.DataChegada,
            departureTime: firstSegment?.departureTime || firstSegment?.legs?.[0]?.departureTime || flight.Voos?.[0]?.HoraSaida,
            arrivalTime: lastSegment?.arrivalTime || lastSegment?.legs?.[lastSegment?.legs?.length - 1]?.arrivalTime || flight.Voos?.[flight.Voos?.length - 1]?.HoraChegada,
            airline: firstSegment?.airline || firstSegment?.legs?.[0]?.airline || flight.Voos?.[0]?.Companhia || 'N/A',
            flightNumber: firstSegment?.flightNumber || firstSegment?.legs?.[0]?.flightNumber || flight.Voos?.[0]?.NumeroVoo || 'N/A',
            duration: flight.duration || firstSegment?.duration || firstSegment?.legs?.[0]?.duration || 'N/A',
            price: finalPrice,
            priceWithTax: finalPrice,
            isMiles: isMilesFlag,
            segments: normalizedSegments,
            rateToken: flight.rateToken || firstSegment?.rateToken || flight.segments?.[0]?.rateToken,
            fareGroup: flight.fareGroup,
            aircraft: firstSegment?.aircraft || firstSegment?.legs?.[0]?.aircraft || flight.Voos?.[0]?.Aeronave || 'N/A',
            ProviderSource: flight.ProviderSource || 'API'
          };
        }).filter(Boolean);

    return normalizedFlights;
  };


  // Select airport
  const selectAirport = (airport: Airport, field: 'origin' | 'destination') => {
    console.log('🚀 INÍCIO selectAirport Flights:', field, airport.Iata, airport.Nome);
    
    // Mostrar formulário completo quando usuário selecionar um aeroporto
    if (!showFullForm) {
      setShowFullForm(true);
    }
    
    // Extrai a cidade/estado do nome do aeroporto
    const getCityFromAirportName = (name: string): string => {
      console.log('🔍 Flights - Extraindo cidade de:', name);
      
      // Casos especiais conhecidos (mapeamento direto)
      const specialCases: Record<string, string> = {
        'Santos Dumont': 'Rio de Janeiro',
        'Congonhas': 'São Paulo', 
        'Guarulhos': 'São Paulo',
        'Galeão': 'Rio de Janeiro',
        'Confins': 'Belo Horizonte',
        'Eduardo Gomes': 'Manaus',
        'Afonso Pena': 'Curitiba',
        'Heathrow': 'Londres',
        'Gatwick': 'Londres',
        'Stansted': 'Londres',
        'Luton': 'Londres',
        'Charles de Gaulle': 'Paris',
        'Orly': 'Paris',
        'Leonardo da Vinci': 'Roma',
        'Marco Polo': 'Veneza',
        'John F. Kennedy': 'Nova York',
        'LaGuardia': 'Nova York',
        'Newark': 'Nova York',
        "O'Hare": 'Chicago',
        'Ezeiza': 'Buenos Aires',
        'Jorge Newbery': 'Buenos Aires',
        'Benito Juárez': 'Cidade do México'
      };
      
      // Verifica casos especiais primeiro
      for (const [key, city] of Object.entries(specialCases)) {
        if (name.includes(key)) {
          console.log('🎯 Flights - Caso especial encontrado:', key, '->', city);
          return city;
        }
      }
      
      // Padrões regex para extrair cidade/estado dos nomes
      const patterns = [
        // "Aeroporto Internacional de São Paulo/Guarulhos" -> "São Paulo"
        /Aeroporto.*?(?:Internacional\s+)?de\s+([^/\-,]+)/i,
        // "Aeroporto de São Paulo/Congonhas" -> "São Paulo"
        /Aeroporto\s+de\s+([^/\-,]+)/i,
        // "Aeroporto Internacional Ezeiza - Buenos Aires" -> "Buenos Aires"
        /.*?\s*-\s*([^,]+)$/i,
        // "Aeroporto Francisco Sá Carneiro - Porto" -> "Porto"
        /.*?\s*-\s*([^,]+)$/i,
        // "Aeroporto Adolfo Suárez Madrid-Barajas" -> "Madrid"
        /.*?\s+([A-Z][a-záéíóúàèìòùâêîôûãõç]+)(?:-|\s|$)/i,
        // Para capturar cidade no final: "Aeroporto Internacional Silvio Pettirossi - Assunção"
        /.*\s-\s([^-]+)$/i
      ];
      
      // Tenta extrair usando padrões regex
      for (const pattern of patterns) {
        const match = name.match(pattern);
        if (match && match[1]) {
          const extracted = match[1].trim();
          console.log('🎯 Flights - Padrão encontrado:', pattern, '->', extracted);
          return extracted;
        }
      }
      
      console.log('⚠️ Flights - Nenhum padrão encontrado, usando país:', airport.Pais);
      // Se não conseguir extrair, usa o país como fallback
      return airport.Pais;
    };
    
    const city = getCityFromAirportName(airport.Nome);
    const displayValue = `${city} (${airport.Iata})`;
    
    console.log('🎯 Flights - Valor para exibir:', displayValue);
    console.log('🎯 Flights - Campo:', field);
    
    // MÉTODO 1: Primeiro esconde sugestões e bloqueia busca
    setShowAirportSuggestions(prev => ({ ...prev, [field]: false }));
    setSkipAutoSearch(prev => ({ ...prev, [field]: true }));
    
    // MÉTODO 2: Atualiza o input diretamente via DOM (garantia extra)
    const inputRef = field === 'origin' ? originInputRef : destinationInputRef;
    if (inputRef.current) {
      inputRef.current.value = displayValue;
      console.log('🔧 Flights - DOM atualizado diretamente para:', displayValue);
    }
    
    // MÉTODO 3: Atualiza o estado React (método principal)
    if (field === 'origin') {
      console.log('📝 Flights - Atualizando estado origem para:', displayValue);
      setSearchParams(prev => {
        const newState = { ...prev, origem: displayValue };
        console.log('📝 Flights - Novo estado searchParams (origem):', newState);
        return newState;
      });
    } else {
      console.log('📝 Flights - Atualizando estado destino para:', displayValue);
      setSearchParams(prev => {
        const newState = { ...prev, destino: displayValue };
        console.log('📝 Flights - Novo estado searchParams (destino):', newState);
        return newState;
      });
    }
    
    // MÉTODO 4: Força re-render do componente (removido - não necessário)
    
    // MÉTODO 5: Armazena o aeroporto selecionado para evitar buscas desnecessárias
    const selectedAirportKey = `${field}_selected_airport`;
    sessionStorage.setItem(selectedAirportKey, JSON.stringify({
      iata: airport.Iata,
      displayValue: displayValue,
      timestamp: Date.now()
    }));
    
    // Reabilita busca automática após delay maior
    setTimeout(() => {
      console.log('⏰ Flights - Reabilitando busca automática para:', field);
      setSkipAutoSearch(prev => ({ ...prev, [field]: false }));
    }, 800); // Delay ainda maior
    
    console.log('✅ Flights - FIM selectAirport');
  };

  // Swap origin and destination
  const swapOriginDestination = () => {
    setSearchParams(prev => ({
      ...prev,
      origem: prev.destino,
      destino: prev.origem
    }));
  };

  // Função para extrair apenas o código IATA do valor do input
  const extractIataCode = (airportValue: string): string => {
    if (!airportValue) return '';
    
    // Padrão: "Cidade (IATA)" -> extrair apenas IATA
    const parenMatch = airportValue.match(/\(([A-Z]{3})\)/);
    if (parenMatch && parenMatch[1]) {
      const iataCode = parenMatch[1].trim().toUpperCase();
      console.log('🔧 Flights - Extraindo IATA do formato (IATA):', airportValue, '->', iataCode);
      return iataCode;
    }
    
    // Se o valor contém " - ", pega apenas a primeira parte (código IATA)
    if (airportValue.includes(' - ')) {
      const iataCode = airportValue.split(' - ')[0].trim().toUpperCase();
      console.log('🔧 Flights - Extraindo IATA do formato " - ":', airportValue, '->', iataCode);
      return iataCode;
    }
    
    // Se for exatamente 3 letras, assume que já é IATA
    if (/^[A-Za-z]{3}$/.test(airportValue.trim())) {
      const iataCode = airportValue.trim().toUpperCase();
      console.log('🔧 Flights - IATA direto:', airportValue, '->', iataCode);
      return iataCode;
    }
    
    // Se não conseguir extrair, retorna o valor original em maiúsculo
    console.log('⚠️ Flights - Não conseguiu extrair IATA, usando valor original:', airportValue);
    return airportValue.trim().toUpperCase();
  };

  // Handle form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchParams.origem || !searchParams.destino || !searchParams.ida) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // 🔄 Limpa seleções anteriores para evitar pré-seleção indevida no novo resultado
    try {
      clear();
      localStorage.removeItem('flightSelections');
      localStorage.removeItem('originalPurchase');
      localStorage.removeItem('precoMinimoVolta');
      localStorage.removeItem('reopenSelectionAfterSearch');
    } catch {}
    
    // 💾 SALVAR PARÂMETROS DE BUSCA NO LOCALSTORAGE PARA O MODAL
    try {
      const searchParamsForStorage = {
        origem: extractIataCode(searchParams.origem),  // Salva o código IATA limpo
        destino: extractIataCode(searchParams.destino), // Salva o código IATA limpo
        ida: searchParams.ida,
        volta: searchParams.volta,
        adultos: searchParams.adultos,
        criancas: searchParams.criancas,
        bebes: searchParams.bebes,
        companhia: searchParams.companhia,
        tipoPagamento: searchParams.tipoPagamento,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('lastFlightSearch', JSON.stringify(searchParamsForStorage));
      console.log('💾 Parâmetros de busca salvos no localStorage:', searchParamsForStorage);
    } catch (error) {
      console.warn('⚠️ Erro ao salvar parâmetros no localStorage:', error);
    }

    setIsLoading(true);
    
    try {
      // Extrai os códigos IATA limpos para a API
      const origemIata = extractIataCode(searchParams.origem);
      const destinoIata = extractIataCode(searchParams.destino);
      
      console.log('🚀 Flights - Iniciando busca na API Moblix...');
      console.log('📋 Flights - Parâmetros originais:', searchParams);
      console.log('🎯 Flights - Códigos IATA extraídos:', { origemIata, destinoIata });
      
      // Busca consolidada usando a API otimizada (todas as companhias de uma vez)
      let allFlights: Flight[] = [];
      
      if (searchParams.soIda) {
        // Busca apenas ida
        console.log(`🔍 Buscando voos de ida apenas...`);
        
        const apiParams = {
          origem: origemIata,
          destino: destinoIata,
          ida: searchParams.ida,
          volta: undefined,
          adultos: searchParams.adultos,
          criancas: searchParams.criancas,
          bebes: searchParams.bebes,
          companhia: -1, // Busca consolidada
          soIda: true
        };
        
        const response = await moblixApiService.consultarVoos(apiParams);
        
        console.log('🔍 Flights - Resposta da API (ida):', response);
        
        if (response?.flights && Array.isArray(response.flights)) {
          console.log('🔍 Flights - Processando', response.flights.length, 'voos de ida');
          const processedFlights = response.flights.map((flight: any) => {
            return processFlightData(flight, 'outbound');
          });
          allFlights.push(...processedFlights);
        }
      } else {
        // Busca ida e volta em paralelo
        console.log(`🔍 Buscando voos de ida e volta em paralelo...`);
        
        const outboundParams = {
          origem: origemIata,
          destino: destinoIata,
          ida: searchParams.ida,
          volta: undefined,
          adultos: searchParams.adultos,
          criancas: searchParams.criancas,
          bebes: searchParams.bebes,
          companhia: -1,
          soIda: true
        };
        
        const returnParams = {
          origem: destinoIata, // Inverte origem e destino para volta
          destino: origemIata,
          ida: searchParams.volta,
          volta: undefined,
          adultos: searchParams.adultos,
          criancas: searchParams.criancas,
          bebes: searchParams.bebes,
          companhia: -1,
          soIda: true
        };
        
        // Executa as duas buscas em paralelo
        const [outboundResponse, returnResponse] = await Promise.all([
          moblixApiService.consultarVoos(outboundParams),
          moblixApiService.consultarVoos(returnParams)
        ]);
        
        console.log('🔍 Flights - Resposta da API (ida):', outboundResponse);
        console.log('🔍 Flights - Resposta da API (volta):', returnResponse);
        
        // Processa voos de ida
        if (outboundResponse?.flights && Array.isArray(outboundResponse.flights)) {
          console.log('🔍 Flights - Processando', outboundResponse.flights.length, 'voos de ida');
          const processedOutbound = outboundResponse.flights.map((flight: any) => {
            return processFlightData(flight, 'outbound');
          });
          allFlights.push(...processedOutbound);
        }
        
        // Processa voos de volta
        if (returnResponse?.flights && Array.isArray(returnResponse.flights)) {
          console.log('🔍 Flights - Processando', returnResponse.flights.length, 'voos de volta');
          const processedReturn = returnResponse.flights.map((flight: any) => {
            return processFlightData(flight, 'return');
          });
          allFlights.push(...processedReturn);
        }
      }
      
      // Debug: verificar estrutura dos voos antes do filtro
      console.log('🔍 Flights - Total de voos antes do filtro:', allFlights.length);
      console.log('🔍 Flights - Primeiro voo estrutura:', allFlights[0]);
      console.log('🔍 Flights - Valor tipoPagamento:', searchParams.tipoPagamento);
      console.log('🔍 Flights - Tipo de tipoPagamento:', typeof searchParams.tipoPagamento);
      
      // Filtrar por tipo de pagamento se especificado
      let filteredFlights = allFlights;
      
      // Debug: verificar propriedade isMiles nos voos
      console.log('🔍 Flights - Verificando propriedade isMiles nos primeiros 3 voos:');
      allFlights.slice(0, 3).forEach((flight, index) => {
        console.log(`Voo ${index}:`, {
          id: (flight as any).rateToken,
          isMiles: flight.isMiles,
          price: flight.price
        });
      });
      
      if (searchParams.tipoPagamento && searchParams.tipoPagamento !== 'ambos') {
        const isFilteringMiles = searchParams.tipoPagamento === 'milhas';
        console.log(`🔍 Flights - Filtrando por: ${isFilteringMiles ? 'milhas' : 'dinheiro'}`);
        
        filteredFlights = allFlights.filter(flight => {
          const flightIsMiles = flight.isMiles === true;
          const shouldInclude = isFilteringMiles ? flightIsMiles : !flightIsMiles;
          
          if (!shouldInclude) {
            console.log(`🔍 Flights - Removendo voo ${(flight as any).rateToken}: isMiles=${flightIsMiles}, filtro=${isFilteringMiles ? 'milhas' : 'dinheiro'}`);
          }
          
          return shouldInclude;
        });
        
        console.log(`🔍 Flights - Após filtro: ${filteredFlights.length} voos restantes`);
      } else {
        console.log('🔍 Flights - Sem filtro de pagamento aplicado (tipoPagamento é "ambos" ou undefined)');
      }
      
      // Ordenar por preço
      const sortedFlights = filteredFlights.sort((a, b) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceA - priceB;
      });
      
      console.log(`🔍 Flights - Voos finais ordenados: ${sortedFlights.length}`);
      console.log(`🔍 Flights - Primeiro voo final:`, sortedFlights[0]);
      
      // Atualizar estado
      setSearchResults(sortedFlights);
      setDisplayedFlights(sortedFlights.slice(0, flightsPerPage));
      setCurrentPage(0);
      
      // Salvar parâmetros no localStorage
      localStorage.setItem('flightSearchParams', JSON.stringify(searchParams));
      console.log('💾 Parâmetros de busca salvos no localStorage:', searchParams);
      
      if (sortedFlights.length === 0) {
        toast.error('Nenhum voo encontrado para os critérios selecionados');
      } else {
        toast.success(`${sortedFlights.length} voos encontrados!`);
      }
      
    } catch (error) {
      console.error('❌ Erro na busca de voos:', error);
      setError('Erro ao buscar voos. Tente novamente.');
      toast.error('Erro ao buscar voos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para lidar com seleção de voo
  const handleFlightSelect = (flight: any, type?: 'outbound' | 'return') => {
    console.log('Voo selecionado:', flight, 'tipo:', type);

    if (type === 'outbound' || !selectedFlights.outbound) {
      setOutbound(flight);
      toast.success('Voo de ida selecionado!');

      if (!searchParams.soIda) {
        // Buscar voos de volta será implementado posteriormente
        console.log('Busca de voos de volta será implementada');
      }
    } else if (type === 'return' || (!selectedFlights.return && !searchParams.soIda)) {
      setReturn(flight);
      toast.success('Voo de volta selecionado!');
    }
  };

  // Função para nova busca
  const handleNewSearch = () => {
    console.log('Nova busca iniciada');
  };

  // Função para mudança de filtros
  const handleFiltersChange = (filters: any) => {
    setSearchParams(prev => ({ ...prev, ...filters }));
    console.log('Filtros alterados:', filters);
  };

  // Função para nova busca com filtros
  const handleNewSearchWithFilters = (newParams: SearchParams) => {
    setSearchParams(newParams);
    console.log('Nova busca com filtros:', newParams);
  };

  // Função auxiliar para obter nome da companhia
  const getAirlineName = (companyId: number | string): string => {
    const companies: Record<string, string> = {
      '1': 'LATAM',
      '2': 'GOL',
      '3': 'Azul',
      '11': 'TAP Air Portugal',
      '13': 'Copa Airlines',
      '22': 'American Airlines',
      '26': 'Iberia',
      '34': 'Livelo',
      '1200': 'Azul Interline'
    };
    return companies[String(companyId)] || 'Companhia Aérea';
  };

// ... (rest of the code remains the same)

  // Função para formatar tipo de voo
  const formatFlightType = (flight: Flight) => {
    if (flight.isMiles) {
      return {
        icon: '✈️',
        text: 'Milhas',
        cssClass: 'bg-blue-100 text-blue-800',
        description: 'Voo pago com milhas'
      };
    }
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

  const getCompanyCountSummary = () => {
    return 'Resultados encontrados para múltiplas companhias';
  };

  // Load more flights function
  const loadMoreFlights = () => {
    const nextPage = currentPage + 1;
    const startIndex = nextPage * flightsPerPage;
    const endIndex = startIndex + flightsPerPage;
    
    const newFlights = searchResults.slice(startIndex, endIndex);
    setDisplayedFlights(prev => [...prev, ...newFlights]);
    setCurrentPage(nextPage);
  };

  // Check if there are more flights to load
  const hasMoreFlights = async () => {
    return displayedFlights.length < searchResults.length;
  };

  // Função auxiliar para processar dados de voo
  const processFlightData = (flight: any, type: 'outbound' | 'return') => {
    // Extrai dados reais do primeiro segmento
    const firstSegment = flight.segments?.[0];
    const firstLeg = firstSegment?.legs?.[0];
    
    // Extrai preço em milhas (PontosAdulto > 0 significa voo em milhas)
    const pontosAdulto = firstSegment?.PontosAdulto;
    const isMiles = pontosAdulto && typeof pontosAdulto === 'number' && pontosAdulto > 0;
    
    // Determina o preço correto
    let price = 0;
    if (isMiles) {
      price = pontosAdulto;
    } else {
      price = flight.fareGroup?.priceWithTax || flight.fareGroup?.priceWithoutTax || 0;
    }
    
    // Determina a companhia aérea
    const airlineName = flight.validatingBy?.name || getAirlineName(firstSegment?.IdCiaResponsavel || 1);
    
    // Mapeia segmentos com dados reais
    const mappedSegments = flight.segments?.map((segment: any) => ({
      ...segment,
      departure: segment.departure,
      arrival: segment.arrival,
      departureDate: segment.departureDate,
      arrivalDate: segment.arrivalDate,
      duration: segment.duration,
      legs: segment.legs?.map((leg: any) => ({
        ...leg,
        flightNumber: leg.flightNumber,
        departure: leg.departure,
        arrival: leg.arrival,
        departureDate: leg.departureDate,
        arrivalDate: leg.arrivalDate
      }))
    })) || [];
    
    return {
      id: flight.rateToken || `${type}_${Date.now()}_${Math.random()}`,
      rateToken: flight.rateToken,
      segments: mappedSegments,
      price: price,
      priceWithTax: price,
      totalPrice: price,
      isMiles: isMiles,
      airline: airlineName,
      numeroVoo: firstLeg?.flightNumber || flight.segments?.[0]?.flightNumber || 'N/A',
      departure: firstLeg?.departure || null,
      arrival: firstLeg?.arrival || null,
      departureDate: firstLeg?.departureDate || firstSegment?.departureDate,
      arrivalDate: firstLeg?.arrivalDate || firstSegment?.arrivalDate,
      duration: firstSegment?.duration || 0,
      stops: firstLeg?.numberOfStops || 0,
      ProviderSource: airlineName,
      validatingBy: flight.validatingBy,
      fareGroup: flight.fareGroup,
      flightType: type // Adiciona o tipo do voo (ida ou volta)
    } as any;
  };

  const handleSearchFlights = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Extrai os códigos IATA limpos para a API
      const origemIata = extractIataCode(searchParams.origem);
      const destinoIata = extractIataCode(searchParams.destino);
      
      console.log('🚀 Flights - Iniciando busca na API Moblix...');
      console.log('📋 Flights - Parâmetros originais:', searchParams);
      console.log('🎯 Flights - Códigos IATA extraídos:', { origemIata, destinoIata });
      
      // Busca consolidada usando a API otimizada (todas as companhias de uma vez)
      let allFlights: Flight[] = [];
      
      if (searchParams.soIda) {
        // Busca apenas ida
        console.log(`🔍 Buscando voos de ida apenas...`);
        
        const apiParams = {
          origem: origemIata,
          destino: destinoIata,
          ida: searchParams.ida,
          volta: undefined,
          adultos: searchParams.adultos,
          criancas: searchParams.criancas,
          bebes: searchParams.bebes,
          companhia: -1, // Busca consolidada
          soIda: true
        };
        
        const response = await moblixApiService.consultarVoos(apiParams);
        
        console.log('🔍 Flights - Resposta da API (ida):', response);
        
        if (response?.flights && Array.isArray(response.flights)) {
          console.log('🔍 Flights - Processando', response.flights.length, 'voos de ida');
          const processedFlights = response.flights.map((flight: any) => {
            return processFlightData(flight, 'outbound');
          });
          allFlights.push(...processedFlights);
        }
      } else {
        // Busca ida e volta em paralelo
        console.log(`🔍 Buscando voos de ida e volta em paralelo...`);
        
        const outboundParams = {
          origem: origemIata,
          destino: destinoIata,
          ida: searchParams.ida,
          volta: undefined,
          adultos: searchParams.adultos,
          criancas: searchParams.criancas,
          bebes: searchParams.bebes,
          companhia: -1,
          soIda: true
        };
        
        const returnParams = {
          origem: destinoIata, // Inverte origem e destino para volta
          destino: origemIata,
          ida: searchParams.volta,
          volta: undefined,
          adultos: searchParams.adultos,
          criancas: searchParams.criancas,
          bebes: searchParams.bebes,
          companhia: -1,
          soIda: true
        };
        
        // Executa as duas buscas em paralelo
        const [outboundResponse, returnResponse] = await Promise.all([
          moblixApiService.consultarVoos(outboundParams),
          moblixApiService.consultarVoos(returnParams)
        ]);
        
        console.log('🔍 Flights - Resposta da API (ida):', outboundResponse);
        console.log('🔍 Flights - Resposta da API (volta):', returnResponse);
        
        // Processa voos de ida
        if (outboundResponse?.flights && Array.isArray(outboundResponse.flights)) {
          console.log('🔍 Flights - Processando', outboundResponse.flights.length, 'voos de ida');
          const processedOutbound = outboundResponse.flights.map((flight: any) => {
            return processFlightData(flight, 'outbound');
          });
          allFlights.push(...processedOutbound);
        }
        
        // Processa voos de volta
        if (returnResponse?.flights && Array.isArray(returnResponse.flights)) {
          console.log('🔍 Flights - Processando', returnResponse.flights.length, 'voos de volta');
          const processedReturn = returnResponse.flights.map((flight: any) => {
            return processFlightData(flight, 'return');
          });
          allFlights.push(...processedReturn);
        }
      }
      
      // Debug: verificar estrutura dos voos antes do filtro
      console.log('🔍 Flights - Total de voos antes do filtro:', allFlights.length);
      console.log('🔍 Flights - Primeiro voo estrutura:', allFlights[0]);
      console.log('🔍 Flights - Valor tipoPagamento:', searchParams.tipoPagamento);
      console.log('🔍 Flights - Tipo de tipoPagamento:', typeof searchParams.tipoPagamento);
      
      // Filtrar por tipo de pagamento se especificado
      let filteredFlights = allFlights;
      
      // Debug: verificar propriedade isMiles nos voos
      console.log('🔍 Flights - Verificando propriedade isMiles nos primeiros 3 voos:');
      allFlights.slice(0, 3).forEach((flight, index) => {
        console.log(`Voo ${index}:`, {
          id: (flight as any).rateToken,
          isMiles: flight.isMiles,
          price: flight.price
        });
      });
      
      if (searchParams.tipoPagamento && searchParams.tipoPagamento !== 'ambos') {
        const isFilteringMiles = searchParams.tipoPagamento === 'milhas';
        console.log(`🔍 Flights - Filtrando por: ${isFilteringMiles ? 'milhas' : 'dinheiro'}`);
        
        filteredFlights = allFlights.filter(flight => {
          const flightIsMiles = flight.isMiles === true;
          const shouldInclude = isFilteringMiles ? flightIsMiles : !flightIsMiles;
          
          if (!shouldInclude) {
            console.log(`🔍 Flights - Removendo voo ${(flight as any).rateToken}: isMiles=${flightIsMiles}, filtro=${isFilteringMiles ? 'milhas' : 'dinheiro'}`);
          }
          
          return shouldInclude;
        });
        
        console.log(`🔍 Flights - Após filtro: ${filteredFlights.length} voos restantes`);
      } else {
        console.log('🔍 Flights - Sem filtro de pagamento aplicado (tipoPagamento é "ambos" ou undefined)');
      }
      
      // Ordenar por preço
      const sortedFlights = filteredFlights.sort((a, b) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceA - priceB;
      });
      
      console.log(`🔍 Flights - Voos finais ordenados: ${sortedFlights.length}`);
      console.log(`🔍 Flights - Primeiro voo final:`, sortedFlights[0]);
      
      // Atualizar estado
      setSearchResults(sortedFlights);
      setDisplayedFlights(sortedFlights.slice(0, flightsPerPage));
      setCurrentPage(0);
      
      // Salvar parâmetros no localStorage
      localStorage.setItem('flightSearchParams', JSON.stringify(searchParams));
      console.log('💾 Parâmetros de busca salvos no localStorage:', searchParams);
      
      if (sortedFlights.length === 0) {
        toast.error('Nenhum voo encontrado para os critérios selecionados');
      } else {
        toast.success(`${sortedFlights.length} voos encontrados!`);
      }
      
    } catch (error) {
      console.error('❌ Erro na busca de voos:', error);
      setError('Erro ao buscar voos. Tente novamente.');
      toast.error('Erro ao buscar voos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flights min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Formulário de Busca */}
        <Card className="bg-white shadow-xl border-0 max-w-4xl mx-auto">
          <CardContent className="p-8">
            <form onSubmit={handleFormSubmit}>
              {/* Header com tipo de viagem */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Para onde você quer ir?</h3>
                
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

              {/* Primeira linha: Origem e Destino lado a lado */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Origin */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">De</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input 
                      ref={originInputRef}
                      key={`origin-${forceUpdateCounter}`}
                      placeholder="Insira uma origem"
                      value={searchParams.origem}
                      onChange={(e) => {
                        setSearchParams(prev => ({ ...prev, origem: e.target.value }));
                        
                        // Mostrar formulário completo quando usuário começar a digitar
                        if (e.target.value.length > 0 && !showFullForm) {
                          setShowFullForm(true);
                        }
                        
                        // Aciona a busca automaticamente ao digitar
                        console.log('🔍 Input onChange - Valor:', e.target.value, 'Tamanho:', e.target.value.length);
                        if (e.target.value.length >= 2) {
                          console.log('✅ Chamando searchAirports para origin');
                          const currentValue = e.target.value;
                          setTimeout(() => searchAirportsWithValue('origin', currentValue), 100);
                        } else if (e.target.value.length < 2) {
                          console.log('🚫 Limpando sugestões - valor muito curto');
                          setAirportSuggestions(prev => ({ ...prev, origin: [] }));
                        }
                      }}
                      className="pl-10 h-12 text-base border-gray-300 rounded-lg transition-all duration-200"
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
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 select-none"
                              onMouseDown={(e) => {
                                e.preventDefault();
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                selectAirport(airport, 'origin');
                              }}
                            >
                              <div className="font-medium text-gray-900 text-sm">
                                {airport.Iata} - {airport.Nome.substring(0, 35)}{airport.Nome.length > 35 ? '...' : ''}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{airport.Pais}</div>
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Para</label>
                  <div className="relative">
                    <Plane className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input 
                      ref={destinationInputRef}
                      key={`destination-${forceUpdateCounter}`}
                      placeholder="Insira um destino"
                      value={searchParams.destino}
                      onChange={(e) => {
                        setSearchParams(prev => ({ ...prev, destino: e.target.value }));
                        
                        // Mostrar formulário completo quando usuário começar a digitar
                        if (e.target.value.length > 0 && !showFullForm) {
                          setShowFullForm(true);
                        }
                        
                        // Aciona a busca automaticamente ao digitar
                        console.log('🔍 Input onChange DESTINO - Valor:', e.target.value, 'Tamanho:', e.target.value.length);
                        if (e.target.value.length >= 2) {
                          console.log('✅ Chamando searchAirports para destination');
                          const currentValue = e.target.value;
                          setTimeout(() => searchAirportsWithValue('destination', currentValue), 100);
                        } else if (e.target.value.length < 2) {
                          console.log('🚫 Limpando sugestões destino - valor muito curto');
                          setAirportSuggestions(prev => ({ ...prev, destination: [] }));
                        }
                      }}
                      className="pl-10 h-12 text-base border-gray-300 rounded-lg transition-all duration-200"
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
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 select-none"
                              onMouseDown={(e) => {
                                e.preventDefault();
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                selectAirport(airport, 'destination');
                              }}
                            >
                              <div className="font-medium text-gray-900 text-sm">
                                {airport.Iata} - {airport.Nome.substring(0, 35)}{airport.Nome.length > 35 ? '...' : ''}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{airport.Pais}</div>
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

              {/* Formulário expandido - só aparece quando o usuário começar a digitar */}
              {showFullForm && (
                <>
                  {/* Segunda linha: Datas e Passageiros - Layout colado */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-4">
                    {/* Ida */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ida</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <div 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const newConfig = {type: 'ida' as 'ida' | 'volta', show: true, title: 'Selecionar data de ida'};
                            setCalendarConfig(newConfig);
                          }}
                          className="relative w-full px-4 py-3 pl-10 h-12 text-base bg-white border border-gray-300 rounded-l-lg rounded-r-none border-r-0 cursor-pointer hover:border-blue-400 transition-colors flex items-center"
                        >
                          <span className="text-gray-900 text-sm">
                            {searchParams.ida ? formatDisplayDate(searchParams.ida) : 'dd/mm/aaaa'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Volta */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Volta</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <div 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!searchParams.soIda) {
                              setCalendarConfig({type: 'volta', show: true, title: 'Selecionar data de volta'});
                            }
                          }}
                          className={`relative w-full px-4 py-3 pl-10 h-12 text-base border border-gray-300 rounded-none border-r-0 transition-colors flex items-center ${
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Passageiros</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <select 
                          value={searchParams.adultos}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, adultos: Number(e.target.value) }))}
                          className="w-full pl-10 pr-4 h-12 text-base border border-gray-300 rounded-r-lg rounded-l-none focus:border-blue-500 focus:ring-blue-500 bg-white appearance-none"
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
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
                    {/* Tipo de Voos */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Tipo de Voos</label>
                      <div className="relative">
                        <Sparkles className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <select 
                          value={searchParams.classe || 'economica'}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, classe: e.target.value as 'economica' | 'executiva' | 'primeira' }))}
                          className="w-full pl-10 pr-4 h-12 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white appearance-none"
                        >
                          <option value="economica">Economica</option>
                          <option value="executiva">Executiva</option>
                          <option value="primeira">Primeira</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox para usar milhas + dinheiro */}
                  <div className="mb-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={searchParams.tipoPagamento === 'ambos'}
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
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-300 disabled:to-red-400 text-white font-bold py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
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

        {/* Calendário customizado */}
        {calendarConfig.show && (
          <CustomCalendar
            title={calendarConfig.title}
            onDateSelect={(date) => handleCalendarDateSelect(date, calendarConfig.type)}
            onClose={handleCalendarClose}
            selectedDate={calendarConfig.type === 'ida' ? searchParams.ida : searchParams.volta}
            selectedDates={[searchParams.ida, searchParams.volta].filter(Boolean)} // ✅ NOVO: Passa ambas as datas
            minDate={calendarConfig.type === 'volta' && searchParams.ida ? new Date(searchParams.ida) : new Date()}
          />
        )}

        {/* Seção de Resultados */}
        {/* Resultados da busca usando FlightResults */}
        {searchResults.length > 0 && (
          <FlightResults
            flights={searchResults}
            searchParams={searchParams}
            onNewSearch={handleNewSearch}
            onFlightSelect={handleFlightSelect}
            onFiltersChange={handleFiltersChange}
            onNewSearchWithFilters={handleNewSearchWithFilters}
            isSearching={isLoading}
            isReturnSection={false}
          />
        )}
      </div>
    </div>
  );
};

export default Flights;
