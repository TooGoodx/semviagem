import React, { useState, useEffect } from 'react';
import { X, Plane, Clock, ArrowRight } from 'lucide-react';
import { useSelection } from '../context/SelectionContext';

interface Flight {
  segments: any[];
  price: number;
  priceWithTax: number;
  totalPrice: number;
  isMiles: boolean;
  airline: string;
  numeroVoo: string;
  departure?: string;
  arrival?: string;
  departureDate?: string;
  arrivalDate?: string;
  Origem?: string;
  Destino?: string;
  Saida?: string;
  Chegada?: string;
}

interface ReturnFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  outboundFlight: Flight | null;
  returnFlights: Flight[];
  onSelectReturn: (flight: Flight) => void;
  searchParams: any;
}

const ReturnFlightModal: React.FC<ReturnFlightModalProps> = ({
  isOpen,
  onClose,
  outboundFlight,
  returnFlights,
  onSelectReturn,
  searchParams
}) => {
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<Flight | null>(null);
  const { selected } = useSelection();

  // Funções de formatação
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatMiles = (value: number) => {
    return `${value.toLocaleString('pt-BR')} milhas`;
  };

  const formatTime = (dateString: string | undefined | null) => {
    if (!dateString || dateString === 'N/A') {
      return '--:--';
    }
    
    try {
      if (/^\d{2}:\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '--:--';
      }
      
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      return '--:--';
    }
  };

  const getFlightPrice = (flight: Flight) => {
    return flight.priceWithTax || flight.price || flight.totalPrice || 0;
  };

  const getFlightRoute = (flight: Flight) => {
    const segments = flight.segments || [];
    const firstSegment = segments[0] || {};
    const lastSegment = segments[segments.length - 1] || {};
    
    const origem = firstSegment.departure || firstSegment.origem || flight.Origem || flight.departure || '';
    const destino = lastSegment.arrival || lastSegment.destino || flight.Destino || flight.arrival || '';
    
    return { origem, destino };
  };

  const getFlightTimes = (flight: Flight) => {
    const segments = flight.segments || [];
    const firstSegment = segments[0] || {};
    const lastSegment = segments[segments.length - 1] || {};
    
    const saida = formatTime(firstSegment.departureDate || flight.Saida || flight.departureDate);
    const chegada = formatTime(lastSegment.arrivalDate || flight.Chegada || flight.arrivalDate);
    
    return { saida, chegada };
  };

  const handleSelectReturn = (flight: Flight) => {
    console.log('🎯 DEBUG: ReturnFlightModal - Voo de volta selecionado:', flight);
    console.log('🔍 DEBUG: onSelectReturn function:', onSelectReturn);
    console.log('🔍 DEBUG: Chamando onSelectReturn...');
    setSelectedReturnFlight(flight);
    onSelectReturn(flight);
    console.log('🔍 DEBUG: onSelectReturn chamado, fechando modal...');
    onClose();
    console.log('🔍 DEBUG: Modal fechado');
  };

  // Debug: verificar se os voos de volta são diferentes dos de ida
  console.log('🔍 ReturnFlightModal - Return flights received:', returnFlights.length);
  console.log('🔍 ReturnFlightModal - First return flight:', returnFlights[0]);
  console.log('🔍 ReturnFlightModal - Outbound flight:', outboundFlight);
  
  // Separar voos por tipo de pagamento
  const moneyFlights = returnFlights.filter(f => !f.isMiles).slice(0, 5);
  const milesFlights = returnFlights.filter(f => f.isMiles).slice(0, 5);

  if (!isOpen || !outboundFlight) return null;

  const outboundRoute = getFlightRoute(outboundFlight);
  const outboundTimes = getFlightTimes(outboundFlight);
  const outboundPrice = getFlightPrice(outboundFlight);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b-2 border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">✈️ Selecione seu voo de volta</h2>
              <p className="text-gray-600">
                {searchParams.destino} → {searchParams.origem} • {searchParams.volta}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Voo de ida selecionado */}
        <div className="p-6 bg-green-50 border-b border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3">✅ Voo de ida selecionado</h3>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Plane className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{outboundFlight.airline}</div>
                  <div className="text-sm text-gray-600">
                    {outboundRoute.origem} → {outboundRoute.destino}
                  </div>
                  <div className="text-sm text-gray-500">
                    {outboundTimes.saida} • {outboundTimes.chegada}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${outboundFlight.isMiles ? 'text-blue-700' : 'text-green-700'}`}>
                  {outboundFlight.isMiles ? formatMiles(outboundPrice) : formatCurrency(outboundPrice)}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${outboundFlight.isMiles ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                  {outboundFlight.isMiles ? 'Milhas' : 'Dinheiro'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de voos de volta */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 Escolha seu voo de volta</h3>
          
          {returnFlights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Plane className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Nenhum voo de volta encontrado</p>
              <p className="text-sm">Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Voos em Dinheiro */}
              {moneyFlights.length > 0 && (
                <div>
                  <div className="bg-green-50 rounded-lg p-3 mb-4 border border-green-200">
                    <h4 className="font-semibold text-green-800 flex items-center">
                      💰 Voos em Dinheiro
                      <span className="ml-auto text-sm bg-green-200 text-green-700 px-2 py-1 rounded-full">
                        {moneyFlights.length} opções
                      </span>
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {moneyFlights.map((flight, index) => {
                      const route = getFlightRoute(flight);
                      const times = getFlightTimes(flight);
                      const price = getFlightPrice(flight);
                      
                      return (
                        <div
                          key={`money-${index}`}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => handleSelectReturn(flight)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Plane className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{flight.airline}</div>
                                <div className="text-sm text-gray-600 flex items-center">
                                  {route.origem}
                                  <ArrowRight className="w-3 h-3 mx-1" />
                                  {route.destino}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {times.saida} • {times.chegada}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-700">
                                {formatCurrency(price)}
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('🚨 BOTÃO ESCOLHER CLICADO - DINHEIRO:', flight);
                                  handleSelectReturn(flight);
                                }}
                                className="mt-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Escolher
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Voos em Milhas */}
              {milesFlights.length > 0 && (
                <div>
                  <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 flex items-center">
                      ✈️ Voos em Milhas
                      <span className="ml-auto text-sm bg-blue-200 text-blue-700 px-2 py-1 rounded-full">
                        {milesFlights.length} opções
                      </span>
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {milesFlights.map((flight, index) => {
                      const route = getFlightRoute(flight);
                      const times = getFlightTimes(flight);
                      const price = getFlightPrice(flight);
                      
                      return (
                        <div
                          key={`miles-${index}`}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => handleSelectReturn(flight)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Plane className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{flight.airline}</div>
                                <div className="text-sm text-gray-600 flex items-center">
                                  {route.origem}
                                  <ArrowRight className="w-3 h-3 mx-1" />
                                  {route.destino}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {times.saida} • {times.chegada}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-700">
                                {formatMiles(price)}
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('🚨 BOTÃO ESCOLHER CLICADO - MILHAS:', flight);
                                  handleSelectReturn(flight);
                                }}
                                className="mt-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Escolher
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Selecione um voo de volta para continuar
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnFlightModal;
