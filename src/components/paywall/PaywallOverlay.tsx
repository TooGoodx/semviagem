import React from 'react'

interface PaywallOverlayProps {
  isVisible: boolean
  onClose: () => void
  flightCount?: number
  context?: 'flights' | 'search'
}

export function PaywallOverlay({
  isVisible,
  onClose,
  flightCount = 0,
  context = 'flights'
}: PaywallOverlayProps) {
  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with brand gradient */}
        <div
          className="text-white p-6 rounded-t-2xl relative"
          style={{ background: 'linear-gradient(135deg, #4896C7 0%, #3B82C7 100%)' }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl w-8 h-8 flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            ×
          </button>

          <div className="text-center">
            <div className="text-3xl mb-2" aria-hidden="true">✈️</div>
            <h3
              id="paywall-title"
              className="text-xl font-bold mb-1"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {flightCount > 0 ? `${flightCount} Voos Encontrados!` : 'Voos Disponíveis!'}
            </h3>
            <p className="text-blue-100 italic text-sm">
              Viaje o mundo <span style={{ fontFamily: 'Playfair Display, serif' }}>quase de graça</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-center mb-6">
            Para ver todos os resultados e comparar preços,
            assine o <strong>Busca Ilimitada</strong>.
          </p>

          {/* Benefits with brand styling */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              O que você ganha:
            </h4>
            <ul className="space-y-2" role="list">
              {flightCount > 0 && (
                <li className="flex items-center text-sm text-gray-700">
                  <span className="mr-3" style={{ color: '#22C55E' }} aria-hidden="true">✓</span>
                  Ver todos os {flightCount} voos encontrados
                </li>
              )}
              <li className="flex items-center text-sm text-gray-700">
                <span className="mr-3" style={{ color: '#22C55E' }} aria-hidden="true">✓</span>
                Buscar até 365 dias no futuro
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <span className="mr-3" style={{ color: '#22C55E' }} aria-hidden="true">✓</span>
                Histórico completo de buscas
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <span className="mr-3" style={{ color: '#22C55E' }} aria-hidden="true">✓</span>
                Comparar preços entre companhias
              </li>
            </ul>
          </div>

          {/* Pricing with yellow accent */}
          <div className="text-center mb-6">
            <div
              className="inline-block rounded-lg px-4 py-2"
              style={{ backgroundColor: '#F0C730', color: '#1F2937' }}
            >
              <span className="font-bold text-lg">
                R$ 29,90<span className="text-sm font-normal">/mês</span>
              </span>
            </div>
          </div>

          {/* CTA with brand color (V2: Navy Primary) */}
          <button
            onClick={() => {
              // Navigate to checkout (will be implemented in future sprint)
              window.location.href = '/checkout?plan=busca_ilimitada'
            }}
            className="w-full text-white font-bold py-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] mb-3 shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#060D1C' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0a1428';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#060D1C';
            }}
          >
            Assinar Busca Ilimitada
          </button>

          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-lg transition-colors"
          >
            Continuar Grátis (limitado)
          </button>

          <p className="text-xs text-center text-gray-500 mt-4">
            Cancele quando quiser • Sem taxas ocultas
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
