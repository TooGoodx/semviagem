import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import { supabase, type SupabaseUser } from '../lib/supabase'

// Re-export User type as SupabaseUser if it exists in supabase.ts
type User = SupabaseUser

export function useAuth() {
  const { user: auth0User, isLoading: auth0Loading, isAuthenticated: auth0Authenticated } = useAuth0()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (auth0Loading) return

    if (!auth0User) {
      setUser(null)
      setIsLoading(false)
      console.log('🚪 User logged out, clearing Supabase state')
      return
    }

    // Sync Auth0 user to Supabase
    console.log('🔄 Auth0 user detected, initiating Supabase sync...')
    syncUserToSupabase(auth0User)
  }, [auth0User, auth0Loading])

  async function syncUserToSupabase(auth0User: any) {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🔍 Checking if user is registered...')
      console.log('  📧 Email:', auth0User.email)
      console.log('  🆔 Auth0 ID:', auth0User.sub)

      // STEP 1: Check if user exists (DO NOT CREATE)
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('auth0_id', auth0User.sub)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (usuário não existe ainda)
        console.error('❌ Supabase fetch error:', fetchError)
        throw fetchError
      }

      if (!existingUser) {
        // User is NOT registered - CREATE AUTOMATICALLY
        console.log('🆕 User not registered - creating automatically...')
        console.log('   Email:', auth0User.email)
        console.log('   Auth0 ID:', auth0User.sub)

        // Create new user in Supabase
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            auth0_id: auth0User.sub,
            email: auth0User.email,
            full_name: auth0User.name || auth0User.email?.split('@')[0] || 'Usuário',
            whatsapp: auth0User.phone_number || null, // Se Auth0 tiver phone
            subscription_status: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('❌ Failed to create user:', createError)
          throw new Error('Não foi possível criar sua conta. Tente novamente.')
        }

        console.log('✅ New user created successfully:', {
          id: newUser.id,
          email: newUser.email,
          subscription_status: newUser.subscription_status
        })

        setUser(newUser)
        return
      }

      // User exists - allow access
      console.log('✅ Registered user found:', {
        id: existingUser.id,
        email: existingUser.email,
        subscription_status: existingUser.subscription_status,
        registered_at: existingUser.created_at
      })

      // Update last login timestamp and name from Auth0
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          email: auth0User.email,
          full_name: auth0User.name || existingUser.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select()
        .single()

      if (updateError) {
        console.warn('⚠️ Failed to update login timestamp:', updateError)
        // Continue with existing user data
        setUser(existingUser)
      } else {
        setUser(updatedUser)
        console.log('✅ User data updated with latest from Auth0')
      }

      console.log('💳 User subscription status:', existingUser.subscription_status)
    } catch (error) {
      console.error('💥 Critical sync error:', error)
      setError(error instanceof Error ? error.message : 'Database sync failed')
      console.warn('⚠️ Authentication failed - user needs to register')
    } finally {
      setIsLoading(false)
    }
  }

  // Development utility functions
  const forceSync = async () => {
    if (auth0User) {
      console.log('🔄 Manual sync triggered')
      await syncUserToSupabase(auth0User)
    }
  }

  const updateSubscriptionStatus = async (newStatus: 'free' | 'busca_ilimitada' | 'alertas_inteligentes') => {
    if (!user) {
      console.error('❌ Cannot update subscription: no user loaded')
      return false
    }

    try {
      console.log(`🔄 Updating subscription to: ${newStatus}`)
      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          subscription_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Subscription update failed:', updateError)
        throw updateError
      }

      setUser(data)
      console.log(`✅ Subscription updated to: ${newStatus}`)
      return true
    } catch (error) {
      console.error('💥 Subscription update error:', error)
      return false
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user && auth0Authenticated,
    subscription_status: user?.subscription_status || 'free',
    error,
    refetch: forceSync,
    // Expose Auth0 user for accessing picture, name, etc.
    auth0User,
    // Registration state - REMOVED: Auto-creation eliminates need for this
    needsRegistration: false, // Always false now
    pendingUserData: null, // Always null now
    // Development utilities (only available in dev mode)
    ...(import.meta.env.DEV && {
      forceSync,
      updateSubscriptionStatus
    })
  }
}
