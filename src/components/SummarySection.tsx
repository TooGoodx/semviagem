import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';
import { getAirlineLogo, getDisplayAirlineName } from '../utils/airlineLogos';

type SummarySectionProps = {};

const SummarySection: React.FC<SummarySectionProps> = () => {
  const { selected, clear } = useSelection();
  const navigate = useNavigate();
  const [showOutboundModal, setShowOutboundModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const outbound = selected.outbound;
  const ret = selected.return;

  const getFromToLabels = (flight: any) => {
    if (!flight) return { from: undefined, to: undefined } as { from?: string; to?: string };
    const from = flight.Origem || flight.departure || flight?.segments?.[0]?.departure || flight?.segments?.[0]?.origem;
    const to = flight.Destino || flight.arrival || flight?.segments?.[flight?.segments?.length - 1]?.arrival || flight?.segments?.[flight?.segments?.length - 1]?.destino;
    return { from, to };
  };

  const getAirlineName = (flight: any) => {
    console.log('🔍 Flight object structure:', JSON.stringify(flight, null, 2));
    
    // Priorizar dados da API Moblix (validatingBy.name) sobre outros campos
    const airlineName = flight?.validatingBy?.name || 
                       flight?.segments?.[0]?.legs?.[0]?.operatedBy?.name || 
                       flight?.segments?.[0]?.legs?.[0]?.managedBy?.name ||
                       flight?.airline || 
                       flight?.segments?.[0]?.airline ||
                       flight?.segments?.[0]?.carrier ||
                       flight?.carrier ||
                       flight?.operatingCarrier ||
                       flight?.marketingCarrier ||
                       flight?.companhia ||
                       flight?.company ||
                       '';
    
    console.log('🏷️ Raw airline name found:', airlineName);
    
    // Usar a função utilitária para padronizar o nome
    const standardizedName = getDisplayAirlineName(airlineName);
    console.log('✈️ Standardized airline name:', standardizedName);
    
    return standardizedName;
  };
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  const formatMiles = (value: number) => `${(value || 0).toLocaleString()} milhas`;
  const getPriceFormatted = (flight: any) => {
    const price = flight?.priceWithTax || flight?.price || flight?.totalPrice || 0;
    return flight?.isMiles ? formatMiles(price) : formatCurrency(price);
  };

  const formatTime = (dateString: string): string => {
    if (!dateString || dateString === 'N/A') return '--:--';
    try {
      if (/^\d{2}:\d{2}$/.test(dateString)) return dateString;
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '--:--';
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      return '--:--';
    }
  };

  const getTotalDuration = (segments: any[]): string => {
    if (!segments || segments.length === 0) return '';
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];
    if (!firstSegment.departureDate || !lastSegment.arrivalDate) return '';
    
    let totalFlightMinutes = 0;
    for (const segment of segments) {
      if (segment.departureDate && segment.arrivalDate) {
        const segmentStart = new Date(segment.departureDate).getTime();
        const segmentEnd = new Date(segment.arrivalDate).getTime();
        const segmentDuration = segmentEnd - segmentStart;
        totalFlightMinutes += Math.floor(segmentDuration / (1000 * 60));
      }
    }
    
    if (segments.length > 1) {
      const connectionTime = (segments.length - 1) * 60;
      totalFlightMinutes = Math.max(totalFlightMinutes - connectionTime, 60);
    }
    
    const hours = Math.floor(totalFlightMinutes / 60);
    const minutes = totalFlightMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const handleCompanyRedirect = (flight: any) => {
    console.log('🚀 FUNÇÃO handleCompanyRedirect CHAMADA!');
    console.log('🔍 Flight data for redirect:', flight);
    const airlineName = getAirlineName(flight);
    console.log('✈️ Detected airline name:', airlineName);
    const isMiles = flight?.isMiles;
    console.log('💰 Is miles:', isMiles);
    
    // Expandir mapeamento de companhias aéreas com URLs específicas
    const airlineUrls: Record<string, { money: string; miles: string }> = {
      'LATAM': {
        money: 'https://www.latam.com/pt_br/',
        miles: 'https://www.latam.com/pt_br/latam-pass'
      },
      'LATAM Airlines': {
        money: 'https://www.latam.com/pt_br/',
        miles: 'https://www.latam.com/pt_br/latam-pass'
      },
      'LATAM Brasil': {
        money: 'https://www.latam.com/pt_br/',
        miles: 'https://www.latam.com/pt_br/latam-pass'
      },
      'GOL': {
        money: 'https://www.voegol.com.br/',
        miles: 'https://www.smiles.com.br/'
      },
      'GOL Linhas Aéreas': {
        money: 'https://www.voegol.com.br/',
        miles: 'https://www.smiles.com.br/'
      },
      'GOL Smiles': {
        money: 'https://www.voegol.com.br/',
        miles: 'https://www.smiles.com.br/'
      },
      'Azul': {
        money: 'https://www.azul.com.br/',
        miles: 'https://www.tudoazul.com/'
      },
      'Azul Linhas Aéreas': {
        money: 'https://www.azul.com.br/',
        miles: 'https://www.tudoazul.com/'
      },
      'Azul TudoAzul': {
        money: 'https://www.azul.com.br/',
        miles: 'https://www.tudoazul.com/'
      },
      'TAM': {
        money: 'https://www.latam.com/pt_br/',
        miles: 'https://www.latam.com/pt_br/latam-pass'
      },
      'Avianca': {
        money: 'https://www.avianca.com/br/pt/',
        miles: 'https://www.lifemiles.com/pt-br/'
      },
      'Copa Airlines': {
        money: 'https://www.copaair.com/pt/web/br',
        miles: 'https://www.copaair.com/pt/web/br/connectmiles'
      },
      'American Airlines': {
        money: 'https://www.aa.com/homePage.do?locale=pt_BR',
        miles: 'https://www.aa.com/aadvantage/enrollNow.do?locale=pt_BR'
      },
      'United Airlines': {
        money: 'https://www.united.com/ual/pt/br/',
        miles: 'https://www.united.com/ual/pt/br/fly/mileageplus.html'
      },
      'Delta Air Lines': {
        money: 'https://pt.delta.com/',
        miles: 'https://pt.delta.com/skymiles'
      },
      'Air France': {
        money: 'https://www.airfrance.com.br/',
        miles: 'https://www.airfrance.com.br/BR/pt/common/flyingblue/flyingblue.htm'
      },
      'KLM': {
        money: 'https://www.klm.com.br/',
        miles: 'https://www.klm.com.br/travel/br_pt/prepare_for_travel/flyingblue/index.htm'
      },
      'Lufthansa': {
        money: 'https://www.lufthansa.com/br/pt/homepage',
        miles: 'https://www.lufthansa.com/br/pt/miles-and-more'
      },
      'Emirates': {
        money: 'https://www.emirates.com/br/portuguese/',
        miles: 'https://www.emirates.com/br/portuguese/skywards/'
      },
      'Qatar Airways': {
        money: 'https://www.qatarairways.com/pt-br/homepage.html',
        miles: 'https://www.qatarairways.com/pt-br/privilege-club.html'
      },
      'Turkish Airlines': {
        money: 'https://www.turkishairlines.com/pt-br/',
        miles: 'https://www.turkishairlines.com/pt-br/miles-smiles/'
      }
    };
    
    // Tentar encontrar a companhia aérea por nome exato ou parcial
    let matchedAirline = null;
    if (airlineName) {
      // Primeiro, tentar match exato
      matchedAirline = airlineUrls[airlineName];
      
      // Se não encontrar, tentar match parcial (case insensitive)
      if (!matchedAirline) {
        const airlineKey = Object.keys(airlineUrls).find(key => 
          key.toLowerCase().includes(airlineName.toLowerCase()) || 
          airlineName.toLowerCase().includes(key.toLowerCase())
        );
        if (airlineKey) {
          matchedAirline = airlineUrls[airlineKey];
        }
      }
    }
    
    // Se encontrou a companhia, usar URL específica; senão, usar URL genérica
    let targetUrl = 'https://www.google.com/travel/flights';
    if (matchedAirline) {
      targetUrl = isMiles ? matchedAirline.miles : matchedAirline.money;
    } else if (!airlineName) {
      // Se não tem nome da companhia, usar URLs padrão das principais companhias brasileiras
      targetUrl = isMiles 
        ? 'https://www.smiles.com.br/' 
        : 'https://www.latam.com/pt_br/';
    }
    
    console.log('🌐 Final redirect URL:', targetUrl);
    window.open(targetUrl, '_blank');
  };

  const { from: outFrom, to: outTo } = getFromToLabels(outbound);
  const { from: retFrom, to: retTo } = getFromToLabels(ret);

  if (!outbound && !ret) return null;

  const FlightModal = ({ flight, isOpen, onClose, title }: { flight: any, isOpen: boolean, onClose: () => void, title: string }) => {
    if (!isOpen || !flight) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Flight Card Content */}
            <div className="space-y-4">
              {/* Header with Airline and Price */}
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  {(() => {
                    const nameKey = getAirlineName(flight);
                    const logo = getAirlineLogo(nameKey);
                    const display = getDisplayAirlineName(nameKey);
                    return logo ? (
                      <div className="bg-white rounded-lg p-3 shadow-md border border-gray-100">
                        <img src={logo} alt={display} className="object-contain" style={{ width: '60px', height: '30px' }} />
                      </div>
                    ) : null;
                  })()}
                  
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    flight.isMiles ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {flight.isMiles ? 'Milhas' : 'Dinheiro'}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">{getPriceFormatted(flight)}</div>
                  <div className="text-sm text-gray-500">por pessoa</div>
                </div>
              </div>

              {/* Flight Route */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  {/* Departure */}
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {flight.segments && flight.segments.length > 0 ? formatTime(flight.segments[0].departureDate) : '--:--'}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {flight.segments && flight.segments.length > 0 ? 
                        (flight.segments[0].departure || flight.segments[0].origem || 'N/A') : 'N/A'}
                    </div>
                  </div>

                  {/* Flight Path */}
                  <div className="flex-1 mx-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <div className="bg-gray-500 rounded-full p-2">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <div className="text-xs text-gray-600">{getTotalDuration(flight.segments)}</div>
                      <div className="text-xs text-blue-600 font-medium">
                        {flight.segments && flight.segments.length > 1 
                          ? `${flight.segments.length - 1} conexão${flight.segments.length - 1 > 1 ? 'ões' : ''}`
                          : 'Direto'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {flight.segments && flight.segments.length > 0 ? 
                        formatTime(flight.segments[flight.segments.length - 1].arrivalDate) : '--:--'}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {flight.segments && flight.segments.length > 0 ? 
                        (flight.segments[flight.segments.length - 1].arrival || 
                         flight.segments[flight.segments.length - 1].destino || 'N/A') : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selection Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-green-800 font-medium text-center">
                  {title === 'Voo de ida' ? 'Selecionado como voo de ida' : 'Selecionado como voo de volta'}
                </div>
              </div>

              {/* Company Redirect Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🚀 BOTÃO MODAL CLICADO!');
                  console.log('📋 Flight data:', flight);
                  
                  // Direct test with alert to confirm button works
                  alert('Botão modal clicado! Testando redirecionamento...');
                  
                  // Force direct redirect without function call first
                  const testUrl = flight?.isMiles ? 'https://www.smiles.com.br/' : 'https://www.latam.com/pt_br/';
                  console.log('🌐 Test URL:', testUrl);
                  
                  try {
                    window.open(testUrl, '_blank');
                  } catch (error) {
                    console.error('❌ Erro:', error);
                    window.location.href = testUrl;
                  }
                }}
                className="w-full px-6 py-3 rounded-lg font-medium text-black bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 transition-colors"
              >
                Entre no site da companhia
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="resumo" className="py-8 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Ações rápidas */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              clear();
              navigate('#topo');
            }}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            🔄 Recomeçar seleção
          </button>
          <button
            onClick={() => navigate('#topo')}
            className="px-4 py-2 rounded-md bg-white text-black border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          >
            🔍 Nova Busca Completa
          </button>
        </div>

        {/* Suas escolhas */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Suas escolhas</h3>
          
          <div className="space-y-4">
            {outbound && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="space-y-4">
                  {/* Header with Airline and Price */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      {(() => {
                        const nameKey = getAirlineName(outbound);
                        if (!nameKey) return null;
                        const logo = getAirlineLogo(nameKey);
                        const display = getDisplayAirlineName(nameKey);
                        return logo ? (
                          <div className="bg-white rounded-lg p-3 shadow-md border border-gray-100">
                            <img src={logo} alt={display} className="object-contain" style={{ width: '60px', height: '30px' }} />
                          </div>
                        ) : null;
                      })()}
                      
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        outbound.isMiles ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {outbound.isMiles ? 'Milhas' : 'Dinheiro'}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">{getPriceFormatted(outbound)}</div>
                      <div className="text-sm text-gray-500">por pessoa</div>
                    </div>
                  </div>

                  {/* Flight Route */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      {/* Departure */}
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">
                          {outbound.segments && outbound.segments.length > 0 ? formatTime(outbound.segments[0].departureDate) : '--:--'}
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                          {outbound.segments && outbound.segments.length > 0 ? 
                            (outbound.segments[0].departure || outbound.segments[0].origem || 'N/A') : 'N/A'}
                        </div>
                      </div>

                      {/* Flight Path */}
                      <div className="flex-1 mx-6">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <div className="bg-gray-500 rounded-full p-2">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="text-center mt-2">
                          <div className="text-xs text-gray-600">{getTotalDuration(outbound.segments)}</div>
                          <div className="text-xs text-blue-600 font-medium">
                            {outbound.segments && outbound.segments.length > 1 
                              ? `${outbound.segments.length - 1} conexão${outbound.segments.length - 1 > 1 ? 'ões' : ''}`
                              : 'Direto'
                            }
                          </div>
                        </div>
                      </div>

                      {/* Arrival */}
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">
                          {outbound.segments && outbound.segments.length > 0 
                            ? (() => {
                                const arrivalTime = formatTime(outbound.segments[outbound.segments.length - 1].arrivalDate);
                                const departureTime = formatTime(outbound.segments[0].departureDate);
                                const duration = getTotalDuration(outbound.segments);
                                
                                // Se o horário de chegada parece incorreto, calcular baseado na partida + duração
                                const shouldCalculate = (() => {
                                  try {
                                    const [depHours, depMinutes] = departureTime.split(':').map(Number);
                                    const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
                                    const durationMatch = duration.match(/(\d+)h\s*(\d+)m/);
                                    
                                    if (durationMatch) {
                                      const durationHours = parseInt(durationMatch[1]);
                                      const durationMinutes = parseInt(durationMatch[2]);
                                      
                                      // Calcular chegada esperada
                                      const totalMinutes = (depHours * 60 + depMinutes) + (durationHours * 60 + durationMinutes);
                                      const expectedArrHours = Math.floor(totalMinutes / 60) % 24;
                                      const expectedArrMinutes = totalMinutes % 60;
                                      
                                      // Verificar se a diferença é maior que 30 minutos
                                      const actualTotalMinutes = arrHours * 60 + arrMinutes;
                                      const expectedTotalMinutes = expectedArrHours * 60 + expectedArrMinutes;
                                      const difference = Math.abs(actualTotalMinutes - expectedTotalMinutes);
                                      
                                      return difference > 30; // Se diferença > 30min, recalcular
                                    }
                                  } catch (error) {
                                    return false;
                                  }
                                  return false;
                                })();
                                
                                if (shouldCalculate) {
                                  try {
                                    const [depHours, depMinutes] = departureTime.split(':').map(Number);
                                    const durationMatch = duration.match(/(\d+)h\s*(\d+)m/);
                                    
                                    if (durationMatch) {
                                      const durationHours = parseInt(durationMatch[1]);
                                      const durationMinutes = parseInt(durationMatch[2]);
                                      
                                      const totalMinutes = (depHours * 60 + depMinutes) + (durationHours * 60 + durationMinutes);
                                      const arrHours = Math.floor(totalMinutes / 60) % 24;
                                      const arrMinutes = totalMinutes % 60;
                                      
                                      return `${arrHours.toString().padStart(2, '0')}:${arrMinutes.toString().padStart(2, '0')}`;
                                    }
                                  } catch (error) {
                                    console.warn('Erro ao calcular horário de chegada:', error);
                                  }
                                }
                                
                                return arrivalTime;
                              })()
                            : '--:--'
                          }
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                          {outbound.segments && outbound.segments.length > 0 ? 
                            (outbound.segments[outbound.segments.length - 1].arrival || 
                             outbound.segments[outbound.segments.length - 1].destino || 'N/A') : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selection Status */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-green-800 font-medium text-center">
                      Selecionado como voo de ida
                    </div>
                  </div>

                  {/* Company Redirect Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🚀 BOTÃO SUMMARY OUTBOUND CLICADO!');
                      handleCompanyRedirect(outbound);
                    }}
                    className="w-full px-6 py-3 rounded-lg font-medium text-black bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    Entre no site da companhia
                  </button>
                </div>
              </div>
            )}

            {ret && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="space-y-4">
                  {/* Header with Airline and Price */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      {(() => {
                        const nameKey = getAirlineName(ret);
                        if (!nameKey) return null;
                        const logo = getAirlineLogo(nameKey);
                        const display = getDisplayAirlineName(nameKey);
                        return logo ? (
                          <div className="bg-white rounded-lg p-3 shadow-md border border-gray-100">
                            <img src={logo} alt={display} className="object-contain" style={{ width: '60px', height: '30px' }} />
                          </div>
                        ) : null;
                      })()}
                      
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        ret.isMiles ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {ret.isMiles ? 'Milhas' : 'Dinheiro'}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">{getPriceFormatted(ret)}</div>
                      <div className="text-sm text-gray-500">por pessoa</div>
                    </div>
                  </div>

                  {/* Flight Route */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      {/* Departure */}
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">
                          {ret.segments && ret.segments.length > 0 ? formatTime(ret.segments[0].departureDate) : '--:--'}
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                          {ret.segments && ret.segments.length > 0 ? 
                            (ret.segments[0].departure || ret.segments[0].origem || 'N/A') : 'N/A'}
                        </div>
                      </div>

                      {/* Flight Path */}
                      <div className="flex-1 mx-6">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <div className="bg-gray-500 rounded-full p-2">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="text-center mt-2">
                          <div className="text-xs text-gray-600">{getTotalDuration(ret.segments)}</div>
                          <div className="text-xs text-blue-600 font-medium">
                            {ret.segments && ret.segments.length > 1 
                              ? `${ret.segments.length - 1} conexão${ret.segments.length - 1 > 1 ? 'ões' : ''}`
                              : 'Direto'
                            }
                          </div>
                        </div>
                      </div>

                      {/* Arrival */}
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">
                          {ret.segments && ret.segments.length > 0 
                            ? (() => {
                                const arrivalTime = formatTime(ret.segments[ret.segments.length - 1].arrivalDate);
                                const departureTime = formatTime(ret.segments[0].departureDate);
                                const duration = getTotalDuration(ret.segments);
                                
                                // Se o horário de chegada parece incorreto, calcular baseado na partida + duração
                                const shouldCalculate = (() => {
                                  try {
                                    const [depHours, depMinutes] = departureTime.split(':').map(Number);
                                    const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
                                    const durationMatch = duration.match(/(\d+)h\s*(\d+)m/);
                                    
                                    if (durationMatch) {
                                      const durationHours = parseInt(durationMatch[1]);
                                      const durationMinutes = parseInt(durationMatch[2]);
                                      
                                      // Calcular chegada esperada
                                      const totalMinutes = (depHours * 60 + depMinutes) + (durationHours * 60 + durationMinutes);
                                      const expectedArrHours = Math.floor(totalMinutes / 60) % 24;
                                      const expectedArrMinutes = totalMinutes % 60;
                                      
                                      // Verificar se a diferença é maior que 30 minutos
                                      const actualTotalMinutes = arrHours * 60 + arrMinutes;
                                      const expectedTotalMinutes = expectedArrHours * 60 + expectedArrMinutes;
                                      const difference = Math.abs(actualTotalMinutes - expectedTotalMinutes);
                                      
                                      return difference > 30; // Se diferença > 30min, recalcular
                                    }
                                  } catch (error) {
                                    return false;
                                  }
                                  return false;
                                })();
                                
                                if (shouldCalculate) {
                                  try {
                                    const [depHours, depMinutes] = departureTime.split(':').map(Number);
                                    const durationMatch = duration.match(/(\d+)h\s*(\d+)m/);
                                    
                                    if (durationMatch) {
                                      const durationHours = parseInt(durationMatch[1]);
                                      const durationMinutes = parseInt(durationMatch[2]);
                                      
                                      const totalMinutes = (depHours * 60 + depMinutes) + (durationHours * 60 + durationMinutes);
                                      const arrHours = Math.floor(totalMinutes / 60) % 24;
                                      const arrMinutes = totalMinutes % 60;
                                      
                                      return `${arrHours.toString().padStart(2, '0')}:${arrMinutes.toString().padStart(2, '0')}`;
                                    }
                                  } catch (error) {
                                    console.warn('Erro ao calcular horário de chegada:', error);
                                  }
                                }
                                
                                return arrivalTime;
                              })()
                            : '--:--'
                          }
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                          {ret.segments && ret.segments.length > 0 ? 
                            (ret.segments[ret.segments.length - 1].arrival || 
                             ret.segments[ret.segments.length - 1].destino || 'N/A') : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selection Status */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-green-800 font-medium text-center">
                      Selecionado como voo de volta
                    </div>
                  </div>

                  {/* Company Redirect Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🚀 BOTÃO SUMMARY RETURN CLICADO!');
                      handleCompanyRedirect(ret);
                    }}
                    className="w-full px-6 py-3 rounded-lg font-medium text-black bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    Entre no site da companhia
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <FlightModal 
          flight={outbound} 
          isOpen={showOutboundModal} 
          onClose={() => setShowOutboundModal(false)}
          title="Voo de ida"
        />
        <FlightModal 
          flight={ret} 
          isOpen={showReturnModal} 
          onClose={() => setShowReturnModal(false)}
          title="Voo de volta"
        />
      </div>
    </section>
  );
};

export default SummarySection;
