import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plane, Search } from 'lucide-react';
import moblixApiService from '../../services/moblixApiService';

interface Airport {
  Iata: string;
  Nome: string;
  Pais: string;
  Cidade?: string;
  Grupo?: string;
}

interface AirportMultiSelectProps {
  value: string[]; // Array de códigos IATA selecionados
  onChange: (airports: string[]) => void;
  maxSelections: number;
  placeholder?: string;
  label: string;
}

// Lista de aeroportos (simplificada - principais destinos)
const globalAirports: Airport[] = [
  { Iata: 'GRU', Nome: 'Aeroporto Internacional de São Paulo', Pais: 'Brasil', Cidade: 'São Paulo', Grupo: 'SAO' },
  { Iata: 'CGH', Nome: 'Aeroporto de Congonhas', Pais: 'Brasil', Cidade: 'São Paulo', Grupo: 'SAO' },
  { Iata: 'VCP', Nome: 'Aeroporto Internacional de Viracopos', Pais: 'Brasil', Cidade: 'Campinas', Grupo: 'SAO' },
  { Iata: 'GIG', Nome: 'Aeroporto Internacional do Rio de Janeiro', Pais: 'Brasil', Cidade: 'Rio de Janeiro', Grupo: 'RIO' },
  { Iata: 'SDU', Nome: 'Aeroporto Santos Dumont', Pais: 'Brasil', Cidade: 'Rio de Janeiro', Grupo: 'RIO' },
  { Iata: 'BSB', Nome: 'Aeroporto Internacional de Brasília', Pais: 'Brasil', Cidade: 'Brasília' },
  { Iata: 'CNF', Nome: 'Aeroporto Internacional de Belo Horizonte', Pais: 'Brasil', Cidade: 'Belo Horizonte' },
  { Iata: 'SSA', Nome: 'Aeroporto Internacional de Salvador', Pais: 'Brasil', Cidade: 'Salvador' },
  { Iata: 'REC', Nome: 'Aeroporto Internacional do Recife', Pais: 'Brasil', Cidade: 'Recife' },
  { Iata: 'FOR', Nome: 'Aeroporto Internacional de Fortaleza', Pais: 'Brasil', Cidade: 'Fortaleza' },
  { Iata: 'POA', Nome: 'Aeroporto Internacional Salgado Filho', Pais: 'Brasil', Cidade: 'Porto Alegre' },
  { Iata: 'CWB', Nome: 'Aeroporto Internacional Afonso Pena', Pais: 'Brasil', Cidade: 'Curitiba' },
  { Iata: 'FLN', Nome: 'Aeroporto Internacional de Florianópolis', Pais: 'Brasil', Cidade: 'Florianópolis' },
  { Iata: 'MAO', Nome: 'Aeroporto Internacional Eduardo Gomes', Pais: 'Brasil', Cidade: 'Manaus' },
  { Iata: 'BEL', Nome: 'Aeroporto Internacional de Belém', Pais: 'Brasil', Cidade: 'Belém' },
  { Iata: 'LIS', Nome: 'Aeroporto de Lisboa', Pais: 'Portugal', Cidade: 'Lisboa' },
  { Iata: 'OPO', Nome: 'Aeroporto do Porto', Pais: 'Portugal', Cidade: 'Porto' },
  { Iata: 'MAD', Nome: 'Aeroporto de Madrid', Pais: 'Espanha', Cidade: 'Madrid' },
  { Iata: 'BCN', Nome: 'Aeroporto de Barcelona', Pais: 'Espanha', Cidade: 'Barcelona' },
  { Iata: 'CDG', Nome: 'Aeroporto Charles de Gaulle', Pais: 'França', Cidade: 'Paris' },
  { Iata: 'FCO', Nome: 'Aeroporto de Roma', Pais: 'Itália', Cidade: 'Roma' },
  { Iata: 'MIA', Nome: 'Aeroporto Internacional de Miami', Pais: 'Estados Unidos', Cidade: 'Miami' },
  { Iata: 'JFK', Nome: 'Aeroporto Internacional John F. Kennedy', Pais: 'Estados Unidos', Cidade: 'Nova York' },
  { Iata: 'LAX', Nome: 'Aeroporto Internacional de Los Angeles', Pais: 'Estados Unidos', Cidade: 'Los Angeles' },
  { Iata: 'EZE', Nome: 'Aeroporto Internacional de Ezeiza', Pais: 'Argentina', Cidade: 'Buenos Aires' },
  { Iata: 'SCL', Nome: 'Aeroporto Internacional de Santiago', Pais: 'Chile', Cidade: 'Santiago' },
  { Iata: 'LIM', Nome: 'Aeroporto Internacional Jorge Chávez', Pais: 'Peru', Cidade: 'Lima' },
];

