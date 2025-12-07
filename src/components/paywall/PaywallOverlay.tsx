import React from 'react'
import IconBusca from '../icons/IconBusca'

interface PaywallOverlayProps {
  isVisible: boolean
  onClose: () => void
  flightCount?: number
  searchDates?: { ida?: string; volta?: string }
}

export function PaywallOverlay({
  isVisible,
  onClose,
  flightCount = 0,
  searchDates
}: PaywallOverlayProps) {
  if (!isVisible) return null

  // Helper to safely parse and format dates
  const formatSearchDate = (dateString: string): string => {
    // Try parsing as ISO format first
    let date = new Date(dateString)

    // If invalid, try DD/MM/YYYY format
    if (isNaN(date.getTime()) && dateString.includes('/')) {
      const [day, month, year] = dateString.split('/')
      date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
    }

    return !isNaN(date.getTime()) ? date.toLocaleDateString('pt-BR') : dateString
  }

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
            {/* Professional icon - Busca Voos */}
            <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center">
              <IconBusca size={80} ariaHidden />
            </div>
            <h3
              id="paywall-title"
              className="text-xl font-bold mb-1"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              {flightCount > 0 ? `${flightCount} Voos Encontrados!` : 'Voos Disponíveis!'}
            </h3>
            <p className="text-blue-100 italic text-sm">
              Viaje o mundo <span style={{ fontFamily: 'Cormorant Garamond, serif' }}>quase de graça</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-center mb-6">
            {searchDates?.ida ? (
              <>
                Para buscar voos em{' '}
                <strong>{formatSearchDate(searchDates.ida)}</strong>
                {searchDates.volta && (
                  <> até <strong>{formatSearchDate(searchDates.volta)}</strong></>
                )}, assine o <strong>Busca Ilimitada</strong>.
              </>
            ) : (
              <>Para ver todos os resultados e comparar preços, assine o <strong>Busca Ilimitada</strong>.</>
            )}
          </p>

          {/* Benefits with brand styling */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              O que você ganha:
            </h4>
            <ul className="space-y-2" role="list">
              {flightCount > 0 && (
                <li className="flex items-center text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full mr-3" style={{ backgroundColor: '#22C55E' }} aria-hidden="true"></span>
                  Ver todos os {flightCount} voos encontrados
                </li>
              )}
              <li className="flex items-center text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full mr-3" style={{ backgroundColor: '#22C55E' }} aria-hidden="true"></span>
                Buscar até 365 dias no futuro
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full mr-3" style={{ backgroundColor: '#22C55E' }} aria-hidden="true"></span>
                Histórico completo de buscas
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full mr-3" style={{ backgroundColor: '#22C55E' }} aria-hidden="true"></span>
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
                R$ 19,90<span className="text-sm font-normal">/mês</span>
              </span>
            </div>
          </div>

          {/* CTA with brand color (V2: Navy Primary) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔗 Redirecionando para Stripe - Busca Ilimitada');
              window.location.href = 'https://buy.stripe.com/cNibJ3eAJetJ0ovfERdMI05';
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
