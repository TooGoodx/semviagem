import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { SupabaseUser } from '../lib/supabase'

// Re-export User type as SupabaseUser
type User = SupabaseUser

interface UserContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  subscription_status: 'free' | 'busca_ilimitada' | 'alertas_inteligentes'
  isPaid: boolean
  canCreateAlerts: boolean
  canSearchUnlimited: boolean
  searchDayLimit: number | null // null = unlimited, number = days limit
  error: string | null
  refetch: () => void
  // Auth0 user (always available - contains picture, name, email, etc.)
  auth0User: any
  // Registration state
  needsRegistration: boolean
  pendingUserData: any | null
  // Development utilities (only available in dev mode)
  forceSync?: () => Promise<void>
  updateSubscriptionStatus?: (status: 'free' | 'busca_ilimitada' | 'alertas_inteligentes') => Promise<boolean>
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const authData = useAuth()
  const { user, isLoading, isAuthenticated, subscription_status, error, refetch } = authData

  // Computed permission helpers
  const isPaid = subscription_status !== 'free'
  const canCreateAlerts = subscription_status === 'alertas_inteligentes'
  const canSearchUnlimited = ['busca_ilimitada', 'alertas_inteligentes'].includes(subscription_status)
  const searchDayLimit = subscription_status === 'free' ? 60 : null // null = unlimited

  // Enhanced debug logging
  if (import.meta.env.DEV) {
    console.log('🔍 UserContext state:', {
      hasUser: !!user,
      isAuthenticated,
      subscriptionStatus: subscription_status,
      isPaid,
      canCreateAlerts,
      canSearchUnlimited,
      searchLimit: searchDayLimit ? `${searchDayLimit} days` : 'unlimited',
      syncError: error ? 'Present' : 'None',
      needsRegistration: !!(authData as any).needsRegistration
    })
  }

  const value: UserContextType = {
    user,
    isLoading,
    isAuthenticated,
    subscription_status,
    isPaid,
    canCreateAlerts,
    canSearchUnlimited,
    searchDayLimit,
    error,
    refetch,
    // Always include Auth0 user (for picture, name, etc.)
    auth0User: (authData as any).auth0User,
    // Registration state
    needsRegistration: !!(authData as any).needsRegistration,
    pendingUserData: (authData as any).pendingUserData || null,
    // Conditionally include development utilities
    ...(import.meta.env.DEV && {
      forceSync: (authData as any).forceSync,
      updateSubscriptionStatus: (authData as any).updateSubscriptionStatus
    })
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error(
      'useUser must be used within a UserProvider. ' +
      'Make sure your component is wrapped in <UserProvider>.'
    )
  }
  return context
}

// Type guard for checking if user is authenticated with Supabase
export function hasSupabaseUser(context: UserContextType): context is UserContextType & { user: User } {
  return context.user !== null
}

// Hook specifically for authenticated operations
export function useAuthenticatedUser(): (UserContextType & { user: User }) | null {
  const context = useUser()
  return hasSupabaseUser(context) ? context : null
}
