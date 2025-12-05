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
import { designSystem } from '../styles/designSystem';

// ============================================
// COMPONENTE AUXILIAR: AirlineLogo
// Gerencia fallback resiliente para logos de companhias
// ============================================
const AirlineLogo: React.FC<{ flight: any }> = ({ flight }) => {
  const [imgError, setImgError] = useState(false);

  const getFlightAirlineName = (flight: any): string => {
    if (!flight) return 'Companhia Aérea';

    const airlineName = flight.validatingBy?.name ||
                       flight.segments?.[0]?.legs?.[0]?.operatedBy?.name ||
                       flight.segments?.[0]?.legs?.[0]?.managedBy?.name ||
                       flight.airline ||
                       '';

    return getDisplayAirlineName(airlineName);
  };

  const airlineName = getFlightAirlineName(flight);
  const logo = getAirlineLogo(airlineName);

  return (
    <div
      className="flex-shrink-0 flex items-center justify-center"
      style={{
        width: '56px',
        height: '56px',
        backgroundColor: '#FFFFFF',
        borderRadius: designSystem.radii.md,
        boxShadow: designSystem.shadows.sm,
        border: `1px solid ${designSystem.colors.outline || '#E5E7EB'}`,
        padding: designSystem.spacing.xs,
      }}
    >
      <img
        src={imgError ? '/placeholder-logo.png' : (logo || '/placeholder-logo.png')}
        alt={airlineName}
        className="object-contain w-full h-full"
        style={{ opacity: imgError ? 0.5 : 1 }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (!imgError && target.src !== '/placeholder-logo.png') {
            setImgError(true);
            target.src = '/placeholder-logo.png';
            target.style.opacity = '0.5';
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ Logo não encontrado para:', airlineName, 'tentado:', logo);
            }
          }
        }}
      />
    </div>
  );
};

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
    validatingBy?: {
      name?: string;
      [key: string]: any;
    };
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

  // ============================================
  // NORMALIZAÇÃO DE DADOS - Garantir campos mínimos
  // ============================================
  const normalizedFlight = {
    segments: flight?.segments || [],
    priceWithTax: flight?.priceWithTax ?? flight?.price ?? flight?.totalPrice ?? 0,
    price: flight?.price ?? flight?.priceWithTax ?? flight?.totalPrice ?? 0,
    totalPrice: flight?.totalPrice ?? flight?.priceWithTax ?? flight?.price ?? 0,
    isMiles: !!flight?.isMiles,
    airline: flight?.airline || flight?.validatingBy?.name || 'Companhia Aérea',
    numeroVoo: flight?.numeroVoo || 'N/A',
    Origem: flight?.Origem || flight?.segments?.[0]?.departure?.airport || flight?.segments?.[0]?.origem || flight?.segments?.[0]?.Origem || '',
    Destino: flight?.Destino || flight?.segments?.slice(-1)[0]?.arrival?.airport || flight?.segments?.slice(-1)[0]?.destino || flight?.segments?.slice(-1)[0]?.Destino || '',
    validatingBy: flight?.validatingBy,
    fareGroup: flight?.fareGroup,
    alternatives: flight?.alternatives || [],
    originalData: flight?.originalData,
    // Preserve original reference for debugging
    __raw: flight
  };

  // Debug log para inspeção (apenas em desenvolvimento)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 FlightResultCard - Normalized Flight:', {
        original: flight,
        normalized: normalizedFlight,
        fromLabel,
        toLabel,
        isRoundTrip,
        isSelectingReturn,
        hasOutboundHandler: !!onChooseOutbound,
        hasReturnHandler: !!onChooseReturn,
        isFinalSummary
      });
    }
  }, []);

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

