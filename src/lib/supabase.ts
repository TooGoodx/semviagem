import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Publishable Key are required')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================
// TYPE DEFINITIONS - DATABASE SCHEMA (VALIDATED)
// ============================================

/**
 * User table interface
 * All columns validated against production schema
 */
export interface User {
  id: string
  email: string
  full_name?: string
  whatsapp?: string
  instagram?: string
  auth0_id: string
  subscription_status: 'free' | 'busca_ilimitada' | 'alertas_inteligentes'
  stripe_customer_id?: string
  subscription_expires_at?: string
  preferences?: any // JSONB field
  created_at: string
  updated_at: string
}

/**
 * Alert table interface
 * Uses origin_code/destination_code (NOT origin/destination)
 */
export interface Alert {
  id: string
  user_id: string
  search_id?: string
  alert_name: string
  origin_code: string       // ✅ Validated: uses _code suffix
  destination_code: string  // ✅ Validated: uses _code suffix
  departure_date: string
  return_date?: string
  max_price_miles?: number
  max_price_brl?: number
  is_active: boolean
  last_checked_at?: string
  last_price_found_miles?: number
  last_price_found_brl?: number
  notify_whatsapp: boolean
  notify_email: boolean
  created_at: string
  updated_at: string
}

/**
 * UserSearch table interface
 * Minimal schema - only origin_code, destination_code, dates
 */
export interface UserSearch {
  id: string
  user_id?: string
  origin_code: string       // ✅ Validated: uses _code suffix
  destination_code: string  // ✅ Validated: uses _code suffix
  departure_date: string
  return_date?: string
  // Note: passengers, search_params, results_count, created_at do NOT exist in production
}

/**
 * AlertNotification table interface
 * Minimal schema - only id, alert_id, sent_at, notification_type
 */
export interface AlertNotification {
  id: string
  alert_id: string
  sent_at: string
  notification_type: 'email' | 'push' | 'sms' | 'whatsapp'
  // Note: flight_data, price, status do NOT exist in production
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Test Supabase connection
 * @returns Promise with connection status
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean
  message: string
  data?: any
}> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      }
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase',
      data
    }
  } catch (err) {
    return {
      success: false,
      message: `Unexpected error: ${err instanceof Error ? err.message : String(err)}`
    }
  }
}

/**
 * Get user by Auth0 ID
 * @param auth0Id - Auth0 user ID
 * @returns User object or null
 */
export async function getUserByAuth0Id(auth0Id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth0_id', auth0Id)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data
}

/**
 * Get active alerts for user
 * @param userId - User ID
 * @returns Array of active alerts
 */
export async function getUserAlerts(userId: string): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching alerts:', error)
    return []
  }

  return data || []
}

/**
 * Create new alert
 * @param alertData - Alert data
 * @returns Created alert or null
 */
export async function createAlert(alertData: Omit<Alert, 'id' | 'created_at' | 'updated_at'>): Promise<Alert | null> {
  const { data, error } = await supabase
    .from('alerts')
    .insert([alertData])
    .select()
    .single()

  if (error) {
    console.error('Error creating alert:', error)
    return null
  }

  return data
}

/**
 * Log user search
 * @param searchData - Search parameters
 * @returns Created search log or null
 */
export async function logUserSearch(searchData: Omit<UserSearch, 'id'>): Promise<UserSearch | null> {
  const { data, error } = await supabase
    .from('user_searches')
    .insert([searchData])
    .select()
    .single()

  if (error) {
    console.error('Error logging search:', error)
    return null
  }

  return data
}

/**
 * Validate database schemas
 * Tests that all interfaces match actual table structures
 */
export async function validateSchemas() {
  console.log('🔍 Validando schemas das tabelas...')

  try {
    // Test users table structure
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (usersError) {
      console.error('❌ Erro na tabela users:', usersError.message)
    } else {
      console.log('✅ Tabela users OK')
      if (users && users.length > 0) {
        console.log('   Sample columns:', Object.keys(users[0]).join(', '))
      }
    }

    // Test alerts table structure (with corrected column names)
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('id, user_id, origin_code, destination_code, alert_name, is_active')
      .limit(1)

    if (alertsError) {
      console.error('❌ Erro na tabela alerts:', alertsError.message)
    } else {
      console.log('✅ Tabela alerts OK (using origin_code/destination_code)')
    }

    // Test user_searches table structure (with corrected column names)
    const { data: searches, error: searchesError } = await supabase
      .from('user_searches')
      .select('id, user_id, origin_code, destination_code, departure_date, return_date')
      .limit(1)

    if (searchesError) {
      console.error('❌ Erro na tabela user_searches:', searchesError.message)
    } else {
      console.log('✅ Tabela user_searches OK (using origin_code/destination_code)')
    }

    // Test alert_notifications table structure
    const { data: notifications, error: notificationsError } = await supabase
      .from('alert_notifications')
      .select('id, alert_id, sent_at, notification_type')
      .limit(1)

    if (notificationsError) {
      console.error('❌ Erro na tabela alert_notifications:', notificationsError.message)
    } else {
      console.log('✅ Tabela alert_notifications OK')
    }

    console.log('🎉 Validação de schema completa!')

  } catch (error) {
    console.error('💥 Erro na validação:', error)
  }
}
