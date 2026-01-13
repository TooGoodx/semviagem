import { createClient } from '@supabase/supabase-js'

// Direct credentials for testing
const supabaseUrl = 'https://rtxrgqlhdbsztsbnycln.supabase.co'
const supabaseKey = 'sb_publishable_o5gqKHJNLaS0B043dVkgGA_ndLGlpVr'

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnoseRLSIssue() {
  console.log('🔍 DIAGNOSING RLS (Row Level Security) ISSUE')
  console.log('=' .repeat(60))
  console.log('')

  // Test 1: Check current user count
  console.log('📊 TEST 1: Current Database State')
  try {
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (selectError) {
      console.log('❌ SELECT Error:', selectError.message)
    } else {
      console.log(`✅ Found ${users.length} users (showing last 5)`)
      users.forEach((user, i) => {
        console.log(`   ${i + 1}. ${user.email} - ${user.created_at} - ${user.subscription_status}`)
      })
    }
  } catch (err) {
    console.log('❌ Exception during SELECT:', err.message)
  }
  console.log('')

  // Test 2: Attempt INSERT with detailed error logging
  console.log('🧪 TEST 2: Attempting INSERT Operation')
  console.log('This will test if RLS is blocking inserts...')

  const testUser = {
    auth0_id: `test-rls-${Date.now()}`,
    email: `test-rls-${Date.now()}@diagnostic.test`,
    full_name: 'RLS Diagnostic Test User',
    subscription_status: 'free',
    preferences: {
      favorite_airports: [],
      preferred_class: 'economica',
      notification_whatsapp: true,
      notification_email: true,
    }
  }

  try {
    console.log('📤 Attempting to insert test user:', testUser.email)

    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single()

    if (insertError) {
      console.log('❌ INSERT FAILED!')
      console.log('Error Details:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      })

      // Check for RLS-specific error patterns
      if (insertError.message.includes('new row violates row-level security policy') ||
          insertError.code === '42501' ||
          insertError.message.includes('permission denied')) {
        console.log('')
        console.log('🚨 RLS ISSUE CONFIRMED!')
        console.log('Row Level Security is blocking INSERT operations.')
        console.log('')
        console.log('SOLUTION: Disable RLS on users table')
        console.log('Execute in Supabase SQL Editor:')
        console.log('   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;')
      } else if (!insertedUser && !insertError.message) {
        console.log('')
        console.log('🚨 SILENT RLS FAILURE DETECTED!')
        console.log('No error message but no data returned - classic RLS symptom')
        console.log('')
        console.log('SOLUTION: Disable RLS on users table')
        console.log('Execute in Supabase SQL Editor:')
        console.log('   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;')
      }
    } else if (insertedUser) {
      console.log('✅ INSERT SUCCESSFUL!')
      console.log('User created:', {
        id: insertedUser.id,
        email: insertedUser.email,
        created_at: insertedUser.created_at
      })

      // Cleanup test user
      console.log('🧹 Cleaning up test user...')
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', insertedUser.id)

      if (deleteError) {
        console.log('⚠️ Could not delete test user (manual cleanup needed)')
      } else {
        console.log('✅ Test user cleaned up successfully')
      }

      console.log('')
      console.log('✅ RLS IS NOT THE ISSUE - Inserts are working!')
    }
  } catch (err) {
    console.log('❌ INSERT Exception:', err.message)
    console.log('Full error:', err)
  }
  console.log('')

  // Test 3: Check RLS policies (requires service role key)
  console.log('🔐 TEST 3: RLS Policy Check')
  console.log('Note: Full RLS inspection requires service role key')
  console.log('Current key type: Anonymous (publishable)')
  console.log('')
  console.log('To check RLS status in Supabase Dashboard:')
  console.log('1. Go to https://app.supabase.com')
  console.log('2. Select your project')
  console.log('3. Go to "Authentication" → "Policies"')
  console.log('4. Check if RLS is enabled on "users" table')
  console.log('')

  // Test 4: Verify last user creation time
  console.log('📅 TEST 4: Last User Creation Time')
  try {
    const { data: lastUser } = await supabase
      .from('users')
      .select('email, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (lastUser) {
      const lastCreation = new Date(lastUser.created_at)
      const now = new Date()
      const hoursSince = Math.floor((now - lastCreation) / (1000 * 60 * 60))

      console.log(`Last user created: ${lastUser.email}`)
      console.log(`Created at: ${lastUser.created_at}`)
      console.log(`Time since: ${hoursSince} hours ago`)

      if (hoursSince > 24) {
        console.log('⚠️ WARNING: No users created in last 24 hours!')
        console.log('This suggests sync is not working.')
      }
    }
  } catch (err) {
    console.log('Could not retrieve last user')
  }
  console.log('')

  // Summary
  console.log('=' .repeat(60))
  console.log('🎯 DIAGNOSTIC SUMMARY')
  console.log('=' .repeat(60))
  console.log('')
  console.log('NEXT STEPS:')
  console.log('1. Check the INSERT test result above')
  console.log('2. If RLS issue confirmed, disable RLS using SQL command')
  console.log('3. Retry Auth0 login after disabling RLS')
  console.log('4. Watch browser console for sync messages')
  console.log('')
}

// Execute diagnostic
diagnoseRLSIssue()
  .then(() => {
    console.log('✅ Diagnostic complete')
    process.exit(0)
  })
  .catch((err) => {
    console.error('💥 Diagnostic failed:', err)
    process.exit(1)
  })