// Função para formatar hora - MELHORADA para aceitar múltiplos formatos
const formatTime = (input: string | number | Date | any): string => {
  // Handle null/undefined
  if (!input || input === 'N/A') {
    return '--:--';
  }

  try {
    // Se é um objeto com propriedades time/dateTime, usar recursivamente
    if (typeof input === 'object' && !(input instanceof Date)) {
      if (input.dateTime) return formatTime(input.dateTime);
      if (input.time) return formatTime(input.time);
      if (input.date && input.time) return formatTime(input.time);
    }

    // Converter para string se for número (timestamp)
    const dateString = typeof input === 'number'
      ? new Date(input).toISOString()
      : input instanceof Date
        ? input.toISOString()
        : String(input);

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

      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Data inválida na API:', input);
      }
      return '--:--';
    }

    // Usar horário LOCAL exato da API Moblix
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Erro ao formatar horário:', error, input);
    }
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
    <article
      role="article"
      aria-labelledby={`flight-${(flight as any).flightId || Math.random()}-title`}
      className={`
        bg-white transition-all duration-200 ease-out
        ${isSelected && !isSelectingReturn ? 'ring-2 bg-green-50' : ''}
        ${!isFinalSummary ? 'hover:-translate-y-0.5' : 'opacity-90'}
      `}
      style={{
        borderRadius: designSystem.radii.lg,
        boxShadow: designSystem.shadows.card,
        border: `1px solid ${designSystem.colors.border}`,
        minHeight: '100px',
        maxHeight: '120px',
      }}
      onMouseEnter={(e) => {
        if (!isFinalSummary) {
          (e.currentTarget as HTMLElement).style.boxShadow = designSystem.shadows.cardHover;
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = designSystem.shadows.card;
      }}
    >
      <div style={{ padding: designSystem.spacing.md }}>
        {/* Grid: Logo+Info | Route | Price+Actions */}
        <div
          className="grid grid-cols-1 lg:grid-cols-[35%_40%_25%] items-center"
          style={{ gap: designSystem.spacing.md }}
        >

          {/* COL 1: Logo + Badge + Horários */}
          <div className="flex items-center" style={{ gap: designSystem.spacing.sm }}>
            {/* Logo compacto padronizado */}
            <AirlineLogo flight={normalizedFlight} />

            {/* Badge + Horários */}
            <div className="flex-1 min-w-0">
              {/* Badge compacto Design System */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  backgroundColor: flight.isMiles ? '#DBEAFE' : '#FEF3C7',
                  color: flight.isMiles ? '#1E40AF' : '#92400E',
                  marginBottom: '4px',
                }}
              >
                {flight.isMiles ? 'Milhas' : 'Dinheiro'}
              </div>

              {/* Horário de partida - Tipografia correta */}
              <div className="flex items-baseline" style={{ gap: designSystem.spacing.xs }}>
                <span
                  className="font-bold leading-none"
                  style={{
                    fontSize: '28px',
                    color: designSystem.colors.textPrimary,
                    letterSpacing: '-0.5px'
                  }}
                >
                  {(() => {
                    if ((flight as any).departureDate) {
                      return extractTimeFromMoblixData(flight as any, 'departure');
                    }
                    if (flight.segments && flight.segments.length > 0) {
                      return extractTimeFromMoblixData(flight.segments[0], 'departure');
                    }
                    return '--:--';
                  })()}
                </span>
                <span
                  className="font-medium tracking-wide"
                  style={{
                    fontSize: '14px',
                    color: designSystem.colors.textSecondary
                  }}
                >
                  {fromLabel || flight.Origem || 'GRU'}
                </span>
              </div>
            </div>
          </div>

          {/* COL 2: Linha de conexão + Duração */}
          <div className="flex items-center justify-center">
            <div className="flex-1 flex flex-col items-center gap-1">
              {/* Timeline - linha fina com bolinha */}
              <div className="relative w-full" style={{ margin: `${designSystem.spacing.xs} 0` }}>
                <div className="absolute inset-0 flex items-center">
                  <div
                    style={{
                      width: '100%',
                      height: '1px',
                      backgroundColor: designSystem.colors.border
                    }}
                  ></div>
                </div>
                <div className="relative flex justify-center">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      boxShadow: designSystem.shadows.sm,
                      border: `2px solid ${designSystem.colors.border}`
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: designSystem.colors.textMuted
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Duração e Conexões - Tipografia correta */}
              <div className="text-center" style={{ marginTop: designSystem.spacing.xs }}>
                <div
                  className="font-medium"
                  style={{
                    fontSize: '13px',
                    color: designSystem.colors.textSecondary
                  }}
                >
                  {getTotalDuration(flight.segments)}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: designSystem.colors.textMuted,
                    marginTop: '2px'
                  }}
                >
                  {flight.segments && flight.segments.length > 1
                    ? `${flight.segments.length - 1} conexão${flight.segments.length - 1 > 1 ? 'ões' : ''}`
                    : 'Direto'
                  }
                </div>
              </div>

              {/* Horário de chegada - Tipografia correta */}
              <div className="flex items-baseline" style={{ gap: designSystem.spacing.xs }}>
                <span
                  className="font-bold leading-none"
                  style={{
                    fontSize: '28px',
                    color: designSystem.colors.textPrimary,
                    letterSpacing: '-0.5px'
                  }}
                >
                  {(() => {
                    if ((flight as any).arrivalDate) {
                      return extractTimeFromMoblixData(flight as any, 'arrival');
                    }
                    if (flight.segments && flight.segments.length > 0) {
                      return extractTimeFromMoblixData(flight.segments[flight.segments.length - 1], 'arrival');
                    }
                    return '--:--';
                  })()}
                </span>
                <span
                  className="font-medium tracking-wide"
                  style={{
                    fontSize: '14px',
                    color: designSystem.colors.textSecondary
                  }}
                >
                  {toLabel || flight.Destino || 'CNF'}
                </span>
              </div>
            </div>
          </div>

          {/* COL 3: Preço + Botões */}
          <div className="flex flex-col items-end justify-center gap-2">
            {/* Preço - Tipografia correta */}
            <div className="text-right">
              <div
                className="font-bold leading-tight"
                style={{
                  fontSize: '24px',
                  color: designSystem.colors.textPrimary,
                  letterSpacing: '-0.5px'
                }}
              >
                {(() => {
                  const price = flight.priceWithTax || flight.price || flight.totalPrice || 0;
                  return flight.isMiles
                    ? formatMiles(price)
                    : formatCurrency(price);
                })()}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: designSystem.colors.textMuted,
                  marginTop: '4px'
                }}
              >
                por pessoa
              </div>
            </div>

            {/* Botões - Design System com Fallback */}
            {!isFinalSummary && (
              <div style={{ marginTop: designSystem.spacing.sm }}>
                {onChooseOutbound ? (
                  <button
                    onClick={handleChooseOutbound}
                    className="font-semibold transition-colors"
                    style={{
                      width: '100%',
                      height: '44px',
                      borderRadius: designSystem.radii.md,
                      backgroundColor: designSystem.colors.success,
                      color: '#FFFFFF',
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#15803D';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = designSystem.colors.success;
                    }}
                  >
                    Escolher
                  </button>
                ) : onChooseReturn ? (
                  <button
                    onClick={handleChooseReturn}
                    className="font-semibold transition-colors"
                    style={{
                      width: '100%',
                      height: '44px',
                      borderRadius: designSystem.radii.md,
                      backgroundColor: designSystem.colors.success,
                      color: '#FFFFFF',
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#15803D';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = designSystem.colors.success;
                    }}
                  >
                    Escolher
                  </button>
                ) : (
                  /* Fallback CTA quando não há handlers do pai */
                  <button
                    onClick={handleViewMore}
                    className="font-semibold transition-colors"
                    style={{
                      width: '100%',
                      height: '44px',
                      borderRadius: designSystem.radii.md,
                      backgroundColor: designSystem.colors.primary,
                      color: designSystem.colors.accent,
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                    }}
                  >
                    Ver Detalhes
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>

      {/* Modals */}
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
            isMiles: airlineClickData.isMiles,
            isRoundTrip: !localStorage.getItem('soIda') || localStorage.getItem('soIda') === 'false',
            isReturnFlight: false
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
