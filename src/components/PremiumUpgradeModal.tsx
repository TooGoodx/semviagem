import React from 'react';
import { X, Crown, Calendar, Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
}

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  selectedDate
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    // Redirecionar para a página de registro e rolar para a seção de cadastro
    navigate('/register');
    // Aguardar um pouco para a página carregar e então rolar para a seção
    setTimeout(() => {
      const cadastroSection = document.querySelector('h1, h2, h3');
      if (cadastroSection) {
        cadastroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
          
          <div>
            <h2 className="text-xl font-bold">Upgrade Premium</h2>
            <p className="text-yellow-100 text-sm">Desbloqueie pesquisas ilimitadas</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Quer ser avisado quando o preço baixar?
            </h3>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <p className="font-medium text-gray-700 mb-3">Com o Premium você terá:</p>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
              <span className="text-gray-700 text-sm">Pesquisas de voos sem restrição de data</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
              <span className="text-gray-700 text-sm">Escolha de Local e Data</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
              <span className="text-gray-700 text-sm">Viaje de acordo com seu planejamento</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
              <span className="text-gray-700 text-sm">Alertas personalizados de preços</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center">
            <button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 flex items-center space-x-2"
            >
              <span>🔔</span>
              <span>Ativar Alerta Premium</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumUpgradeModal;
