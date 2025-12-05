import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { User } from '../lib/supabase'

interface UserContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  subscription_status: string
  isPaid: boolean
  canCreateAlerts: boolean
  canSearchUnlimited: boolean
  error: string | null
  refetch: () => void
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated, subscription_status, error, refetch } = useAuth()

  const isPaid = subscription_status !== 'free'
  const canCreateAlerts = subscription_status === 'alertas_inteligentes'
  const canSearchUnlimited = ['busca_ilimitada', 'alertas_inteligentes'].includes(subscription_status)

  const value = {
    user,
    isLoading,
    isAuthenticated,
    subscription_status,
    isPaid,
    canCreateAlerts,
    canSearchUnlimited,
    error,
    refetch,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser deve ser usado dentro de UserProvider')
  }
  return context
}
