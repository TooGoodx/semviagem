import React from 'react'
import { useUser } from '../../context/UserContext'
import { getUpgradeRecommendation, Permissions } from '../../hooks/usePermissions'

interface FeatureUpgradePromptProps {
  feature: keyof Permissions
  customMessage?: string
  compact?: boolean
}

export function FeatureUpgradePrompt({
  feature,
  customMessage,
  compact = false
}: FeatureUpgradePromptProps) {
  const { subscription_status } = useUser()

  const recommendation = getUpgradeRecommendation(subscription_status, feature)

  const getFeatureContext = () => {
    switch (feature) {
      case 'canSearchUnlimited':
        return {
          icon: '🚀',
          title: 'Busca Ilimitada',
          description: customMessage || 'Busque voos em qualquer data, sem limites de tempo.',
          ctaText: 'Liberar Busca Ilimitada'
        }
      case 'canCreateAlerts':
        return {
          icon: '🔔',
          title: 'Alertas de Preço',
          description: customMessage || 'Monitore automaticamente quedas de preço e receba notificações.',
          ctaText: 'Ativar Alertas'
        }
      case 'canAccessDashboard':
        return {
          icon: '📊',
          title: 'Dashboard Premium',
          description: customMessage || 'Gerencie seus alertas e acompanhe seu histórico de viagens.',
          ctaText: 'Acessar Dashboard'
        }
      default:
        return {
          icon: '⭐',
          title: 'Recurso Premium',
          description: customMessage || 'Este recurso está disponível nos planos pagos.',
          ctaText: 'Fazer Upgrade'
        }
    }
  }

  const context = getFeatureContext()

  if (compact) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
        <p className="text-sm text-blue-800 mb-2">
          {context.icon} <strong>{context.title}</strong>
        </p>
        <button
          onClick={() => window.location.href = recommendation.stripeLink}
          className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          {recommendation.price} - {context.ctaText}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center max-w-md mx-auto">
      {/* Feature Icon */}
      <div
        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl text-white font-bold"
        style={{ backgroundColor: '#060D1C' }}
      >
        {context.icon}
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {context.title}
      </h3>

      <p className="text-gray-600 mb-4">
        {context.description}
      </p>

      {/* Benefits List */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
        <h4 className="font-semibold text-gray-900 mb-2">
          Incluído no {recommendation.targetPlan}:
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          {recommendation.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* Pricing */}
      <div
        className="inline-block rounded-lg px-4 py-2 mb-4 font-bold text-lg"
        style={{ backgroundColor: '#F0C730', color: '#1F2937' }}
      >
        {recommendation.price}
      </div>

      {/* CTA Button */}
      <button
        onClick={() => {
          console.log(`🔄 Upgrade to ${recommendation.targetPlan} clicked`)
          window.location.href = recommendation.stripeLink
        }}
        className="w-full text-white font-semibold py-3 px-4 rounded-lg transition-opacity hover:opacity-90 mb-3"
        style={{ backgroundColor: '#060D1C' }}
      >
        {context.ctaText}
      </button>

      {/* Secondary Action */}
      <button
        onClick={() => console.log('ℹ️ Learn more about plans clicked')}
        className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
      >
        Ver Todos os Planos
      </button>
    </div>
  )
}
