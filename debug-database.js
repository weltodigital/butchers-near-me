#!/usr/bin/env node

/**
 * Debug script to check database structure and available tables
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugDatabase() {
  console.log('🔍 Debugging database structure...\n')

  // Check what tables exist
  console.log('📊 Checking available tables...')
  try {
    const { data: tables, error } = await supabase
      .rpc('exec', {
        sql: `
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          ORDER BY table_name;
        `
      })

    if (error) {
      console.error('❌ Error getting tables:', error.message)
    } else {
      console.log('Available tables:', tables)
    }
  } catch (err) {
    console.error('❌ Unexpected error getting tables:', err.message)
  }

  // Try to query locations table directly
  console.log('\n📍 Checking locations table...')
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .limit(5)

    if (error) {
      console.error('❌ Error querying locations:', error.message)
    } else {
      console.log('✅ Found locations table with sample data:')
      if (data && data.length > 0) {
        console.log('First location:', data[0])
        console.log('Columns available:', Object.keys(data[0]))
      } else {
        console.log('No data in locations table')
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
  }

  // Try to query public_locations view
  console.log('\n🔍 Checking public_locations view...')
  try {
    const { data, error } = await supabase
      .from('public_locations')
      .select('*')
      .limit(5)

    if (error) {
      console.error('❌ Error querying public_locations:', error.message)
    } else {
      console.log('✅ Found public_locations view with sample data:')
      if (data && data.length > 0) {
        console.log('First location:', data[0])
        console.log('Columns available:', Object.keys(data[0]))
      } else {
        console.log('No data in public_locations view')
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
  }

  // Search for any Bedfordshire-related data
  console.log('\n🔍 Searching for Bedfordshire locations...')
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .or('name.ilike.%bedford%,region.ilike.%bedford%')
      .limit(10)

    if (error) {
      console.error('❌ Error searching locations:', error.message)
    } else {
      console.log(`✅ Found ${data?.length || 0} Bedfordshire-related locations:`)
      data?.forEach(location => {
        console.log(`   - ${location.name} (${location.type || 'unknown'}) - Region: ${location.region || 'N/A'}`)
      })
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
  }

  // Check butchers table
  console.log('\n🥩 Checking butchers table...')
  try {
    const { data, error } = await supabase
      .from('butchers')
      .select('*')
      .limit(3)

    if (error) {
      console.error('❌ Error querying butchers:', error.message)
    } else {
      console.log('✅ Found butchers table:')
      if (data && data.length > 0) {
        console.log(`Found ${data.length} sample butchers`)
        console.log('Columns available:', Object.keys(data[0]))
      } else {
        console.log('No data in butchers table')
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
  }

  console.log('\n🎯 Debug complete!')
}

debugDatabase().catch(console.error)