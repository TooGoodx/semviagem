// Sistema de cache para tarifas de voos da API Moblix
// Garante que sempre tenhamos os dados mais completos das tarifas

interface CachedFare {
  Tipo: string
  ValorAdulto: number
  ValorTotalComTaxa: number
  BagagensInclusas: any[]
  timestamp: number
}

interface FlightKey {
  flightNumber: string
  route: string
  departure: string
}

// Cache global de tarifas por voo
const fareCache = new Map<string, CachedFare[]>()

// Função para gerar chave única do voo
export const generateFlightKey = (flightNumber: string, route: string, departure: string): string => {
  return `${flightNumber}-${route}-${departure}`
}

// Função para adicionar tarifas ao cache
export const addFaresToCache = (flightKey: FlightKey, fares: CachedFare[]): void => {
  const key = generateFlightKey(flightKey.flightNumber, flightKey.route, flightKey.departure)
  const timestamp = Date.now()
  
  // Adicionar timestamp a cada tarifa
  const faresWithTimestamp = fares.map(fare => ({
    ...fare,
    timestamp
  }))
  
  // Se já existe no cache, combinar com as novas tarifas
  const existingFares = fareCache.get(key) || []
  const combinedFares = [...existingFares, ...faresWithTimestamp]
  
  // Remover duplicatas mantendo a mais cara por tipo
  const uniqueFares = combinedFares.reduce((acc, current) => {
    const existing = acc.find(fare => fare.Tipo === current.Tipo)
    if (!existing || current.ValorTotalComTaxa > existing.ValorTotalComTaxa) {
      return [...acc.filter(fare => fare.Tipo !== current.Tipo), current]
    }
    return acc
  }, [] as CachedFare[])
  
  fareCache.set(key, uniqueFares)
  
  console.log(`💾 Cache: Adicionadas ${fares.length} tarifas para voo ${key}`)
  console.log(`💾 Cache: Total de ${uniqueFares.length} tarifas únicas no cache para este voo`)
}

// Função para buscar tarifas do cache
export const getFaresFromCache = (flightKey: FlightKey): CachedFare[] => {
  const key = generateFlightKey(flightKey.flightNumber, flightKey.route, flightKey.departure)
  const fares = fareCache.get(key) || []
  
  console.log(`🔍 Cache: Buscando tarifas para voo ${key}, encontradas ${fares.length} tarifas`)
  
  return fares
}

// Função para combinar tarifas de múltiplas fontes
export const getMaxFares = (
  currentFlightFares: any[],
  relatedFlightsFares: any[],
  flightKey: FlightKey,
  currentFlightPrice: number
): CachedFare[] => {
  
  // 1. Converter tarifas do voo atual
  const currentFares = currentFlightFares.map(tarifa => ({
    Tipo: tarifa.Tipo,
    ValorAdulto: tarifa.ValorAdulto,
    ValorTotalComTaxa: currentFlightPrice,
    BagagensInclusas: tarifa.BagagensInclusas,
    timestamp: Date.now()
  }))
  
  // 2. Adicionar tarifas atuais ao cache
  addFaresToCache(flightKey, currentFares)
  
  // 3. Adicionar tarifas dos voos relacionados ao cache
  relatedFlightsFares.forEach(relatedData => {
    const relatedFares = relatedData.tarifas.map((tarifa: any) => ({
      Tipo: tarifa.Tipo,
      ValorAdulto: tarifa.ValorAdulto,
      ValorTotalComTaxa: relatedData.price,
      BagagensInclusas: tarifa.BagagensInclusas,
      timestamp: Date.now()
    }))
    addFaresToCache(flightKey, relatedFares)
  })
  
  // 4. Buscar todas as tarifas do cache (agora com dados completos)
  const allCachedFares = getFaresFromCache(flightKey)
  
  // 5. Garantir que temos pelo menos as tarifas básicas
  const finalFares = allCachedFares.length > 0 ? allCachedFares : currentFares
  
  console.log(`✅ Cache: Retornando ${finalFares.length} tarifas para o modal`)
  console.log(`✅ Cache: Tarifas encontradas:`, finalFares.map(f => ({ tipo: f.Tipo, preco: f.ValorTotalComTaxa })))
  
  return finalFares
}

// Função para limpar cache antigo (opcional)
export const cleanOldCache = (maxAgeMinutes: number = 30): void => {
  const now = Date.now()
  const maxAge = maxAgeMinutes * 60 * 1000
  
  fareCache.forEach((fares, key) => {
    const validFares = fares.filter(fare => (now - fare.timestamp) < maxAge)
    if (validFares.length === 0) {
      fareCache.delete(key)
      console.log(`🧹 Cache: Removido cache expirado para voo ${key}`)
    } else if (validFares.length < fares.length) {
      fareCache.set(key, validFares)
      console.log(`🧹 Cache: Removidas ${fares.length - validFares.length} tarifas expiradas para voo ${key}`)
    }
  })
}

// Função para debug do cache
export const debugCache = (): void => {
  console.log(`🔍 DEBUG Cache: Total de voos no cache: ${fareCache.size}`)
  fareCache.forEach((fares, key) => {
    console.log(`🔍 DEBUG Cache: Voo ${key} tem ${fares.length} tarifas:`, 
      fares.map(f => ({ tipo: f.Tipo, preco: f.ValorTotalComTaxa })))
  })
}
