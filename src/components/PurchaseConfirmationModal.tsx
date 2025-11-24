import React, { useState } from 'react';
import { Check, X, Plane, ArrowRight } from 'lucide-react';

interface FlightInfo {
  airline: string;
  route: string;
  date: string;
  price: number;
  isMiles?: boolean;
  isRoundTrip: boolean;
  isReturnFlight?: boolean;
}

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPurchase: () => void;
  onDenyPurchase: () => void;
  flightInfo: FlightInfo;
}

const PurchaseConfirmationModal: React.FC<PurchaseConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirmPurchase,
  onDenyPurchase,
  flightInfo
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Formatar preço baseado no tipo
  const getFormattedPrice = () => {
    return flightInfo.isMiles ? formatMiles(flightInfo.price) : formatCurrency(flightInfo.price);
  };

  if (!isOpen) return null;

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    
    // Pequeno delay para mostrar feedback visual
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onConfirmPurchase();
    setIsProcessing(false);
  };

  const handleDenyPurchase = () => {
    onDenyPurchase();
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900 bg-opacity-30 z-[9998]"></div>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] max-w-sm w-full">
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-blue-500">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Plane className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {flightInfo.isRoundTrip && !flightInfo.isReturnFlight ? 'Voo de ida selecionado!' : 'Bem-vindo de volta!'}
            </h2>
            <p className="text-gray-600">
              {flightInfo.isRoundTrip && !flightInfo.isReturnFlight 
                ? `Agora vamos buscar seu voo de volta. Você escolheu ${flightInfo.airline}.`
                : `Você foi redirecionado para a ${flightInfo.airline}. Como foi sua experiência?`
              }
            </p>
          </div>

          {/* Flight Info Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="font-semibold text-gray-900">{flightInfo.airline}</div>
                <div className="text-gray-600">{flightInfo.route}</div>
                <div className="text-gray-600">{flightInfo.date}</div>
              </div>
              <div className="text-right">
                <div className={`font-bold text-lg ${
                  flightInfo.isMiles ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {getFormattedPrice()}
                </div>
                <div className="flex flex-col items-end">
                  {flightInfo.isRoundTrip && (
                    <div className="text-xs text-gray-500">Ida e volta</div>
                  )}
                  <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                    flightInfo.isMiles 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {flightInfo.isMiles ? '✈️ Milhas' : '💰 Dinheiro'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {flightInfo.isRoundTrip && !flightInfo.isReturnFlight 
                ? 'Confirmar seleção do voo de ida?'
                : 'Você conseguiu comprar a passagem?'
              }
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {flightInfo.isRoundTrip && !flightInfo.isReturnFlight
                ? 'Após confirmar, buscaremos automaticamente os voos de volta para você.'
                : 'Se você comprou, vamos te ajudar a encontrar o voo de volta!'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleDenyPurchase}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <X className="w-4 h-4 mr-2" />
              {flightInfo.isRoundTrip && !flightInfo.isReturnFlight ? 'Cancelar' : 'Não comprei'}
            </button>
            
            <button
              onClick={handleConfirmPurchase}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  {flightInfo.isRoundTrip && !flightInfo.isReturnFlight ? (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Confirmar e buscar volta
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {flightInfo.isRoundTrip ? 'Sim, agora quero a volta!' : 'Sim, comprei!'}
                    </>
                  )}
                </>
              )}
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Se você não comprou, continue navegando para encontrar outras opções
            </p>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default PurchaseConfirmationModal;
