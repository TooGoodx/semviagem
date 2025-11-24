import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchAirports, type Airport } from '../data/airports';
import moblixApiService from '../services/moblixApiService';

interface AirportSearchProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: string;
  required?: boolean;
}

interface AirportSuggestion extends Airport {
  source: 'local' | 'api';
}

const AirportSearch: React.FC<AirportSearchProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder = "Digite país, cidade ou código",
  icon = "🛫",
  required = false
}) => {
  const [suggestions, setSuggestions] = useState<AirportSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const debouncedSearch = useCallback((term: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(async () => {
      if (!term || term.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('🔍 AirportSearch: Buscando termo:', term);
        
        // Busca local primeiro (mais rápida)
        const localResults = searchAirports(term);
        console.log('🔍 AirportSearch: Resultados locais encontrados:', localResults.length);
        localResults.forEach(r => console.log(`  - ${r.iata}: ${r.name} (${r.city})`))
        
        const localSuggestions: AirportSuggestion[] = localResults.map(airport => ({
          ...airport,
          source: 'local'
        }));

        // Se encontrou resultados locais, mostra imediatamente
        if (localSuggestions.length > 0) {
          console.log('✅ AirportSearch: Mostrando sugestões locais');
          setSuggestions(localSuggestions);
          setShowSuggestions(true);
        } else {
          console.log('❌ AirportSearch: Nenhuma sugestão local encontrada');
        }

        // Busca na API da Moblix em paralelo (para resultados mais completos)
        try {
          const apiResults = await moblixApiService.buscarAeroportos(term);
          
          if (apiResults && Array.isArray(apiResults) && apiResults.length > 0) {
            const apiSuggestions: AirportSuggestion[] = apiResults
              .filter((airport: any) => airport.Iata && airport.Nome)
              .map((airport: any) => ({
                iata: airport.Iata,
                name: airport.Nome,
                city: airport.Cidade || airport.Nome.split(' ')[0] || airport.Iata,
                country: airport.Pais || 'País não informado',
                source: 'api'
              }));

            // Combina resultados locais e da API, removendo duplicatas
            const combinedResults: AirportSuggestion[] = [...localSuggestions];
            
            apiSuggestions.forEach(apiAirport => {
              if (!combinedResults.some(existing => existing.iata === apiAirport.iata)) {
                combinedResults.push(apiAirport);
              }
            });

            // Ordena: locais primeiro (são mais confiáveis), depois da API
            combinedResults.sort((a, b) => {
              if (a.source === 'local' && b.source === 'api') return -1;
              if (a.source === 'api' && b.source === 'local') return 1;
              if (a.popular && !b.popular) return -1;
              if (!a.popular && b.popular) return 1;
              return 0;
            });

            setSuggestions(combinedResults.slice(0, 10));
            setShowSuggestions(true);
          }
        } catch (apiError) {
          console.log('API search failed, using only local results:', apiError);
          // Se a API falhar, usa apenas resultados locais
          if (localSuggestions.length === 0) {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue !== value) {
      onChange(newValue);
      debouncedSearch(newValue);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AirportSuggestion) => {
    setInputValue(suggestion.iata);
    onChange(suggestion.iata);
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.blur();
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    } else if (inputValue.length >= 2) {
      debouncedSearch(inputValue);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync input value with prop value
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {icon} {label}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
          required={required}
          autoComplete="off"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.iata}-${index}`}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-blue-600 text-sm bg-blue-100 px-2 py-1 rounded">
                      {suggestion.iata}
                    </span>
                    <span className="text-sm text-gray-900 truncate">
                      {suggestion.city}
                    </span>
                    {suggestion.popular && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">
                        ⭐
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {suggestion.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {suggestion.country}
                  </div>
                </div>
                <div className="ml-2 flex-shrink-0">
                  {suggestion.source === 'local' ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Popular
                    </span>
                  ) : (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      API
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Hint about typing countries */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              💡 Dica: Digite o nome do país (ex: "espanha") para ver todos os aeroportos
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AirportSearch;
