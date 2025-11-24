// Arquivo de teste para validar o sistema de cache de tarifas maximizadas
// Este arquivo pode ser importado temporariamente para testar o sistema

import { getMaximizedFares, validateMaximizedFares } from './fareMaximizer'
import { debugCache, cleanOldCache } from './fareCache'

// Mock de dados de teste baseado na API Moblix real
const createMockFlightData = (token: string, flightNumber: string, price: number, fareType: string = 'STANDARD') => ({
  Token: token,
  Cia: {
    Nome: 'Latam',
    Iata: 'LA'
  },
  Voos: [{
    Numero: flightNumber,
    Saida: '2025-01-15T08:00:00',
    Chegada: '2025-01-15T10:30:00',
    Origem: 'GRU',
    Destino: 'GIG',
    Duracao: 150,
    Tempo: '2h 30m'
  }],
  Tarifas: [{
    Tipo: fareType,
    ValorAdulto: price - 50,
    ValorCrianca: price - 100,
    TaxaEmbarque: 50,
    Classe: 'Y',
    BagagensInclusas: [{
      Bagagem: 1,
      TextoBagagem: '1 bagagem despachada 23 kg',
      Quantidade: 1
    }]
  }],
  ValorAdulto: price - 50,
  ValorTotalComTaxa: price,
  Origem: 'GRU',
  Destino: 'GIG',
  Saida: '2025-01-15T08:00:00',
  Chegada: '2025-01-15T10:30:00',
  TempoTotalStr: '2h 30m'
})

// Função de teste principal
export const testFareMaximizerSystem = () => {
  console.log('🧪 INICIANDO TESTE DO SISTEMA DE CACHE DE TARIFAS')
  
  // Limpar cache antes do teste
  cleanOldCache(0) // Remove tudo
  console.log('🧹 Cache limpo para teste')
  
  // Cenário 1: Primeira abertura (sem dados em allFlights)
  console.log('\n📅 CENÁRIO 1: Primeira abertura do modal (allFlights vazio)')
  
  const mainFlight = createMockFlightData('TOKEN_001', 'LA3001', 345, 'LIGHT')
  const result1 = getMaximizedFares(mainFlight, []) // allFlights vazio
  
  console.log('📊 Resultado 1ª abertura:', {
    totalFares: result1.length,
    prices: result1.map(f => f.ValorTotalComTaxa)
  })
  
  // Validar primeira abertura
  const isValid1 = validateMaximizedFares(result1)
  console.log(`✅ Primeira abertura válida: ${isValid1}`)
  
  // Cenário 2: Segunda abertura (com dados em allFlights)
  console.log('\n📅 CENÁRIO 2: Segunda abertura do modal (allFlights populado)')
  
  const relatedFlights = [
    createMockFlightData('TOKEN_002', 'LA3001', 1716, 'LIGHT'), // Mesmo voo, preço mais alto
    createMockFlightData('TOKEN_003', 'LA3001', 1850, 'STANDARD'),
    createMockFlightData('TOKEN_004', 'LA3001', 1969, 'FULL'),
    createMockFlightData('TOKEN_005', 'LA3001', 1989, 'PREMIUM ECONOMY')
  ]
  
  const allFlights = [mainFlight, ...relatedFlights]
  const result2 = getMaximizedFares(mainFlight, allFlights)
  
  console.log('📊 Resultado 2ª abertura:', {
    totalFares: result2.length,
    prices: result2.map(f => f.ValorTotalComTaxa)
  })
  
  // Validar segunda abertura
  const isValid2 = validateMaximizedFares(result2)
  console.log(`✅ Segunda abertura válida: ${isValid2}`)
  
  // Cenário 3: Terceira abertura (deve usar cache)
  console.log('\n📅 CENÁRIO 3: Terceira abertura do modal (usando cache)')
  
  const result3 = getMaximizedFares(mainFlight, []) // allFlights vazio novamente, mas cache deve ter dados
  
  console.log('📊 Resultado 3ª abertura:', {
    totalFares: result3.length,
    prices: result3.map(f => f.ValorTotalComTaxa)
  })
  
  // Validar terceira abertura
  const isValid3 = validateMaximizedFares(result3)
  console.log(`✅ Terceira abertura válida: ${isValid3}`)
  
  // Comparar resultados
  console.log('\n🔍 COMPARAÇÃO DOS RESULTADOS:')
  
  const prices1 = result1.map(f => f.ValorTotalComTaxa).sort((a, b) => a - b)
  const prices2 = result2.map(f => f.ValorTotalComTaxa).sort((a, b) => a - b)
  const prices3 = result3.map(f => f.ValorTotalComTaxa).sort((a, b) => a - b)
  
  console.log('💰 Preços 1ª abertura:', prices1)
  console.log('💰 Preços 2ª abertura:', prices2)
  console.log('💰 Preços 3ª abertura:', prices3)
  
  // Verificar se a 2ª e 3ª aberturas têm valores consistentes
  const prices2Str = JSON.stringify(prices2)
  const prices3Str = JSON.stringify(prices3)
  
  const isConsistent = prices2Str === prices3Str
  console.log(`🎯 Consistência entre 2ª e 3ª abertura: ${isConsistent ? '✅ SIM' : '❌ NÃO'}`)
  
  // Verificar se os valores da 2ª/3ª abertura são maiores que a 1ª
  const maxPrice1 = Math.max(...prices1)
  const minPrice2 = Math.min(...prices2)
  
  const hasImprovement = minPrice2 >= maxPrice1
  console.log(`📈 Melhoria de preços após cache: ${hasImprovement ? '✅ SIM' : '❌ NÃO'}`)
  
  // Debug do cache
  console.log('\n🔍 DEBUG DO CACHE:')
  debugCache()
  
  // Resultado final do teste
  console.log('\n🏁 RESULTADO FINAL DO TESTE:')
  console.log(`✅ Primeira abertura: ${isValid1 ? 'OK' : 'FALHOU'}`)
  console.log(`✅ Segunda abertura: ${isValid2 ? 'OK' : 'FALHOU'}`)
  console.log(`✅ Terceira abertura: ${isValid3 ? 'OK' : 'FALHOU'}`)
  console.log(`✅ Consistência: ${isConsistent ? 'OK' : 'FALHOU'}`)
  console.log(`✅ Melhoria: ${hasImprovement ? 'OK' : 'FALHOU'}`)
  
  const allTestsPassed = isValid1 && isValid2 && isValid3 && isConsistent && hasImprovement
  console.log(`\n🎉 TODOS OS TESTES: ${allTestsPassed ? '✅ PASSOU' : '❌ FALHOU'}`)
  
  return {
    passed: allTestsPassed,
    results: {
      firstOpening: { valid: isValid1, prices: prices1 },
      secondOpening: { valid: isValid2, prices: prices2 },
      thirdOpening: { valid: isValid3, prices: prices3 },
      consistent: isConsistent,
      improved: hasImprovement
    }
  }
}

// Função para executar teste rápido no console
export const quickTest = () => {
  console.log('🚀 Executando teste rápido do sistema de cache...')
  return testFareMaximizerSystem()
}
