import React, { createContext, useContext, useState } from 'react'
import { useUser } from '../../context/UserContext'
import { useSubscriptionRules } from '../../hooks/useSubscriptionRules'
import { useDateValidation } from '../../hooks/useDateValidation'

interface PaywallContextType {
  shouldShowPaywall: (searchDates?: { ida?: string; volta?: string }) => boolean
  showPaywallModal: (searchDates: { ida?: string; volta?: string }, flightCount?: number) => void
  hidePaywallModal: () => void
  isModalVisible: boolean
  modalFlightCount: number
  modalSearchDates: { ida?: string; volta?: string }
  subscriptionRules: ReturnType<typeof useSubscriptionRules>
}

const PaywallContext = createContext<PaywallContextType | null>(null)

export function PaywallProvider({ children }: { children: React.ReactNode }) {
  const { subscription_status } = useUser()
  const subscriptionRules = useSubscriptionRules(subscription_status)
  const dateValidation = useDateValidation(subscriptionRules.maxSearchDays, subscriptionRules.planName)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalFlightCount, setModalFlightCount] = useState(0)
  const [modalSearchDates, setModalSearchDates] = useState<{ ida?: string; volta?: string }>({})

  // Date parsing helper - handles both "YYYY-MM-DD" and "DD/MM/YYYY" formats
  const parseSearchDate = (dateString: string): Date | null => {
    if (!dateString) return null

    // Try parsing as ISO format (YYYY-MM-DD) first
    const isoDate = new Date(dateString)
    if (!isNaN(isoDate.getTime())) {
      return isoDate
    }

    // If invalid, try parsing DD/MM/YYYY format
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/')
      // JavaScript Date months are 0-indexed, but when using ISO string format (YYYY-MM-DD)
      // the month is 1-indexed, so we can safely use the month value directly
      const parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate
      }
    }

    return null
  }

  // NEW date-based paywall logic
  const shouldShowPaywall = (searchDates?: { ida?: string; volta?: string }): boolean => {
    // If no search dates, don't show paywall
    if (!searchDates?.ida) {
      return false
    }

    // Parse departure date
    const departureDate = parseSearchDate(searchDates.ida)
    if (!departureDate) {
      return false // Invalid date format
    }

    // Check if departure date exceeds user's plan limit
    const departureValidation = dateValidation.validateSearchDate(departureDate)

    // If return date exists, validate it too
    let returnExceedsLimit = false
    if (searchDates.volta) {
      const returnDate = parseSearchDate(searchDates.volta)
      if (returnDate) {
        const returnValidation = dateValidation.validateSearchDate(returnDate)
        returnExceedsLimit = !returnValidation.isValid
      }
    }

    // Show paywall if ANY search date exceeds the user's plan limit
    return !departureValidation.isValid || returnExceedsLimit
  }

  const showPaywallModal = (searchDates: { ida?: string; volta?: string }, flightCount = 0) => {
    setModalFlightCount(flightCount)
    setModalSearchDates(searchDates)
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
      modalFlightCount,
      modalSearchDates,
      subscriptionRules
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
