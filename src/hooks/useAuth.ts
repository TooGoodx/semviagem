import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import { supabase, type User } from '../lib/supabase'

export function useAuth() {
  const { user: auth0User, isLoading: auth0Loading } = useAuth0()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (auth0Loading) return

    if (!auth0User) {
      setUser(null)
      setIsLoading(false)
      return
    }

    // Sync Auth0 user to Supabase
    syncUserToSupabase(auth0User)
  }, [auth0User, auth0Loading])

  async function syncUserToSupabase(auth0User: any) {
    try {
      setIsLoading(true)
      setError(null)

      // Buscar usuário existente
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('auth0_id', auth0User.sub)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (usuário não existe ainda)
        throw fetchError
      }

      if (existingUser) {
        // Usuário já existe, apenas atualiza campos básicos se necessário
        const needsUpdate =
          existingUser.email !== auth0User.email ||
          existingUser.full_name !== auth0User.name

        if (needsUpdate) {
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({
              email: auth0User.email,
              full_name: auth0User.name,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingUser.id)
            .select()
            .single()

          if (updateError) throw updateError
          setUser(updatedUser)
        } else {
          setUser(existingUser)
        }
      } else {
        // Novo usuário, criar registro
        const newUserData = {
          auth0_id: auth0User.sub,
          email: auth0User.email,
          full_name: auth0User.name || auth0User.email.split('@')[0],
          subscription_status: 'free' as const,
          preferences: {
            favorite_airports: [],
            preferred_class: 'economica',
            notification_whatsapp: true,
            notification_email: true,
          },
        }

        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert(newUserData)
          .select()
          .single()

        if (insertError) throw insertError
        setUser(newUser)
      }
    } catch (error) {
      console.error('Erro ao sincronizar usuário Auth0 → Supabase:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    subscription_status: user?.subscription_status || 'free',
    error,
    refetch: () => {
      if (auth0User) {
        syncUserToSupabase(auth0User)
      }
    },
  }
}
