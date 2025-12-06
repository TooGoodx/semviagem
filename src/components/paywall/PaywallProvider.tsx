import React, { createContext, useContext, useState } from 'react'
import { useUser } from '../../context/UserContext'
import { useSubscriptionRules } from '../../hooks/useSubscriptionRules'

interface PaywallContextType {
  shouldShowPaywall: (feature: 'flights' | 'search-date') => boolean
  showPaywallModal: (context: 'flights' | 'search', flightCount?: number) => void
  hidePaywallModal: () => void
  isModalVisible: boolean
  modalContext: 'flights' | 'search'
  modalFlightCount: number
}

const PaywallContext = createContext<PaywallContextType | null>(null)

export function PaywallProvider({ children }: { children: React.ReactNode }) {
  const { subscription_status } = useUser()
  const subscriptionRules = useSubscriptionRules(subscription_status)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalContext, setModalContext] = useState<'flights' | 'search'>('flights')
  const [modalFlightCount, setModalFlightCount] = useState(0)

  const shouldShowPaywall = (feature: 'flights' | 'search-date'): boolean => {
    // Free users see paywall for premium features
    if (subscriptionRules.planName === 'Gratuito') {
      switch (feature) {
        case 'flights':
          return !subscriptionRules.canAccessFlights
        case 'search-date':
          return subscriptionRules.maxSearchDays <= 60
        default:
          return false
      }
    }
    return false
  }

  const showPaywallModal = (context: 'flights' | 'search', flightCount = 0) => {
    setModalContext(context)
    setModalFlightCount(flightCount)
    setIsModalVisible(true)
  }

  const hidePaywallModal = () => {
    setIsModalVisible(false)
  }

  return (
    <PaywallContext.Provider value={{
      shouldShowPaywall,
      showPaywallModal,
      hidePaywallModal,
      isModalVisible,
      modalContext,
      modalFlightCount
    }}>
      {children}
    </PaywallContext.Provider>
  )
}

export function usePaywall() {
  const context = useContext(PaywallContext)
  if (!context) {
    throw new Error('usePaywall must be used within PaywallProvider')
  }
  return context
}
