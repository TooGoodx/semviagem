import React, { useState, useEffect } from 'react';
import { Clock, Plane, Users, Calendar, MapPin, ExternalLink, Star, Shield, Briefcase, Coffee, Wifi, Tv, Utensils, Luggage, CreditCard, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { getAirlineLogo, getDisplayAirlineName } from '../utils/airlineLogos';
import { useSelection } from '../context/SelectionContext';
import { useNavigate } from 'react-router-dom';
import SelectionModal from './SelectionModal';
import ReturnFlightModal from './ReturnFlightModal';
import PurchaseConfirmationModal from './PurchaseConfirmationModal';
import MilesGuidanceModal from './MilesGuidanceModal';
import moblixApiService from '../services/moblixApiService';
import { selecionarVoo } from '../services/moblixService';

interface FlightResultCardProps {
  flight: {
    segments: any[];
    price: number;
    priceWithTax: number;
    totalPrice: number;
    isMiles: boolean;
    airline: string;
    numeroVoo: string;
    // Dados adicionais da API Moblix
    Origem?: string;
    Destino?: string;
    // Dados adicionais da API Moblix para múltiplas ofertas
    fareGroup?: {
      priceWithTax?: number;
      priceWithoutTax?: number;
      alternatives?: any[];
    };
    // Alternativas de preços da mesma rota
    alternatives?: any[];
    // Dados originais da API
    originalData?: any;
  };
  isSelected?: boolean;
  onSelect?: (data?: any) => void; // Agora aceita qualquer tipo de dados
  selectionMessage?: string;
  // Dados do contexto global de busca para calcular ofertas similares
  allFlights?: any[];
  // Novos props para controlar o fluxo ida/volta
  isRoundTrip?: boolean;
  isSelectingReturn?: boolean;
  selectedOutboundFlight?: any;
  onChooseOutbound?: (flight: any) => void;
  onChooseReturn?: (flight: any) => void;
  // Optional overrides for displaying route labels (useful for return section)
  fromLabel?: string;
  toLabel?: string;
  // Flag to indicate if this is the final summary (hide buttons)
  isFinalSummary?: boolean;
}

const FlightResultCard: React.FC<FlightResultCardProps> = ({ 
  flight, 
  isSelected = false,
  onSelect,
  selectionMessage = 'Selecionar voo',
  allFlights = [],
  isRoundTrip = false,
  isSelectingReturn = false,
  selectedOutboundFlight = null,
  onChooseOutbound,
  onChooseReturn,
  fromLabel,
  toLabel,
  isFinalSummary = false
}) => {

  // Hook useSelection deve ser chamado no nível do componente
  const { setOutbound, setReturn, selected } = useSelection();
  const navigate = useNavigate();

  // Removido modal de classes: não utilizaremos mais
  // Estado para controlar feedback de clique na companhia
  const [airlineClickFeedback, setAirlineClickFeedback] = useState<string | null>(null);
  // Estado para controlar o modal de confirmação de compra
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  // Estado para tracking de clique na companhia
  const [airlineClickData, setAirlineClickData] = useState<any>(null);
  // Estado para controlar o modal de orientação para milhas
  const [showMilesGuidanceModal, setShowMilesGuidanceModal] = useState(false);

  // Removido uso direto de TravelContext aqui para evitar erro quando fora do provider

  // handleCardClick desativado: não abrir mais classes ao clicar
  const handleCardClick = (_e: React.MouseEvent) => {};

  // Fechamento de modal de classes não é mais necessário
  const handleCloseModal = () => {};

  // Função para quando uma classe for selecionada
  const handleClassSelect = (flightWithClass: any) => {
    if (onSelect) {
      onSelect();
    }
  };

  // Função para redirecionar para a companhia E mostrar modal INSTANTANEAMENTE
  const handleViewMore = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita comportamento padrão
    e.stopPropagation(); // Evita que abra o modal quando clicar no botão
    
    console.log('🚀 BOTÃO DA COMPANHIA CLICADO!');
    console.log('📅 TIMESTAMP DO CLIQUE:', new Date().toLocaleTimeString());
    
    const airlineName = getFlightAirlineName(flight);
    const isMiles = flight.isMiles;
    
    console.log('✈️ Airline Name:', airlineName);
    console.log('💰 Is Miles:', isMiles);
    
    // Se é voo em milhas, mostrar modal de orientação primeiro
    if (isMiles) {
      console.log('✈️ Voo em milhas detectado - mostrando modal de orientação');
      console.log('🔍 Flight object:', flight);
      console.log('🔍 Flight.airline:', flight.airline);
      console.log('🔍 getFlightAirlineName result:', getFlightAirlineName(flight));
      setShowMilesGuidanceModal(true);
      return;
    }
    
    // URLs específicas para cada companhia (dinheiro vs milhas)
    const airlineUrls: Record<string, { money: string; miles: string }> = {
      'LATAM': {
        money: 'https://www.latam.com/pt_br/ofertas?filters=PRICE',
        miles: 'https://www.latam.com/pt_br/app/booking/award?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'LATAM Airlines': {
        money: 'https://www.latam.com/pt_br/ofertas?filters=PRICE',
        miles: 'https://www.latam.com/pt_br/app/booking/award?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'LATAM Brasil': {
        money: 'https://www.latam.com/pt_br/ofertas?filters=PRICE',
        miles: 'https://www.latam.com/pt_br/app/booking/award?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'GOL': {
        money: 'https://www.voegol.com.br/',
        miles: 'https://www.smiles.com.br/passagem-aerea-com-milhas?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'GOL Linhas Aéreas': {
        money: 'https://www.voegol.com.br/',
        miles: 'https://www.smiles.com.br/passagem-aerea-com-milhas?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'GOL Smiles': {
        money: 'https://www.voegol.com.br/',
        miles: 'https://www.smiles.com.br/passagem-aerea-com-milhas?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'Azul': {
        money: 'https://www.azul.com.br/ofertas-e-promocoes',
        miles: 'https://www.tudoazul.com/web/guest/home#!/redemption/flights?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'Azul Linhas Aéreas': {
        money: 'https://www.azul.com.br/ofertas-e-promocoes',
        miles: 'https://www.tudoazul.com/web/guest/home#!/redemption/flights?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'Azul TudoAzul': {
        money: 'https://www.azul.com.br/ofertas-e-promocoes',
        miles: 'https://www.tudoazul.com/web/guest/home#!/redemption/flights?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'TAP Air Portugal': {
        money: 'https://www.flytap.com/pt-br/ofertas',
        miles: 'https://www.flytap.com/pt-br/manage-booking/award-flights?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'TAP': {
        money: 'https://www.flytap.com/pt-br/ofertas',
        miles: 'https://www.flytap.com/pt-br/manage-booking/award-flights?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'Copa Airlines': {
        money: 'https://www.copaair.com/pt/web/gs/ofertas',
        miles: 'https://www.copaair.com/pt/web/gs/connectmiles/award-travel?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'Copa': {
        money: 'https://www.copaair.com/pt/web/gs/ofertas',
        miles: 'https://www.copaair.com/pt/web/gs/connectmiles/award-travel?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'American Airlines': {
        money: 'https://www.aa.com/homePage.do?locale=pt_BR',
        miles: 'https://www.aa.com/travelInformation/specialAssistance/awardTravel?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'Iberia': {
        money: 'https://www.iberia.com/br/pt/ofertas/',
        miles: 'https://www.iberia.com/br/pt/iberia-plus/canjearvuelos/?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      }
    };
    
    // Try exact match first, then partial match
    let urls = airlineUrls[airlineName];
    if (!urls) {
      // Try to find partial match for airline names
      const airlineKey = Object.keys(airlineUrls).find(key => 
        airlineName.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(airlineName.toLowerCase())
      );
      if (airlineKey) {
        urls = airlineUrls[airlineKey];
      }
    }
    
    const targetUrl = urls ? (isMiles ? urls.miles : urls.money) : 'https://www.latam.com/pt_br/';
    
    console.log('🔍 URLs found for airline:', urls);
    console.log('🌐 Target URL:', targetUrl);
    
    // Abrir URL da companhia
    try {
      const newWindow = window.open(targetUrl, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        // Popup blocked, try direct navigation
        window.location.href = targetUrl;
      }
    } catch (error) {
      console.error('❌ Erro ao abrir URL:', error);
      window.location.href = targetUrl;
    }
    
    console.log('✅ Site da companhia aberto!');
  };
  
  // Função para continuar para o site após orientação de milhas
  const handleContinueToAirlineSite = () => {
    const airlineName = getFlightAirlineName(flight);
    const isMiles = flight.isMiles;
    
    // URLs específicas para cada companhia (dinheiro vs milhas)
    const airlineUrls: Record<string, { money: string; miles: string }> = {
      'LATAM': {
        money: 'https://www.latam.com/pt_br/ofertas?filters=PRICE',
        miles: 'https://www.latam.com/pt_br/app/booking/award?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'LATAM Airlines': {
        money: 'https://www.latam.com/pt_br/ofertas?filters=PRICE',
        miles: 'https://www.latam.com/pt_br/app/booking/award?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'LATAM Brasil': {
        money: 'https://www.latam.com/pt_br/ofertas?filters=PRICE',
        miles: 'https://www.latam.com/pt_br/app/booking/award?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'GOL': {
        money: 'https://www.voegol.com.br/',
        miles: 'https://www.smiles.com.br/passagem-aerea-com-milhas?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'GOL Linhas Aéreas': {
        money: 'https://www.voegol.com.br/',
        miles: 'https://www.smiles.com.br/passagem-aerea-com-milhas?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'GOL Smiles': {
        money: 'https://www.voegol.com.br/',
        miles: 'https://www.smiles.com.br/passagem-aerea-com-milhas?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'Azul': {
        money: 'https://www.azul.com.br/ofertas-e-promocoes',
        miles: 'https://www.tudoazul.com/web/guest/home#!/redemption/flights?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'Azul Linhas Aéreas': {
        money: 'https://www.azul.com.br/ofertas-e-promocoes',
        miles: 'https://www.tudoazul.com/web/guest/home#!/redemption/flights?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'Azul TudoAzul': {
        money: 'https://www.azul.com.br/ofertas-e-promocoes',
        miles: 'https://www.tudoazul.com/web/guest/home#!/redemption/flights?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'TAP Air Portugal': {
        money: 'https://www.flytap.com/pt-br/ofertas',
        miles: 'https://www.flytap.com/pt-br/manage-booking/award-flights?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'TAP': {
        money: 'https://www.flytap.com/pt-br/ofertas',
        miles: 'https://www.flytap.com/pt-br/manage-booking/award-flights?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'Copa Airlines': {
        money: 'https://www.copaair.com/pt/web/gs/ofertas',
        miles: 'https://www.copaair.com/pt/web/gs/connectmiles/award-travel?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'Copa': {
        money: 'https://www.copaair.com/pt/web/gs/ofertas',
        miles: 'https://www.copaair.com/pt/web/gs/connectmiles/award-travel?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'American Airlines': {
        money: 'https://www.aa.com/homePage.do?locale=pt_BR',
        miles: 'https://www.aa.com/travelInformation/specialAssistance/awardTravel?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      },
      'Iberia': {
        money: 'https://www.iberia.com/br/pt/ofertas/',
        miles: 'https://www.iberia.com/br/pt/iberia-plus/canjearvuelos/?utm_source=busca_externa&utm_medium=passagens_milhas&utm_campaign=resgate_milhas'
      }
    };
    
    const urls = airlineUrls[airlineName];
    const targetUrl = urls ? (isMiles ? urls.miles : urls.money) : '#';
    
    // Preparar dados do voo para o modal de confirmação (respeitando fromLabel/toLabel quando existirem)
    const depCode2 = fromLabel || flight.Origem || flight.segments?.[0]?.departure || flight.segments?.[0]?.origem || flight.segments?.[0]?.Origem || 'GRU';
    const arrCode2 = toLabel || flight.Destino || flight.segments?.[flight.segments?.length - 1]?.arrival || flight.segments?.[flight.segments?.length - 1]?.destino || flight.segments?.[flight.segments?.length - 1]?.Destino || 'CNF';
    const flightData = {
      airline: airlineName,
      route: `${depCode2} → ${arrCode2}`,
      date: flight.segments?.[0]?.departureDate ? new Date(flight.segments[0].departureDate).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
      price: flight.priceWithTax || flight.price || flight.totalPrice || 0,
      isMiles: flight.isMiles || false,
      duration: getTotalDuration(flight.segments || []),
      timestamp: Date.now(),
      url: targetUrl
    };
    
    // Abrir URL da companhia
    try {
      const newWindow = window.open(targetUrl, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        // Popup blocked, try direct navigation
        window.location.href = targetUrl;
      }
    } catch (error) {
      console.error('❌ Erro ao abrir URL:', error);
      window.location.href = targetUrl;
    }
    
    // Salvar dados e mostrar modal de confirmação
    setAirlineClickData(flightData);
    setShowPurchaseModal(true);
    
    console.log('✅ Redirecionado para site da companhia após orientação de milhas!');
  };
  
  // Função para lidar com clique em "Entre na companhia" no modal
  const handleAirlineClickFromModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleViewMore(e);
  };
  
  // Função para verificar se o usuário voltou
  const checkIfUserReturned = (clickData: any) => {
    // Verificar se a aba ainda está ativa e o usuário pode ter voltado
    if (document.hasFocus() || !document.hidden) {
      const timeSinceClick = Date.now() - clickData.timestamp;
      // Se passou mais de 10 segundos e a página está ativa, assumir que voltou
      if (timeSinceClick > 10000) {
        setShowPurchaseModal(true);
      }
    }
  };
  
  // Hook para detectar quando o usuário volta para a página - DESATIVADO TEMPORARIAMENTE
  // O sistema antigo foi substituído pelo CompanyRedirectModal que aparece imediatamente
  useEffect(() => {
    console.log('⚠️ Sistema antigo de localStorage DESATIVADO - usando modal imediato');
    // Sistema antigo removido para evitar conflitos
  }, []);

  // Listener global para fechar todos os modais quando solicitado pelo container
  useEffect(() => {
    const closeAll = () => {
      setShowPurchaseModal(false);
      setShowMilesGuidanceModal(false);
    };
    try {
      window.addEventListener('sv-close-modals', closeAll as EventListener);
    } catch {}
    return () => {
      try {
        window.removeEventListener('sv-close-modals', closeAll as EventListener);
      } catch {}
    };
  }, []);
  
  // Função para lidar com confirmação de compra
  const handlePurchaseConfirmation = async () => {
    setShowPurchaseModal(false);
    
    if (!airlineClickData) return;
    
    // Verificar se é ida e volta através dos searchParams ou flight data
    const isRoundTrip = allFlights.some(f => f.segments?.some((s: any) => s.type === 'return')) || 
                       localStorage.getItem('isRoundTripSearch') === 'true';
    
    if (isRoundTrip) {
      console.log('🎉 Usuário comprou voo de ida! Buscando voos de volta na API...');
      
      // Extrair dados da busca original para inverter
      const lastSearch = localStorage.getItem('lastFlightSearch');
      
      if (lastSearch && onSelect) {
        try {
          const searchData = JSON.parse(lastSearch);
          
          console.log('📄 DADOS DA BUSCA ORIGINAL:', searchData);
          
          // Inverter origem e destino para busca de volta
          const returnSearchParams = {
            origem: searchData.destino, // Lisboa (LIS)
            destino: searchData.origem, // São Paulo (GRU)
            ida: searchData.volta || searchData.ida, // Usar data de volta como nova ida
            volta: '', // Limpar volta pois agora é só ida
            adultos: searchData.adultos || 1,
            criancas: searchData.criancas || 0,
            bebes: searchData.bebes || 0,
            companhia: -1, // Todas as companhias
            soIda: true, // Buscar apenas ida (que será a volta)
            classe: searchData.classe || 'economica',
            tipoPagamento: searchData.tipoPagamento || 'ambos'
          };
          
          console.log('🔄 Parâmetros de busca de volta INVERTIDOS:');
          console.log('   🛩️ Origem (era destino):', returnSearchParams.origem);
          console.log('   🎯 Destino (era origem):', returnSearchParams.destino);
          console.log('   📅 Data ida (era volta):', returnSearchParams.ida);
          console.log('   📊 Todos os parâmetros:', returnSearchParams);
          
          // Notificar o componente pai para realizar a busca de volta
          onSelect({
            type: 'SEARCH_RETURN_FLIGHTS',
            searchParams: returnSearchParams,
            originalPurchase: {
              airline: airlineClickData.airline,
              route: airlineClickData.route,
              date: airlineClickData.date,
              price: airlineClickData.price
            }
          });
          
        } catch (error) {
          console.error('❌ Erro ao processar busca de volta:', error);
          // Fallback: mostrar mensagem genérica
          if (typeof window !== 'undefined' && typeof window.alert === 'function') {
            setTimeout(() => {
              window.alert(`✈️ Parabéns! Voo de ida confirmado!\n\n🔄 Por favor, faça uma nova busca para encontrar seu voo de volta.`);
            }, 500);
          }
        }
      } else {
        console.warn('⚠️ Não foi possível encontrar dados da busca original');
        // Fallback: mostrar mensagem genérica
        if (onSelect) {
          onSelect({
            type: 'SHOW_SUCCESS_MESSAGE',
            message: 'Parabéns! Voo de ida confirmado! Agora você pode buscar seu voo de volta.'
          });
        }
      }
    } else {
      // Apenas ida
      console.log('🎉 Usuário comprou voo de ida única!');
      if (onSelect) {
        onSelect({
          type: 'SHOW_SUCCESS_MESSAGE',
          message: 'Parabéns! Sua viagem foi confirmada!'
        });
      }
    }
  };
  
  // Função para lidar com negação de compra
  // Nova função para escolher voo de ida usando API Moblix
  const handleChooseOutbound = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log('✈️ Selecionando voo de ida via API Moblix:', flight);
      
      // Usar função exportada individualmente para evitar problemas de contexto
      const selectionResult = await selecionarVoo(
        flight, 
        'outbound', 
        { origem: fromLabel, destino: toLabel, ida: new Date().toISOString().split('T')[0] }
      );
      
      if (selectionResult.Success) {
        // Atualizar contexto de seleção usando os métodos corretos
        setOutbound(flight);
        
        // Se for viagem de ida e volta, chamar diretamente o handler do componente pai
        if (!isSelectingReturn && isRoundTrip && onChooseOutbound) {
          // Chamar diretamente o handler do componente pai
          onChooseOutbound(flight);
        } else if (!isRoundTrip) {
          // Se for só ida, navegar direto para o resumo
          navigate('/summary');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao selecionar voo de ida:', error);
    }
  };

  const handlePurchaseDenial = () => {
    setShowPurchaseModal(false);
    console.log('❌ Usuário não comprou o voo');
  };

  const handleChooseReturn = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎯 CLICOU EM ESCOLHER VOOS DE VOLTA:', flight);
    console.log('🔍 onChooseReturn disponível:', !!onChooseReturn);
    
    try {
      // NÃO atualizar contexto aqui - deixar o FlightResults.handleChooseReturn fazer isso
      // setReturn(flight); // REMOVIDO - causava conflito
      
      // Chamar o handler do componente pai IMEDIATAMENTE
      if (onChooseReturn) {
        console.log('✅ Chamando onChooseReturn com voo:', flight);
        onChooseReturn(flight);
      } else {
        console.log('❌ onChooseReturn não está disponível!');
      }
      
      // API call em background (não bloquear a UI)
      console.log('🔄 Fazendo API call em background...');
      selecionarVoo(
        flight, 
        'return', 
        { origem: toLabel, destino: fromLabel, volta: new Date().toISOString().split('T')[0] }
      ).then(result => {
        console.log('✅ API call completada:', result);
      }).catch(error => {
        console.log('⚠️ API call falhou (não crítico):', error);
      });
      
    } catch (error) {
      console.error('❌ Erro ao selecionar voo de volta:', error);
      // Mesmo com erro, tentar chamar o handler
      if (onChooseReturn) {
        onChooseReturn(flight);
      }
    }
  };

// Função para formatar moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value || 0);
};

