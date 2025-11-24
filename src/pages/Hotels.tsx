import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface Hotel {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  location: string;
  amenities: string[];
  images: string[];
  description: string;
  distance: string;
}

interface SearchForm {
  destination: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
}

const Hotels: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Hotel[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const [searchForm, setSearchForm] = useState<SearchForm>({
    destination: '',
    checkIn: '',
    checkOut: '',
    rooms: 1,
    adults: 2,
    children: 0
  });

  const mockHotels: Hotel[] = [
    {
      id: 'H001',
      name: 'Hotel Copacabana Palace',
      rating: 5,
      reviewCount: 1234,
      pricePerNight: 850,
      location: 'Copacabana, Rio de Janeiro',
      amenities: ['WiFi Gratuito', 'Piscina', 'Spa', 'Academia', 'Estacionamento', 'Pet Friendly'],
      images: ['hotel1.jpg', 'hotel1_2.jpg'],
      description: 'Hotel luxuoso com vista para a praia de Copacabana',
      distance: '0.2 km do centro'
    },
    {
      id: 'H002',
      name: 'Pousada Charme & Conforto',
      rating: 4,
      reviewCount: 567,
      pricePerNight: 320,
      location: 'Ipanema, Rio de Janeiro',
      amenities: ['WiFi Gratuito', 'Café da Manhã', 'Ar Condicionado'],
      images: ['hotel2.jpg'],
      description: 'Pousada aconchegante no coração de Ipanema',
      distance: '0.5 km do centro'
    },
    {
      id: 'H003',
      name: 'Resort Vista Mar',
      rating: 4,
      reviewCount: 892,
      pricePerNight: 650,
      location: 'Barra da Tijuca, Rio de Janeiro',
      amenities: ['WiFi Gratuito', 'Piscina', 'All Inclusive', 'Kids Club', 'Beach Club'],
      images: ['hotel3.jpg'],
      description: 'Resort all-inclusive com acesso direto à praia',
      distance: '5 km do centro'
    }
  ];

  const popularDestinations = [
    { city: 'Rio de Janeiro', hotels: 1247 },
    { city: 'São Paulo', hotels: 2103 },
    { city: 'Salvador', hotels: 543 },
    { city: 'Brasília', hotels: 234 },
    { city: 'Fortaleza', hotels: 678 },
    { city: 'Gramado', hotels: 156 }
  ];

  const handleInputChange = (field: keyof SearchForm, value: any) => {
    setSearchForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    if (!searchForm.destination || !searchForm.checkIn || !searchForm.checkOut) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (new Date(searchForm.checkOut) <= new Date(searchForm.checkIn)) {
      toast.error('A data de check-out deve ser posterior à data de check-in');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API search
      await new Promise(resolve => setTimeout(resolve, 2500));
      setSearchResults(mockHotels);
      setShowResults(true);
      toast.success(`${mockHotels.length} hotéis encontrados!`);
    } catch (error) {
      toast.error('Erro ao buscar hotéis. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const bookHotel = (hotel: Hotel) => {
    toast.success(`Hotel ${hotel.name} selecionado para reserva!`);
    // Here you would typically redirect to booking page or open booking modal
  };

  const selectDestination = (destination: any) => {
    handleInputChange('destination', destination.city);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const calculateNights = () => {
    if (searchForm.checkIn && searchForm.checkOut) {
      const checkIn = new Date(searchForm.checkIn);
      const checkOut = new Date(searchForm.checkOut);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏨 Busca de Hotéis
          </h1>
          <p className="text-xl text-gray-600">
            Encontre a hospedagem perfeita para sua viagem
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Pesquisar Hotéis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Destino
              </label>
              <input
                type="text"
                placeholder="Para onde você vai?"
                value={searchForm.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Check-in
              </label>
              <input
                type="date"
                value={searchForm.checkIn}
                onChange={(e) => handleInputChange('checkIn', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Check-out
              </label>
              <input
                type="date"
                value={searchForm.checkOut}
                onChange={(e) => handleInputChange('checkOut', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏠 Quartos
              </label>
              <select
                value={searchForm.rooms}
                onChange={(e) => handleInputChange('rooms', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {[1,2,3,4,5].map(num => (
                  <option key={num} value={num}>{num} quarto{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👥 Adultos
              </label>
              <select
                value={searchForm.adults}
                onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {[1,2,3,4,5,6,7,8].map(num => (
                  <option key={num} value={num}>{num} adulto{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👶 Crianças
              </label>
              <select
                value={searchForm.children}
                onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {[0,1,2,3,4].map(num => (
                  <option key={num} value={num}>{num} criança{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Buscando hotéis...
              </div>
            ) : (
              '🔍 Buscar Hotéis'
            )}
          </button>
        </div>

        {/* Popular Destinations */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🌟 Destinos Populares</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularDestinations.map((destination) => (
              <div
                key={destination.city}
                onClick={() => selectDestination(destination)}
                className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
              >
                <div className="text-3xl mb-2">🏙️</div>
                <h3 className="font-semibold text-gray-900 text-sm group-hover:text-purple-600">
                  {destination.city}
                </h3>
                <p className="text-xs text-gray-600">{destination.hotels} hotéis</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                🏨 Resultados da Busca ({searchResults.length} hotéis)
              </h2>
              <div className="text-sm text-gray-600">
                {calculateNights() > 0 && `${calculateNights()} noite${calculateNights() > 1 ? 's' : ''}`}
              </div>
            </div>
            
            <div className="space-y-6">
              {searchResults.map((hotel) => (
                <div key={hotel.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="md:flex">
                    {/* Hotel Image */}
                    <div className="md:w-1/3">
                      <div className="h-64 md:h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <div className="text-6xl text-white">🏨</div>
                      </div>
                    </div>
                    
                    {/* Hotel Details */}
                    <div className="md:w-2/3 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex">{renderStars(hotel.rating)}</div>
                            <span className="text-sm text-gray-600">
                              ({hotel.reviewCount} avaliações)
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">📍 {hotel.location}</p>
                          <p className="text-gray-600 text-sm mb-4">{hotel.distance}</p>
                          <p className="text-gray-700 mb-4">{hotel.description}</p>
                          
                          {/* Amenities */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {hotel.amenities.slice(0, 4).map((amenity, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                              >
                                {amenity}
                              </span>
                            ))}
                            {hotel.amenities.length > 4 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                +{hotel.amenities.length - 4} mais
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Price and Book Button */}
                        <div className="text-right ml-6">
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            R$ {hotel.pricePerNight}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">por noite</p>
                          {calculateNights() > 0 && (
                            <p className="text-lg font-semibold text-gray-800 mb-4">
                              Total: R$ {hotel.pricePerNight * calculateNights()}
                            </p>
                          )}
                          <button
                            onClick={() => bookHotel(hotel)}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                          >
                            Reservar Hotel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {showResults && searchResults.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum hotel encontrado</h3>
            <p className="text-gray-600 mb-6">
              Não encontramos hotéis para os critérios selecionados. 
              Tente ajustar suas datas ou destino.
            </p>
            <button
              onClick={() => setShowResults(false)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              Nova Busca
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hotels;
