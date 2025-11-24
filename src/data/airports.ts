export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
  region?: string;
  popular?: boolean;
}

export const airportsByCountry: Record<string, Airport[]> = {
  'brasil': [
    { iata: 'GRU', name: 'Aeroporto Internacional de São Paulo/Guarulhos', city: 'São Paulo', country: 'Brasil', popular: true },
    { iata: 'CGH', name: 'Aeroporto de São Paulo/Congonhas', city: 'São Paulo', country: 'Brasil', popular: true },
    { iata: 'BSB', name: 'Aeroporto Internacional de Brasília', city: 'Brasília', country: 'Brasil', popular: true },
    { iata: 'GIG', name: 'Aeroporto Internacional do Rio de Janeiro/Galeão', city: 'Rio de Janeiro', country: 'Brasil', popular: true },
    { iata: 'SDU', name: 'Aeroporto Santos Dumont', city: 'Rio de Janeiro', country: 'Brasil', popular: true },
    { iata: 'CNF', name: 'Aeroporto Internacional de Belo Horizonte/Confins', city: 'Belo Horizonte', country: 'Brasil', popular: true },
    { iata: 'SSA', name: 'Aeroporto Internacional de Salvador', city: 'Salvador', country: 'Brasil', popular: true },
    { iata: 'FOR', name: 'Aeroporto Internacional de Fortaleza', city: 'Fortaleza', country: 'Brasil' },
    { iata: 'REC', name: 'Aeroporto Internacional do Recife', city: 'Recife', country: 'Brasil' },
    { iata: 'POA', name: 'Aeroporto Internacional de Porto Alegre', city: 'Porto Alegre', country: 'Brasil' },
    { iata: 'BEL', name: 'Aeroporto Internacional de Belém', city: 'Belém', country: 'Brasil' },
    { iata: 'MAO', name: 'Aeroporto Internacional de Manaus', city: 'Manaus', country: 'Brasil' },
    { iata: 'CWB', name: 'Aeroporto Internacional de Curitiba', city: 'Curitiba', country: 'Brasil' },
    { iata: 'VIX', name: 'Aeroporto de Vitória', city: 'Vitória', country: 'Brasil' },
    { iata: 'NAT', name: 'Aeroporto Internacional de Natal', city: 'Natal', country: 'Brasil' },
    { iata: 'MCZ', name: 'Aeroporto Internacional de Maceió', city: 'Maceió', country: 'Brasil' },
    { iata: 'AJU', name: 'Aeroporto Internacional de Aracaju', city: 'Aracaju', country: 'Brasil' }
  ],
  
  'espanha': [
    { iata: 'MAD', name: 'Aeroporto Madrid-Barajas', city: 'Madrid', country: 'Espanha', popular: true },
    { iata: 'BCN', name: 'Aeroporto de Barcelona-El Prat', city: 'Barcelona', country: 'Espanha', popular: true },
    { iata: 'PMI', name: 'Aeroporto de Palma de Mallorca', city: 'Palma', country: 'Espanha', popular: true },
    { iata: 'AGP', name: 'Aeroporto de Málaga-Costa del Sol', city: 'Málaga', country: 'Espanha', popular: true },
    { iata: 'LPA', name: 'Aeroporto de Las Palmas', city: 'Las Palmas', country: 'Espanha', popular: true },
    { iata: 'BIO', name: 'Aeroporto de Bilbao', city: 'Bilbao', country: 'Espanha' },
    { iata: 'SVQ', name: 'Aeroporto de Sevilha', city: 'Sevilha', country: 'Espanha' },
    { iata: 'VLC', name: 'Aeroporto de Valência', city: 'Valência', country: 'Espanha' },
    { iata: 'ALC', name: 'Aeroporto de Alicante', city: 'Alicante', country: 'Espanha' },
    { iata: 'TFS', name: 'Aeroporto Tenerife Sul', city: 'Tenerife', country: 'Espanha' },
    { iata: 'TFN', name: 'Aeroporto Tenerife Norte', city: 'Tenerife', country: 'Espanha' },
    { iata: 'ACE', name: 'Aeroporto de Lanzarote', city: 'Lanzarote', country: 'Espanha' },
    { iata: 'FUE', name: 'Aeroporto de Fuerteventura', city: 'Fuerteventura', country: 'Espanha' },
    { iata: 'SPC', name: 'Aeroporto de La Palma', city: 'La Palma', country: 'Espanha' },
    { iata: 'GMZ', name: 'Aeroporto de La Gomera', city: 'La Gomera', country: 'Espanha' },
    { iata: 'EJR', name: 'Aeroporto de El Hierro', city: 'El Hierro', country: 'Espanha' },
    { iata: 'SDR', name: 'Aeroporto de Santander', city: 'Santander', country: 'Espanha' },
    { iata: 'VGO', name: 'Aeroporto de Vigo', city: 'Vigo', country: 'Espanha' },
    { iata: 'SCQ', name: 'Aeroporto de Santiago de Compostela', city: 'Santiago', country: 'Espanha' },
    { iata: 'LCG', name: 'Aeroporto da Coruña', city: 'A Coruña', country: 'Espanha' },
    { iata: 'ZAZ', name: 'Aeroporto de Zaragoza', city: 'Zaragoza', country: 'Espanha' },
    { iata: 'REU', name: 'Aeroporto de Reus', city: 'Reus', country: 'Espanha' },
    { iata: 'GRO', name: 'Aeroporto de Girona-Costa Brava', city: 'Girona', country: 'Espanha' },
    { iata: 'GRX', name: 'Aeroporto Federico García Lorca Granada-Jaén', city: 'Granada', country: 'Espanha' },
    { iata: 'XRY', name: 'Aeroporto de Jerez', city: 'Jerez', country: 'Espanha' },
    { iata: 'LEI', name: 'Aeroporto de Almería', city: 'Almería', country: 'Espanha' },
    { iata: 'SLM', name: 'Aeroporto de Salamanca', city: 'Salamanca', country: 'Espanha' },
    { iata: 'VLL', name: 'Aeroporto de Valladolid', city: 'Valladolid', country: 'Espanha' },
    { iata: 'LEN', name: 'Aeroporto de León', city: 'León', country: 'Espanha' },
    { iata: 'OVD', name: 'Aeroporto de Oviedo', city: 'Oviedo', country: 'Espanha' },
    { iata: 'HSK', name: 'Aeroporto de Huesca', city: 'Huesca', country: 'Espanha' },
    { iata: 'RJL', name: 'Aeroporto de Logroño', city: 'Logroño', country: 'Espanha' },
    { iata: 'VIT', name: 'Aeroporto de Vitoria', city: 'Vitoria', country: 'Espanha' },
    { iata: 'PNA', name: 'Aeroporto de Pamplona', city: 'Pamplona', country: 'Espanha' },
    { iata: 'SAN', name: 'Aeroporto de San Sebastián', city: 'San Sebastián', country: 'Espanha' },
    { iata: 'CDT', name: 'Aeroporto de Castellón', city: 'Castellón', country: 'Espanha' },
    { iata: 'ILD', name: 'Aeroporto de Lleida', city: 'Lleida', country: 'Espanha' },
    { iata: 'TOJ', name: 'Aeroporto de Madrid-Torrejón', city: 'Madrid', country: 'Espanha' },
    { iata: 'ABC', name: 'Aeroporto de Albacete', city: 'Albacete', country: 'Espanha' },
    { iata: 'BJZ', name: 'Aeroporto de Badajoz', city: 'Badajoz', country: 'Espanha' }
  ],

  'portugal': [
    { iata: 'LIS', name: 'Aeroporto Humberto Delgado', city: 'Lisboa', country: 'Portugal', popular: true },
    { iata: 'OPO', name: 'Aeroporto Francisco Sá Carneiro', city: 'Porto', country: 'Portugal', popular: true },
    { iata: 'FAO', name: 'Aeroporto de Faro', city: 'Faro', country: 'Portugal' },
    { iata: 'FNC', name: 'Aeroporto da Madeira', city: 'Funchal', country: 'Portugal' },
    { iata: 'PDL', name: 'Aeroporto João Paulo II', city: 'Ponta Delgada', country: 'Portugal' }
  ],

  'frança': [
    { iata: 'CDG', name: 'Aeroporto Charles de Gaulle', city: 'Paris', country: 'França', popular: true },
    { iata: 'ORY', name: 'Aeroporto de Orly', city: 'Paris', country: 'França', popular: true },
    { iata: 'NCE', name: 'Aeroporto de Nice', city: 'Nice', country: 'França' },
    { iata: 'LYS', name: 'Aeroporto de Lyon', city: 'Lyon', country: 'França' },
    { iata: 'MRS', name: 'Aeroporto de Marselha', city: 'Marselha', country: 'França' },
    { iata: 'TLS', name: 'Aeroporto de Toulouse', city: 'Toulouse', country: 'França' },
    { iata: 'BOD', name: 'Aeroporto de Bordeaux', city: 'Bordeaux', country: 'França' }
  ],

  'itália': [
    { iata: 'FCO', name: 'Aeroporto Leonardo da Vinci', city: 'Roma', country: 'Itália', popular: true },
    { iata: 'CIA', name: 'Aeroporto de Ciampino', city: 'Roma', country: 'Itália' },
    { iata: 'MXP', name: 'Aeroporto de Malpensa', city: 'Milão', country: 'Itália', popular: true },
    { iata: 'LIN', name: 'Aeroporto de Linate', city: 'Milão', country: 'Itália' },
    { iata: 'VCE', name: 'Aeroporto Marco Polo', city: 'Veneza', country: 'Itália', popular: true },
    { iata: 'NAP', name: 'Aeroporto Internacional de Nápoles', city: 'Nápoles', country: 'Itália' },
    { iata: 'BLQ', name: 'Aeroporto de Bolonha', city: 'Bolonha', country: 'Itália' }
  ],

  'alemanha': [
    { iata: 'FRA', name: 'Aeroporto de Frankfurt', city: 'Frankfurt', country: 'Alemanha', popular: true },
    { iata: 'MUC', name: 'Aeroporto de Munique', city: 'Munique', country: 'Alemanha', popular: true },
    { iata: 'TXL', name: 'Aeroporto de Berlim-Tegel', city: 'Berlim', country: 'Alemanha' },
    { iata: 'BER', name: 'Aeroporto de Berlim Brandenburg', city: 'Berlim', country: 'Alemanha', popular: true },
    { iata: 'DUS', name: 'Aeroporto de Düsseldorf', city: 'Düsseldorf', country: 'Alemanha' },
    { iata: 'HAM', name: 'Aeroporto de Hamburgo', city: 'Hamburgo', country: 'Alemanha' },
    { iata: 'CGN', name: 'Aeroporto de Colônia', city: 'Colônia', country: 'Alemanha' }
  ],

  'reino unido': [
    { iata: 'LHR', name: 'Aeroporto de Heathrow', city: 'Londres', country: 'Reino Unido', popular: true },
    { iata: 'LGW', name: 'Aeroporto de Gatwick', city: 'Londres', country: 'Reino Unido', popular: true },
    { iata: 'STN', name: 'Aeroporto de Stansted', city: 'Londres', country: 'Reino Unido' },
    { iata: 'LTN', name: 'Aeroporto de Luton', city: 'Londres', country: 'Reino Unido' },
    { iata: 'MAN', name: 'Aeroporto de Manchester', city: 'Manchester', country: 'Reino Unido' },
    { iata: 'EDI', name: 'Aeroporto de Edimburgo', city: 'Edimburgo', country: 'Reino Unido' },
    { iata: 'GLA', name: 'Aeroporto de Glasgow', city: 'Glasgow', country: 'Reino Unido' }
  ],

  'holanda': [
    { iata: 'AMS', name: 'Aeroporto de Amsterdã Schiphol', city: 'Amsterdã', country: 'Holanda', popular: true },
    { iata: 'EIN', name: 'Aeroporto de Eindhoven', city: 'Eindhoven', country: 'Holanda' },
    { iata: 'RTM', name: 'Aeroporto de Rotterdam', city: 'Rotterdam', country: 'Holanda' }
  ],

  'estados unidos': [
    { iata: 'JFK', name: 'Aeroporto John F. Kennedy', city: 'Nova York', country: 'Estados Unidos', popular: true },
    { iata: 'LGA', name: 'Aeroporto LaGuardia', city: 'Nova York', country: 'Estados Unidos' },
    { iata: 'EWR', name: 'Aeroporto Newark', city: 'Nova York', country: 'Estados Unidos' },
    { iata: 'LAX', name: 'Aeroporto de Los Angeles', city: 'Los Angeles', country: 'Estados Unidos', popular: true },
    { iata: 'MIA', name: 'Aeroporto Internacional de Miami', city: 'Miami', country: 'Estados Unidos', popular: true },
    { iata: 'ORD', name: 'Aeroporto de Chicago O\'Hare', city: 'Chicago', country: 'Estados Unidos' },
    { iata: 'ATL', name: 'Aeroporto de Atlanta', city: 'Atlanta', country: 'Estados Unidos' },
    { iata: 'DFW', name: 'Aeroporto de Dallas', city: 'Dallas', country: 'Estados Unidos' },
    { iata: 'SFO', name: 'Aeroporto de San Francisco', city: 'San Francisco', country: 'Estados Unidos' },
    { iata: 'BOS', name: 'Aeroporto de Boston', city: 'Boston', country: 'Estados Unidos' }
  ],

  'argentina': [
    { iata: 'EZE', name: 'Aeroporto Internacional Ezeiza', city: 'Buenos Aires', country: 'Argentina', popular: true },
    { iata: 'AEP', name: 'Aeroporto Jorge Newbery', city: 'Buenos Aires', country: 'Argentina' },
    { iata: 'COR', name: 'Aeroporto de Córdoba', city: 'Córdoba', country: 'Argentina' },
    { iata: 'MDZ', name: 'Aeroporto de Mendoza', city: 'Mendoza', country: 'Argentina' },
    { iata: 'BRC', name: 'Aeroporto de Bariloche', city: 'Bariloche', country: 'Argentina' }
  ],

  'chile': [
    { iata: 'SCL', name: 'Aeroporto Internacional de Santiago', city: 'Santiago', country: 'Chile', popular: true },
    { iata: 'IPC', name: 'Aeroporto Isla de Pascua', city: 'Ilha de Páscoa', country: 'Chile' },
    { iata: 'CCP', name: 'Aeroporto de Concepción', city: 'Concepción', country: 'Chile' }
  ],

  'uruguai': [
    { iata: 'MVD', name: 'Aeroporto Internacional de Montevidéu', city: 'Montevidéu', country: 'Uruguai', popular: true },
    { iata: 'PDP', name: 'Aeroporto de Punta del Este', city: 'Punta del Este', country: 'Uruguai' }
  ],

  'colômbia': [
    { iata: 'BOG', name: 'Aeroporto El Dorado', city: 'Bogotá', country: 'Colômbia', popular: true },
    { iata: 'MDE', name: 'Aeroporto de Medellín', city: 'Medellín', country: 'Colômbia' },
    { iata: 'CTG', name: 'Aeroporto de Cartagena', city: 'Cartagena', country: 'Colômbia' },
    { iata: 'CLO', name: 'Aeroporto de Cali', city: 'Cali', country: 'Colômbia' }
  ],

  'peru': [
    { iata: 'LIM', name: 'Aeroporto Internacional Jorge Chávez', city: 'Lima', country: 'Peru', popular: true },
    { iata: 'CUZ', name: 'Aeroporto de Cusco', city: 'Cusco', country: 'Peru' },
    { iata: 'AQP', name: 'Aeroporto de Arequipa', city: 'Arequipa', country: 'Peru' }
  ],

  'japão': [
    { iata: 'NRT', name: 'Aeroporto de Narita', city: 'Tóquio', country: 'Japão', popular: true },
    { iata: 'HND', name: 'Aeroporto de Haneda', city: 'Tóquio', country: 'Japão', popular: true },
    { iata: 'KIX', name: 'Aeroporto de Kansai', city: 'Osaka', country: 'Japão' },
    { iata: 'NGO', name: 'Aeroporto de Nagoya', city: 'Nagoya', country: 'Japão' }
  ],

  'coreia do sul': [
    { iata: 'ICN', name: 'Aeroporto Internacional de Incheon', city: 'Seul', country: 'Coreia do Sul', popular: true },
    { iata: 'GMP', name: 'Aeroporto de Gimpo', city: 'Seul', country: 'Coreia do Sul' },
    { iata: 'PUS', name: 'Aeroporto de Busan', city: 'Busan', country: 'Coreia do Sul' }
  ]
};

