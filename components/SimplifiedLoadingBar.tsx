"use client"

import { useState, useEffect } from 'react'
import { Plane } from 'lucide-react'

interface SimplifiedLoadingBarProps {
  isLoading?: boolean
  className?: string
}

// 5 mensagens atrativas e impactantes focadas na experiência do usuário
const LOADING_MESSAGES = [
  "✨ Procurando as melhores ofertas para você...",
  "🚀 Conectando com as principais companhias aéreas...",
  "💎 Encontrando preços especiais e promoções...",
  "🎯 Selecionando as opções mais vantajosas...",
  "⚡ Quase lá! Finalizando sua busca personalizada..."
]

export default function SimplifiedLoadingBar({ 
  isLoading = false, 
  className = "" 
}: SimplifiedLoadingBarProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setCurrentMessageIndex(0)
      setProgress(0)
      return
    }

    // Progresso mais dinâmico e visível - sempre em movimento
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const nextValue = prev + Math.random() * 3 + 1
        // Reinicia quando chega no final para manter movimento
        return nextValue >= 100 ? 0 : nextValue
      })
    }, 120) // Mais rápido e fluido

    // Troca de mensagens a cada 2 segundos
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => {
        const nextIndex = (prev + 1) % LOADING_MESSAGES.length
        return nextIndex
      })
    }, 2000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(messageInterval)
    }
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className={`fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${className}`}>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full mx-4 text-center">
        {/* Ícone animado mais discreto */}
        <div className="mb-6">
          <div className="relative">
            <div className="animate-bounce">
              <Plane className="w-10 h-10 text-blue-500 mx-auto" />
            </div>
            {/* Círculos animados mais sutis */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border border-blue-100 rounded-full animate-ping opacity-30"></div>
            </div>
          </div>
        </div>

        {/* Mensagem que muda - SEM título estático */}
        <div className="mb-6">
          <p className="text-gray-700 text-base leading-relaxed min-h-[2rem] flex items-center justify-center font-medium">
            <span key={currentMessageIndex} className="animate-fade-in">
              {LOADING_MESSAGES[currentMessageIndex]}
            </span>
          </p>
        </div>

        {/* Barra de progresso sempre em movimento */}
        <div className="mb-4">
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-200 ease-linear shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Status sem percentual fixo */}
          <p className="text-xs text-gray-500 mt-2">Consultando companhias aéreas...</p>
        </div>

        {/* Spinner mais discreto */}
        <div className="text-xs text-gray-400">
          <span className="inline-flex items-center">
            <span className="animate-spin mr-2">
              <div className="w-3 h-3 border border-gray-300 border-t-green-500 rounded-full"></div>
            </span>
            Aguarde...
          </span>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
