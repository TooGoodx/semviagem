import { useUser } from '../context/UserContext'

export interface Permissions {
  // Search permissions
  canSearchUnlimited: boolean
  searchDayLimit: number | null  // null = unlimited

  // Alert permissions
  canCreateAlerts: boolean
  canAccessDashboard: boolean
  maxAlerts: number

  // UI permissions
  canAccessPremiumFeatures: boolean
  canSeeAdvancedFilters: boolean
}

export function usePermissions(): Permissions {
  const { subscription_status } = useUser()

  console.log('🔍 Calculating permissions for subscription:', subscription_status)

  // Calculate permissions based on subscription
  const permissions: Permissions = {
    // Search permissions
    canSearchUnlimited: subscription_status !== 'free',
    searchDayLimit: subscription_status === 'free' ? 60 : null, // null = unlimited

    // Alert permissions
    canCreateAlerts: subscription_status === 'alertas_inteligentes',
    canAccessDashboard: subscription_status === 'alertas_inteligentes',
    maxAlerts: subscription_status === 'alertas_inteligentes' ? 10 : 0,

    // UI permissions
    canAccessPremiumFeatures: subscription_status !== 'free',
    canSeeAdvancedFilters: subscription_status !== 'free'
  }

  console.log('🔐 User permissions:', {
    subscription: subscription_status,
    canSearchUnlimited: permissions.canSearchUnlimited,
    searchLimit: permissions.searchDayLimit ? `${permissions.searchDayLimit} days` : 'unlimited',
    canCreateAlerts: permissions.canCreateAlerts,
    maxAlerts: permissions.maxAlerts
  })

  return permissions
}

// Helper functions for common permission checks
export function canSearchDate(date: string, permissions: Permissions): boolean {
  if (permissions.canSearchUnlimited) return true

  if (permissions.searchDayLimit === null) return true

  const searchDate = new Date(date)
  const today = new Date()
  const diffTime = Math.abs(searchDate.getTime() - today.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays <= permissions.searchDayLimit
}

export function getUpgradeRecommendation(currentPlan: string, desiredFeature: keyof Permissions): {
  targetPlan: string
  price: string
  stripeLink: string
  benefits: string[]
} {
  const recommendations = {
    // For search limits
    canSearchUnlimited: {
      targetPlan: 'Busca Ilimitada',
      price: 'R$ 19,90/mês',
      stripeLink: 'https://buy.stripe.com/cNibJ3eAJetJ0ovfERdMI05',
      benefits: [
        'Busca em qualquer data (sem limites)',
        'Filtros avançados',
        'Histórico completo de buscas',
        'Suporte prioritário'
      ]
    },
    // For alerts
    canCreateAlerts: {
      targetPlan: 'Alertas Inteligentes',
      price: 'R$ 29,90/mês',
      stripeLink: 'https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI02',
      benefits: [
        'Busca ilimitada em qualquer data',
        'Até 10 alertas de preço ativos',
        'Notificações via WhatsApp',
        'Dashboard personalizado',
        'Relatórios de economia'
      ]
    },
    canAccessDashboard: {
      targetPlan: 'Alertas Inteligentes',
      price: 'R$ 29,90/mês',
      stripeLink: 'https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI02',
      benefits: [
        'Busca ilimitada em qualquer data',
        'Até 10 alertas de preço ativos',
        'Notificações via WhatsApp',
        'Dashboard personalizado',
        'Relatórios de economia'
      ]
    }
  }

  return recommendations[desiredFeature] || recommendations.canSearchUnlimited
}
