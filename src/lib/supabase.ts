import { createClient } from '@supabase/supabase-js'

// Environment variables with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Critical validation - fail fast if missing
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables. Check .env.local file.')
}

// Validate URL format
if (!supabaseUrl.startsWith('https://')) {
  throw new Error('Invalid Supabase URL format. Must start with https://')
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// === DATABASE TYPES - Sprint 3 Complete ===

export interface SupabaseUser {
  id: string
  email: string
  full_name?: string
  whatsapp?: string
  instagram?: string
  auth0_id: string
  subscription_status: 'free' | 'busca_ilimitada' | 'alertas_inteligentes'
  stripe_customer_id?: string
  subscription_expires_at?: string
  preferences?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Alert {
  id: string
  user_id: string
  auth0_id: string
  alert_name: string
  origins: string[]           // Array of airport codes
  destinations: string[]      // Array of airport codes
  departure_start: string     // ISO date
  departure_end: string       // ISO date
  return_start?: string       // ISO date
  return_end?: string         // ISO date
  max_price_miles?: number
  max_price_brl?: number
  alert_types: {
    milhas: boolean
    preco: boolean
  }
  is_active: boolean
  notify_whatsapp: boolean
  notify_email: boolean
  last_triggered_at?: string
  created_at: string
  updated_at: string
}

export interface UserSearch {
  id: string
  user_id?: string
  auth0_id?: string
  origin_code: string
  destination_code: string
  departure_date: string
  return_date?: string
  passengers_adults: number
  passengers_children: number
  passengers_infants: number
  travel_class: string
  cheapest_price_miles?: number
  cheapest_price_brl?: number
  total_results: number
  searched_at: string
  ip_address?: string
  user_agent?: string
}

// === ALERT OPERATIONS ===

export async function createAlert(alertData: Omit<Alert, 'id' | 'created_at' | 'updated_at'>): Promise<Alert | null> {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        ...alertData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating alert:', error)
      throw error
    }

    console.log('✅ Alert created:', data)
    return data
  } catch (err) {
    console.error('❌ Create alert exception:', err)
    return null
  }
}

export async function getUserAlerts(userId: string): Promise<Alert[]> {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching alerts:', error)
      throw error
    }

    return data || []
  } catch (err) {
    console.error('❌ Fetch alerts exception:', err)
    return []
  }
}

export async function updateAlert(alertId: string, updates: Partial<Alert>): Promise<Alert | null> {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating alert:', error)
      throw error
    }

    console.log('✅ Alert updated:', data)
    return data
  } catch (err) {
    console.error('❌ Update alert exception:', err)
    return null
  }
}

export async function deleteAlert(alertId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', alertId)

    if (error) {
      console.error('❌ Error deleting alert:', error)
      throw error
    }

    console.log('✅ Alert deleted:', alertId)
    return true
  } catch (err) {
    console.error('❌ Delete alert exception:', err)
    return false
  }
}

// === USER OPERATIONS ===

export async function updateUserWhatsApp(userId: string, whatsapp: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        whatsapp,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('❌ Error updating WhatsApp:', error)
      throw error
    }

    console.log('✅ WhatsApp updated for user:', userId)
    return true
  } catch (err) {
    console.error('❌ Update WhatsApp exception:', err)
    return false
  }
}

// === SEARCH LOGGING ===

export async function logUserSearch(searchData: Omit<UserSearch, 'id' | 'searched_at'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_searches')
      .insert({
        ...searchData,
        searched_at: new Date().toISOString()
      })

    if (error) {
      console.error('❌ Error logging search:', error)
      return false
    }

    console.log('✅ Search logged')
    return true
  } catch (err) {
    console.error('❌ Log search exception:', err)
    return false
  }
}

// Database health check function
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    console.log('🔍 Testing Supabase connection...')
    console.log('📡 URL:', supabaseUrl.substring(0, 30) + '...')

    // Test basic connectivity
    const { data, error } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact', head: true })
      .limit(1)

    if (error) {
      console.error('❌ Supabase connection error:', error.message)
      return false
    }

    console.log('✅ Supabase connection successful!')
    console.log('📊 Database accessible')
    return true
  } catch (err) {
    console.error('❌ Supabase connection exception:', err)
    return false
  }
}

// Export for development debugging
if (import.meta.env.DEV) {
  // @ts-ignore - Development only
  window.supabaseClient = supabase
  console.log('🛠️ Development mode: Supabase client available as window.supabaseClient')
}
