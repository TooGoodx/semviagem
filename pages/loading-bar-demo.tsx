"use client"

import { useState } from 'react'
import SimplifiedLoadingBar from '../components/SimplifiedLoadingBar'

export default function LoadingBarDemo() {
  const [isLoading, setIsLoading] = useState(false)

  const simulateFlightSearch = () => {
    setIsLoading(true)
    
    // Simula uma busca de voos que demora entre 8-12 segundos
    setTimeout(() => {
      setIsLoading(false)
    }, Math.random() * 4000 + 8000) // Entre 8-12 segundos
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Demonstração da Barra de Carregamento Simplificada
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Nova experiência focada em mensagens atrativas e progresso visual
          </p>
        </div>

        {/* Cartão de demonstração */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Teste a Nova Barra de Carregamento
            </h2>
            
            <div className="space-y-4 mb-8">
              <p className="text-gray-600">
                ✨ Mensagens motivacionais que mudam automaticamente
              </p>
              <p className="text-gray-600">
                📊 Progresso visual suave e realista
              </p>
              <p className="text-gray-600">
                🎨 Design limpo e moderno
              </p>
              <p className="text-gray-600">
                💡 Dicas úteis durante o carregamento
              </p>
            </div>

            <button
              onClick={simulateFlightSearch}
              disabled={isLoading}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                isLoading 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full mr-3"></div>
                  Buscando voos...
                </span>
              ) : (
                '✈️ Simular Busca de Voos'
              )}
            </button>
          </div>
        </div>

        {/* Recursos da barra de carregamento */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Mensagens Dinâmicas
              </h3>
              <p className="text-gray-600 text-sm">
                5 mensagens cuidadosamente selecionadas que mudam a cada 2.5 segundos para manter o usuário engajado
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Progresso Realista
              </h3>
              <p className="text-gray-600 text-sm">
                Barra de progresso que simula o carregamento real, parando em 95% até a conclusão
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Design Moderno
              </h3>
              <p className="text-gray-600 text-sm">
                Interface clean com animações suaves e elementos visuais atraentes
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Informações Úteis
              </h3>
              <p className="text-gray-600 text-sm">
                Dicas contextuais que educam o usuário sobre o processo de busca
              </p>
            </div>
          </div>
        </div>

        {/* Lista das mensagens */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            🗨️ As 5 Mensagens Selecionadas
          </h3>
          <div className="grid gap-3 text-sm text-gray-600">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <span className="mr-3 font-semibold text-blue-600">1.</span>
              <span>✨ Procurando as melhores ofertas para você...</span>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
              <span className="mr-3 font-semibold text-green-600">2.</span>
              <span>🚀 Conectando com as principais companhias aéreas...</span>
            </div>
            <div className="flex items-center p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
              <span className="mr-3 font-semibold text-purple-600">3.</span>
              <span>💎 Encontrando preços especiais e promoções...</span>
            </div>
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <span className="mr-3 font-semibold text-yellow-600">4.</span>
              <span>🎯 Selecionando as opções mais vantajosas...</span>
            </div>
            <div className="flex items-center p-3 bg-pink-50 rounded-lg border-l-4 border-pink-400">
              <span className="mr-3 font-semibold text-pink-600">5.</span>
              <span>⚡ Quase lá! Finalizando sua busca personalizada...</span>
            </div>
          </div>
        </div>

        {/* Instruções de integração */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">
            🔧 Como integrar no seu projeto:
          </h3>
          <div className="bg-white/10 rounded-lg p-4 font-mono text-sm">
            <p className="mb-2">1. Importe o componente:</p>
            <code className="text-yellow-300">import SimplifiedLoadingBar from '../components/SimplifiedLoadingBar'</code>
            
            <p className="mb-2 mt-4">2. Use no seu componente:</p>
            <code className="text-yellow-300">&lt;SimplifiedLoadingBar isLoading={isSearching} /&gt;</code>
            
            <p className="mb-2 mt-4">3. Controle o estado:</p>
            <code className="text-yellow-300">const [isSearching, setIsSearching] = useState(false)</code>
          </div>
        </div>
      </div>

      {/* Componente da barra de carregamento */}
      <SimplifiedLoadingBar isLoading={isLoading} />
    </div>
  )
}