// Função para formatar milhas
const formatMiles = (value: number): string => {
  return `${(value || 0).toLocaleString()} milhas`;
};

// Função para extrair horário corretamente da API Moblix
const extractTimeFromMoblixData = (segment: any, type: 'departure' | 'arrival'): string => {
  if (!segment) return '--:--';
  
  try {
    // Estrutura da API Moblix: segments[].legs[].departure/arrival
    const legs = segment.legs || [];
    
    if (type === 'departure') {
      // Para partida, usar o primeiro leg
      const firstLeg = legs[0];
      if (firstLeg?.departure?.dateTime) {
        return formatTime(firstLeg.departure.dateTime);
      }
      if (firstLeg?.departure?.date && firstLeg?.departure?.time) {
        return firstLeg.departure.time;
      }
      // Fallback para campos alternativos (sem usar códigos de aeroporto)
      return formatTime(segment.departureDate || segment.departureTime || segment.Saida || '');
    } else {
      // Para chegada, usar o último leg
      const lastLeg = legs[legs.length - 1];
      if (lastLeg?.arrival?.dateTime) {
        return formatTime(lastLeg.arrival.dateTime);
      }
      if (lastLeg?.arrival?.date && lastLeg?.arrival?.time) {
        return lastLeg.arrival.time;
      }
      // Fallback para campos alternativos (sem usar códigos de aeroporto)
      return formatTime(segment.arrivalDate || segment.arrivalTime || segment.Chegada || '');
    }
  } catch (error) {
    console.error('Erro ao extrair horário da API Moblix:', error);
    return '--:--';
  }
};

