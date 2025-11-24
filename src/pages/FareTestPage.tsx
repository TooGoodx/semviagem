import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import moblixApiService from '../services/moblixApiService';

const FareTestPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [selectedTest, setSelectedTest] = useState('basic');

  // Parâmetros de teste padrão
  const defaultParams = {
    origem: 'GRU',
    destino: 'GIG', 
    ida: '2025-09-15',
    volta: '2025-09-20',
    adultos: 1,
    criancas: 0,
    bebes: 0,
    companhia: 1, // LATAM
    soIda: false
  };

  const testBasicFareSearch = async () => {
    setIsLoading(true);
    setTestResults(null);
    
    try {
      console.log('🧪 TESTE: Busca básica de voos na API Moblix');
      
      const result = await moblixApiService.consultarVoos(defaultParams);
      
      console.log('📊 Resultado da busca básica:', result);
      
      setTestResults({
        type: 'basic',
        data: result,
        summary: `Encontrados ${result?.Data?.[0]?.Ida?.length || 0} voos básicos`
      });
      
      toast.success('✅ Teste básico concluído!');
      
    } catch (error: any) {
      console.error('❌ Erro no teste básico:', error);
      toast.error(`❌ Erro: ${error.message}`);
      setTestResults({
        type: 'basic',
        error: error.message,
        summary: 'Falha na busca básica'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testMultipleFares = async () => {
    setIsLoading(true);
    setTestResults(null);
    
    try {
      console.log('🧪 TESTE: Busca de múltiplas tarifas na API Moblix');
      
      const tarifas = await moblixApiService.buscarMultiplasTarifas(defaultParams);
      
      console.log('📊 Tarifas encontradas:', tarifas);
      
      // Conta quantas tarifas foram encontradas
      const foundFares = Object.entries(tarifas).filter(([key, value]) => value !== null);
      
      setTestResults({
        type: 'multiple',
        data: tarifas,
        summary: `Encontradas ${foundFares.length} tarifas diferentes: ${foundFares.map(([key]) => key).join(', ')}`
      });
      
      toast.success(`✅ Teste de múltiplas tarifas concluído! ${foundFares.length} tarifas encontradas`);
      
    } catch (error: any) {
      console.error('❌ Erro no teste de múltiplas tarifas:', error);
      toast.error(`❌ Erro: ${error.message}`);
      setTestResults({
        type: 'multiple',
        error: error.message,
        summary: 'Falha na busca de múltiplas tarifas'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testCategorizedFares = async () => {
    setIsLoading(true);
    setTestResults(null);
    
    try {
      console.log('🧪 TESTE: Busca e categorização de tarifas');
      
      // Primeiro busca as tarifas
      const tarifas = await moblixApiService.buscarMultiplasTarifas(defaultParams);
      
      // Depois categoriza
      const categorizadas = moblixApiService.categorizarTarifas(tarifas);
      
      console.log('📊 Tarifas categorizadas:', categorizadas);
      
      setTestResults({
        type: 'categorized',
        data: { original: tarifas, categorized: categorizadas },
        summary: `Categorizadas: ${Object.entries(categorizadas).filter(([key, value]) => value !== null).map(([key]) => key).join(', ')}`
      });
      
      toast.success('✅ Teste de categorização concluído!');
      
    } catch (error: any) {
      console.error('❌ Erro no teste de categorização:', error);
      toast.error(`❌ Erro: ${error.message}`);
      setTestResults({
        type: 'categorized',
        error: error.message,
        summary: 'Falha na categorização de tarifas'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSpecificFareTypes = async () => {
    setIsLoading(true);
    setTestResults(null);
    
    try {
      console.log('🧪 TESTE: Busca de tipos específicos de tarifa');
      
      const results = {
        economica: null,
        executiva: null,
        primeira: null
      };
      
      // Testa classe econômica
      try {
        const econResult = await moblixApiService.consultarVoos({
          ...defaultParams,
          classe: 'economica'
        });
        results.economica = econResult;
        console.log('✅ Classe econômica testada');
      } catch (error) {
        console.log('⚠️ Erro na classe econômica:', (error as Error).message);
      }
      
      // Testa classe executiva
      try {
        const execResult = await moblixApiService.consultarVoos({
          ...defaultParams,
          classe: 'executiva'
        });
        results.executiva = execResult;
        console.log('✅ Classe executiva testada');
      } catch (error) {
        console.log('⚠️ Erro na classe executiva:', (error as Error).message);
      }
      
      // Testa primeira classe
      try {
        const primeiraResult = await moblixApiService.consultarVoos({
          ...defaultParams,
          classe: 'primeira'
        });
        results.primeira = primeiraResult;
        console.log('✅ Primeira classe testada');
      } catch (error) {
        console.log('⚠️ Erro na primeira classe:', (error as Error).message);
      }
      
      setTestResults({
        type: 'classes',
        data: results,
        summary: `Classes testadas: ${Object.entries(results).filter(([key, value]) => value !== null).map(([key]) => key).join(', ')}`
      });
      
      toast.success('✅ Teste de classes específicas concluído!');
      
    } catch (error: any) {
      console.error('❌ Erro no teste de classes:', error);
      toast.error(`❌ Erro: ${error.message}`);
      setTestResults({
        type: 'classes',
        error: error.message,
        summary: 'Falha no teste de classes'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runTest = () => {
    switch (selectedTest) {
      case 'basic':
        testBasicFareSearch();
        break;
      case 'multiple':
        testMultipleFares();
        break;
      case 'categorized':
        testCategorizedFares();
        break;
      case 'classes':
        testSpecificFareTypes();
        break;
      default:
        testBasicFareSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Teste API Moblix - Múltiplas Tarifas
          </h1>
          <p className="text-xl text-gray-600">
            Testando busca de diferentes tipos de tarifas (Light, Standard, Full, Premium Economy)
          </p>
        </div>

        {/* Test Configuration */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuração do Teste</h2>
          
          {/* Test Parameters */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Parâmetros do Teste:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><strong>Origem:</strong> {defaultParams.origem}</div>
              <div><strong>Destino:</strong> {defaultParams.destino}</div>
              <div><strong>Ida:</strong> {defaultParams.ida}</div>
              <div><strong>Volta:</strong> {defaultParams.volta}</div>
              <div><strong>Adultos:</strong> {defaultParams.adultos}</div>
              <div><strong>Companhia:</strong> LATAM (ID: {defaultParams.companhia})</div>
            </div>
          </div>

          {/* Test Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Teste:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setSelectedTest('basic')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTest === 'basic'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Busca Básica</div>
                <div className="text-sm text-gray-600">Teste padrão da API</div>
              </button>
              
              <button
                onClick={() => setSelectedTest('multiple')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTest === 'multiple'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Múltiplas Tarifas</div>
                <div className="text-sm text-gray-600">Light, Standard, Full, Premium</div>
              </button>
              
              <button
                onClick={() => setSelectedTest('categorized')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTest === 'categorized'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Categorizadas</div>
                <div className="text-sm text-gray-600">Recomendado, Mais rápido, Mais econômico</div>
              </button>
              
              <button
                onClick={() => setSelectedTest('classes')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTest === 'classes'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Classes Específicas</div>
                <div className="text-sm text-gray-600">Econômica, Executiva, Primeira</div>
              </button>
            </div>
          </div>

          {/* Run Test Button */}
          <button
            onClick={runTest}
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Testando API Moblix...
              </span>
            ) : (
              `🚀 Executar Teste: ${
                selectedTest === 'basic' ? 'Busca Básica' :
                selectedTest === 'multiple' ? 'Múltiplas Tarifas' :
                selectedTest === 'categorized' ? 'Tarifas Categorizadas' :
                'Classes Específicas'
              }`
            )}
          </button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                📊 Resultados do Teste
              </h2>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                testResults.error 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {testResults.error ? '❌ Erro' : '✅ Sucesso'}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Resumo:</h3>
              <p className="text-gray-700">{testResults.summary}</p>
            </div>

            {/* Error Display */}
            {testResults.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-800 mb-2">Erro Encontrado:</h3>
                <p className="text-red-700 font-mono text-sm">{testResults.error}</p>
              </div>
            )}

            {/* Data Display */}
            {testResults.data && (
              <div className="space-y-6">
                {/* Basic Test Results */}
                {testResults.type === 'basic' && testResults.data?.Data?.[0]?.Ida && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Voos Encontrados na Busca Básica ({testResults.data.Data[0].Ida.length})
                    </h3>
                    <div className="space-y-3">
                      {testResults.data.Data[0].Ida.slice(0, 3).map((flight: any, index: number) => (
                        <div key={index} className="bg-blue-50 rounded-lg p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><strong>Voo:</strong> {flight.NumeroVoo || 'N/A'}</div>
                            <div><strong>Preço:</strong> R$ {(flight.ValorTotalComTaxa || flight.ValorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            <div><strong>Duração:</strong> {flight.DuracaoVoo || 'N/A'}</div>
                            <div><strong>Companhia:</strong> {flight.CompanhiaAerea || 'N/A'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multiple Fares Results */}
                {testResults.type === 'multiple' && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Múltiplas Tarifas Encontradas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(testResults.data).map(([fareType, fareData]: [string, any]) => (
                        <div key={fareType} className={`rounded-lg p-4 ${
                          fareData ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <h4 className="font-semibold text-gray-800 mb-2 capitalize">{fareType}</h4>
                          {fareData ? (
                            <div className="text-sm space-y-1">
                              <div><strong>Preço:</strong> {fareData.formattedPrice}</div>
                              <div><strong>Airline:</strong> {fareData.airline}</div>
                              <div><strong>Duração:</strong> {fareData.duration}</div>
                              <div><strong>Adicional:</strong> +R$ {fareData.features?.additionalPrice || 0}</div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">Não encontrada</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categorized Results */}
                {testResults.type === 'categorized' && testResults.data?.categorized && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Tarifas Categorizadas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {Object.entries(testResults.data.categorized).map(([category, fareData]: [string, any]) => (
                        <div key={category} className={`rounded-lg p-6 border-2 ${
                          fareData 
                            ? category === 'recomendado' ? 'bg-yellow-50 border-yellow-300' :
                              category === 'maisRapido' ? 'bg-blue-50 border-blue-300' :
                              'bg-green-50 border-green-300'
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <h4 className="font-bold text-lg mb-3 capitalize">
                            {category === 'recomendado' ? '⭐ Recomendado' :
                             category === 'maisRapido' ? '⚡ Mais Rápido' :
                             '💰 Mais Econômico'}
                          </h4>
                          {fareData ? (
                            <div className="space-y-2 text-sm">
                              <div><strong>Tipo Original:</strong> {fareData.type}</div>
                              <div><strong>Preço:</strong> {fareData.formattedPrice}</div>
                              <div><strong>+ Adicional:</strong> R$ {fareData.features?.additionalPrice || 0}</div>
                              <div><strong>Total:</strong> R$ {(fareData.price + (fareData.features?.additionalPrice || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                              <div><strong>Airline:</strong> {fareData.airline}</div>
                              <div><strong>Duração:</strong> {fareData.duration}</div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">Não disponível</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Classes Results */}
                {testResults.type === 'classes' && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Resultados por Classe de Cabine</h3>
                    <div className="space-y-4">
                      {Object.entries(testResults.data).map(([className, classData]: [string, any]) => (
                        <div key={className} className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-2 capitalize">
                            {className === 'economica' ? '💺 Classe Econômica' :
                             className === 'executiva' ? '✨ Classe Executiva' :
                             '👑 Primeira Classe'}
                          </h4>
                          {classData?.Data?.[0]?.Ida?.length > 0 ? (
                            <div className="text-sm">
                              <div className="text-green-700 font-medium">
                                ✅ {classData.Data[0].Ida.length} voos encontrados
                              </div>
                              <div className="mt-2">
                                <strong>Primeiro voo:</strong> {classData.Data[0].Ida[0]?.NumeroVoo || 'N/A'} - 
                                R$ {(classData.Data[0].Ida[0]?.ValorTotalComTaxa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">❌ Nenhum voo encontrado</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Raw Data Display (for debugging) */}
            <details className="mt-8">
              <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                🔧 Ver Dados Brutos da API (Debug)
              </summary>
              <div className="mt-4 bg-gray-800 text-green-400 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-xs">
                  {JSON.stringify(testResults.data, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Instruções</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <strong>1. Busca Básica:</strong> Testa a funcionalidade padrão da API Moblix para verificar se a conexão está funcionando.
            </div>
            <div>
              <strong>2. Múltiplas Tarifas:</strong> Tenta buscar 4 tipos diferentes de tarifa (Light, Standard, Full, Premium Economy) usando diferentes parâmetros.
            </div>
            <div>
              <strong>3. Tarifas Categorizadas:</strong> Busca todas as tarifas e depois as categoriza em "Recomendado", "Mais rápido" e "Mais econômico".
            </div>
            <div>
              <strong>4. Classes Específicas:</strong> Testa busca por diferentes classes de cabine (Econômica, Executiva, Primeira).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FareTestPage;
