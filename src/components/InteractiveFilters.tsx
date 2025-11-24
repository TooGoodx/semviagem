import React, { useState, useEffect, useRef, useCallback } from 'react';

interface InteractiveFiltersProps {
  searchParams: {
    adultos: number;
    criancas: number;
    bebes: number;
    tipoPagamento: 'milhas' | 'dinheiro' | 'ambos';
    orderBy: 'tempo' | 'preco';
    soIda: boolean;
  };
  onFiltersChange: (newParams: any) => void;
  onNewSearch: () => void;
  isLoading?: boolean;
}

const InteractiveFilters: React.FC<InteractiveFiltersProps> = ({
  searchParams,
  onFiltersChange,
  onNewSearch,
  isLoading = false
}) => {
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [localParams, setLocalParams] = useState(searchParams);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializa localParams apenas uma vez quando o componente for montado
  useEffect(() => {
    console.log('🎬 InteractiveFilters - Inicializando com searchParams:', searchParams);
    setLocalParams(searchParams);
  }, []); // Empty dependency array - só roda uma vez

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Debounced filter change function
  const debouncedFilterChange = useCallback((newParams: any) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced execution
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('🎛️ Aplicando filtros com debounce:', newParams);
      onFiltersChange(newParams);
    }, 300); // 300ms debounce delay
  }, [onFiltersChange]);

  const getTotalPassengers = (): number => {
    return localParams.adultos + localParams.criancas + localParams.bebes;
  };

  const updatePassengerCount = (type: 'adultos' | 'criancas' | 'bebes', change: number) => {
    const currentValue = localParams[type];
    const newValue = Math.max(type === 'adultos' ? 1 : 0, currentValue + change);
    
    // Só atualiza se o valor realmente mudou
    if (newValue !== currentValue) {
      const newParams = {
        ...localParams,
        [type]: newValue
      };
      console.log(`🔢 Atualizando ${type}: ${currentValue} → ${newValue}`);
      setLocalParams(newParams);
      console.log('🎛️ Filtros alterados:', newParams);
      onFiltersChange(newParams);
    } else {
      console.log(`⏸️ Não atualizando ${type}: valor já é ${currentValue}`);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    const newParams = {
      ...localParams,
      [key]: value
    };
    setLocalParams(newParams);
    console.log('🎛️ Filtros alterados:', newParams);
    onFiltersChange(newParams);
  };

  const handleNewSearchClick = () => {
    onNewSearch();
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          Filtros de Busca
        </h3>
        <button
          onClick={handleNewSearchClick}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Buscando...
            </>
          ) : (
            <>Nova Busca</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Passageiros */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passageiros
          </label>
          <div 
            onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
            className="relative w-full px-4 py-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors shadow-sm"
          >
            <span className="text-gray-900 text-sm font-medium">
              {getTotalPassengers()} passageiro{getTotalPassengers() > 1 ? 's' : ''}
            </span>
            <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${
              showPassengerDropdown ? 'rotate-180' : ''
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {/* Dropdown de Passageiros */}
          {showPassengerDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 font-medium">Adultos</span>
                  <div className="flex items-center space-x-3">
                    <button 
                      type="button"
                      onClick={() => updatePassengerCount('adultos', -1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      disabled={localParams.adultos <= 1}
                    >
                      <span className="text-lg text-gray-600">-</span>
                    </button>
                    <span className="w-8 text-center font-medium">{localParams.adultos}</span>
                    <button 
                      type="button"
                      onClick={() => updatePassengerCount('adultos', 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      disabled={localParams.adultos >= 9}
                    >
                      <span className="text-lg text-gray-600">+</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 font-medium">Crianças</span>
                  <div className="flex items-center space-x-3">
                    <button 
                      type="button"
                      onClick={() => updatePassengerCount('criancas', -1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      disabled={localParams.criancas <= 0}
                    >
                      <span className="text-lg text-gray-600">-</span>
                    </button>
                    <span className="w-8 text-center font-medium">{localParams.criancas}</span>
                    <button 
                      type="button"
                      onClick={() => updatePassengerCount('criancas', 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      disabled={localParams.criancas >= 8}
                    >
                      <span className="text-lg text-gray-600">+</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 font-medium">Bebês</span>
                  <div className="flex items-center space-x-3">
                    <button 
                      type="button"
                      onClick={() => updatePassengerCount('bebes', -1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      disabled={localParams.bebes <= 0}
                    >
                      <span className="text-lg text-gray-600">-</span>
                    </button>
                    <span className="w-8 text-center font-medium">{localParams.bebes}</span>
                    <button 
                      type="button"
                      onClick={() => updatePassengerCount('bebes', 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      disabled={localParams.bebes >= 8}
                    >
                      <span className="text-lg text-gray-600">+</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tipo de Pagamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Pagamento
          </label>
          <select
            value={localParams.tipoPagamento}
            onChange={(e) => handleFilterChange('tipoPagamento', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
          >
            <option value="ambos">Ambos os tipos</option>
            <option value="milhas">Apenas Milhas</option>
            <option value="dinheiro">Apenas Dinheiro</option>
          </select>
        </div>

        {/* Ordenação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordenação
          </label>
          <select
            value={localParams.orderBy}
            onChange={(e) => handleFilterChange('orderBy', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
          >
            <option value="preco">Por preço</option>
            <option value="tempo">Por tempo</option>
          </select>
        </div>

        {/* Tipo de Viagem */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Viagem
          </label>
          <div className="flex items-center space-x-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tripType"
                checked={!localParams.soIda}
                onChange={() => handleFilterChange('soIda', false)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Ida e volta</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tripType"
                checked={localParams.soIda}
                onChange={() => handleFilterChange('soIda', true)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Somente ida</span>
            </label>
          </div>
        </div>
      </div>

      {/* Resumo dos filtros aplicados */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            {getTotalPassengers()} passageiro{getTotalPassengers() > 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
            {localParams.tipoPagamento === 'milhas' ? 'Milhas' : 
             localParams.tipoPagamento === 'dinheiro' ? 'Dinheiro' : 'Ambos'}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800">
            {localParams.orderBy === 'preco' ? 'Por preço' : 'Por tempo'}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800">
            {localParams.soIda ? 'Somente ida' : 'Ida e volta'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveFilters;