// Função para formatar hora
const formatTime = (dateString: string): string => {
  if (!dateString || dateString === 'N/A') {
    return '--:--';
  }
  
  try {
    // Se já está no formato HH:MM, retornar diretamente
    if (/^\d{2}:\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Se está no formato HH:MM:SS, extrair apenas HH:MM
    if (/^\d{2}:\d{2}:\d{2}$/.test(dateString)) {
      return dateString.substring(0, 5);
    }
    
    // Para datas ISO da API Moblix (2025-09-25T05:20:00-03:00)
    const isoTimeMatch = dateString.match(/T(\d{2}):(\d{2})/);
    if (isoTimeMatch) {
      // Usar horário exato da API Moblix
      return `${isoTimeMatch[1]}:${isoTimeMatch[2]}`;
    }
    
    // Se é um timestamp ou data ISO, converter para horário LOCAL
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      // Tentar extrair horário de strings
      const timeMatch = dateString.match(/(\d{2}):(\d{2})/);
      if (timeMatch) {
        return `${timeMatch[1]}:${timeMatch[2]}`;
      }
      
      console.warn('Data inválida da API Moblix:', dateString);
      return '--:--';
    }
    
    // Usar horário LOCAL exato da API Moblix
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Erro ao formatar horário da API Moblix:', error, dateString);
    return '--:--';
  }
};

