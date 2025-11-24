import React from 'react';
import { X, AlertTriangle, LogIn, Search, CreditCard, CheckCircle } from 'lucide-react';
import { getAirlineLogo, getDisplayAirlineName } from '../utils/airlineLogos';

interface MilesGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueToSite: () => void;
  flightInfo: {
    airline: string;
    route: string;
    date: string;
    miles: number;
    url: string;
  };
}

const MilesGuidanceModal: React.FC<MilesGuidanceModalProps> = ({
  isOpen,
  onClose,
  onContinueToSite,
  flightInfo
}) => {
  if (!isOpen) return null;

  // Debug: verificar o nome da companhia aérea recebido
  console.log('🔍 MilesGuidanceModal - Airline name received:', flightInfo.airline);
  console.log('🔍 MilesGuidanceModal - Logo URL:', getAirlineLogo(flightInfo.airline));

  const formatMiles = (value: number) => {
    return `${value.toLocaleString('pt-BR')} milhas`;
  };
  
  // Verificação de disponibilidade real de milhas com base em dados históricos
  const getMilesAvailabilityPrediction = (airline: string, miles: number) => {
    // Limites históricos de disponibilidade por companhia
    const milesAvailabilityThresholds: Record<string, {
      lowAvailability: number;
      mediumAvailability: number;
      probabilityNote: string;
    }> = {
      'LATAM': {
        lowAvailability: 25000,
        mediumAvailability: 15000,
        probabilityNote: 'Voos abaixo de 25.000 milhas têm alta demanda e disponibilidade limitada'
      },
      'GOL': {
        lowAvailability: 20000,
        mediumAvailability: 12000,
        probabilityNote: 'Voos com menos de 20.000 milhas no Smiles são muito disputados'
      },
      'Azul': {
        lowAvailability: 18000,
        mediumAvailability: 10000,
        probabilityNote: 'No TudoAzul, voos com menos de 18.000 milhas podem ser limitados'
      },
      'TAP Air Portugal': {
        lowAvailability: 35000,
        mediumAvailability: 25000,
        probabilityNote: 'Voos internacionais com menos de 35.000 milhas são raramente disponíveis'
      }
    };
    
    // Usar valores padrão se a companhia não estiver mapeada
    const threshold = milesAvailabilityThresholds[airline] || {
      lowAvailability: 20000,
      mediumAvailability: 15000,
      probabilityNote: 'Voos com milhas muito baixas têm alta demanda e disponibilidade limitada'
    };
    
    // Calcular a probabilidade de disponibilidade com base nos limiares
    if (miles < threshold.mediumAvailability) {
      return {
        level: 'low',
        label: 'Baixa disponibilidade',
        description: `Valor muito atrativo! Voos com ${formatMiles(miles)} costumam ter disponibilidade limitada.`,
        color: 'text-red-600',
        note: threshold.probabilityNote
      };
    } else if (miles < threshold.lowAvailability) {
      return {
        level: 'medium',
        label: 'Disponibilidade média',
        description: `Bom valor! Voos com ${formatMiles(miles)} têm disponibilidade moderada.`,
        color: 'text-orange-500',
        note: 'Pode ser necessário alguma flexibilidade nos horários ou datas'
      };
    } else {
      return {
        level: 'high',
        label: 'Alta disponibilidade',
        description: `Voos com ${formatMiles(miles)} geralmente estão disponíveis.`,
        color: 'text-green-600', 
        note: 'Provavelmente você encontrará opções similares no site da companhia'
      };
    }
  };

  const getAirlineSpecificGuidance = (airline: string) => {
    const guidanceMap: Record<string, {
      programName: string;
      loginTip: string;
      searchTip: string;
      additionalInfo: string;
    }> = {
      'LATAM': {
        programName: 'LATAM Pass',
        loginTip: 'Faça login na sua conta LATAM Pass',
        searchTip: 'Procure por "Usar Pontos" ou "Canje Pasajes"',
        additionalInfo: 'Verifique se você tem milhas suficientes e se o voo está disponível para resgate'
      },
      'GOL': {
        programName: 'Smiles',
        loginTip: 'Faça login na sua conta Smiles',
        searchTip: 'Procure por "Passagens com Milhas"',
        additionalInfo: 'Lembre-se de que alguns voos podem ter taxa de embarque adicional'
      },
      'Azul': {
        programName: 'TudoAzul',
        loginTip: 'Faça login na sua conta TudoAzul',
        searchTip: 'Procure por "Usar Pontos" na seção de passagens',
        additionalInfo: 'Verifique a disponibilidade na categoria de pontos'
      },
      'TAP Air Portugal': {
        programName: 'TAP Miles&Go',
        loginTip: 'Faça login na sua conta TAP Miles&Go',
        searchTip: 'Procure por "Usar Milhas" na busca de voos',
        additionalInfo: 'Voos internacionais podem ter diferentes categorias de resgate'
      }
    };

    return guidanceMap[airline] || {
      programName: 'Programa de Fidelidade',
      loginTip: 'Faça login na sua conta do programa de fidelidade',
      searchTip: 'Procure por "Usar Milhas" ou "Resgatar Pontos"',
      additionalInfo: 'Verifique a disponibilidade e as condições do voo'
    };
  };

  const guidance = getAirlineSpecificGuidance(flightInfo.airline);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Voo em Milhas</h2>
            <p className="text-white/90">
              Orientações para resgatar seu voo com milhas na {flightInfo.airline}
            </p>
          </div>
        </div>

        <div className="p-6">
          {/* Flight Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              {/* Airline Logo */}
              <div className="flex justify-center mb-4">
                <img 
                  src={getAirlineLogo(flightInfo.airline)} 
                  alt={getDisplayAirlineName(flightInfo.airline)}
                  className="h-16 w-16 object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{flightInfo.airline}</h3>
              <div className="space-y-1">
                <p className="text-gray-700 font-medium">{flightInfo.route}</p>
                <p className="text-gray-600">{flightInfo.date}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatMiles(flightInfo.miles)}
                </p>
                <p className="text-sm text-gray-500">por pessoa</p>
              </div>
            </div>
          </div>

          {/* Important Alert */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">Atenção Importante!</h4>
                <p className="text-sm text-yellow-700">
                  Este voo foi encontrado na nossa busca, mas <strong>pode aparecer com preço em dinheiro</strong> no site da companhia. 
                  Siga as instruções abaixo para encontrá-lo em milhas.
                </p>
              </div>
            </div>
          </div>
          
          {/* Previsão de disponibilidade */}
          {flightInfo.miles > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">i</span>
                </div>
                <div>
                  {(() => {
                    const availability = getMilesAvailabilityPrediction(flightInfo.airline, flightInfo.miles);
                    return (
                      <>
                        <h4 className={`font-semibold ${availability.color} mb-1`}>{availability.label}</h4>
                        <p className="text-sm text-gray-700">
                          {availability.description}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {availability.note}
                        </p>
                      </>
                    );
                  })()} 
                </div>
              </div>
            </div>
          )}

          {/* Step by Step Guide */}
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Passo a passo para resgatar com milhas:</h4>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                <LogIn className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h5 className="font-medium text-gray-900">1. Faça Login</h5>
                <p className="text-sm text-gray-600">
                  {guidance.loginTip} na {flightInfo.airline}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div>
                <h5 className="font-medium text-gray-900">2. Busque por Milhas</h5>
                <p className="text-sm text-gray-600">
                  {guidance.searchTip}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h5 className="font-medium text-gray-900">3. Verifique Disponibilidade</h5>
                <p className="text-sm text-gray-600">
                  Procure pelo mesmo voo ({flightInfo.route}) na mesma data. {guidance.additionalInfo}
                </p>
              </div>
            </div>
          </div>

          {/* Program Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h5 className="font-medium text-gray-900 mb-2">Programa: {guidance.programName}</h5>
            <p className="text-sm text-gray-600">
              Se você não tem conta no programa de fidelidade da {flightInfo.airline}, 
              pode ser necessário criar uma conta primeiro ou considerar a compra em dinheiro.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onContinueToSite();
                onClose();
              }}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continuar para {flightInfo.airline}
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              💡 Dica: Se o voo não aparecer em milhas, pode estar esgotado ou ter restrições. 
              Tente datas próximas ou considere a compra em dinheiro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilesGuidanceModal;
