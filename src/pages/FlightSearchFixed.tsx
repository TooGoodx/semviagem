import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import AirportSearch from '../components/AirportSearch';
import CustomCalendar from '../components/CustomCalendar';
import FlightResultCard from '../components/FlightResultCard';
import moblixApiService from '../services/moblixApiService';
import { useSelection } from '../context/SelectionContext';

interface Flight {
  id?: string;
  companhia?: string;
  Companhia?: string;
  CompanhiaNome?: string;
  numeroVoo?: string;
  origem?: string;
  destino?: string;
  horarioSaida?: string;
  horarioChegada?: string;
  duracao?: string;
  priceWithTax?: number;
  price?: number;
  totalPrice?: number;
  PontosAdulto?: number;
  isMiles?: boolean;
  segments?: any[];
  escalas?: number;
  NumeroEscalas?: number;
  Cia?: { Nome?: string };
  validatingBy?: { name?: string };
  ProviderSource?: string;
}

interface SearchParams {
  origem: string;
  destino: string;
  ida: string;
  volta?: string;
  adultos: number;
  criancas: number;
  bebes: number;
  companhia: number;
  soIda: boolean;
  tipoPagamento: 'milhas' | 'dinheiro' | 'ambos';
  orderBy: 'tempo' | 'preco' | 'custo-beneficio';
  classe: 'economica' | 'executiva' | 'primeira';
}

const FlightSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    origem: 'GRU',
    destino: 'GIG',
    ida: '2025-08-20',
    volta: '2025-08-27',
    adultos: 1,
    criancas: 0,
    bebes: 0,
    companhia: 1,
    soIda: false,
    tipoPagamento: 'ambos',
    orderBy: 'preco',
    classe: 'economica'
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [filteredResults, setFilteredResults] = useState<Flight[]>([]);
  const [calendarConfig, setCalendarConfig] = useState<{type: 'ida' | 'volta', show: boolean, title: string}>({type: 'ida', show: false, title: ''});
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [filters, setFilters] = useState({
    companhias: [] as string[],
    precoMin: 0,
    precoMax: 10000,
    apenasVoosDirectos: false,
    apenasEconomica: false
  });
  const { clear } = useSelection();

  const popularDestinations = [
    { city: 'São Paulo', code: 'GRU', country: 'Brasil', image: '🏙️' },
    { city: 'Rio de Janeiro', code: 'GIG', country: 'Brasil', image: '🏖️' },
    { city: 'Paris', code: 'CDG', country: 'França', image: '🗼' },
    { city: 'Nova York', code: 'JFK', country: 'EUA', image: '🗽' },
    { city: 'Londres', code: 'LHR', country: 'Reino Unido', image: '🎡' },
    { city: 'Tokyo', code: 'NRT', country: 'Japão', image: '🏯' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setSearchParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
              ['adultos', 'criancas', 'bebes', 'companhia'].includes(name) ? parseInt(value) || 0 :
              value
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // 🔄 Limpa seleções anteriores para evitar pré-seleção indevida no novo resultado
    try {
      clear();
      localStorage.removeItem('flightSelections');
      localStorage.removeItem('originalPurchase');
      localStorage.removeItem('precoMinimoVolta');
      localStorage.removeItem('reopenSelectionAfterSearch');
    } catch {}
    setIsSearching(true);
    
    try {
      console.log('🔍 Iniciando busca de voos com parâmetros:', searchParams);
      
      // Prepara os parâmetros para a API Moblix
      const apiParams = {
        origem: searchParams.origem,
        destino: searchParams.destino,
        ida: searchParams.ida,
        volta: !searchParams.soIda && searchParams.volta ? searchParams.volta : undefined,
        adultos: searchParams.adultos,
        criancas: searchParams.criancas,
        bebes: searchParams.bebes,
        companhia: searchParams.companhia,
        classe: searchParams.classe // Passa a classe selecionada para a API
      };
      
      console.log('📡 Enviando parâmetros para API Moblix:', apiParams);
      
      // Chama a API real da Moblix
      const response = await moblixApiService.consultarVoos(apiParams);
      
      console.log('📨 Resposta da API Moblix:', response);
      
      if (!response || !response.Data || !Array.isArray(response.Data)) {
        throw new Error('Formato de resposta inválido da API');
      }
      
      // Processa os voos retornados pela API
      const flights: Flight[] = [];
      
      response.Data.forEach((dataItem: any, dataIndex: number) => {
        // Processa voos de ida
        if (dataItem.Ida && Array.isArray(dataItem.Ida)) {
          dataItem.Ida.forEach((flight: any, index: number) => {
            const processedFlight = {
              id: `${dataIndex}-${index}-ida`,
              companhia: flight.Cia?.Nome || flight.CompanhiaNome || 'Companhia não informada',
              numeroVoo: flight.NumeroVoo,
              origem: flight.Origem || searchParams.origem,
              destino: flight.Destino || searchParams.destino,
              horarioSaida: flight.HorarioSaida,
              horarioChegada: flight.HorarioChegada,
              duracao: flight.DuracaoVoo,
              priceWithTax: flight.PrecoPagante,
              totalPrice: flight.PrecoPagante,
              PontosAdulto: flight.PontosAdulto,
              isMiles: flight.PontosAdulto > 0 && !flight.PrecoPagante,
              escalas: flight.NumeroEscalas || 0,
              NumeroEscalas: flight.NumeroEscalas || 0,
              ProviderSource: 'Moblix'
            };
            flights.push(processedFlight);
          });
        }
        
        // Se houver voos em outros formatos, processa também
        if (dataItem.flights && Array.isArray(dataItem.flights)) {
          dataItem.flights.forEach((flight: any, index: number) => {
            const processedFlight = {
              id: `${dataIndex}-${index}-alt`,
              companhia: flight.validatingBy?.name || flight.Companhia || 'Companhia não informada',
              numeroVoo: flight.numeroVoo,
              origem: flight.origem || searchParams.origem,
              destino: flight.destino || searchParams.destino,
              horarioSaida: flight.horarioSaida,
              horarioChegada: flight.horarioChegada,
              duracao: flight.duracao,
              priceWithTax: flight.priceWithTax,
              price: flight.price,
              totalPrice: flight.totalPrice || flight.priceWithTax || flight.price,
              PontosAdulto: flight.PontosAdulto,
              isMiles: flight.isMiles || false,
              escalas: flight.segments?.length - 1 || 0,
              ProviderSource: flight.validatingBy?.name || 'Moblix'
            };
            flights.push(processedFlight);
          });
        }
      });
      
      console.log(`✅ Processados ${flights.length} voos da resposta da API`);
      
      if (flights.length === 0) {
        toast.info(`ℹ️ Nenhum voo encontrado para ${searchParams.origem} → ${searchParams.destino} na classe ${searchParams.classe}`);
        setSearchResults([]);
        setFilteredResults([]);
        return;
      }
      
      // Ordena os resultados conforme solicitado
      const sortedFlights = [...flights].sort((a, b) => {
        if (searchParams.orderBy === 'preco') {
          const priceA = a.totalPrice || a.priceWithTax || a.price || 0;
          const priceB = b.totalPrice || b.priceWithTax || b.price || 0;
          return priceA - priceB;
        } else {
          // Ordenar por tempo (duração)
          const durationA = parseInt(a.duracao?.replace(/\D/g, '') || '0');
          const durationB = parseInt(b.duracao?.replace(/\D/g, '') || '0');
          return durationA - durationB;
        }
      });
      
      setSearchResults(sortedFlights);
      setFilteredResults(sortedFlights);
      
      toast.success(`✅ Encontrados ${sortedFlights.length} voos de ${searchParams.origem} para ${searchParams.destino} (${searchParams.classe})!`);
      
    } catch (error: any) {
      console.error('❌ Erro na busca de voos:', error);
      
      // Mensagens de erro mais específicas
      let errorMessage = '❌ Erro na busca. Tente novamente.';
      
      if (error.message?.includes('Nenhum voo encontrado')) {
        errorMessage = `ℹ️ Nenhum voo encontrado para ${searchParams.origem} → ${searchParams.destino} na classe ${searchParams.classe}`;
      } else if (error.message?.includes('Falha na conexão')) {
        errorMessage = '🌐 Problema de conectividade. Verifique sua internet.';
      } else if (error.message?.includes('autenticação')) {
        errorMessage = '🔐 Problema de autenticação com a API. Tente novamente.';
      }
      
      toast.error(errorMessage);
      setSearchResults([]);
      setFilteredResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getTotalPassengers = (): number => {
    return searchParams.adultos + searchParams.criancas + searchParams.bebes;
  };

  const updatePassengerCount = (type: 'adultos' | 'criancas' | 'bebes', change: number) => {
    setSearchParams(prev => ({
      ...prev,
      [type]: Math.max(type === 'adultos' ? 1 : 0, prev[type] + change)
    }));
  };

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'short', 
        day: '2-digit', 
        month: 'short' 
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleCalendarDateSelect = (date: string) => {
    if (calendarConfig.type === 'ida') {
      setSearchParams(prev => ({ ...prev, ida: date }));
    } else {
      setSearchParams(prev => ({ ...prev, volta: date }));
    }
    setCalendarConfig({type: 'ida', show: false, title: ''});
  };

  const closeCalendar = () => {
    setCalendarConfig({type: 'ida', show: false, title: ''});
  };

  const selectDestination = (destination: typeof popularDestinations[0], field: 'origem' | 'destino') => {
    setSearchParams(prev => ({
      ...prev,
      [field]: destination.code
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ✈️ Buscar Voos
          </h1>
          <p className="text-xl text-gray-600">
            Encontre os melhores voos para o seu destino
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              🔍 Parâmetros da Busca
            </h2>
            <span className="text-sm font-medium text-gray-700">✅ LATAM funcionando perfeitamente | ⚠️ GOL/Azul temporariamente indisponíveis</span>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Origin and Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AirportSearch
                label="Origem"
                name="origem"
                value={searchParams.origem}
                onChange={(value) => setSearchParams(prev => ({ ...prev, origem: value }))}
                placeholder="Digite país, cidade ou código (ex: espanha, madrid, MAD)"
                icon="🛫"
                required
              />
              <AirportSearch
                label="Para"
                name="destino"
                value={searchParams.destino}
                onChange={(value) => setSearchParams(prev => ({ ...prev, destino: value }))}
                placeholder="Digite país, cidade ou código (ex: espanha, madrid, MAD)"
                icon="🛬"
                required
              />
            </div>

            {/* Dates and Passengers - Layout como na imagem */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ida */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Ida
                </label>
                <div 
                  onClick={() => setCalendarConfig({type: 'ida', show: true, title: 'Selecionar data de ida'})}
                  className="relative w-full px-4 py-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <span className="text-gray-900 text-sm">
                    {searchParams.ida ? formatDisplayDate(searchParams.ida) : 'dd/mm/aaaa'}
                  </span>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Volta */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Volta
                </label>
                <div 
                  onClick={() => !searchParams.soIda && setCalendarConfig({type: 'volta', show: true, title: 'Selecionar data de volta'})}
                  className={`relative w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors ${
                    searchParams.soIda 
                      ? 'bg-gray-100 cursor-not-allowed' 
                      : 'bg-white cursor-pointer hover:border-blue-400'
                  }`}
                >
                  <span className={`text-sm ${searchParams.soIda ? 'text-gray-400' : 'text-gray-900'}`}>
                    {searchParams.soIda 
                      ? 'Somente ida' 
                      : (searchParams.volta ? formatDisplayDate(searchParams.volta) : 'dd/mm/aaaa')
                    }
                  </span>
                  <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${searchParams.soIda ? 'text-gray-300' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Passengers */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Passageiros
                </label>
                <div 
                  onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                  className="relative w-full px-4 py-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <span className="text-gray-900 text-sm">
                    {getTotalPassengers()} adulto{getTotalPassengers() > 1 ? 's' : ''}
                  </span>
                  <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${
                    showPassengerDropdown ? 'rotate-180' : ''
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Passenger Dropdown */}
                {showPassengerDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Adultos</span>
                        <div className="flex items-center space-x-3">
                          <button 
                            type="button"
                            onClick={() => updatePassengerCount('adultos', -1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            disabled={searchParams.adultos <= 1}
                          >
                            <span className="text-lg">-</span>
                          </button>
                          <span className="w-8 text-center">{searchParams.adultos}</span>
                          <button 
                            type="button"
                            onClick={() => updatePassengerCount('adultos', 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            disabled={searchParams.adultos >= 9}
                          >
                            <span className="text-lg">+</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Crianças</span>
                        <div className="flex items-center space-x-3">
                          <button 
                            type="button"
                            onClick={() => updatePassengerCount('criancas', -1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            disabled={searchParams.criancas <= 0}
                          >
                            <span className="text-lg">-</span>
                          </button>
                          <span className="w-8 text-center">{searchParams.criancas}</span>
                          <button 
                            type="button"
                            onClick={() => updatePassengerCount('criancas', 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            disabled={searchParams.criancas >= 8}
                          >
                            <span className="text-lg">+</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Bebês</span>
                        <div className="flex items-center space-x-3">
                          <button 
                            type="button"
                            onClick={() => updatePassengerCount('bebes', -1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            disabled={searchParams.bebes <= 0}
                          >
                            <span className="text-lg">-</span>
                          </button>
                          <span className="w-8 text-center">{searchParams.bebes}</span>
                          <button 
                            type="button"
                            onClick={() => updatePassengerCount('bebes', 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            disabled={searchParams.bebes >= 8}
                          >
                            <span className="text-lg">+</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Options */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ✈️ Companhia Aérea
                </label>
                <select
                  name="companhia"
                  value={searchParams.companhia}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={-1}>🔍 Companhias funcionando (recomendado)</option>
                  <option value={1}>✅ LATAM (funcionando)</option>
                  <option value={2}>⚠️ GOL Linhas Aéreas (problemas temporários)</option>
                  <option value={3}>⚠️ Azul (problemas temporários)</option>
                  <option value={11}>🔍 TAP Air Portugal (testando...)</option>
                  <option value={13}>🔍 Copa Airlines (testando...)</option>
                  <option value={22}>🔍 American Airlines (testando...)</option>
                  <option value={26}>🔍 Iberia (testando...)</option>
                  <option value={34}>🔍 Livelo (testando...)</option>
                  <option value={1200}>🔍 Azul Interline (testando...)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💳 Tipo de Pagamento
                </label>
                <select
                  name="tipoPagamento"
                  value={searchParams.tipoPagamento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ambos">🔄 Ambos (Milhas + Dinheiro)</option>
                  <option value="milhas">✈️ Apenas Milhas</option>
                  <option value="dinheiro">💰 Apenas Dinheiro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎯 Tipo de Voos
                </label>
                <select
                  name="classe"
                  value={searchParams.classe}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="economica">💺 Economica</option>
                  <option value="executiva">✨ Executiva</option>
                  <option value="primeira">👑 Primeira</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📊 Ordenar por
                </label>
                <select
                  name="orderBy"
                  value={searchParams.orderBy}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="tempo">Menor tempo</option>
                  <option value="preco">Menor preço</option>
                </select>
              </div>
            </div>

            {/* Only One Way */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="soIda"
                checked={searchParams.soIda}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Apenas ida
              </label>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Buscando voos...
                </span>
              ) : (
                '🔍 Buscar Voos'
              )}
            </button>
          </form>
        </div>

        {/* Popular Destinations */}
        {searchResults.length === 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🌟 Destinos Populares</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularDestinations.map((destination) => (
                <div
                  key={destination.code}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{destination.image}</div>
                    <h3 className="font-semibold text-gray-900">{destination.city}</h3>
                    <p className="text-sm text-gray-600">{destination.country}</p>
                    <p className="text-xs text-blue-600 font-mono">{destination.code}</p>
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => selectDestination(destination, 'origem')}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        Origem
                      </button>
                      <button
                        onClick={() => selectDestination(destination, 'destino')}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                      >
                        Destino
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flight Results Section */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Results Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    ✈️ Voos Encontrados ({searchResults.length})
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {searchParams.origem} → {searchParams.destino} • {formatDisplayDate(searchParams.ida)}
                    {!searchParams.soIda && searchParams.volta && ` → ${formatDisplayDate(searchParams.volta)}`}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {getTotalPassengers()} passageiro{getTotalPassengers() > 1 ? 's' : ''} • {searchParams.classe}
                  </span>
                  <button
                    onClick={() => setSearchResults([])}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Nova Busca
                  </button>
                </div>
              </div>

              {/* Sorting and Filter Bar */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
                    <select 
                      value={searchParams.orderBy}
                      onChange={(e) => {
                        const newOrderBy = e.target.value as 'tempo' | 'preco';
                        setSearchParams(prev => ({ ...prev, orderBy: newOrderBy }));
                        // Reordenar resultados
                        const sorted = [...searchResults].sort((a, b) => {
                          if (newOrderBy === 'preco') {
                            const priceA = a.totalPrice || a.priceWithTax || a.price || 0;
                            const priceB = b.totalPrice || b.priceWithTax || b.price || 0;
                            return priceA - priceB;
                          } else {
                            // Ordenar por tempo (duração)
                            const durationA = parseInt(a.duracao?.replace(/\D/g, '') || '0');
                            const durationB = parseInt(b.duracao?.replace(/\D/g, '') || '0');
                            return durationA - durationB;
                          }
                        });
                        setSearchResults(sorted);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="preco">Menor preço</option>
                      <option value="tempo">Menor duração</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      💡 Dica: Clique em "Veja mais" para detalhes
                    </span>
                  </div>
                </div>
              </div>

              {/* Flight Results List */}
              <div className="space-y-4">
                {searchResults.map((flight, index) => (
                  <FlightResultCard
                    key={flight.id || index}
                    flight={{
                      id: flight.id || `flight-${index}`,
                      companhia: flight.companhia || 'Companhia não informada',
                      numeroVoo: flight.numeroVoo,
                      origem: flight.origem || searchParams.origem,
                      destino: flight.destino || searchParams.destino,
                      horarioSaida: flight.horarioSaida || '00:00',
                      horarioChegada: flight.horarioChegada || '00:00',
                      duracao: flight.duracao || 'N/A',
                      priceWithTax: flight.priceWithTax,
                      price: flight.price,
                      totalPrice: flight.totalPrice,
                      PontosAdulto: flight.PontosAdulto,
                      isMiles: flight.isMiles || false,
                      escalas: flight.escalas,
                      NumeroEscalas: flight.NumeroEscalas,
                      ProviderSource: flight.ProviderSource
                    }}
                    onSelect={(flightId) => {
                      toast.success(`✈️ Selecionado voo ${flightId} para mais detalhes!`);
                      // Aqui você pode implementar navegação para página de detalhes
                    }}
                    onFavorite={(flightId) => {
                      toast.success(`❤️ Voo ${flightId} adicionado aos favoritos!`);
                      // Aqui você pode implementar lógica de favoritos
                    }}
                  />
                ))}
              </div>

              {/* Load More Button (opcional) */}
              <div className="text-center mt-8">
                <button 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors"
                  onClick={() => toast.info('Funcionalidade "Carregar mais" em desenvolvimento!')}
                >
                  Carregar mais voos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Calendar */}
        <CustomCalendar
          isOpen={calendarConfig.show}
          onClose={closeCalendar}
          onSelectDate={handleCalendarDateSelect}
          selectedDate={calendarConfig.type === 'ida' ? searchParams.ida : searchParams.volta}
          minDate={new Date().toISOString().split('T')[0]}
          title={calendarConfig.title}
        />
      </div>
    </div>
  );
};

export default FlightSearch;