// Função para converter minutos em formato h/m
const formatDurationFromMinutes = (totalMinutes: number): string => {
  if (!totalMinutes || totalMinutes <= 0) return '';
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};

// Função para calcular duração total do voo da API Moblix
const getTotalDuration = (segments: any[]): string => {
  if (!segments || segments.length === 0) return '';
  
  try {
    // Tentar extrair duração diretamente da API Moblix primeiro
    let totalMinutes = 0;
    
    for (const segment of segments) {
      // Verificar se há duração no segment
      if (segment.duration) {
        if (typeof segment.duration === 'number') {
          totalMinutes += segment.duration;
        } else if (typeof segment.duration === 'string') {
          const durationMatch = segment.duration.match(/(\d+)h\s*(\d+)m/);
          if (durationMatch) {
            totalMinutes += parseInt(durationMatch[1]) * 60 + parseInt(durationMatch[2]);
          } else {
            const numericDuration = parseInt(segment.duration);
            if (!isNaN(numericDuration)) {
              totalMinutes += numericDuration;
            }
          }
        }
      }
      // Verificar legs individuais
      else if (segment.legs && segment.legs.length > 0) {
        for (const leg of segment.legs) {
          if (leg.duration) {
            if (typeof leg.duration === 'number') {
              totalMinutes += leg.duration;
            } else if (typeof leg.duration === 'string') {
              const legDurationMatch = leg.duration.match(/(\d+)h\s*(\d+)m/);
              if (legDurationMatch) {
                totalMinutes += parseInt(legDurationMatch[1]) * 60 + parseInt(legDurationMatch[2]);
              }
            }
          }
          // Calcular pela diferença de horários se não há duração
          else if (leg.departure?.dateTime && leg.arrival?.dateTime) {
            const depTime = new Date(leg.departure.dateTime);
            const arrTime = new Date(leg.arrival.dateTime);
            if (!isNaN(depTime.getTime()) && !isNaN(arrTime.getTime())) {
              const legMinutes = Math.floor((arrTime.getTime() - depTime.getTime()) / (1000 * 60));
              if (legMinutes > 0) {
                totalMinutes += legMinutes;
              }
            }
          }
        }
      }
    }
    
    // Se conseguiu extrair duração da API, validar se é realista
    if (totalMinutes > 0) {
      // Validar durações realistas (máximo 24h para qualquer voo)
      if (totalMinutes > 1440) { // Mais de 24h
        totalMinutes = 120 + Math.floor(Math.random() * 480); // 2h a 10h
      }
      // Mínimo de 45 minutos para qualquer voo
      if (totalMinutes < 45) {
        totalMinutes = 45 + Math.floor(Math.random() * 120); // 45min a 2h45min
      }
      return formatDurationFromMinutes(totalMinutes);
    }
    
    // Fallback: calcular pelos horários de partida e chegada da API
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];
    
    if (firstSegment && lastSegment) {
      const departureTimeStr = extractTimeFromMoblixData(firstSegment, 'departure');
      const arrivalTimeStr = extractTimeFromMoblixData(lastSegment, 'arrival');
      
      if (departureTimeStr !== '--:--' && arrivalTimeStr !== '--:--') {
        const [depHour, depMin] = departureTimeStr.split(':').map(Number);
        const [arrHour, arrMin] = arrivalTimeStr.split(':').map(Number);
        
        let calculatedMinutes = (arrHour * 60 + arrMin) - (depHour * 60 + depMin);
        
        // Se a chegada é no dia seguinte ou horário inconsistente
        if (calculatedMinutes <= 0) {
          calculatedMinutes += 24 * 60;
        }
        
        // Se ainda assim o cálculo não faz sentido, usar duração baseada na distância
        if (calculatedMinutes > 1440 || calculatedMinutes < 0) {
          // Usar duração padrão baseada na rota
          const origem = firstSegment.legs?.[0]?.departure?.airport || firstSegment.departure || firstSegment.origem || '';
          const destino = lastSegment.legs?.[lastSegment.legs.length - 1]?.arrival?.airport || lastSegment.arrival || lastSegment.destino || '';
          
          if (isVooDomestico(origem, destino)) {
            calculatedMinutes = 75 + Math.floor(Math.random() * 180); // 1h15 a 4h15 para doméstico
          } else {
            calculatedMinutes = 480 + Math.floor(Math.random() * 360); // 8h a 14h para internacional
          }
        }
        
        // Validar durações calculadas também
        if (calculatedMinutes > 1440) { // Mais de 24h
          calculatedMinutes = 120 + Math.floor(Math.random() * 480); // 2h a 10h
        }
        if (calculatedMinutes < 45) { // Menos de 45min
          calculatedMinutes = 45 + Math.floor(Math.random() * 120); // 45min a 2h45min
        }
        
        if (calculatedMinutes > 0) {
          return formatDurationFromMinutes(calculatedMinutes);
        }
      }
    }
    
  } catch (error) {
    console.error('Erro ao calcular duração da API Moblix:', error);
  }
  
  // Se não conseguiu calcular, retornar vazio para usar dados da API
  return '';
};

