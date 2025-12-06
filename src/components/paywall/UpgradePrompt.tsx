import React, { useState } from 'react'

interface UpgradePromptProps {
  context: 'search-limit' | 'results-found'
  onUpgrade: () => void
  onDismiss?: () => void
}

export function UpgradePrompt({ context, onUpgrade, onDismiss }: UpgradePromptProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  const getContextMessage = () => {
    switch (context) {
      case 'search-limit':
        return {
          icon: '📅',
          title: 'Busque até 365 dias no futuro',
          subtitle: 'Encontre voos em qualquer data com Busca Ilimitada'
        }
      case 'results-found':
        return {
          icon: '✈️',
          title: 'Voos encontrados!',
          subtitle: 'Veja todos os resultados com Busca Ilimitada'
        }
      default:
        return {
          icon: '🚀',
          title: 'Viaje mais',
          subtitle: 'Desbloqueie todas as funcionalidades'
        }
    }
  }

  const content = getContextMessage()

  return (
    <div
      className="rounded-xl p-4 mb-6 relative border"
      style={{
        backgroundColor: '#F8FAFC',
        borderColor: '#E2E8F0'
      }}
      role="alert"
      aria-live="polite"
    >
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl w-6 h-6 flex items-center justify-center transition-colors"
          aria-label="Dispensar"
        >
          ×
        </button>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="text-2xl flex-shrink-0" aria-hidden="true">{content.icon}</div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
              {content.title}
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              {content.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="text-right flex-1 sm:flex-initial">
            <div
              className="text-sm font-bold whitespace-nowrap"
              style={{ color: '#F0C730' }}
            >
              R$ 29,90/mês
            </div>
            <div className="text-xs text-gray-500">
              cancele quando quiser
            </div>
          </div>
          <button
            onClick={onUpgrade}
            className="text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md whitespace-nowrap min-w-[100px]"
            style={{ backgroundColor: '#4896C7' }}
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  )
}
