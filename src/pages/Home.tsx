import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Users, Heart, Globe, Plane, Calendar, MapPin, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { useNavigate } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import toast from 'react-hot-toast';
import moblixApiService from '../services/moblixApiService';
import FlightResults from '../components/FlightResultsHome';
import FlightResultCard from '../components/FlightResultCard';
import CustomCalendar from '../components/CustomCalendar';
import FlightLoadingOverlay from '../components/FlightLoadingOverlay';
import SummarySection from '../components/SummarySection';
import StripeButton from '../components/StripeButton';

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
  orderBy: 'tempo' | 'preco';
  soIda: boolean;
  classe: 'economica' | 'executiva' | 'primeira';
}

const Home: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = [
    "/images/upscalemedia-transformed-1-scaled.webp", // Custom image 1
    "/images/upscalemedia-transformed-2-scaled.webp", // Custom image 2
    "/images/upscalemedia-transformed-3-scaled.webp"  // Custom image 3
  ];
  const navigate = useNavigate();
  const { clear } = useSelection();
  const { isAuthenticated } = useAuth();
  const { isPremium } = useSubscription();
  
  // Estados para busca de voos
  const [isLoading, setIsLoading] = useState(false);
  const [showFlightResults, setShowFlightResults] = useState(false);
  const [flightResults, setFlightResults] = useState<any[]>([]);
  // Novos estados separados para resultados de ida e volta
  const [outboundFlightResults, setOutboundFlightResults] = useState<any[]>([]);
  const [returnFlightResults, setReturnFlightResults] = useState<any[]>([]);
  
  // Use SelectionContext instead of local state
  const { selected: selectedFlights, setOutbound, setReturn, clear: clearSelection } = useSelection();
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
  // Estados para controlar se o formulário completo deve ser exibido
  const [showFullForm, setShowFullForm] = useState(false);

  // Estados para o calendário customizado
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

  // Estados para o novo loading overlay
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showLoadingSidebar, setShowLoadingSidebar] = useState(false);
  const [messageInterval, setMessageInterval] = useState<NodeJS.Timeout | null>(null);

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

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

  // Função auxiliar para formatar data para exibição
  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      // Parse da data YYYY-MM-DD para evitar problemas de timezone
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month é 0-indexed no JS
      
      return date.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit', 
        month: 'short'
      }).replace(',', '');
    } catch {
      return dateString;
    }
  };

  // Função para lidar com seleção de data do calendário
  const handleCalendarDateSelect = (date: Date, type: 'ida' | 'volta') => {
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    if (type === 'ida') {
      setSearchParams(prev => ({ ...prev, ida: formattedDate }));
      
      // Se não está em modo "somente ida" e não tem data de volta, sugere data de volta
      if (!searchParams.soIda && !searchParams.volta) {
        const suggestedReturn = new Date(date);
        suggestedReturn.setDate(suggestedReturn.getDate() + 7); // Sugere 7 dias depois
        const suggestedReturnFormatted = suggestedReturn.toISOString().split('T')[0];
        setSearchParams(prev => ({ ...prev, volta: suggestedReturnFormatted }));
      }
      
      // Se já tem data de volta e a nova data de ida é posterior, ajustar volta
      if (!searchParams.soIda && searchParams.volta && formattedDate > searchParams.volta) {
        const newReturn = new Date(date);
        newReturn.setDate(newReturn.getDate() + 7); // Sugere 7 dias depois da nova ida
        const newReturnFormatted = newReturn.toISOString().split('T')[0];
        setSearchParams(prev => ({ ...prev, volta: newReturnFormatted }));
        toast('Data de volta ajustada automaticamente para ser posterior à ida.', { icon: '⚠️', duration: 4000 });
      }
      
      // Se não é "somente ida", manter calendário aberto e mudar para seleção de volta
      if (!searchParams.soIda) {
        setCalendarConfig(prev => ({ 
          ...prev, 
          type: 'volta', 
          title: 'Selecionar data de volta' 
        }));
        return; // Não fecha o calendário
      }
    } else {
      // Validar se data de volta não é anterior à ida
      if (searchParams.ida && formattedDate < searchParams.ida) {
        toast.error('A data de volta não pode ser anterior à data de ida.');
        return;
      }
      setSearchParams(prev => ({ ...prev, volta: formattedDate }));
    }
    
    // Fecha o calendário apenas se for "somente ida" ou se selecionou a volta
    setCalendarConfig(prev => ({ ...prev, show: false }));
  };

  // Função para fechar o calendário
  const handleCalendarClose = () => {
    setCalendarConfig(prev => ({ ...prev, show: false }));
  };

  // Global airport database - Expanded with cities and groups
  const globalAirports: Airport[] = [
    // BRASIL - Aeroportos Nacionais
    // São Paulo (Múltiplos Aeroportos)
    { Iata: 'GRU', Nome: 'Aeroporto Internacional de São Paulo/Guarulhos', Pais: 'Brasil', Cidade: 'São Paulo', Grupo: 'sao-paulo' },
    { Iata: 'CGH', Nome: 'Aeroporto de São Paulo/Congonhas', Pais: 'Brasil', Cidade: 'São Paulo', Grupo: 'sao-paulo' },
    { Iata: 'VCP', Nome: 'Aeroporto de Viracopos - Campinas', Pais: 'Brasil', Cidade: 'São Paulo', Grupo: 'sao-paulo' },
    
    // Rio de Janeiro (Múltiplos Aeroportos)
    { Iata: 'GIG', Nome: 'Aeroporto Internacional do Rio de Janeiro/Galeão', Pais: 'Brasil', Cidade: 'Rio de Janeiro', Grupo: 'rio-janeiro' },
    { Iata: 'SDU', Nome: 'Aeroporto Santos Dumont', Pais: 'Brasil', Cidade: 'Rio de Janeiro', Grupo: 'rio-janeiro' },
    
    // Belo Horizonte (Múltiplos Aeroportos) 
    { Iata: 'CNF', Nome: 'Aeroporto Internacional de Belo Horizonte/Confins', Pais: 'Brasil', Cidade: 'Belo Horizonte', Grupo: 'belo-horizonte' },
    { Iata: 'PLU', Nome: 'Aeroporto da Pampulha', Pais: 'Brasil', Cidade: 'Belo Horizonte', Grupo: 'belo-horizonte' },
    
    // Outros aeroportos brasileiros
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
    { Iata: 'MCZ', Nome: 'Aeroporto Internacional de Maceió', Pais: 'Brasil', Cidade: 'Maceió' },
    { Iata: 'AJU', Nome: 'Aeroporto Internacional de Aracaju', Pais: 'Brasil', Cidade: 'Aracaju' },
    { Iata: 'THE', Nome: 'Aeroporto Internacional de Teresina', Pais: 'Brasil', Cidade: 'Teresina' },
    { Iata: 'SLZ', Nome: 'Aeroporto Internacional de São Luís', Pais: 'Brasil', Cidade: 'São Luís' },
    { Iata: 'CGB', Nome: 'Aeroporto Internacional de Cuiabá', Pais: 'Brasil', Cidade: 'Cuiabá' },
    { Iata: 'CGR', Nome: 'Aeroporto Internacional de Campo Grande', Pais: 'Brasil', Cidade: 'Campo Grande' },
    { Iata: 'PVH', Nome: 'Aeroporto Internacional de Porto Velho', Pais: 'Brasil', Cidade: 'Porto Velho' },
    { Iata: 'RBR', Nome: 'Aeroporto Internacional de Rio Branco', Pais: 'Brasil', Cidade: 'Rio Branco' },
    
    // ESPANHA - Aeroportos Principais
    { Iata: 'MAD', Nome: 'Aeroporto Adolfo Suárez Madrid-Barajas', Pais: 'Espanha' },
    { Iata: 'BCN', Nome: 'Aeroporto de Barcelona-El Prat', Pais: 'Espanha' },
    { Iata: 'PMI', Nome: 'Aeroporto de Palma de Mallorca', Pais: 'Espanha' },
    { Iata: 'LPA', Nome: 'Aeroporto de Las Palmas Gran Canaria', Pais: 'Espanha' },
    { Iata: 'AGP', Nome: 'Aeroporto de Málaga-Costa del Sol', Pais: 'Espanha' },
    { Iata: 'SVQ', Nome: 'Aeroporto de Sevilla', Pais: 'Espanha' },
    { Iata: 'VLC', Nome: 'Aeroporto de Valencia', Pais: 'Espanha' },
    { Iata: 'BIO', Nome: 'Aeroporto de Bilbao', Pais: 'Espanha' },
    { Iata: 'TFS', Nome: 'Aeroporto de Tenerife Sur', Pais: 'Espanha' },
    { Iata: 'IBZ', Nome: 'Aeroporto de Ibiza', Pais: 'Espanha' },
    { Iata: 'ALC', Nome: 'Aeroporto de Alicante', Pais: 'Espanha' },
    { Iata: 'SDR', Nome: 'Aeroporto de Santander', Pais: 'Espanha' },
    
    // PORTUGAL
    { Iata: 'LIS', Nome: 'Aeroporto Humberto Delgado - Lisboa', Pais: 'Portugal' },
    { Iata: 'OPO', Nome: 'Aeroporto Francisco Sá Carneiro - Porto', Pais: 'Portugal' },
    { Iata: 'FAO', Nome: 'Aeroporto de Faro', Pais: 'Portugal' },
    { Iata: 'FNC', Nome: 'Aeroporto da Madeira - Funchal', Pais: 'Portugal' },
    { Iata: 'PDL', Nome: 'Aeroporto João Paulo II - Açores', Pais: 'Portugal' },
    
    // FRANÇA - Paris (Múltiplos Aeroportos)
    { Iata: 'CDG', Nome: 'Aeroporto Charles de Gaulle - Paris', Pais: 'França', Cidade: 'Paris', Grupo: 'paris' },
    { Iata: 'ORY', Nome: 'Aeroporto de Orly - Paris', Pais: 'França', Cidade: 'Paris', Grupo: 'paris' },
    // Outros aeroportos franceses
    { Iata: 'NCE', Nome: 'Aeroporto Nice Côte d\'Azur', Pais: 'França', Cidade: 'Nice' },
    { Iata: 'LYS', Nome: 'Aeroporto de Lyon', Pais: 'França', Cidade: 'Lyon' },
    { Iata: 'MRS', Nome: 'Aeroporto de Marseille Provence', Pais: 'França', Cidade: 'Marseille' },
    { Iata: 'TLS', Nome: 'Aeroporto de Toulouse-Blagnac', Pais: 'França', Cidade: 'Toulouse' },
    { Iata: 'NTE', Nome: 'Aeroporto de Nantes Atlantique', Pais: 'França', Cidade: 'Nantes' },
    { Iata: 'BOD', Nome: 'Aeroporto de Bordeaux', Pais: 'França', Cidade: 'Bordeaux' },
    
    // ITÁLIA - Roma (Múltiplos Aeroportos)
    { Iata: 'FCO', Nome: 'Aeroporto Leonardo da Vinci - Roma', Pais: 'Itália', Cidade: 'Roma', Grupo: 'roma' },
    { Iata: 'CIA', Nome: 'Aeroporto de Ciampino - Roma', Pais: 'Itália', Cidade: 'Roma', Grupo: 'roma' },
    // Milão (Múltiplos Aeroportos)
    { Iata: 'MXP', Nome: 'Aeroporto de Milão-Malpensa', Pais: 'Itália', Cidade: 'Milão', Grupo: 'milao' },
    { Iata: 'LIN', Nome: 'Aeroporto de Milão-Linate', Pais: 'Itália', Cidade: 'Milão', Grupo: 'milao' },
    { Iata: 'BGY', Nome: 'Aeroporto de Bergamo - Milão', Pais: 'Itália', Cidade: 'Milão', Grupo: 'milao' },
    // Outros aeroportos italianos
    { Iata: 'VCE', Nome: 'Aeroporto Marco Polo - Veneza', Pais: 'Itália', Cidade: 'Veneza' },
    { Iata: 'NAP', Nome: 'Aeroporto Internacional de Nápoles', Pais: 'Itália', Cidade: 'Nápoles' },
    { Iata: 'BLQ', Nome: 'Aeroporto de Bologna', Pais: 'Itália', Cidade: 'Bologna' },
    { Iata: 'FLR', Nome: 'Aeroporto de Florença', Pais: 'Itália', Cidade: 'Florença' },
    { Iata: 'CTA', Nome: 'Aeroporto de Catania', Pais: 'Itália', Cidade: 'Catania' },
    { Iata: 'PMO', Nome: 'Aeroporto de Palermo', Pais: 'Itália', Cidade: 'Palermo' },
    { Iata: 'CAG', Nome: 'Aeroporto de Cagliari', Pais: 'Itália', Cidade: 'Cagliari' },
    { Iata: 'TRN', Nome: 'Aeroporto de Turim', Pais: 'Itália', Cidade: 'Turim' },
    
    // REINO UNIDO - Londres (Múltiplos Aeroportos)
    { Iata: 'LHR', Nome: 'Aeroporto de Heathrow - Londres', Pais: 'Reino Unido', Cidade: 'Londres', Grupo: 'londres' },
    { Iata: 'LGW', Nome: 'Aeroporto de Gatwick - Londres', Pais: 'Reino Unido', Cidade: 'Londres', Grupo: 'londres' },
    { Iata: 'STN', Nome: 'Aeroporto de Stansted - Londres', Pais: 'Reino Unido', Cidade: 'Londres', Grupo: 'londres' },
    { Iata: 'LTN', Nome: 'Aeroporto de Luton - Londres', Pais: 'Reino Unido', Cidade: 'Londres', Grupo: 'londres' },
    { Iata: 'LCY', Nome: 'Aeroporto London City - Londres', Pais: 'Reino Unido', Cidade: 'Londres', Grupo: 'londres' },
    // Outros aeroportos do Reino Unido
    { Iata: 'MAN', Nome: 'Aeroporto de Manchester', Pais: 'Reino Unido', Cidade: 'Manchester' },
    { Iata: 'EDI', Nome: 'Aeroporto de Edimburgo', Pais: 'Reino Unido', Cidade: 'Edimburgo' },
    { Iata: 'GLA', Nome: 'Aeroporto de Glasgow', Pais: 'Reino Unido', Cidade: 'Glasgow' },
    { Iata: 'BHX', Nome: 'Aeroporto de Birmingham', Pais: 'Reino Unido', Cidade: 'Birmingham' },
    
    // ALEMANHA - Frankfurt/Berlim (Múltiplos Aeroportos)
    { Iata: 'FRA', Nome: 'Aeroporto de Frankfurt am Main', Pais: 'Alemanha', Cidade: 'Frankfurt' },
    { Iata: 'TXL', Nome: 'Aeroporto de Berlim-Tegel', Pais: 'Alemanha', Cidade: 'Berlim', Grupo: 'berlim' },
    { Iata: 'SXF', Nome: 'Aeroporto de Berlim-Schönefeld', Pais: 'Alemanha', Cidade: 'Berlim', Grupo: 'berlim' },
    { Iata: 'BER', Nome: 'Aeroporto Brandenburg Berlin', Pais: 'Alemanha', Cidade: 'Berlim', Grupo: 'berlim' },
    // Outros aeroportos alemães
    { Iata: 'MUC', Nome: 'Aeroporto de Munique', Pais: 'Alemanha', Cidade: 'Munique' },
    { Iata: 'DUS', Nome: 'Aeroporto de Düsseldorf', Pais: 'Alemanha', Cidade: 'Düsseldorf' },
    { Iata: 'HAM', Nome: 'Aeroporto de Hamburgo', Pais: 'Alemanha', Cidade: 'Hamburgo' },
    { Iata: 'CGN', Nome: 'Aeroporto de Colônia/Bonn', Pais: 'Alemanha', Cidade: 'Colônia' },
    { Iata: 'STR', Nome: 'Aeroporto de Stuttgart', Pais: 'Alemanha', Cidade: 'Stuttgart' },
    
    // HOLANDA
    { Iata: 'AMS', Nome: 'Aeroporto Amsterdam Schiphol', Pais: 'Holanda', Cidade: 'Amsterdam' },
    { Iata: 'RTM', Nome: 'Aeroporto de Rotterdam', Pais: 'Holanda', Cidade: 'Rotterdam' },
    
    // BÉLGICA
    { Iata: 'BRU', Nome: 'Aeroporto de Bruxelas', Pais: 'Bélgica', Cidade: 'Bruxelas' },
    { Iata: 'ANR', Nome: 'Aeroporto de Antuérpia', Pais: 'Bélgica', Cidade: 'Antuérpia' },
    
    // SUÍÇA
    { Iata: 'ZUR', Nome: 'Aeroporto de Zurique', Pais: 'Suíça', Cidade: 'Zurique' },
    { Iata: 'GVA', Nome: 'Aeroporto de Genebra', Pais: 'Suíça', Cidade: 'Genebra' },
    { Iata: 'BSL', Nome: 'Aeroporto de Basel-Mulhouse', Pais: 'Suíça', Cidade: 'Basel' },
    
    // ÁUSTRIA
    { Iata: 'VIE', Nome: 'Aeroporto de Viena', Pais: 'Áustria', Cidade: 'Viena' },
    { Iata: 'SZG', Nome: 'Aeroporto de Salzburgo', Pais: 'Áustria', Cidade: 'Salzburgo' },
    
    // ESTADOS UNIDOS - Nova York (Múltiplos Aeroportos)
    { Iata: 'JFK', Nome: 'Aeroporto John F. Kennedy - Nova York', Pais: 'Estados Unidos', Cidade: 'Nova York', Grupo: 'nova-york' },
    { Iata: 'LGA', Nome: 'Aeroporto LaGuardia - Nova York', Pais: 'Estados Unidos', Cidade: 'Nova York', Grupo: 'nova-york' },
    { Iata: 'EWR', Nome: 'Aeroporto Newark - Nova York', Pais: 'Estados Unidos', Cidade: 'Nova York', Grupo: 'nova-york' },
    // Los Angeles (Múltiplos Aeroportos)
    { Iata: 'LAX', Nome: 'Aeroporto Internacional de Los Angeles', Pais: 'Estados Unidos', Cidade: 'Los Angeles', Grupo: 'los-angeles' },
    { Iata: 'BUR', Nome: 'Aeroporto de Burbank - Los Angeles', Pais: 'Estados Unidos', Cidade: 'Los Angeles', Grupo: 'los-angeles' },
    { Iata: 'LGB', Nome: 'Aeroporto Long Beach - Los Angeles', Pais: 'Estados Unidos', Cidade: 'Los Angeles', Grupo: 'los-angeles' },
    // Chicago (Múltiplos Aeroportos)
    { Iata: 'ORD', Nome: 'Aeroporto O\'Hare - Chicago', Pais: 'Estados Unidos', Cidade: 'Chicago', Grupo: 'chicago' },
    { Iata: 'MDW', Nome: 'Aeroporto Midway - Chicago', Pais: 'Estados Unidos', Cidade: 'Chicago', Grupo: 'chicago' },
    // Washington D.C. (Múltiplos Aeroportos)
    { Iata: 'DCA', Nome: 'Aeroporto Ronald Reagan - Washington', Pais: 'Estados Unidos', Cidade: 'Washington', Grupo: 'washington' },
    { Iata: 'IAD', Nome: 'Aeroporto Dulles - Washington', Pais: 'Estados Unidos', Cidade: 'Washington', Grupo: 'washington' },
    { Iata: 'BWI', Nome: 'Aeroporto Baltimore-Washington', Pais: 'Estados Unidos', Cidade: 'Washington', Grupo: 'washington' },
    // Outros aeroportos dos EUA
    { Iata: 'MIA', Nome: 'Aeroporto Internacional de Miami', Pais: 'Estados Unidos', Cidade: 'Miami' },
    { Iata: 'SFO', Nome: 'Aeroporto Internacional de São Francisco', Pais: 'Estados Unidos', Cidade: 'São Francisco' },
    { Iata: 'SEA', Nome: 'Aeroporto de Seattle-Tacoma', Pais: 'Estados Unidos', Cidade: 'Seattle' },
    { Iata: 'DFW', Nome: 'Aeroporto Internacional de Dallas/Fort Worth', Pais: 'Estados Unidos', Cidade: 'Dallas' },
    { Iata: 'ATL', Nome: 'Aeroporto Internacional de Atlanta', Pais: 'Estados Unidos', Cidade: 'Atlanta' },
    { Iata: 'BOS', Nome: 'Aeroporto Internacional de Boston', Pais: 'Estados Unidos', Cidade: 'Boston' },
    { Iata: 'DEN', Nome: 'Aeroporto Internacional de Denver', Pais: 'Estados Unidos', Cidade: 'Denver' },
    { Iata: 'LAS', Nome: 'Aeroporto Internacional de Las Vegas', Pais: 'Estados Unidos', Cidade: 'Las Vegas' },
    { Iata: 'PHX', Nome: 'Aeroporto Internacional de Phoenix', Pais: 'Estados Unidos', Cidade: 'Phoenix' },
    { Iata: 'IAH', Nome: 'Aeroporto Internacional de Houston', Pais: 'Estados Unidos', Cidade: 'Houston' },
    { Iata: 'MSP', Nome: 'Aeroporto Internacional de Minneapolis', Pais: 'Estados Unidos', Cidade: 'Minneapolis' },
    
    // CANADÁ - Toronto (Múltiplos Aeroportos)
    { Iata: 'YYZ', Nome: 'Aeroporto Internacional de Toronto', Pais: 'Canadá', Cidade: 'Toronto', Grupo: 'toronto' },
    { Iata: 'YTZ', Nome: 'Aeroporto Billy Bishop Toronto', Pais: 'Canadá', Cidade: 'Toronto', Grupo: 'toronto' },
    // Outros aeroportos canadenses
    { Iata: 'YVR', Nome: 'Aeroporto Internacional de Vancouver', Pais: 'Canadá', Cidade: 'Vancouver' },
    { Iata: 'YUL', Nome: 'Aeroporto Internacional de Montreal', Pais: 'Canadá', Cidade: 'Montreal' },
    { Iata: 'YYC', Nome: 'Aeroporto Internacional de Calgary', Pais: 'Canadá', Cidade: 'Calgary' },
    { Iata: 'YOW', Nome: 'Aeroporto de Ottawa', Pais: 'Canadá', Cidade: 'Ottawa' },
    
    // MÉXICO - Cidade do México (Múltiplos Aeroportos)
    { Iata: 'MEX', Nome: 'Aeroporto Internacional Benito Juárez - Cidade do México', Pais: 'México', Cidade: 'Cidade do México', Grupo: 'cidade-mexico' },
    { Iata: 'NLU', Nome: 'Aeroporto Internacional Felipe Ángeles - Cidade do México', Pais: 'México', Cidade: 'Cidade do México', Grupo: 'cidade-mexico' },
    // Outros aeroportos mexicanos
    { Iata: 'CUN', Nome: 'Aeroporto Internacional de Cancún', Pais: 'México', Cidade: 'Cancún' },
    { Iata: 'GDL', Nome: 'Aeroporto de Guadalajara', Pais: 'México', Cidade: 'Guadalajara' },
    { Iata: 'MTY', Nome: 'Aeroporto de Monterrey', Pais: 'México', Cidade: 'Monterrey' },
    { Iata: 'PVR', Nome: 'Aeroporto de Puerto Vallarta', Pais: 'México', Cidade: 'Puerto Vallarta' },
    { Iata: 'SJD', Nome: 'Aeroporto de Los Cabos', Pais: 'México', Cidade: 'Los Cabos' },
    
    // ARGENTINA - Buenos Aires (Múltiplos Aeroportos)
    { Iata: 'EZE', Nome: 'Aeroporto Internacional Ezeiza - Buenos Aires', Pais: 'Argentina', Cidade: 'Buenos Aires', Grupo: 'buenos-aires' },
    { Iata: 'AEP', Nome: 'Aeroporto Jorge Newbery - Buenos Aires', Pais: 'Argentina', Cidade: 'Buenos Aires', Grupo: 'buenos-aires' },
    // Outros aeroportos argentinos
    { Iata: 'COR', Nome: 'Aeroporto de Córdoba', Pais: 'Argentina', Cidade: 'Córdoba' },
    { Iata: 'MDZ', Nome: 'Aeroporto de Mendoza', Pais: 'Argentina', Cidade: 'Mendoza' },
    { Iata: 'IGR', Nome: 'Aeroporto de Puerto Iguazú', Pais: 'Argentina', Cidade: 'Puerto Iguazú' },
    { Iata: 'BRC', Nome: 'Aeroporto de Bariloche', Pais: 'Argentina', Cidade: 'Bariloche' },
    
    // AUSTRÁLIA - Sydney (Múltiplos Aeroportos)
    { Iata: 'SYD', Nome: 'Aeroporto de Sydney Kingsford Smith', Pais: 'Austrália', Cidade: 'Sydney' },
    { Iata: 'MEL', Nome: 'Aeroporto de Melbourne', Pais: 'Austrália', Cidade: 'Melbourne' },
    { Iata: 'BNE', Nome: 'Aeroporto de Brisbane', Pais: 'Austrália', Cidade: 'Brisbane' },
    { Iata: 'PER', Nome: 'Aeroporto de Perth', Pais: 'Austrália', Cidade: 'Perth' },
    
    // JAPÃO - Tóquio (Múltiplos Aeroportos)
    { Iata: 'NRT', Nome: 'Aeroporto de Narita - Tóquio', Pais: 'Japão', Cidade: 'Tóquio', Grupo: 'toquio' },
    { Iata: 'HND', Nome: 'Aeroporto de Haneda - Tóquio', Pais: 'Japão', Cidade: 'Tóquio', Grupo: 'toquio' },
    // Outros aeroportos japoneses
    { Iata: 'KIX', Nome: 'Aeroporto de Kansai - Osaka', Pais: 'Japão', Cidade: 'Osaka' },
    { Iata: 'ITM', Nome: 'Aeroporto de Itami - Osaka', Pais: 'Japão', Cidade: 'Osaka', Grupo: 'osaka' },
    { Iata: 'NGO', Nome: 'Aeroporto de Nagoya', Pais: 'Japão', Cidade: 'Nagoya' },
    
    // COREIA DO SUL
    { Iata: 'ICN', Nome: 'Aeroporto Internacional de Incheon - Seul', Pais: 'Coreia do Sul', Cidade: 'Seul' },
    { Iata: 'GMP', Nome: 'Aeroporto de Gimpo - Seul', Pais: 'Coreia do Sul', Cidade: 'Seul', Grupo: 'seul' },
    
    // CHINA - Pequim (Múltiplos Aeroportos)
    { Iata: 'PEK', Nome: 'Aeroporto Internacional de Pequim Capital', Pais: 'China', Cidade: 'Pequim', Grupo: 'pequim' },
    { Iata: 'PKX', Nome: 'Aeroporto de Pequim Daxing', Pais: 'China', Cidade: 'Pequim', Grupo: 'pequim' },
    // Shanghai (Múltiplos Aeroportos)
    { Iata: 'PVG', Nome: 'Aeroporto de Shanghai Pudong', Pais: 'China', Cidade: 'Shanghai', Grupo: 'shanghai' },
    { Iata: 'SHA', Nome: 'Aeroporto de Shanghai Hongqiao', Pais: 'China', Cidade: 'Shanghai', Grupo: 'shanghai' },
    // Outros aeroportos chineses
    { Iata: 'CAN', Nome: 'Aeroporto de Guangzhou', Pais: 'China', Cidade: 'Guangzhou' },
    { Iata: 'SZX', Nome: 'Aeroporto de Shenzhen', Pais: 'China', Cidade: 'Shenzhen' },
    
    // PERU - Aeroportos Principais
    { Iata: 'LIM', Nome: 'Aeroporto Internacional Jorge Chávez - Lima', Pais: 'Peru', Cidade: 'Lima' },
    { Iata: 'CUZ', Nome: 'Aeroporto Internacional Alejandro Velasco Astete - Cusco', Pais: 'Peru', Cidade: 'Cusco' },
    { Iata: 'AQP', Nome: 'Aeroporto Internacional Rodríguez Ballón - Arequipa', Pais: 'Peru', Cidade: 'Arequipa' },
    { Iata: 'TRU', Nome: 'Aeroporto Internacional Capitán FAP Carlos Martínez de Pinillos - Trujillo', Pais: 'Peru', Cidade: 'Trujillo' },
    { Iata: 'PIU', Nome: 'Aeroporto Internacional Capitán FAP Guillermo Concha Iberico - Piura', Pais: 'Peru', Cidade: 'Piura' },
    { Iata: 'IQT', Nome: 'Aeroporto Internacional Coronel FAP Francisco Secada Vignetta - Iquitos', Pais: 'Peru', Cidade: 'Iquitos' }
  ];

  // Search airports with direct value to avoid stale state issues
  const searchAirportsWithValue = useCallback(async (field: 'origin' | 'destination', searchValue: string) => {
    console.log('🚀 Home - searchAirportsWithValue INICIADA - field:', field, 'value:', searchValue);
    console.log('🚀 Home - searchAirportsWithValue - searchValue:', searchValue, 'length:', searchValue.length);
    
    if (searchValue.length < 2) {
      console.log('⚠️ Home - searchValue muito curto, limpando sugestões');
      setAirportSuggestions(prev => ({ ...prev, [field]: [] }));
      return;
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Criar novo AbortController para esta requisição
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoadingAirports(prev => ({ ...prev, [field]: true }));
    
    try {
      console.log('🔍 Home - Buscando aeroportos com termo:', searchValue);
      
      // SEMPRE busca na lista local primeiro (garante que GRU seja encontrado)
      const localFiltered = globalAirports.filter(airport => 
        airport.Nome.toLowerCase().includes(searchValue.toLowerCase()) ||
        airport.Iata.toLowerCase().includes(searchValue.toLowerCase()) ||
        airport.Pais.toLowerCase().includes(searchValue.toLowerCase()) ||
        (airport.Cidade && airport.Cidade.toLowerCase().includes(searchValue.toLowerCase()))
      );
      
      let finalResults: Airport[] = [];
      
      // Se encontrou resultados locais, usa sempre (prioriza lista local)
      if (localFiltered.length > 0) {
        console.log('✅ Home - Encontrados', localFiltered.length, 'aeroportos locais');
        // Priorizar aeroportos agrupados da mesma cidade/região
        const groupedResults = localFiltered.sort((a, b) => {
          // Prioriza aeroportos com Cidade definida
          if (a.Cidade && !b.Cidade) return -1;
          if (!a.Cidade && b.Cidade) return 1;
          
          // Se ambos têm cidade, prioriza aeroportos com grupos
          if (a.Cidade && b.Cidade) {
            if (a.Grupo && !b.Grupo) return -1;
            if (!a.Grupo && b.Grupo) return 1;
            
            // Se ambos têm grupo, ordena alfabeticamente por cidade
            if (a.Grupo && b.Grupo) {
              return a.Cidade.localeCompare(b.Cidade, 'pt-BR');
            }
          }
          
          // Ordenação padrão por nome
          return a.Nome.localeCompare(b.Nome, 'pt-BR');
        });
        
        finalResults = groupedResults.slice(0, 8);
      } else {
        console.log('⚠️ Home - Nenhum aeroporto local encontrado, tentando API Moblix');
        // Só tenta a API Moblix se não encontrou nada localmente
        try {
          // Verificar se a requisição foi cancelada antes de fazer a chamada da API
          if (signal.aborted) {
            return;
          }
          
          const apiResponse = await moblixApiService.buscarAeroportos(searchValue);
          console.log('🔍 Home - Resposta da API Moblix:', apiResponse);
          
          // Verificar novamente se foi cancelada após a resposta
          if (signal.aborted) {
            return;
          }
          
          if (apiResponse && apiResponse.Data && Array.isArray(apiResponse.Data) && apiResponse.Data.length > 0) {
            // Mapear dados da API Moblix para o formato esperado
            finalResults = apiResponse.Data.map((airport: any) => ({
              Iata: airport.Iata,
              Nome: airport.Nome,
              Pais: airport.Pais,
              Cidade: airport.Cidade
            })).slice(0, 8);
            console.log('✅ Home - Usando', finalResults.length, 'aeroportos da API Moblix');
          } else {
            console.log('⚠️ Home - API Moblix não retornou resultados válidos');
          }
        } catch (apiError: any) {
          // Ignorar erros de cancelamento
          if (apiError.name === 'AbortError') {
            return;
          }
          console.warn('⚠️ Home - Erro na API Moblix:', apiError);
        }
      }
      
      // Verificar se foi cancelada antes de atualizar o estado
      if (signal.aborted) {
        return;
      }
      
      console.log('📋 Home - Atualizando sugestões com', finalResults.length, 'resultados');
      setAirportSuggestions(prev => ({ ...prev, [field]: finalResults }));
      
    } catch (error: any) {
      // Ignorar erros de cancelamento
      if (error.name === 'AbortError') {
        console.log('🚫 Home - Busca de aeroportos cancelada');
        return;
      }
      console.error('❌ Home - Erro geral na busca:', error);
      setAirportSuggestions(prev => ({ ...prev, [field]: [] }));
    } finally {
      // Só atualizar loading se não foi cancelado
      if (!signal.aborted) {
        setIsLoadingAirports(prev => ({ ...prev, [field]: false }));
      }
    }
  }, []);

  // Search airports using hybrid approach (API + local filtering)
  const searchAirports = useCallback(async (field: 'origin' | 'destination') => {
    const searchValue = field === 'origin' ? searchParams.origem : searchParams.destino;
    
    if (searchValue.length < 2) {
      setAirportSuggestions(prev => ({ ...prev, [field]: [] }));
      return;
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Criar novo AbortController para esta requisição
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoadingAirports(prev => ({ ...prev, [field]: true }));
    
    try {
      // SEMPRE busca na lista local primeiro (garante que GRU seja encontrado)
      const localFiltered = globalAirports.filter(airport => 
        airport.Nome.toLowerCase().includes(searchValue.toLowerCase()) ||
        airport.Iata.toLowerCase().includes(searchValue.toLowerCase()) ||
        airport.Pais.toLowerCase().includes(searchValue.toLowerCase()) ||
        (airport.Cidade && airport.Cidade.toLowerCase().includes(searchValue.toLowerCase()))
      );
      
      let finalResults: Airport[] = [];
      
      // Se encontrou resultados locais, usa sempre (prioriza lista local)
      if (localFiltered.length > 0) {
        // Priorizar aeroportos agrupados da mesma cidade/região
        const groupedResults = localFiltered.sort((a, b) => {
          // Prioriza aeroportos com Cidade definida
          if (a.Cidade && !b.Cidade) return -1;
          if (!a.Cidade && b.Cidade) return 1;
          
          // Se ambos têm cidade, prioriza aeroportos com grupos
          if (a.Cidade && b.Cidade) {
            if (a.Grupo && !b.Grupo) return -1;
            if (!a.Grupo && b.Grupo) return 1;
            
            // Se ambos têm grupo, ordena alfabeticamente por cidade
            if (a.Grupo && b.Grupo) {
              return a.Cidade.localeCompare(b.Cidade, 'pt-BR');
            }
          }
          
          // Ordenação padrão por nome
          return a.Nome.localeCompare(b.Nome, 'pt-BR');
        });
        
        finalResults = groupedResults.slice(0, 8);
      } else {
        // Só tenta a API Moblix se não encontrou nada localmente
        try {
          // Verificar se a requisição foi cancelada antes de fazer a chamada da API
          if (signal.aborted) {
            return;
          }
          
          const apiResponse = await moblixApiService.buscarAeroportos(searchValue);
          
          // Verificar novamente se foi cancelada após a resposta
          if (signal.aborted) {
            return;
          }
          
          if (apiResponse && Array.isArray(apiResponse) && apiResponse.length > 0) {
            finalResults = apiResponse.slice(0, 8);
          }
        } catch (apiError: any) {
          // Ignorar erros de cancelamento
          if (apiError.name === 'AbortError') {
            return;
          }
          console.warn('⚠️ Home - Erro na API Moblix:', apiError);
        }
      }
      
      // Verificar se foi cancelada antes de atualizar o estado
      if (signal.aborted) {
        return;
      }
      
      setAirportSuggestions(prev => ({ ...prev, [field]: finalResults }));
      
    } catch (error: any) {
      // Ignorar erros de cancelamento
      if (error.name === 'AbortError') {
        console.log('🚫 Home - Busca de aeroportos cancelada');
        return;
      }
      console.error('❌ Home - Erro geral na busca:', error);
      setAirportSuggestions(prev => ({ ...prev, [field]: [] }));
    } finally {
      // Só atualizar loading se não foi cancelado
      if (!signal.aborted) {
        setIsLoadingAirports(prev => ({ ...prev, [field]: false }));
      }
    }
  }, [searchParams.origem, searchParams.destino]);

  // Handle input focus
  const handleInputFocus = (field: 'origin' | 'destination') => {
    setShowAirportSuggestions(prev => ({ ...prev, [field]: true }));
    searchAirports(field);
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
          const departure = firstSegment?.departure || firstSegment?.legs?.[0]?.departure || flight.Voos?.[0]?.Origem || flight.Origem || extractIataCode(paramsForNorm.origem) || 'GRU';
          const arrival = lastSegment?.arrival || lastSegment?.legs?.[lastSegment?.legs?.length - 1]?.arrival || flight.Voos?.[flight.Voos?.length - 1]?.Destino || flight.Destino || extractIataCode(paramsForNorm.destino) || 'CNF';
          const origemBusca = extractIataCode(paramsForNorm.origem);
          const destinoBusca = extractIataCode(paramsForNorm.destino);

          let normalizedSegments: any[] = [];
          if (flight.segments && Array.isArray(flight.segments)) {
            normalizedSegments = flight.segments.map((segment: any) => {
              let segDeparture = segment.departure || segment.Origem || segment.legs?.[0]?.departure || flight.Origem || extractIataCode(paramsForNorm.origem) || 'GRU';
              let segArrival = segment.arrival || segment.Destino || segment.legs?.[segment.legs?.length - 1]?.arrival || flight.Destino || extractIataCode(paramsForNorm.destino) || 'CNF';
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
                duration: segment.duration || '2h 30m',
                legs: segment.legs || []
              };
            });
          } else if (flight.Voos && Array.isArray(flight.Voos)) {
            normalizedSegments = flight.Voos.map((voo: any) => {
              let vooDeparture = voo.Origem || voo.departure || flight.Origem || extractIataCode(paramsForNorm.origem) || 'GRU';
              let vooArrival = voo.Destino || voo.arrival || flight.Destino || extractIataCode(paramsForNorm.destino) || 'CNF';
              if (isMilesFlag && origemBusca && destinoBusca) {
                if (vooDeparture === destinoBusca && vooArrival === origemBusca) {
                  vooDeparture = origemBusca;
                  vooArrival = destinoBusca;
                }
              }
              return {
                departure: vooDeparture,
                arrival: vooArrival,
                departureDate: voo.Saida,
                arrivalDate: voo.Chegada,
                duration: voo.Tempo || '2h 30m',
                flightNumber: voo.Numero || 'N/A'
              };
            });
          } else {
            let finalDeparture = departure;
            let finalArrival = arrival;
            if (isMilesFlag && origemBusca && destinoBusca) {
              if (departure === destinoBusca && arrival === origemBusca) {
                finalDeparture = origemBusca;
                finalArrival = destinoBusca;
              }
            }
            normalizedSegments = [{
              departure: finalDeparture,
              arrival: finalArrival,
              departureDate: flight.DepartureDate || flight.departureDate || flight.Saida || null,
              arrivalDate: flight.ArrivalDate || flight.arrivalDate || flight.Chegada || null,
              duration: flight.Duration || flight.duration || flight.Tempo || flight.TempoTotalStr || null,
              legs: []
            }];
          }

          // Extração robusta de origem e destino com múltiplas tentativas
          const extractedOrigem = flight.Origem || 
                                  flight.departure ||
                                  normalizedSegments[0]?.departure ||
                                  normalizedSegments[0]?.Origem ||
                                  extractIataCode(paramsForNorm.origem) ||
                                  departure ||
                                  'GRU';
          
          const extractedDestino = flight.Destino || 
                                   flight.arrival ||
                                   normalizedSegments[normalizedSegments.length - 1]?.arrival ||
                                   normalizedSegments[normalizedSegments.length - 1]?.Destino ||
                                   extractIataCode(paramsForNorm.destino) ||
                                   arrival ||
                                   'CNF';
          
          console.log('🔍 NORMALIZING FLIGHT:', {
            'isMiles': isMilesFlag,
            'finalPrice': finalPrice,
            'flight.Origem': flight.Origem,
            'flight.departure': flight.departure,
            'segments[0].departure': normalizedSegments[0]?.departure,
            'extractedOrigem': extractedOrigem,
            'extractedDestino': extractedDestino
          });
          
          const normalizedFlight = {
            ...flight,
            price: finalPrice,
            priceWithTax: finalPrice,
            totalPrice: finalPrice,
            isMiles: isMilesFlag,
            departure: extractedOrigem,
            arrival: extractedDestino,
            Origem: extractedOrigem,
            Destino: extractedDestino,
            airline: flight.airline || flight.ProviderSource || 'Companhia Aérea',
            CompanhiaAerea: flight.CompanhiaAerea || flight.airline || flight.ProviderSource || 'Companhia Aérea',
            NumeroVoo: flight.NumeroVoo || flight.numeroVoo || flight.Voos?.[0]?.Numero || flight.FlightCode || 'LA001',
            segments: normalizedSegments.map(seg => ({
              ...seg,
              departure: (seg.departure && seg.departure !== 'N/A') ? seg.departure : extractedOrigem,
              arrival: (seg.arrival && seg.arrival !== 'N/A') ? seg.arrival : extractedDestino,
              Origem: (seg.Origem && seg.Origem !== 'N/A') ? seg.Origem : extractedOrigem,
              Destino: (seg.Destino && seg.Destino !== 'N/A') ? seg.Destino : extractedDestino
            })),
            numeroVoo: flight.numeroVoo || flight.Voos?.[0]?.Numero || flight.FlightCode || 'LA001'
          };
          return normalizedFlight;
        }).filter((flight: any) => flight !== null);
    return normalizedFlights;
  };

  // Nova função para realizar buscas separadas de ida e volta
  const performSearch = async (params: SearchParams) => {
    // Validação: data de volta não pode ser anterior à data de ida
    if (!params.soIda && params.volta && params.ida && params.volta < params.ida) {
      toast.error('A data de volta não pode ser anterior à data de ida.');
      return;
    }

    setIsLoading(true);
    setShowLoadingSidebar(true);
    setLoadingMessage('🔎 Buscando voos...');
    try {
      const origemIata = extractIataCode(params.origem) || params.origem?.toUpperCase();
      const destinoIata = extractIataCode(params.destino) || params.destino?.toUpperCase();

      // Somente ida: mantém o fluxo atual simples
      if (params.soIda || !params.volta) {
        setLoadingMessage('🔎 Buscando voos de ida...');
        const resultIda = await moblixApiService.consultarVoos({
          origem: origemIata,
          destino: destinoIata,
          ida: params.ida,
          adultos: params.adultos,
          criancas: params.criancas,
          bebes: params.bebes,
          companhia: -1, // Buscar todas as companhias
          tipoPagamento: params.tipoPagamento,
          classe: params.classe
        });
        console.log('🔍 Home - Processando resultado IDA (somente ida):', {
          tipoResultIda: typeof resultIda,
          isArray: Array.isArray(resultIda),
          hasFlights: resultIda?.flights?.length || 0,
          hasData: resultIda?.Data?.[0]?.flights?.length || 0
        });
        
        const rawOut = Array.isArray(resultIda?.flights) ? resultIda.flights : 
                       Array.isArray(resultIda) ? resultIda : 
                       (resultIda?.Data?.[0]?.flights ?? resultIda?.Data?.[0]?.Ida ?? resultIda?.Data ?? []);
        
        console.log('🔍 Home - Raw flights extraídos (somente ida):', {
          total: rawOut.length,
          primeiro: rawOut[0] ? {
            rateToken: rawOut[0].rateToken || rawOut[0].segments?.[0]?.rateToken,
            fareGroup: !!rawOut[0].fareGroup
          } : null
        });
        
        const normalizedOut = normalizeFlights(rawOut, params);
        
        console.log('🔍 Home - Voos normalizados (somente ida):', {
          total: normalizedOut.length,
          primeiro: normalizedOut[0] ? {
            price: normalizedOut[0].price,
            priceWithTax: normalizedOut[0].priceWithTax,
            segments: normalizedOut[0].segments?.length
          } : null
        });
        setOutboundFlightResults(normalizedOut);
        setFlightResults(normalizedOut);
        setReturnFlightResults([]);
        setShowFlightResults(true);
        setLoadingMessage(`✈️ ${normalizedOut.length} voos de ida encontrados`);

        const noOutbound = normalizedOut.length === 0;
        if (noOutbound) {
          toast('Nenhum voo encontrado para os critérios selecionados.', { icon: 'ℹ️', duration: 4000 });
        } else {
          toast.success('Resultados atualizados!');
        }
        return;
      }

      // Ida e volta: buscar as duas rotas em paralelo (X->Z e Z->X) com logs e tolerância a falhas
      setLoadingMessage('🔁 Buscando ida e volta em paralelo...');
      console.log('Home -> Outbound params', { origem: origemIata, destino: destinoIata, ida: params.ida, adultos: params.adultos, criancas: params.criancas, bebes: params.bebes, companhia: params.companhia, classe: params.classe });
      console.log('Home -> Return params', { origem: destinoIata, destino: origemIata, ida: params.volta, adultos: params.adultos, criancas: params.criancas, bebes: params.bebes, companhia: params.companhia, classe: params.classe });

      const [outcomeIda, outcomeVolta] = await Promise.allSettled([
        moblixApiService.consultarVoos({
          origem: origemIata,
          destino: destinoIata,
          ida: params.ida,
          adultos: params.adultos,
          criancas: params.criancas,
          bebes: params.bebes,
          companhia: -1, // Buscar todas as companhias
          tipoPagamento: params.tipoPagamento,
          classe: params.classe
        }),
        moblixApiService.consultarVoos({
          origem: destinoIata,
          destino: origemIata,
          ida: params.volta,
          adultos: params.adultos,
          criancas: params.criancas,
          bebes: params.bebes,
          companhia: -1, // Buscar todas as companhias
          tipoPagamento: params.tipoPagamento,
          classe: params.classe
        })
      ]);

      const resultIda = outcomeIda.status === 'fulfilled' ? outcomeIda.value : null;
      const resultVolta = outcomeVolta.status === 'fulfilled' ? outcomeVolta.value : null;
      if (outcomeIda.status === 'rejected') {
        console.log('❌ Home -> Outbound request failed:', outcomeIda.reason);
      } else {
        console.log('✅ Home -> Outbound request succeeded');
      }
      if (outcomeVolta.status === 'rejected') {
        console.log('❌ Home -> Return request failed:', outcomeVolta.reason);
      } else {
        console.log('✅ Home -> Return request succeeded');
      }

      // Normalizar os resultados individualmente (usa vazio se alguma perna falhar)
      console.log('🔍 Home - Processando resultado IDA:', {
        tipoResultIda: typeof resultIda,
        isArray: Array.isArray(resultIda),
        hasFlights: resultIda?.flights?.length || 0,
        hasData: resultIda?.Data?.[0]?.flights?.length || 0
      });
      
      const rawOut = Array.isArray(resultIda?.flights) ? resultIda.flights : 
                     Array.isArray(resultIda) ? resultIda : 
                     (resultIda?.Data?.[0]?.flights ?? resultIda?.Data?.[0]?.Ida ?? resultIda?.Data ?? []);
      
      console.log('🔍 Home - Raw flights extraídos:', {
        total: rawOut.length,
        primeiro: rawOut[0] ? {
          rateToken: rawOut[0].rateToken || rawOut[0].segments?.[0]?.rateToken,
          fareGroup: !!rawOut[0].fareGroup
        } : null
      });
      
      const normalizedOut = normalizeFlights(rawOut, params);
      
      console.log('🔍 Home - Voos normalizados:', {
        total: normalizedOut.length,
        primeiro: normalizedOut[0] ? {
          price: normalizedOut[0].price,
          priceWithTax: normalizedOut[0].priceWithTax,
          segments: normalizedOut[0].segments?.length
        } : null
      });

      const rawRet = Array.isArray(resultVolta?.flights) ? resultVolta.flights : 
                     Array.isArray(resultVolta) ? resultVolta : 
                     (resultVolta?.Data?.[0]?.flights ?? resultVolta?.Data?.[0]?.Ida ?? resultVolta?.Data ?? []);
      console.log('🔍 Home - Processando resultado VOLTA:', {
        tipoResultVolta: typeof resultVolta,
        isArray: Array.isArray(resultVolta),
        hasFlights: resultVolta?.flights?.length || 0,
        hasData: resultVolta?.Data?.[0]?.flights?.length || 0
      });
      
      console.log('🔍 Home - Raw flights volta extraídos:', {
        total: rawRet.length,
        primeiro: rawRet[0] ? {
          rateToken: rawRet[0].rateToken || rawRet[0].segments?.[0]?.rateToken,
          fareGroup: !!rawRet[0].fareGroup
        } : null
      });

      const normalizedRet = normalizeFlights(rawRet, {
        ...params,
        origem: params.destino,
        destino: params.origem,
        ida: params.volta,
        volta: ''
      });
      
      console.log('🔍 Home - Voos volta normalizados:', {
        total: normalizedRet.length,
        primeiro: normalizedRet[0] ? {
          price: normalizedRet[0].price,
          priceWithTax: normalizedRet[0].priceWithTax,
          segments: normalizedRet[0].segments?.length
        } : null
      });

      setOutboundFlightResults(normalizedOut);
      setReturnFlightResults(normalizedRet);
      setFlightResults(normalizedOut); // compatibilidade
      setShowFlightResults(true);
      setLoadingMessage(`✅ ${normalizedOut.length} ida • ${normalizedRet.length} volta`);

      const noOutbound = normalizedOut.length === 0;
      const noReturn = normalizedRet.length === 0;
      if (noOutbound && noReturn) {
        toast('Nenhum voo encontrado para os critérios selecionados.', { icon: 'ℹ️', duration: 4000 });
      } else {
        toast.success('Resultados atualizados!');
      }
    } catch (error: any) {
      console.error('❌ Home - Erro na busca:', error);
      toast.error(`Erro ao buscar voos: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setShowLoadingSidebar(false);
        setLoadingMessage('');
      }, 800);
    }
  };

  // Handle input blur
  const handleBlur = (field: 'origin' | 'destination') => {
    // Delay to allow for suggestion click - AUMENTADO para 500ms
    setTimeout(() => {
      setShowAirportSuggestions(prev => ({ ...prev, [field]: false }));
    }, 500); // Aumentei de 200ms para 500ms
  };

  // Select airport
  const selectAirport = (airport: Airport, field: 'origin' | 'destination') => {
    // Extrai a cidade/estado do nome do aeroporto
    const getCityFromAirportName = (name: string): string => {
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
          return extracted;
        }
      }
      
      // Se não conseguir extrair, usa o país como fallback
      return airport.Pais;
    };
    
    const city = getCityFromAirportName(airport.Nome);
    const displayValue = `${city} (${airport.Iata})`;
    
    // MÉTODO 1: Primeiro esconde sugestões e bloqueia busca
    setShowAirportSuggestions(prev => ({ ...prev, [field]: false }));
    setSkipAutoSearch(prev => ({ ...prev, [field]: true }));
    
    // MÉTODO 2: Atualiza o input diretamente via DOM (garantia extra)
    const inputRef = field === 'origin' ? originInputRef : destinationInputRef;
    if (inputRef.current) {
      inputRef.current.value = displayValue;
    }
    
    // MÉTODO 3: Atualiza o estado React (método principal)
    if (field === 'origin') {
      setSearchParams(prev => ({ ...prev, origem: displayValue }));
    } else {
      setSearchParams(prev => ({ ...prev, destino: displayValue }));
    }
    
    // MÉTODO 4: Força re-render do componente
    setForceUpdateCounter(prev => prev + 1);
    
    // Verifica se o valor foi realmente aplicado após um pequeno delay
    setTimeout(() => {
      const currentValue = field === 'origin' ? searchParams.origem : searchParams.destino;
      const currentDOMValue = inputRef.current?.value || 'N/A';
      
      if (currentValue !== displayValue) {
        if (field === 'origin') {
          setSearchParams(prev => ({ ...prev, origem: displayValue }));
        } else {
          setSearchParams(prev => ({ ...prev, destino: displayValue }));
        }
      }
      
      if (currentDOMValue !== displayValue) {
        if (inputRef.current) {
          inputRef.current.value = displayValue;
        }
      }
    }, 100);
    
    // Reabilita busca automática após delay maior
    setTimeout(() => {
      setSkipAutoSearch(prev => ({ ...prev, [field]: false }));
    }, 800);
  };

  // Função para extrair apenas o código IATA do valor do input
  const extractIataCode = (airportValue: string): string => {
    if (!airportValue) return '';
    
    // Padrão: "Cidade (IATA)" -> extrair apenas IATA
    const parenMatch = airportValue.match(/\(([A-Z]{3})\)/);
    if (parenMatch && parenMatch[1]) {
      const iataCode = parenMatch[1].trim().toUpperCase();
      return iataCode;
    }
    
    // Se o valor contém " - ", pega apenas a primeira parte (código IATA)
    if (airportValue.includes(' - ')) {
      const iataCode = airportValue.split(' - ')[0].trim().toUpperCase();
      return iataCode;
    }
    // Se for exatamente 3 letras, assume que já é IATA
    if (/^[A-Za-z]{3}$/.test(airportValue.trim())) {
      return airportValue.trim().toUpperCase();
    }

    // Como fallback, tenta extrair as últimas 3 letras entre parênteses ao final
    const endMatch = airportValue.match(/([A-Za-z]{3})$/);
    if (endMatch && endMatch[1]) {
      return endMatch[1].toUpperCase();
    }

    return '';
  };

  // Handle form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpar seleções e storage ao iniciar uma nova busca
    try {
      clear();
      localStorage.removeItem('flightSelections');
      localStorage.removeItem('originalPurchase');
      localStorage.removeItem('precoMinimoVolta');
      localStorage.removeItem('reopenSelectionAfterSearch');
    } catch {}

    // Resetar estados locais para evitar qualquer pré-visualização/summary
    setShowFlightResults(false);
    setFlightResults([]);
    setOutboundFlightResults([]);
    setReturnFlightResults([]);
    clearSelection();

    await performSearch(searchParams);
  };

  // Handle new search with filters - manter uma única definição

  // Função para voltar à busca
  const handleNewSearch = () => {
    // Limpar seleções globais e storage relacionado
    try {
      clear();
      localStorage.removeItem('flightSelections');
      localStorage.removeItem('originalPurchase');
      localStorage.removeItem('precoMinimoVolta');
      localStorage.removeItem('reopenSelectionAfterSearch');
    } catch {}

    // Reset completo de todos os estados
    setShowFlightResults(false);
    setFlightResults([]);
    setOutboundFlightResults([]);
    setReturnFlightResults([]);
    clearSelection();
    setIsLoading(false);
    setShowLoadingSidebar(false);
    setLoadingMessage('');
    
    // Forçar re-render para garantir que o estado seja limpo
    setTimeout(() => {
      setShowFlightResults(false);
      clearSelection();
    }, 100);
    
    // Scroll para o topo da página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle flight selection
  const handleFlightSelect = (flight: any, type: 'outbound' | 'return') => {
    console.log(`✈️ Voo ${type} selecionado:`, flight);
    if (type === 'outbound') {
      setOutbound(flight);
      // Se selecionou só o voo de ida, mostra mensagem para continuar
      toast.success('Voo de ida selecionado! Agora escolha seu voo de volta.');
    } else if (type === 'return') {
      setReturn(flight);
      // IMPORTANTE: NÃO fazer nova busca aqui - apenas completar a seleção
      toast.success('Voos selecionados com sucesso!');
      console.log('🎯 SELEÇÃO COMPLETA - Ida e volta selecionados');
    }
  };

  // Handle filters change from FlightResults component
  const handleFiltersChange = (newFilterParams: Partial<SearchParams>) => {
    console.log('🎛️ Home - Recebendo mudanças nos filtros:', newFilterParams);
    setSearchParams(prev => ({
      ...prev,
      ...newFilterParams
    }));
  };

  // Handle new search with current filters
  const handleNewSearchWithFilters = (currentParams: SearchParams) => {
    console.log('🔍 Home - Nova busca solicitada com filtros atuais:', currentParams);
    // Atualiza os searchParams com os valores atuais e dispara nova busca
    setSearchParams(currentParams);
    // Simula submit do formulário com os novos parâmetros
    setTimeout(() => {
      handleFormSubmit(new Event('submit') as any);
    }, 100);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Troca a imagem a cada 5 segundos

    return () => clearInterval(interval);
  }, [heroImages.length]);


  return (
    <div id="topo" className="min-h-screen">
      {/* Hero Section */}
      <section className="hero relative min-h-[60vh] flex items-end justify-center overflow-visible w-full pb-0" style={{backgroundColor: 'rgba(6, 13, 28, 0.7)'}}>
        {/* Background Carousel */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={image}
                alt={`Hero background ${index + 1}`}
                className="w-full h-full object-cover opacity-100"
              />
            </div>
          ))}
        </div>

        {/* Blue Overlay for 70% transparency */}
        <div className="absolute inset-0 z-10" style={{backgroundColor: 'rgba(6, 13, 28, 0.7)'}}></div>

        {/* Content */}
        <div className="container mx-auto relative z-20 pb-12 pt-20">
          <div className="flex justify-center items-center">
            <div className="text-center max-w-4xl">
              <h1 className="hero__title">
                A forma mais simples e honesta de viajar com milhas — sem truques, sem taxas, sem viagem.
              </h1>
              <p className="hero__subtitle">
                Viaje pagando quase nada. Busque, ative alertas e aproveite o poder real das milhas.
              </p>

              {/* Search Form - Posicionado para ficar metade na hero e metade na próxima seção */}
              <div id="flight-search-form" className="w-full max-w-4xl mt-4 relative" style={{transform: 'translateY(30%)'}}>
                <Card className="bg-white shadow-xl border-0">
                  <CardContent className="p-6">
                    <form onSubmit={handleFormSubmit}>
                      {/* Header com tipo de viagem */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Encontrar meu próximo destino</h3>
                        
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
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4" style={{textAlign: 'left'}}>
                        {/* Origin */}
                        <div className="space-y-2" style={{textAlign: 'left'}}>
                          <label className="text-sm font-medium text-gray-700" style={{textAlign: 'left'}}>De</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input 
                              ref={originInputRef}
                              key={`origin-${forceUpdateCounter}`}
                              placeholder="Insira uma origem"
                              value={searchParams.origem}
                              onChange={(e) => {
                                const currentValue = e.target.value;
                                setSearchParams(prev => ({ ...prev, origem: currentValue }));
                                
                                if (currentValue.length > 0 && !showFullForm) {
                                  setShowFullForm(true);
                                }
                                
                                setTimeout(() => searchAirportsWithValue('origin', currentValue), 100);
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
                          <label className="text-sm font-medium text-gray-700" style={{textAlign: 'left'}}>Para</label>
                          <div className="relative">
                            <Plane className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input 
                              ref={destinationInputRef}
                              key={`destination-${forceUpdateCounter}`}
                              placeholder="Insira um destino"
                              value={searchParams.destino}
                              onChange={(e) => {
                                const currentValue = e.target.value;
                                setSearchParams(prev => ({ ...prev, destino: currentValue }));
                                
                                if (currentValue.length > 0 && !showFullForm) {
                                  setShowFullForm(true);
                                }
                                
                                setTimeout(() => searchAirportsWithValue('destination', currentValue), 100);
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

                      {/* Formulário expandido - só aparece quando o usuário começar a digitar */}
                      {showFullForm && (
                        <>
                          {/* Segunda linha: Datas e Passageiros - Layout colado */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-4">
                            {/* Ida */}
                            <div className="md:col-span-1">
                              <label className="block text-sm font-medium text-gray-700 mb-2" style={{textAlign: 'left'}}>Ida</label>
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
                              <label className="block text-sm font-medium text-gray-700 mb-2" style={{textAlign: 'left'}}>Volta</label>
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
                              <label className="block text-sm font-medium text-gray-700 mb-2" style={{textAlign: 'left'}}>Passageiros</label>
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
                              <label className="text-sm font-medium text-gray-700" style={{textAlign: 'left'}}>Tipo de Voos</label>
                              <div className="relative">
                                <Sparkles className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <select 
                                  value={searchParams.classe}
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
                                Buscar voos
                              </>
                            )}
                          </Button>

                        </>
                      )}

                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Flight Results Section - Sequential flow: show return only after outbound is selected */}
      {showFlightResults && (outboundFlightResults.length > 0 || returnFlightResults.length > 0) && (
        <section className="pt-40 pb-20 px-4 bg-gradient-to-br from-blue-50 to-white">
          <div className="container mx-auto max-w-7xl space-y-12">
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

            {/* Final Summary - Show only selected flights after both are chosen */}
            {selectedFlights.outbound && selectedFlights.return && (
              <div className="max-w-4xl mx-auto">
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-bold text-[#060D1C] mb-4 text-center">
                    Voos Selecionados
                  </h3>
                  <p className="text-gray-600">Seus voos de ida e volta escolhidos</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-lg">
                    <div className="bg-[#F0C72F] px-4 py-2 rounded-t-lg">
                      <h4 className="text-lg font-semibold text-[#060D1C] mb-3">
                        Voo de Ida
                      </h4>
                    </div>
                    <div className="p-4">
                      <FlightResultCard
                        flight={selectedFlights.outbound}
                        isSelected={true}
                        fromLabel={extractIataCode(searchParams.origem)}
                        toLabel={extractIataCode(searchParams.destino)}
                        selectionMessage={''}
                        allFlights={outboundFlightResults}
                        isRoundTrip={!searchParams.soIda}
                        isSelectingReturn={false}
                        selectedOutboundFlight={selectedFlights.outbound}
                        onChooseOutbound={undefined}
                        onChooseReturn={undefined}
                        isFinalSummary={true}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg">
                    <div className="bg-[#F0C72F] px-4 py-2 rounded-t-lg">
                      <h4 className="text-lg font-semibold text-[#060D1C] mb-3">
                        Voo de Volta
                      </h4>
                    </div>
                    <div className="p-4">
                      <FlightResultCard
                        flight={selectedFlights.return}
                        isSelected={true}
                        fromLabel={extractIataCode(searchParams.destino)}
                        toLabel={extractIataCode(searchParams.origem)}
                        selectionMessage={''}
                        allFlights={returnFlightResults}
                        isRoundTrip={!searchParams.soIda}
                        isSelectingReturn={false}
                        selectedOutboundFlight={selectedFlights.outbound}
                        onChooseOutbound={undefined}
                        onChooseReturn={undefined}
                        isFinalSummary={true}
                      />
                    </div>
                  </div>
                </div>

                {/* CTA Box */}
                <div className="mt-8 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        🚀 Desbloqueie Resultados ilimitados
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Veja mais voos, receba alertas de preços e apoie o desenvolvimento do SemViagem
                      </p>
                      <p className="text-xs text-yellow-700">
                        💳 Pagamento Seguro via Stripe
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => {
                          // Redirecionar para página de checkout ou abrir modal
                          window.open('https://buy.stripe.com/test_seu_link_aqui', '_blank');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Comprar Agora!
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </section>
      )}


      {/* Pro Account Section - 3 Cards */}
      <section id="pro" className="pt-20 pb-20 px-4" style={{backgroundColor: 'var(--bg)'}}>
        <div className="container mx-auto max-w-7xl">

          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-xl" style={{color: 'var(--muted)', lineHeight: '140%'}}>
              Economize, simplifique e voe leve — com transparência total.
            </p>
          </div>

          {/* Three Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

            {/* Box 1 - Busca Ilimitada */}
            <div className="pricing-box bg-white flex flex-col relative overflow-hidden transition-all duration-200 hover:shadow-xl"
                 style={{
                   borderRadius: '16px',
                   boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                   padding: '36px 36px',
                   minHeight: '500px'
                 }}>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--yellow)'}}>
                  <svg className="w-10 h-10" fill="var(--navy)" viewBox="0 0 24 24">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h3 className="pricing-title text-lg font-bold mb-2 text-center" style={{color: 'var(--navy)', lineHeight: '22px'}}>
                Busca Ilimitada
              </h3>

              {/* Price */}
              <p className="pricing-title text-base font-bold mb-3 text-center" style={{color: 'var(--navy)', lineHeight: '20px'}}>
                R$ 9,90<span className="font-normal text-sm">/mês</span>
              </p>

              {/* Description */}
              <p className="pricing-body text-sm mb-6 text-center" style={{color: 'rgba(11,19,43,0.85)', lineHeight: '18px'}}>
                Encontre passagens baratas com milhas para onde e quando quiser.
              </p>

              {/* Bullets */}
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="pricing-body flex items-start text-sm" style={{color: 'rgba(11,19,43,0.75)', lineHeight: '18px'}}>
                  <span className="mr-2">•</span>
                  <span>Busca ilimitada de voos com milhas e dinheiro</span>
                </li>
                <li className="pricing-body flex items-start text-sm" style={{color: 'rgba(11,19,43,0.75)', lineHeight: '18px'}}>
                  <span className="mr-2">•</span>
                  <span>Comparação automática de tarifas reais</span>
                </li>
              </ul>

              {/* CTA */}
              <button
                onClick={() => window.open('https://buy.stripe.com/00w8wR9gpgBRfjpcsFdMI04', '_blank')}
                className="w-full py-3 px-4 rounded-lg font-semibold text-sm text-white transition-all duration-200"
                style={{
                  backgroundColor: 'var(--blue)',
                  lineHeight: '18px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,119,182,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Quero Buscar Passagens
              </button>
            </div>

            {/* Box 2 - Alertas Inteligentes (MAIS POPULAR) */}
            <div className="pricing-box flex flex-col relative overflow-hidden transition-all duration-200 hover:shadow-2xl"
                 style={{
                   backgroundColor: 'var(--yellow)',
                   borderRadius: '16px',
                   boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                   padding: '36px 36px',
                   minHeight: '500px'
                 }}>

              {/* Badge MAIS POPULAR */}
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white"
                   style={{backgroundColor: 'var(--blue)'}}>
                MAIS POPULAR
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white">
                  <svg className="w-10 h-10" fill="var(--navy)" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12zm-7-5h2v2h-2zm0-6h2v4h-2z"/>
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h3 className="pricing-title text-lg font-bold mb-2 text-center" style={{color: 'var(--navy)', lineHeight: '22px'}}>
                Alertas Inteligentes
              </h3>

              {/* Price */}
              <p className="pricing-title text-base font-bold mb-3 text-center" style={{color: 'var(--navy)', lineHeight: '20px'}}>
                R$ 19,90<span className="font-normal text-sm">/mês</span>
              </p>

              {/* Description */}
              <p className="pricing-body text-sm mb-6 text-center" style={{color: 'rgba(11,19,43,0.85)', lineHeight: '18px'}}>
                Configure seus destinos e datas e receba alertas assim que os preços caírem no WhatsApp.
              </p>

              {/* Bullets */}
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="pricing-body flex items-start text-sm" style={{color: 'rgba(11,19,43,0.75)', lineHeight: '18px'}}>
                  <span className="mr-2">•</span>
                  <span>Alertas automáticos de queda de preço via WhatsApp</span>
                </li>
                <li className="pricing-body flex items-start text-sm" style={{color: 'rgba(11,19,43,0.75)', lineHeight: '18px'}}>
                  <span className="mr-2">•</span>
                  <span>Notificações diretas e imediatas</span>
                </li>
              </ul>

              {/* CTA */}
              <button
                onClick={() => window.open('https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI02', '_blank')}
                className="w-full py-3 px-4 rounded-lg font-semibold text-sm text-white transition-all duration-200"
                style={{
                  backgroundColor: 'var(--navy)',
                  lineHeight: '18px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,29,61,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Ativar meus Alertas
              </button>
            </div>

            {/* Box 3 - AI Concierge */}
            <div className="pricing-box flex flex-col relative overflow-hidden transition-all duration-200"
                 style={{
                   backgroundColor: 'var(--navy)',
                   borderRadius: '16px',
                   boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                   padding: '36px 36px',
                   minHeight: '500px'
                 }}>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--yellow)'}}>
                  <svg className="w-10 h-10" fill="var(--navy)" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h3 className="pricing-title text-lg font-bold mb-2 text-center text-white" style={{lineHeight: '22px'}}>
                AI Concierge
              </h3>

              {/* Price */}
              <p className="pricing-title text-base font-bold mb-3 text-center text-white" style={{lineHeight: '20px'}}>
                Em breve
              </p>

              {/* Description */}
              <p className="pricing-body text-sm mb-6 text-center" style={{color: 'rgba(255,255,255,0.85)', lineHeight: '18px'}}>
                Um assistente inteligente que planeja toda sua viagem — das milhas à hospedagem.
              </p>

              {/* Bullets */}
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="pricing-body flex items-start text-sm" style={{color: 'rgba(255,255,255,0.75)', lineHeight: '18px'}}>
                  <span className="mr-2">•</span>
                  <span>Planejamento automatizado com IA</span>
                </li>
                <li className="pricing-body flex items-start text-sm" style={{color: 'rgba(255,255,255,0.75)', lineHeight: '18px'}}>
                  <span className="mr-2">•</span>
                  <span>Sugestões inteligentes de rotas, voos e hospedagens</span>
                </li>
                <li className="pricing-body flex items-start text-sm" style={{color: 'rgba(255,255,255,0.75)', lineHeight: '18px'}}>
                  <span className="mr-2">•</span>
                  <span>Agente pessoal 24h</span>
                </li>
              </ul>

              {/* CTA */}
              <button
                onClick={() => navigate('/register')}
                className="w-full py-3 px-4 rounded-lg font-semibold text-sm text-white transition-all duration-200"
                style={{
                  backgroundColor: 'var(--red)',
                  lineHeight: '18px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.04)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(229,57,70,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Entrar na lista VIP!
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impacto" className="py-32 px-4" style={{backgroundColor: '#E4E4E4'}}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6" style={{color: '#060D1C'}}>Enquanto você viaja, você ajuda na educação das nossas crianças!</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center mb-12">
            <div className="bg-white p-6 rounded-lg shadow-lg" style={{borderBottom: '4px solid #F0C72F'}}>
              <div className="text-4xl font-bold mb-2" style={{color: '#4896C7'}}>150+</div>
              <div className="text-gray-600">Projetos Apoiados</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg" style={{borderBottom: '4px solid #F0C72F'}}>
              <div className="text-4xl font-bold mb-2" style={{color: '#F0C72F'}}>50k+</div>
              <div className="text-gray-600">Vidas Impactadas</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg" style={{borderBottom: '4px solid #F0C72F'}}>
              <div className="text-4xl font-bold mb-2" style={{color: '#4896C7'}}>R$ 2M+</div>
              <div className="text-gray-600">Investidos em Comunidades</div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              Cada passagem comprada contribui diretamente para projetos que transformam vidas
            </p>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="parceiros" className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto">
          <h3 className="text-center text-lg font-semibold text-gray-600 mb-8">
            As melhores cias aéreas, 15 países, 127 aeroportos e continuamos adicionando destinos!
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            <img
              src="/logos/latam.png"
              alt="LATAM"
              className="h-10 transition-all"
            />
            <img
              src="/logos/azul.png"
              alt="Azul"
              className="h-10 transition-all"
            />
            <img
              src="/logos/gol.png"
              alt="GOL"
              className="h-10 transition-all"
            />
            <img
              src="/logos/american-airlines.svg"
              alt="American Airlines"
              className="h-10 transition-all"
            />
            <img
              src="/logos/tap.png"
              alt="TAP"
              className="h-10 transition-all object-contain"
            />
            <img
              src="/logos/copa.png"
              alt="Copa Airlines"
              className="h-10 transition-all"
            />
            <img
              src="/logos/iberia.png"
              alt="Iberia"
              className="h-10 transition-all"
            />
            <img
              src="/logos/interline-azul.png"
              alt="Interline Azul"
              className="h-10 transition-all"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4" style={{backgroundColor: '#FFFFFF'}}>
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{color: '#060D1C'}}>FAQ Atualizado</h2>
            <p className="text-xl" style={{color: '#060D1C'}}>Tire suas dúvidas sobre nossa plataforma e serviços</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4 [&_svg]:text-[#4896C7]">
            <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6 hover:bg-gray-100 transition-colors">
              <AccordionTrigger className="text-left font-semibold" style={{color: '#060D1C'}}>
                O que é a Conta PRO SemViagem?
              </AccordionTrigger>
              <AccordionContent className="pt-2" style={{color: '#060D1C'}}>
                É uma assinatura mensal de R$29,99 que dá acesso a resultados ilimitados, alertas inteligentes e
                promoções exclusivas.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-6 hover:bg-opacity-10 hover:bg-gray-100 transition-colors">
              <AccordionTrigger className="text-left font-semibold" style={{color: '#060D1C'}}>
                Como funciona o SemViagem?
              </AccordionTrigger>
              <AccordionContent className="pt-2" style={{color: '#060D1C'}}>
                <p className="mb-3">
                  O SemViagem coleta dados de tráfego aéreo mundial em tempo real e disponibiliza passagens a preços
                  realmente baixos.
                </p>
                <p className="mb-3">
                  Diferente de outros buscadores, não somos financiados por companhias aéreas ou agências — o que nos
                  permite mostrar as tarifas mais transparentes e justas.
                </p>
                <p>
                  Nosso objetivo é simples: fazer com que o maior número possível de brasileiros viaje pelo mundo. Com
                  passagens baratas e acessíveis, isso se torna possível.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-6 hover:bg-gray-100 transition-colors">
              <AccordionTrigger className="text-left font-semibold" style={{color: '#060D1C'}}>
                Como cada viagem gera impacto social?
              </AccordionTrigger>
              <AccordionContent className="pt-2" style={{color: '#060D1C'}}>
                Parte da receita de cada passagem é destinada a projetos sociais e ambientais que apoiamos diretamente.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-6 hover:bg-gray-100 transition-colors">
              <AccordionTrigger className="text-left font-semibold" style={{color: '#060D1C'}}>
                Quais métodos de pagamento são aceitos?
              </AccordionTrigger>
              <AccordionContent className="pt-2" style={{color: '#060D1C'}}>Cartões de crédito.</AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-gray-200 rounded-lg px-6 hover:bg-gray-100 transition-colors">
              <AccordionTrigger className="text-left font-semibold" style={{color: '#060D1C'}}>
                Posso cancelar minha assinatura a qualquer momento?
              </AccordionTrigger>
              <AccordionContent className="pt-2" style={{color: '#060D1C'}}>
                Sim, você pode cancelar diretamente pelo portal do cliente sem multas ou burocracia.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-20 px-4 bg-white relative">
        {/* Floating WhatsApp Button - Only in Contact Section */}
        <div className="fixed bottom-6 right-6 z-50">
          <a
            href="https://wa.me/5531991058027"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.479 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </a>
        </div>
        
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6" style={{color: '#060D1C'}}>📞 Entre em Contato</h2>
            <p className="text-xl max-w-3xl mx-auto" style={{color: '#060D1C'}}>
              Estamos aqui para ajudar você a planejar sua próxima viagem. Entre em contato conosco!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Informações de Contato</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#F0C72F'}}>
                    <svg className="w-6 h-6" fill="none" stroke="#060D1C" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">E-mail</h4>
                    <p className="text-gray-600">contato@semviagem.com.br</p>
                    <p className="text-sm text-gray-500">Resposta em até 24 horas</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#F0C72F'}}>
                    <svg className="w-6 h-6" fill="none" stroke="#060D1C" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Telefone</h4>
                    <p className="text-gray-600">(11) 4040-4040</p>
                    <p className="text-sm text-gray-500">Segunda a sexta, 9h às 18h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#F0C72F'}}>
                    <svg className="w-6 h-6" fill="#060D1C" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.479 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">WhatsApp</h4>
                    <p className="text-gray-600">(31) 99733-4723</p>
                    <p className="text-sm text-gray-500">Atendimento rápido e personalizado</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Envie sua Mensagem</h3>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors focus:outline-none focus:border-blue-700"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors focus:outline-none focus:border-blue-700"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-2">Assunto</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Como podemos ajudar?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">Mensagem</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors focus:outline-none focus:border-blue-700"
                    placeholder="Descreva sua dúvida, sugestão ou como podemos te ajudar..."
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 px-6 rounded-lg transition-colors font-semibold bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                >
                  Enviar Mensagem
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16" style={{backgroundColor: '#060D1C'}}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Logo e Descrição */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4" style={{color: '#F0C72F'}}>SemViagem</h3>
              <p className="mb-4" style={{color: '#E4E4E4'}}>
                Revolucionando o modo de viajar com impacto social positivo.
              </p>
            </div>
            
            {/* Links da Empresa */}
            <div>
              <h4 className="text-lg font-semibold mb-4" style={{color: '#F0C72F'}}>Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#sobre" className="transition-colors hover:text-yellow-400" style={{color: '#E4E4E4'}}>Sobre Nós</a></li>
                <li><a href="#impacto" className="transition-colors hover:text-yellow-400" style={{color: '#E4E4E4'}}>Impacto Social</a></li>
                <li><a href="#faq" className="transition-colors hover:text-yellow-400" style={{color: '#E4E4E4'}}>FAQ</a></li>
              </ul>
            </div>
            
            {/* Suporte */}
            <div>
              <h4 className="text-lg font-semibold mb-4" style={{color: '#F0C72F'}}>Suporte</h4>
              <ul className="space-y-2">
                <li><a href="#contato" className="transition-colors hover:text-yellow-400" style={{color: '#E4E4E4'}}>Central de Ajuda</a></li>
                <li><a href="#contato" className="transition-colors hover:text-yellow-400" style={{color: '#E4E4E4'}}>Contato</a></li>
                <li><a href="#" className="transition-colors hover:text-yellow-400" style={{color: '#E4E4E4'}}>Termos de Uso</a></li>
              </ul>
            </div>
          </div>
          
          {/* Social Media */}
          <div className="border-t border-gray-800 pt-8 mb-8">
            <div className="flex flex-col items-center">
              <h4 className="text-lg font-semibold mb-4" style={{color: '#F0C72F'}}>Conecte-se</h4>
              <div className="flex gap-6">
                <a 
                  href="https://www.instagram.com/semviagemapp/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{backgroundColor: '#F0C72F'}}
                >
                  <svg className="w-6 h-6" fill="#060D1C" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.facebook.com/semviagem" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{backgroundColor: '#F0C72F'}}
                >
                  <svg className="w-6 h-6" fill="#060D1C" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://twitter.com/semviagem" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{backgroundColor: '#F0C72F'}}
                >
                  <svg className="w-6 h-6" fill="#060D1C" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/company/semviagem" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{backgroundColor: '#F0C72F'}}
                >
                  <svg className="w-6 h-6" fill="#060D1C" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="text-center text-sm" style={{color: '#E4E4E4'}}>
            <p>&copy; 2025 SemViagem. Todos os direitos reservados. Viaje com propósito e impacto social positivo.</p>
          </div>
        </div>
      </footer>

      {/* Custom Calendar Component */}
      {calendarConfig.show && (
        <CustomCalendar
          title={calendarConfig.title}
          onDateSelect={(date) => handleCalendarDateSelect(date, calendarConfig.type)}
          onClose={handleCalendarClose}
          selectedDate={calendarConfig.type === 'ida' ? searchParams.ida : searchParams.volta}
          minDate={new Date(new Date().setHours(0, 0, 0, 0))}
        />
      )}
    </div>
  );
};

export default Home;
