// Canonical airline IDs and names used across the project
// Source aligned with test-all-official-airlines.js

export const OFFICIAL_AIRLINES = {
  Todas: { id: -1, name: 'Busca em todas as companhias disponíveis', testable: false },
  Latam: { id: 1, name: 'LATAM Airlines', testable: true },
  Gol: { id: 2, name: 'GOL Linhas Aéreas', testable: true },
  Azul: { id: 3, name: 'Azul Linhas Aéreas', testable: true },
  Tap: { id: 11, name: 'TAP Air Portugal', testable: true },
  Copa: { id: 13, name: 'Copa Airlines', testable: true },
  AmericanAirlines: { id: 22, name: 'American Airlines', testable: true },
  Iberia: { id: 26, name: 'Iberia', testable: true },
  Livelo: { id: 34, name: 'Livelo', testable: true },
  Interline: { id: 1200, name: 'Azul Interline', testable: true },
  Rextur: { id: null, name: 'Rextur Advance', testable: false },
  Nenhuma: { id: 0, name: 'Nenhuma companhia específica', testable: false }
};

export const OFFICIAL_AIRLINE_IDS = Object.values(OFFICIAL_AIRLINES)
  .map(a => a.id)
  .filter(id => typeof id === 'number' && id > 0); // only concrete companies (exclude -1/0/null)

export const AIRLINE_ID_TO_NAME = Object.fromEntries(
  Object.values(OFFICIAL_AIRLINES)
    .filter(a => typeof a.id === 'number')
    .map(a => [a.id, a.name])
);
