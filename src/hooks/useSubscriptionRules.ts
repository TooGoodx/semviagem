import { useMemo } from 'react'

// TypeScript interfaces for type safety
export interface SubscriptionRules {
  maxSearchDays: number
  canAccessFlights: boolean
  canAccessHistory: boolean
  canAccessAlerts: boolean
  canCreateAlerts: boolean
  maxAlerts: number
  planName: string
  planDescription: string
  monthlyPrice: number
  features: string[]
}

export type SubscriptionTier = 'free' | 'busca_ilimitada' | 'alertas_inteligentes'

// Business rules configuration
const SUBSCRIPTION_CONFIG: Record<SubscriptionTier, SubscriptionRules> = {
  free: {
    maxSearchDays: 60,
    canAccessFlights: false,
    canAccessHistory: false,
    canAccessAlerts: false,
    canCreateAlerts: false,
    maxAlerts: 0,
    planName: 'Gratuito',
    planDescription: 'Busca básica com limitações',
    monthlyPrice: 0,
    features: [
      'Busca de voos até 60 dias',
      'Visualização limitada de resultados',
      'Suporte básico'
    ]
  },
  busca_ilimitada: {
    maxSearchDays: 365,
    canAccessFlights: true,
    canAccessHistory: true,
    canAccessAlerts: false,
    canCreateAlerts: false,
    maxAlerts: 0,
    planName: 'Busca Ilimitada',
    planDescription: 'Acesso completo a buscas e histórico',
    monthlyPrice: 29.90,
    features: [
      'Busca ilimitada até 365 dias',
      'Acesso completo aos resultados',
      'Histórico de buscas',
      'Comparação de preços avançada',
      'Suporte prioritário'
    ]
  },
  alertas_inteligentes: {
    maxSearchDays: 365,
    canAccessFlights: true,
    canAccessHistory: true,
    canAccessAlerts: true,
    canCreateAlerts: true,
    maxAlerts: 2,
    planName: 'Alertas Inteligentes',
    planDescription: 'Funcionalidades premium + alertas automáticos',
    monthlyPrice: 49.90,
    features: [
      'Todas as funcionalidades do Busca Ilimitada',
      'Alertas inteligentes de preços',
      'Notificações WhatsApp',
      'Monitoramento 24/7',
      'Até 2 alertas simultâneos',
      'Suporte VIP'
    ]
  }
}

// Main hook for subscription rules
export function useSubscriptionRules(subscriptionStatus?: string): SubscriptionRules {
  const rules = useMemo(() => {
    // Validate subscription status and provide fallback
    const tier = (subscriptionStatus as SubscriptionTier) || 'free'

    // Return rules for the user's subscription tier
    if (tier in SUBSCRIPTION_CONFIG) {
      return SUBSCRIPTION_CONFIG[tier]
    }

    // Fallback to free tier for unknown statuses
    console.warn(`Unknown subscription status: ${subscriptionStatus}, falling back to free tier`)
    return SUBSCRIPTION_CONFIG.free
  }, [subscriptionStatus])

  return rules
}

// Helper hook to check specific permissions
export function useSubscriptionPermissions(subscriptionStatus?: string) {
  const rules = useSubscriptionRules(subscriptionStatus)

  const hasPermission = (feature: keyof Pick<SubscriptionRules, 'canAccessFlights' | 'canAccessHistory' | 'canAccessAlerts' | 'canCreateAlerts'>) => {
    return rules[feature]
  }

  const canSearchDaysAhead = (days: number): boolean => {
    return days <= rules.maxSearchDays
  }

  const getUpgradeMessage = (requiredTier: SubscriptionTier): string => {
    const targetPlan = SUBSCRIPTION_CONFIG[requiredTier]
    return `Esta funcionalidade está disponível no plano ${targetPlan.planName}. Faça upgrade por apenas R$ ${targetPlan.monthlyPrice.toFixed(2)}/mês.`
  }

  const getNextTierRecommendation = (): SubscriptionTier | null => {
    const currentTier = subscriptionStatus as SubscriptionTier || 'free'

    switch (currentTier) {
      case 'free':
        return 'busca_ilimitada'
      case 'busca_ilimitada':
        return 'alertas_inteligentes'
      case 'alertas_inteligentes':
        return null // Already highest tier
      default:
        return 'busca_ilimitada'
    }
  }

  return {
    rules,
    hasPermission,
    canSearchDaysAhead,
    getUpgradeMessage,
    getNextTierRecommendation,
    isFreeTier: rules.planName === 'Gratuito',
    isPaidTier: rules.monthlyPrice > 0,
    currentTier: subscriptionStatus as SubscriptionTier || 'free'
  }
}

// Hook to get all available tiers (for pricing pages)
export function useSubscriptionTiers() {
  return {
    tiers: SUBSCRIPTION_CONFIG,
    getTierByName: (tierName: SubscriptionTier) => SUBSCRIPTION_CONFIG[tierName],
    getAllTiers: () => Object.entries(SUBSCRIPTION_CONFIG).map(([key, value]) => ({
      id: key as SubscriptionTier,
      ...value
    }))
  }
}