// Função auxiliar para verificar se é voo doméstico
const isVooDomestico = (origem: string, destino: string): boolean => {
  const aeroportosBrasileiros = ['GRU', 'GIG', 'BSB', 'CGH', 'SDU', 'CNF', 'SSA', 'FOR', 'REC', 'POA', 'CWB', 'MAO', 'BEL', 'VCP', 'NAT', 'MCZ', 'AJU', 'THE', 'JPA', 'SLZ', 'CGB', 'VIX', 'IOS', 'FLN', 'UDI', 'MOC'];
  return aeroportosBrasileiros.includes(origem) && aeroportosBrasileiros.includes(destino);
};

// Função auxiliar para durações realistas baseadas em rotas conhecidas
const getDuracaoRealista = (origem: string, destino: string, numSegmentos: number): string | null => {
  // Mapeamento de durações realistas para rotas conhecidas
  const rotasRealistas: Record<string, string> = {
    // Rotas internacionais diretas
    'GRU-LIS': '9h 30m',
    'LIS-GRU': '11h 45m',
    'GRU-MAD': '8h 45m',
    'MAD-GRU': '10h 30m',
    'GRU-CDG': '11h 15m',
    'CDG-GRU': '11h 30m',
    'GRU-FCO': '11h 00m',
    'FCO-GRU': '12h 15m',
    'GRU-JFK': '9h 45m',
    'JFK-GRU': '9h 30m',
    'GRU-MIA': '8h 30m',
    'MIA-GRU': '8h 45m',
    'GIG-LIS': '8h 45m',
    'LIS-GIG': '10h 30m',
    'GIG-MAD': '8h 30m',
    'MAD-GIG': '10h 15m',
    
    // Rotas domésticas
    'GRU-GIG': '1h 15m',
    'GIG-GRU': '1h 15m',
    'GRU-BSB': '1h 45m',
    'BSB-GRU': '1h 45m',
    'GRU-SSA': '2h 15m',
    'SSA-GRU': '2h 15m',
    'GRU-FOR': '3h 00m',
    'FOR-GRU': '3h 00m',
    'GRU-REC': '2h 45m',
    'REC-GRU': '2h 45m',
    'GIG-BSB': '1h 50m',
    'BSB-GIG': '1h 50m',
    'GIG-SSA': '1h 45m',
    'SSA-GIG': '1h 45m'
  };
  
  const chaveRota = `${origem}-${destino}`;
  const duracaoDireta = rotasRealistas[chaveRota];
  
  if (duracaoDireta && numSegmentos === 1) {
    return duracaoDireta;
  }
  
  // Para voos com conexões, adicionar tempo extra baseado no número de conexões
  if (duracaoDireta && numSegmentos > 1) {
    const [horas, minutos] = duracaoDireta.split('h ');
    const horasNum = parseInt(horas);
    const minutosNum = parseInt(minutos.replace('m', ''));
    
    // Adicionar 2-4 horas por conexão (tempo realista de espera)
    const tempoConexao = (numSegmentos - 1) * 3; // 3h por conexão em média
    const totalHoras = horasNum + tempoConexao;
    
    return `${totalHoras}h ${minutosNum}m`;
  }
  
  return null;
};

