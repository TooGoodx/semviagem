import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface FlightOffer {
  id: string;
  title: string;
  description: string;
  airline: string;
  route: {
    from: string;
    to: string;
  };
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  validUntil: string;
  availableSeats: number;
  terms: string[];
  image?: string;
  featured?: boolean;
}

const FlightOffers: React.FC = () => {
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const mockOffers: FlightOffer[] = [
    {
      id: 'OF001',
      title: 'Super Promoção Rio - São Paulo',
      description: 'Voos diretos com a melhor companhia aérea do país',
      airline: 'LATAM Airlines',
      route: {
        from: 'Rio de Janeiro (GIG)',
        to: 'São Paulo (GRU)'
      },
      originalPrice: 450,
      discountedPrice: 289,
      discount: 36,
      validUntil: '2024-03-15',
      availableSeats: 45,
      terms: ['Válido para voos até março/2024', 'Não reembolsável', 'Sujeito a disponibilidade'],
      featured: true
    },
    {
      id: 'OF002',
      title: 'Nordeste em Promoção',
      description: 'Descubra as belezas do Nordeste com preços imperdíveis',
      airline: 'GOL Linhas Aéreas',
      route: {
        from: 'São Paulo (CGH)',
        to: 'Salvador (SSA)'
      },
      originalPrice: 680,
      discountedPrice: 399,
      discount: 41,
      validUntil: '2024-02-28',
      availableSeats: 23,
      terms: ['Válido para voos até fevereiro/2024', 'Taxas não inclusas', 'Sujeito a disponibilidade']
    },
    {
      id: 'OF003',
      title: 'Brasília Executiva',
      description: 'Voe com conforto para a capital federal',
      airline: 'Azul Linhas Aéreas',
      route: {
        from: 'Rio de Janeiro (SDU)',
        to: 'Brasília (BSB)'
      },
      originalPrice: 550,
      discountedPrice: 425,
      discount: 23,
      validUntil: '2024-04-30',
      availableSeats: 67,
      terms: ['Classe executiva', 'Bagagem incluída', 'Refeição a bordo'],
      featured: true
    },
    {
      id: 'OF004',
      title: 'Sul do Brasil',
      description: 'Explore o charme do Sul com tarifas promocionais',
      airline: 'LATAM Airlines',
      route: {
        from: 'São Paulo (GRU)',
        to: 'Porto Alegre (POA)'
      },
      originalPrice: 520,
      discountedPrice: 368,
      discount: 29,
      validUntil: '2024-03-20',
      availableSeats: 34,
      terms: ['Promoção limitada', 'Voos diretos', 'Check-in online gratuito']
    },
    {
      id: 'OF005',
      title: 'Fortaleza Relâmpago',
      description: 'Promoção relâmpago para o Ceará',
      airline: 'GOL Linhas Aéreas',
      route: {
        from: 'Brasília (BSB)',
        to: 'Fortaleza (FOR)'
      },
      originalPrice: 750,
      discountedPrice: 489,
      discount: 35,
      validUntil: '2024-02-15',
      availableSeats: 12,
      terms: ['Apenas 48h de promoção', 'Últimas vagas', 'Não acumula milhas']
    },
    {
      id: 'OF006',
      title: 'Recife Cultural',
      description: 'Conheça a rica cultura pernambucana',
      airline: 'Azul Linhas Aéreas',
      route: {
        from: 'São Paulo (VCP)',
        to: 'Recife (REC)'
      },
      originalPrice: 590,
      discountedPrice: 445,
      discount: 25,
      validUntil: '2024-05-10',
      availableSeats: 56,
      terms: ['Válido para fins de semana', 'Bagagem de mão inclusa', 'Cancelamento flexível']
    }
  ];

  const categories = [
    { id: 'all', name: 'Todas as Ofertas', count: mockOffers.length },
    { id: 'featured', name: 'Destacadas', count: mockOffers.filter(o => o.featured).length },
    { id: 'domestic', name: 'Voos Nacionais', count: mockOffers.length },
    { id: 'lastminute', name: 'Última Hora', count: 2 }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setOffers(mockOffers);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const filteredOffers = offers.filter(offer => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'featured') return offer.featured;
    if (selectedCategory === 'lastminute') return offer.availableSeats < 20;
    return true;
  });

  const bookOffer = (offer: FlightOffer) => {
    toast.success(`Oferta "${offer.title}" selecionada para reserva!`);
  };

  const getAirlineEmoji = (airline: string) => {
    return '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getUrgencyClass = (validUntil: string) => {
    const daysUntilExpiry = Math.ceil((new Date(validUntil).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    if (daysUntilExpiry <= 7) return 'bg-red-100 text-red-800';
    if (daysUntilExpiry <= 15) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#F0C72F', borderTopColor: 'transparent' }}></div>
          <h2 className="text-xl font-semibold" style={{ color: '#060D1C' }}>Carregando ofertas especiais...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#060D1C' }}>
            <span style={{ color: '#060D1C' }}>Sem</span><span style={{ color: '#F0C72F' }}>Viagem</span> - Ofertas Especiais
          </h1>
          <p className="text-xl" style={{ color: '#060D1C' }}>
            Não perca essas oportunidades únicas com descontos imperdíveis!
          </p>
        </div>

        {/* Category Filters */}
        <div className="rounded-2xl shadow-xl p-6 mb-8" style={{ backgroundColor: '#E4E4E4' }}>
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200`}
                style={{
                  backgroundColor: selectedCategory === category.id ? '#F0C72F' : 'white',
                  color: selectedCategory === category.id ? '#060D1C' : '#060D1C',
                  border: '1px solid #060D1C'
                }}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
              style={{
                border: offer.featured ? '4px solid #F0C72F' : '1px solid #E4E4E4'
              }}
            >
              {offer.featured && (
                <div className="text-center py-2 font-bold" style={{ backgroundColor: '#F0C72F', color: '#060D1C' }}>
                  OFERTA DESTACADA
                </div>
              )}

              {/* Card Header */}
              <div className="text-white p-6" style={{ backgroundColor: '#060D1C' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{getAirlineEmoji(offer.airline)}</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${getUrgencyClass(offer.validUntil)}`}>
                    Válida até {formatDate(offer.validUntil)}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                <p style={{ color: '#E4E4E4' }}>{offer.description}</p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Route */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-center">
                    <div className="font-bold text-lg text-gray-900">{offer.route.from.split('(')[0]}</div>
                    <div className="text-sm" style={{ color: '#060D1C' }}>{offer.route.from.split('(')[1]?.replace(')', '')}</div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <div className="mx-2" style={{ color: '#F0C72F' }}>→</div>
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-gray-900">{offer.route.to.split('(')[0]}</div>
                    <div className="text-sm" style={{ color: '#060D1C' }}>{offer.route.to.split('(')[1]?.replace(')', '')}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-lg line-through" style={{ color: '#060D1C', opacity: 0.6 }}>
                      R$ {offer.originalPrice}
                    </div>
                    <div className="text-3xl font-bold" style={{ color: '#F0C72F' }}>
                      R$ {offer.discountedPrice}
                    </div>
                  </div>
                  <div className="text-lg font-bold mt-2" style={{ color: '#060D1C' }}>
                    {offer.discount}% de desconto
                  </div>
                </div>

                {/* Airline and Availability */}
                <div className="flex items-center justify-between mb-6 text-sm" style={{ color: '#060D1C' }}>
                  <span>{offer.airline}</span>
                  <span>{offer.availableSeats} vagas</span>
                </div>

                {/* Terms */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2" style={{ color: '#060D1C' }}>Condições:</h4>
                  <ul className="text-sm space-y-1" style={{ color: '#060D1C' }}>
                    {offer.terms.map((term, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2" style={{ color: '#F0C72F' }}>•</span>
                        {term}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Book Button */}
                <button
                  onClick={() => bookOffer(offer)}
                  className="w-full font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                  style={{
                    backgroundColor: '#F0C72F',
                    color: '#060D1C',
                    border: '1px solid #060D1C'
                  }}
                >
                  Reservar Agora - R$ {offer.discountedPrice}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Offers */}
        {filteredOffers.length === 0 && (
          <div className="rounded-2xl shadow-xl p-12 text-center" style={{ backgroundColor: '#E4E4E4' }}>
            <div className="text-6xl mb-4"></div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#060D1C' }}>Nenhuma oferta encontrada</h3>
            <p className="mb-6" style={{ color: '#060D1C' }}>
              Não há ofertas disponíveis para a categoria selecionada.
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="font-bold py-3 px-6 rounded-lg"
              style={{
                backgroundColor: '#F0C72F',
                color: '#060D1C',
                border: '1px solid #060D1C'
              }}
            >
              Ver Todas as Ofertas
            </button>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="rounded-2xl shadow-xl p-8 mt-12 text-center" style={{ backgroundColor: '#E4E4E4' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#060D1C' }}>
            Não Perca Nenhuma Oferta!
          </h2>
          <p className="mb-6" style={{ color: '#060D1C' }}>
            Cadastre-se em nossa newsletter e seja o primeiro a saber das melhores promoções
          </p>
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 px-4 py-3 rounded-l-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              style={{
                border: '1px solid #060D1C'
              }}
            />
            <button
              onClick={() => toast.success('E-mail cadastrado com sucesso!')}
              className="px-6 py-3 rounded-r-lg font-bold transition-colors"
              style={{
                backgroundColor: '#F0C72F',
                color: '#060D1C',
                border: '1px solid #060D1C'
              }}
            >
              Cadastrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightOffers;
