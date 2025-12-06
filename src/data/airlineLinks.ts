// ESM export of airline booking links
// Following SemViagem ESM architecture standard

export const AIRLINE_LINKS = {
  "LATAM Airlines": {
    search: "https://www.latam.com/",
    redeem: "https://latampass.latam.com/pt_br/latam-pass/resgate-de-pontos/passagens-aereas"
  },
  "Azul Linhas Aéreas": {
    search: "https://www.voeazul.com.br/",
    redeem: "https://tudoazul.voeazul.com.br/resgate"
  },
  "GOL Linhas Aéreas": {
    search: "https://www.voegol.com.br/",
    redeem: "https://www.smiles.com.br/passagens-aereas"
  },
  "American Airlines": {
    search: "https://www.aa.com/",
    redeem: "https://www.aa.com/booking/flights"
  },
  "TAP Air Portugal": {
    search: "https://www.flytap.com/",
    redeem: "https://www.flytap.com/pt-br/miles-and-go/use-miles"
  },
  "Copa Airlines": {
    search: "https://www.copaair.com/",
    redeem: "https://www.connectmiles.com/redeem-miles"
  },
  "Iberia": {
    search: "https://www.iberia.com/",
    redeem: "https://www.iberia.com/iberiaplus/avios/use/"
  }
} as const;

// Type for airline name validation
export type AirlineName = keyof typeof AIRLINE_LINKS;

// Helper function to get airline links
export function getAirlineLinks(airlineName: string) {
  return AIRLINE_LINKS[airlineName as AirlineName] || null;
}

// Helper function to normalize airline names
export function normalizeAirlineName(name: string): string {
  const normalizations: Record<string, string> = {
    "LATAM": "LATAM Airlines",
    "Azul": "Azul Linhas Aéreas",
    "GOL": "GOL Linhas Aéreas",
    "American": "American Airlines",
    "TAP": "TAP Air Portugal",
    "Copa": "Copa Airlines",
    "Companhia Aérea": "LATAM Airlines" // Default fallback
  };

  return normalizations[name] || name;
}
