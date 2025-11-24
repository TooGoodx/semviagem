// Função para gerar um SVG com as iniciais da companhia aérea
const generateAirlineInitialsSVG = (airlineName: string): string => {
  const initials = airlineName.substring(0, 2).toUpperCase();
  const colors = ['#1e40af', '#dc2626', '#059669', '#7c2d12', '#4338ca', '#be185d'];
  const colorIndex = airlineName.length % colors.length;
  const bgColor = colors[colorIndex];
  
  const svg = `
    <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="150" fill="${bgColor}" rx="8"/>
      <text x="75" y="85" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
            text-anchor="middle" fill="white">${initials}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Mapeamento de códigos/nomes de companhias aéreas para seus respectivos logos
export const getAirlineLogo = (airlineName: string): string => {
  if (!airlineName) return generateAirlineInitialsSVG('CA');
  
  // Mapeamento principal de logos
  const airlineLogos: Record<string, string> = {
    // Principais companhias brasileiras - LATAM
    'latam': '/logos/latam.png',
    'latam brasil': '/logos/latam.png',
    'latam airlines': '/logos/latam.png',
    'latam airlines brasil': '/logos/latam.png',
    'tam': '/logos/latam.png',
    'tam linhas aéreas': '/logos/latam.png',
    'la': '/logos/latam.png', // Código IATA
    'jj': '/logos/latam.png', // Código IATA TAM
    
    // GOL
    'gol': '/logos/gol.png',
    'gol transporte aéreo': '/logos/gol.png',
    'gol linhas aéreas': '/logos/gol.png',
    'gol transportes aéreos': '/logos/gol.png',
    'smiles': '/logos/gol.png',
    'g3': '/logos/gol.png', // Código IATA
    
    // AZUL
    'azul': '/logos/azul.png',
    'azul linhas aéreas': '/logos/azul.png',
    'azul linhas aereas': '/logos/azul.png',
    'azul brasileiro': '/logos/azul.png',
    'azul linhas aéreas brasileiras': '/logos/azul.png',
    'tudoazul': '/logos/azul.png',
    'tudo azul': '/logos/azul.png',
    'ad': '/logos/azul.png', // Código IATA
    
    // Companhias internacionais
    'tap': '/logos/tap.png',
    'tap portugal': '/logos/tap.png',
    'tap air portugal': '/logos/tap.png',
    
    'copa': '/logos/copa.png',
    'copa airlines': '/logos/copa.png',
    'copa airlines panama': '/logos/copa.png',
    
    'american': '/logos/american-airlines.svg',
    'american airlines': '/logos/american-airlines.svg',
    'americanair': '/logos/american-airlines.svg',
    
    'iberia': '/logos/iberia.png',
    'iberia airlines': '/logos/iberia.png',
    
    // Adicionais (com fallback para logos genéricas por código IATA)
    'delta': 'https://logos-download.com/wp-content/uploads/2016/03/Delta_Airlines_logo_logotype.png',
    'united': 'https://logos-download.com/wp-content/uploads/2016/02/United_Airlines_logo_white_text.png',
    'air france': 'https://logos-download.com/wp-content/uploads/2016/02/Air_France_logo_white.png',
    'british airways': 'https://logos-download.com/wp-content/uploads/2016/06/British_Airways_logo_white.png',
    'lufthansa': 'https://logos-download.com/wp-content/uploads/2016/06/Lufthansa_logo_white.png',
    'emirates': 'https://logos-download.com/wp-content/uploads/2016/03/Emirates_logo_white.png',
    'qatar': 'https://logos-download.com/wp-content/uploads/2016/02/Qatar_Airways_logo_white.png',
    'turkish': 'https://logos-download.com/wp-content/uploads/2016/02/Turkish_Airlines_logo_white.png',
    'air canada': 'https://logos-download.com/wp-content/uploads/2016/02/Air_Canada_logo_white_text.png'
  };
  
  // Tenta encontrar uma correspondência direta
  const normalizedAirline = airlineName.toLowerCase().trim();
  
  const directMatch = airlineLogos[normalizedAirline];
  if (directMatch) {
    return directMatch;
  }
  
  // Tenta encontrar correspondência parcial para nomes mais longos
  for (const [key, logo] of Object.entries(airlineLogos)) {
    if (normalizedAirline.includes(key) || key.includes(normalizedAirline)) {
      return logo;
    }
  }

  // Se não encontrar, retorna um SVG gerado com as iniciais da companhia
  return generateAirlineInitialsSVG(airlineName);
};

// Função para padronizar o nome da companhia aérea para exibição
export const getDisplayAirlineName = (airlineName: string): string => {
  if (!airlineName) return 'Companhia Aérea';
  
  const airlineNames: Record<string, string> = {
    // Nacionais
    'latam': 'LATAM Airlines',
    'latam brasil': 'LATAM Brasil',
    'latam airlines': 'LATAM Airlines',
    'tam': 'LATAM Airlines',
    'tam linhas aéreas': 'LATAM Airlines',
    
    'gol': 'GOL Linhas Aéreas',
    'gol transporte aéreo': 'GOL Linhas Aéreas',
    'gol linhas aéreas': 'GOL Linhas Aéreas',
    'smiles': 'GOL Smiles',
    
    'azul': 'Azul Linhas Aéreas',
    'azul linhas aéreas': 'Azul Linhas Aéreas',
    'azul brasileiro': 'Azul Linhas Aéreas',
    'tudoazul': 'Azul TudoAzul',
    'tudo azul': 'Azul TudoAzul',
    
    // Internacionais
    'tap': 'TAP Air Portugal',
    'tap portugal': 'TAP Air Portugal',
    'tap air portugal': 'TAP Air Portugal',
    
    'copa': 'Copa Airlines',
    'copa airlines': 'Copa Airlines',
    'copa airlines panama': 'Copa Airlines',
    
    'american': 'American Airlines',
    'american airlines': 'American Airlines',
    'americanair': 'American Airlines',
    
    'iberia': 'Iberia',
    'iberia airlines': 'Iberia',
    
    // Outras companhias internacionais
    'delta': 'Delta Air Lines',
    'united': 'United Airlines',
    'air france': 'Air France',
    'british airways': 'British Airways',
    'lufthansa': 'Lufthansa',
    'emirates': 'Emirates',
    'qatar': 'Qatar Airways',
    'turkish': 'Turkish Airlines',
    'air canada': 'Air Canada'
  };

  const normalizedAirline = airlineName.toLowerCase().trim();
  
  // Tenta encontrar uma correspondência direta
  const directMatch = airlineNames[normalizedAirline];
  if (directMatch) return directMatch;
  
  // Tenta encontrar correspondência parcial
  for (const [key, name] of Object.entries(airlineNames)) {
    if (normalizedAirline.includes(key) || key.includes(normalizedAirline)) {
      return name;
    }
  }
  
  // Se não encontrar, retorna o nome original com a primeira letra maiúscula
  return airlineName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Alias para manter compatibilidade com código existente
export const getAirlineDisplayName = getDisplayAirlineName;