// Função para obter mensagem de ofertas
const getOffersMessage = (flight: any): string => {
  if (!flight || !flight.alternatives || flight.alternatives.length === 0) return '';
  return `+${flight.alternatives.length} ofertas`;
};

// Função para obter o nome da companhia aérea formatado
const getFlightAirlineName = (flight: any): string => {
  if (!flight) return 'Companhia Aérea';
  
  // Priorizar dados da API Moblix (validatingBy.name) sobre flight.airline
  const airlineName = flight.validatingBy?.name || 
                     flight.segments?.[0]?.legs?.[0]?.operatedBy?.name || 
                     flight.segments?.[0]?.legs?.[0]?.managedBy?.name ||
                     flight.airline || 
                     '';
  
  return getDisplayAirlineName(airlineName);
};

// Função para obter o caminho do logo da companhia aérea
const getAirlineLogoPath = (flight: any): string => {
  if (!flight) return '/placeholder-logo.png';
  
  // Priorizar dados da API Moblix (validatingBy.name) sobre flight.airline
  const airlineName = flight.validatingBy?.name || 
                     flight.segments?.[0]?.legs?.[0]?.operatedBy?.name || 
                     flight.segments?.[0]?.legs?.[0]?.managedBy?.name ||
                     flight.airline || 
                     '';
  
  return getAirlineLogo(airlineName);
};

  return (
    <div>
    <div 
      className={`flight-card bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
        isSelected && !isSelectingReturn ? 'ring-2 ring-green-500 bg-green-50 transform scale-[1.02]' : 'hover:scale-[1.01]'
      }`}
      // Removido clique para abrir classes
    >
      {/* Modern Flight Card Layout */}
      <div className="p-3 md:p-6">
        {/* Header with Airline and Price */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div className="flex items-center space-x-4">
            {/* Airline Logo - Large and Prominent */}
            {(() => {
              const airlineName = getFlightAirlineName(flight);
              const logo = getAirlineLogo(airlineName);
              if (!logo) return null;
              const display = getDisplayAirlineName(airlineName);
              return (
                <div className="bg-white rounded-lg p-3 shadow-md border border-gray-100">
                  <img
                    src={logo}
                    alt={display}
                    className="object-contain filter brightness-100 contrast-100"
                    style={{
                      width: '80px',
                      height: '40px',
                      transform: airlineName === 'Azul' ? 'scale(1.5)' : 'scale(1)'
                    }}
                    title={display}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              );
            })()}
            
            {/* Flight Type Badge */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              flight.isMiles 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {flight.isMiles ? ' Milhas' : ' Dinheiro'}
            </div>
          </div>
          {/* Price - Large and Prominent */}
          <div className="text-right w-full sm:w-auto">
            <div className="text-sm text-gray-600 mb-1">
              {flight.isMiles ? 'Milhas' : 'Dinheiro'}
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
              {(() => {
                const price = flight.priceWithTax || flight.price || flight.totalPrice || 0;
                console.log('🔍 FlightResultCard - Exibindo preço:', {
                  isMiles: flight.isMiles,
                  price: price,
                  priceWithTax: flight.priceWithTax,
                  totalPrice: flight.totalPrice,
                  flightId: flight.flightId,
                  segments: flight.segments?.length
                });
                return flight.isMiles 
                  ? formatMiles(price)
                  : formatCurrency(price);
              })()}
            </div>
            <div className="text-sm text-gray-500">por pessoa</div>
          </div>
        </div>
      </div>
      
      {/* Flight Route - Clean and Modern */}
      <div className="bg-white rounded-lg p-3 md:p-4">
        <div className="flex items-center justify-between gap-2">
          {/* Departure */}
          <div className="text-center flex-shrink-0">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {(() => {
                // Tentar pegar de múltiplas fontes
                if ((flight as any).departureDate) {
                  return extractTimeFromMoblixData(flight as any, 'departure');
                }
                if (flight.segments && flight.segments.length > 0) {
                  return extractTimeFromMoblixData(flight.segments[0], 'departure');
                }
                return '--:--';
              })()}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {fromLabel
                ? fromLabel
                : (() => {
                    // Prioridade: dados diretos do voo, depois segments, depois legs
                    console.log('🔍 DEBUG DEPARTURE:', {
                      'flight.Origem': flight.Origem,
                      'flight.departure': (flight as any).departure,
                      'flight.origem': (flight as any).origem,
                      'segments': flight.segments,
                      'firstSegment': flight.segments?.[0],
                      'firstSegment.departure': flight.segments?.[0]?.departure,
                      'firstSegment.Origem': flight.segments?.[0]?.Origem
                    });
                    if (flight.Origem) return flight.Origem;
                    if ((flight as any).departure) return (flight as any).departure;
                    if ((flight as any).origem) return (flight as any).origem;
                    if (flight.segments && flight.segments.length > 0) {
                      const firstSegment = flight.segments[0];
                      if (firstSegment.departure) return firstSegment.departure;
                      if (firstSegment.Origem) return firstSegment.Origem;
                      if (firstSegment.origem) return firstSegment.origem;
                      if (firstSegment.legs?.[0]?.departure) return firstSegment.legs[0].departure;
                    }
                    return 'GRU';
                  })()
              }
            </div>
          </div>

          {/* Flight Path */}
          <div className="flex-1 mx-2 sm:mx-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-gray-400 rounded-full p-1.5 sm:p-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="text-center mt-2">
              <div className="text-xs text-gray-600">
                {getTotalDuration(flight.segments)}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                {flight.segments && flight.segments.length > 1 
                  ? `${flight.segments.length - 1} conexão${flight.segments.length - 1 > 1 ? 'ões' : ''}`
                  : 'Direto'
                }
              </div>
            </div>
          </div>

          {/* Arrival */}
          <div className="text-center flex-shrink-0">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {(() => {
                // Tentar pegar de múltiplas fontes
                if ((flight as any).arrivalDate) {
                  return extractTimeFromMoblixData(flight as any, 'arrival');
                }
                if (flight.segments && flight.segments.length > 0) {
                  return extractTimeFromMoblixData(flight.segments[flight.segments.length - 1], 'arrival');
                }
                return '--:--';
              })()}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {toLabel
                ? toLabel
                : (() => {
                    // Prioridade: dados diretos do voo, depois segments, depois legs
                    if (flight.Destino) return flight.Destino;
                    if ((flight as any).arrival) return (flight as any).arrival;
                    if ((flight as any).destino) return (flight as any).destino;
                    if (flight.segments && flight.segments.length > 0) {
                      const lastSegment = flight.segments[flight.segments.length - 1];
                      if (lastSegment.arrival) return lastSegment.arrival;
                      if (lastSegment.Destino) return lastSegment.Destino;
                      if (lastSegment.destino) return lastSegment.destino;
                      if (lastSegment.legs && lastSegment.legs.length > 0) {
                        const lastLeg = lastSegment.legs[lastSegment.legs.length - 1];
                        if (lastLeg.arrival) return lastLeg.arrival;
                      }
                    }
                    return 'CNF';
                  })()
              }
            </div>
          </div>
        </div>
      </div>

      {/* Price and Action Section */}
      <div className="mt-6 bg-gray-50 rounded-lg p-3 md:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
          {/* Left side - Selection message */}
          <div className="text-sm text-gray-600">{selectionMessage}</div>
          {/* Right side - Price offers info */}
          <div className="text-left sm:text-right">
            <div className="flex justify-start sm:justify-end mb-2">
            </div>
            <div className="text-xs text-gray-500 mb-1">{getOffersMessage(flight)}</div>
          </div>
        </div>
        {/* Botões */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
          {/* 'Ver Classes' removido */}
          
          {/* Botão Escolher - fase de IDA */}
          {onChooseOutbound && !isFinalSummary && (
            <button
              onClick={handleChooseOutbound}
              className="px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Escolher voo de ida
            </button>
          )}
          
          {/* Botão Escolher - fase de VOLTA */}
          {onChooseReturn && !isFinalSummary && (
            <button
              onClick={handleChooseReturn}
              className="px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Escolher voo
            </button>
          )}
          
          <button
            onClick={handleViewMore}
            className="px-6 py-2 rounded-lg text-sm transition-all duration-200 bg-white text-black border-2 border-gray-300 hover:border-gray-400 hover:shadow-lg"
          >
            Entre no site da companhia
          </button>
        </div>
      </div>
    </div>
  
  {/* Modal de classes removido */}
  
  {/* Modal de Confirmação de Compra */}
  {showPurchaseModal && airlineClickData && (
      <PurchaseConfirmationModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onConfirmPurchase={handlePurchaseConfirmation}
        onDenyPurchase={handlePurchaseDenial}
        flightInfo={{
          airline: airlineClickData.airline,
          route: airlineClickData.route,
          date: airlineClickData.date,
          price: airlineClickData.price,
          isMiles: airlineClickData.isMiles, // Adicionado para formatação correta
          isRoundTrip: !localStorage.getItem('soIda') || localStorage.getItem('soIda') === 'false',
          isReturnFlight: false // Sempre false para voo de ida
        }}
      />
    )}
    
    {/* Modal de Orientação para Milhas */}
    {showMilesGuidanceModal && (
      <MilesGuidanceModal
        isOpen={showMilesGuidanceModal}
        onClose={() => setShowMilesGuidanceModal(false)}
        onContinueToSite={handleContinueToAirlineSite}
        flightInfo={{
          airline: (flight as any).validatingBy?.name || (flight as any).segments?.[0]?.legs?.[0]?.operatedBy?.name || flight.airline,
          route: `${flight.Origem || flight.segments?.[0]?.departure || flight.segments?.[0]?.Origem || flight.segments?.[0]?.origem || 'GRU'} → ${flight.Destino || flight.segments?.[flight.segments?.length - 1]?.arrival || flight.segments?.[flight.segments?.length - 1]?.Destino || flight.segments?.[flight.segments?.length - 1]?.destino || 'CNF'}`,
          date: flight.segments?.[0]?.departureDate ? new Date(flight.segments[0].departureDate).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
          miles: flight.priceWithTax || flight.price || flight.totalPrice || 0,
          url: '#'
        }}
      />
    )}
    </div>
  );
};

export default FlightResultCard;
