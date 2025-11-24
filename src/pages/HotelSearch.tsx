import React, { useState } from 'react';
import toast from 'react-hot-toast';

// This is essentially the same as Hotels.tsx but with a different approach/implementation
// to maintain exact parity with the Vue.js version

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

const HotelSearch: React.FC = () => {
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSearchResults(mockHotels);
      setShowResults(true);
      toast.success(`${mockHotels.length} hotéis encontrados!`);
    } catch (error) {
      toast.error('Erro ao buscar hotéis. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🏨 Hotel Search - Moblix
          </h1>
          <p className="text-gray-600">
            Find and book the perfect accommodation for your trip
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Search Hotels</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination
              </label>
              <input
                type="text"
                placeholder="Where are you going?"
                value={searchForm.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in
              </label>
              <input
                type="date"
                value={searchForm.checkIn}
                onChange={(e) => handleInputChange('checkIn', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out
              </label>
              <input
                type="date"
                value={searchForm.checkOut}
                onChange={(e) => handleInputChange('checkOut', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guests
              </label>
              <select
                value={searchForm.adults}
                onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1,2,3,4,5,6].map(num => (
                  <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search Hotels'}
          </button>
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Search Results ({searchResults.length} hotels found)
            </h2>
            
            {searchResults.map((hotel) => (
              <div key={hotel.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <div className="h-64 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <div className="text-6xl text-white">🏨</div>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">{renderStars(hotel.rating)}</div>
                          <span className="text-sm text-gray-600">({hotel.reviewCount} reviews)</span>
                        </div>
                        <p className="text-gray-600 mb-2">📍 {hotel.location}</p>
                        <p className="text-gray-700 mb-4">{hotel.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {hotel.amenities.slice(0, 3).map((amenity, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          R$ {hotel.pricePerNight}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">per night</p>
                        {calculateNights() > 0 && (
                          <p className="text-lg font-semibold text-gray-800 mb-4">
                            Total: R$ {hotel.pricePerNight * calculateNights()}
                          </p>
                        )}
                        <button
                          onClick={() => toast.success(`${hotel.name} selected!`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {showResults && searchResults.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hotels found</h3>
            <p className="text-gray-600">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelSearch;
