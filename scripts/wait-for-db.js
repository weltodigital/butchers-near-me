#!/usr/bin/env node

/**
 * Wait for database to be ready
 * This script will poll the database until it's set up
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function waitForDatabase() {
  console.log('⏳ Waiting for database to be ready...')
  console.log('   (Make sure you\'ve executed the SQL schema in Supabase)')
  console.log('')

  let attempts = 0
  const maxAttempts = 30 // 5 minutes max

  while (attempts < maxAttempts) {
    try {
      // Test if butchers table exists
      const { data, error } = await supabase
        .from('butchers')
        .select('count')
        .limit(1)

      if (!error) {
        console.log('✅ Database is ready!')
        console.log('🎉 You can now use the MeatMap UK application')
        
        // Show sample data
        const { data: butchers } = await supabase
          .from('butchers')
          .select('name, city, rating')
          .limit(3)

        if (butchers && butchers.length > 0) {
          console.log('\n📊 Sample butchers loaded:')
          butchers.forEach(butcher => {
            console.log(`   - ${butcher.name} (${butcher.city}) - ⭐ ${butcher.rating}`)
          })
        }

        console.log('\n🚀 Next steps:')
        console.log('   1. Test the API: curl http://localhost:3000/api/butchers')
        console.log('   2. Visit the app: http://localhost:3000')
        console.log('   3. Check the application page: http://localhost:3000/application')
        
        process.exit(0)
      }
    } catch (error) {
      // Database not ready yet
    }

    attempts++
    process.stdout.write(`   Attempt ${attempts}/${maxAttempts}...\r`)
    await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds
  }

  console.log('\n❌ Database setup timeout')
  console.log('   Please check:')
  console.log('   1. You\'ve executed the SQL schema in Supabase')
  console.log('   2. Your environment variables are correct')
  console.log('   3. Your Supabase project is active')
  
  process.exit(1)
}

waitForDatabase()
