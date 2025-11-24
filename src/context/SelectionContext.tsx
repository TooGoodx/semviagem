import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface Flight {
  segments: any[];
  price: number;
  priceWithTax: number;
  totalPrice: number;
  isMiles: boolean;
  airline: string;
  numeroVoo: string;
  // Flexible fields the app already uses in places
  Origem?: string;
  Destino?: string;
  Saida?: string;
  Chegada?: string;
  departure?: string;
  arrival?: string;
  departureDate?: string;
  arrivalDate?: string;
}

interface SelectedFlights {
  outbound: Flight | null;
  return: Flight | null;
}

interface SelectionContextValue {
  selected: SelectedFlights;
  setOutbound: (flight: Flight | null) => void;
  setReturn: (flight: Flight | null) => void;
  clear: () => void;
}

const SelectionContext = createContext<SelectionContextValue | undefined>(undefined);

const STORAGE_KEY = 'flightSelections';

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selected, setSelected] = useState<SelectedFlights>({ outbound: null, return: null });

  // Hydrate from storage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSelected({ outbound: parsed.outbound || null, return: parsed.return || null });
      }
    } catch {}
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    } catch {}
  }, [selected]);

  const value = useMemo<SelectionContextValue>(() => ({
    selected,
    setOutbound: (flight) => setSelected(prev => ({ ...prev, outbound: flight })),
    setReturn: (flight) => setSelected(prev => ({ ...prev, return: flight })),
    clear: () => setSelected({ outbound: null, return: null })
  }), [selected]);

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = (): SelectionContextValue => {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within a SelectionProvider');
  return ctx;
};
