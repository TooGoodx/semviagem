import React, { useState, useEffect } from 'react';

interface FlightLoadingOverlayProps {
  isVisible: boolean;
  origin: string;
  destination: string;
  progress: number;
}

const FlightLoadingOverlay: React.FC<FlightLoadingOverlayProps> = ({
  isVisible,
  origin,
  destination,
  progress
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  // Lista de 5 mensagens motivacionais que serão exibidas em rotação
  const loadingMessages = [
    'Buscando os voos mais baratos para você...',
    'Explorando companhias aéreas em busca da melhor tarifa...',
    'Verificando disponibilidade em tempo real...',
    'Selecionando as opções mais vantajosas...',
    'Conectando destinos e preços acessíveis...'
  ];

  // Efeito para alternar as mensagens a cada 2 segundos
  useEffect(() => {
    if (!isVisible) return;
    
    const intervalId = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [isVisible, loadingMessages.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="animate-spin mr-3 h-5 w-5 text-blue-500 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <h2 className="text-xl font-semibold text-blue-600">Buscando Voos</h2>
          </div>
          
          <p className="text-blue-500 text-sm mb-6">
            {origin} → {destination}
          </p>
          
          {/* Mensagem que vai alternando */}
          <div className="min-h-[24px]">
            <p className="text-gray-700 font-medium">
              {loadingMessages[currentMessageIndex]}
            </p>
          </div>
        </div>
        
        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Texto "Verificando disponibilidade" */}
        <div className="text-center text-gray-500 text-sm">
          Verificando disponibilidade em tempo real...
        </div>
      </div>
    </div>
  );
};

export default FlightLoadingOverlay;