// Função para buscar aeroportos por termo (país, cidade ou código)
export const searchAirports = (term: string): Airport[] => {
  if (!term || term.length < 2) return [];
  
  const searchTerm = term.toLowerCase().trim();
  const results: Airport[] = [];
  
  // Busca por país
  if (airportsByCountry[searchTerm]) {
    results.push(...airportsByCountry[searchTerm]);
  }
  
  // Busca em todos os aeroportos por cidade ou código IATA
  Object.values(airportsByCountry).forEach(airports => {
    airports.forEach(airport => {
      if (
        airport.city.toLowerCase().includes(searchTerm) ||
        airport.iata.toLowerCase().includes(searchTerm) ||
        airport.name.toLowerCase().includes(searchTerm) ||
        airport.country.toLowerCase().includes(searchTerm)
      ) {
        // Evita duplicatas
        if (!results.some(existing => existing.iata === airport.iata)) {
          results.push(airport);
        }
      }
    });
  });
  
  // Ordena colocando aeroportos populares primeiro
  return results.sort((a, b) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    return 0;
  }).slice(0, 10); // Limita a 10 resultados
};

// Função para obter aeroportos populares por país
export const getPopularAirportsByCountry = (country: string): Airport[] => {
  const airports = airportsByCountry[country.toLowerCase()];
  return airports ? airports.filter(airport => airport.popular) : [];
};

// Lista de países disponíveis
export const availableCountries = Object.keys(airportsByCountry).map(country => ({
  name: country.charAt(0).toUpperCase() + country.slice(1),
  code: country
}));
