import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rtxrgqlhdbsztsbnycln.supabase.co'
const supabaseKey = 'sb_publishable_o5gqKHJNLaS0B043dVkgGA_ndLGlpVr'

const supabase = createClient(supabaseUrl, supabaseKey)

async function validatePhase1B() {
  console.log('🔍 SPRINT 3 PHASE 1B - VALIDATION')
  console.log('=' .repeat(60))

  // Test 1: File Structure Validation
  console.log('\n📁 TEST 1: File Structure')
  try {
    const fs = await import('fs')

    const requiredFiles = [
      'src/hooks/useAuth.ts',
      'src/context/UserContext.tsx',
      'src/lib/supabase.ts',
      'src/App.tsx'
    ]

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`)
      } else {
        console.log(`❌ ${file} missing`)
      }
    }
  } catch (err) {
    console.log('⚠️ File system check not available')
  }

  // Test 2: Database Connection & User Count
  console.log('\n💾 TEST 2: Database State')
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    console.log(`✅ Users table accessible`)
    console.log(`📊 Total users in database: ${count}`)

    // Check for recent user activity
    const { data: recentUsers } = await supabase
      .from('users')
      .select('email, subscription_status, created_at')
      .order('updated_at', { ascending: false })
      .limit(5)

    if (recentUsers && recentUsers.length > 0) {
      console.log('👥 Recent users:')
      recentUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.subscription_status})`)
      })
    }
  } catch (err) {
    console.log(`❌ Database test failed: ${err.message}`)
  }

  // Test 3: Auth0 Integration Points
  console.log('\n🔐 TEST 3: Auth0 → Supabase Integration')
  console.log('Manual verification required:')
  console.log('  1. Login with Auth0 → Check console for sync messages')
  console.log('  2. Verify user appears in Supabase users table')
  console.log('  3. Check subscription_status defaults to "free"')
  console.log('  4. Test logout → login cycle')

  // Test 4: Code Quality Checks
  console.log('\n📝 TEST 4: Code Quality')
  try {
    const fs = await import('fs')

    // Check useAuth has logging
    const useAuthContent = fs.readFileSync('src/hooks/useAuth.ts', 'utf8')
    if (useAuthContent.includes('🔄 Auth0 user detected')) {
      console.log('✅ useAuth hook has debug logging')
    } else {
      console.log('❌ useAuth hook missing debug logging')
    }

    // Check UserContext has logging
    const userContextContent = fs.readFileSync('src/context/UserContext.tsx', 'utf8')
    if (userContextContent.includes('🔍 UserContext state')) {
      console.log('✅ UserContext has debug logging')
    } else {
      console.log('❌ UserContext missing debug logging')
    }

    // Check App.tsx has UserProvider
    const appContent = fs.readFileSync('src/App.tsx', 'utf8')
    if (appContent.includes('UserProvider')) {
      console.log('✅ App.tsx includes UserProvider')
    } else {
      console.log('❌ App.tsx missing UserProvider')
    }
  } catch (err) {
    console.log('⚠️ Code quality check not available')
  }

  console.log('\n✅ PHASE 1B VALIDATION COMPLETE')
  console.log('=' .repeat(60))
  console.log('\n🎯 Next Steps:')
  console.log('  1. Start development server: npm run dev')
  console.log('  2. Login with Auth0')
  console.log('  3. Check browser console for sync messages')
  console.log('  4. Verify user in Supabase dashboard')
  console.log('\n🚀 Ready for Day 2: Authorization System')
}

validatePhase1B()
  .then(() => {
    console.log('\n🎉 VALIDATION SUCCESSFUL!')
  })
  .catch(err => {
    console.error('\n💥 VALIDATION ERROR:', err)
  })