const AirportMultiSelect: React.FC<AirportMultiSelectProps> = ({
  value,
  onChange,
  maxSelections,
  placeholder = 'Digite o nome ou código do aeroporto',
  label,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAirportsCache, setSelectedAirportsCache] = useState<Airport[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obter detalhes dos aeroportos selecionados (com cache para aeroportos da API)
  const selectedAirports = value
    .map((iata) => {
      // Tentar achar no cache primeiro, depois no global
      return selectedAirportsCache.find((a) => a.Iata === iata) ||
             globalAirports.find((a) => a.Iata === iata);
    })
    .filter(Boolean) as Airport[];

  // Buscar aeroportos
  const searchAirports = useCallback(async (searchValue: string) => {
    if (searchValue.length < 2) {
      setSuggestions([]);
      return;
    }

    // Cancelar requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);

    try {
      // Busca local primeiro
      const localFiltered = globalAirports.filter(
        (airport) =>
          airport.Nome.toLowerCase().includes(searchValue.toLowerCase()) ||
          airport.Iata.toLowerCase().includes(searchValue.toLowerCase()) ||
          airport.Pais.toLowerCase().includes(searchValue.toLowerCase()) ||
          (airport.Cidade && airport.Cidade.toLowerCase().includes(searchValue.toLowerCase()))
      );

      let finalResults: Airport[] = [];

      if (localFiltered.length > 0) {
        // Priorizar aeroportos com grupo
        const sorted = localFiltered.sort((a, b) => {
          if (a.Cidade && !b.Cidade) return -1;
          if (!a.Cidade && b.Cidade) return 1;
          return a.Nome.localeCompare(b.Nome, 'pt-BR');
        });

        finalResults = sorted.slice(0, 8);
      } else {
        // Tentar API Moblix se não encontrou localmente
        if (signal.aborted) return;

        const apiResponse = await moblixApiService.buscarAeroportos(searchValue);

        if (signal.aborted) return;

        if (apiResponse?.Data && Array.isArray(apiResponse.Data)) {
          finalResults = apiResponse.Data.map((airport: any) => ({
            Iata: airport.Iata,
            Nome: airport.Nome,
            Pais: airport.Pais,
            Cidade: airport.Cidade,
          })).slice(0, 8);
        }
      }

      if (!signal.aborted) {
        setSuggestions(finalResults);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Erro ao buscar aeroportos:', error);
        setSuggestions([]);
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchAirports(searchTerm);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchAirports]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Adicionar aeroporto
  const handleSelectAirport = (airport: Airport) => {
    if (value.length >= maxSelections) {
      return;
    }

    if (!value.includes(airport.Iata)) {
      // Adicionar ao cache se não estiver no globalAirports
      if (!globalAirports.find((a) => a.Iata === airport.Iata)) {
        setSelectedAirportsCache((prev) => [...prev, airport]);
      }
      onChange([...value, airport.Iata]);
      setSearchTerm('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Remover aeroporto
  const handleRemoveAirport = (iata: string) => {
    onChange(value.filter((code) => code !== iata));
    // Limpar do cache também
    setSelectedAirportsCache((prev) => prev.filter((a) => a.Iata !== iata));
  };

  const isMaxReached = value.length >= maxSelections;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-[#060D1C]">{label}</Label>

      {/* Input de busca */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#060D1C]/40" />
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={isMaxReached ? `Máximo de ${maxSelections} atingido` : placeholder}
            disabled={isMaxReached}
            className="pl-10 h-11 border-gray-200 focus-visible:ring-[#F0C72F] focus-visible:border-[#F0C72F] disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        {/* Dropdown de sugestões */}
        {showSuggestions && suggestions.length > 0 && !isMaxReached && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-[0_10px_40px_rgba(6,13,28,0.12)] max-h-64 overflow-y-auto">
            {suggestions.map((airport) => {
              const isAlreadySelected = value.includes(airport.Iata);

              return (
                <button
                  key={airport.Iata}
                  onClick={() => !isAlreadySelected && handleSelectAirport(airport)}
                  disabled={isAlreadySelected}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-start gap-3 ${
                    isAlreadySelected ? 'bg-gray-50' : ''
                  }`}
                >
                  <Plane className="h-4 w-4 text-[#060D1C]/40 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#060D1C]">{airport.Iata}</span>
                      <span className="text-sm text-[#060D1C]/60 truncate">
                        {airport.Cidade ? `${airport.Cidade}, ${airport.Pais}` : airport.Pais}
                      </span>
                    </div>
                    <div className="text-xs text-[#060D1C]/50 truncate mt-0.5">{airport.Nome}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Loading state */}
        {isLoading && showSuggestions && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-[#060D1C]/60">
            Buscando aeroportos...
          </div>
        )}
      </div>

      {/* Tags de aeroportos selecionados */}
      {selectedAirports.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedAirports.map((airport) => (
            <Badge
              key={airport.Iata}
              variant="secondary"
              className="bg-gray-100 text-[#060D1C] hover:bg-gray-200 px-3 py-1.5 text-sm font-medium flex items-center gap-2"
            >
              <Plane className="h-3 w-3" />
              <span className="font-semibold">{airport.Iata}</span>
              <span className="text-[#060D1C]/60">-</span>
              <span className="text-[#060D1C]/80">{airport.Cidade || airport.Pais}</span>
              <button
                onClick={() => handleRemoveAirport(airport.Iata)}
                className="ml-1 hover:text-red-600 transition-colors"
                aria-label={`Remover ${airport.Iata}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Contador */}
      <div className="text-xs text-[#060D1C]/50">
        {value.length} de {maxSelections} selecionados
      </div>
    </div>
  );
};

export default AirportMultiSelect;
