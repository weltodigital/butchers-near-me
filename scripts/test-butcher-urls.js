#!/usr/bin/env node

/**
 * Test butcher URL routing and lookup
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testButcherUrls() {
  console.log('🔍 Testing Butcher URL Lookup')
  console.log('=============================\n')

  try {
    // Get sample butchers
    const { data: butchers, error } = await supabase
      .from('public_butchers')
      .select('name, county_slug, city_slug, full_url_path')
      .limit(5)

    if (error) {
      console.error('❌ Error fetching butchers:', error.message)
      return
    }

    console.log('📋 Testing URL lookup for sample butchers:\n')

    for (const butcher of butchers) {
      console.log(`🏪 ${butcher.name}`)
      console.log(`   Full URL path: /${butcher.full_url_path}`)

      // Test the URL path lookup
      const { data: lookupResult, error: lookupError } = await supabase
        .from('public_butchers')
        .select('*')
        .eq('full_url_path', butcher.full_url_path)
        .single()

      if (lookupError) {
        console.log(`   ❌ Lookup failed: ${lookupError.message}`)
      } else if (lookupResult) {
        console.log(`   ✅ Lookup successful: Found ${lookupResult.name}`)
      } else {
        console.log(`   ⚠️  Lookup returned no results`)
      }
      console.log('')
    }

    // Test static params generation
    console.log('📊 Testing static params generation...\n')

    const { data: allButchers } = await supabase
      .from('public_butchers')
      .select('county_slug, city_slug, full_url_path')
      .not('county_slug', 'is', null)
      .not('city_slug', 'is', null)
      .not('full_url_path', 'is', null)
      .limit(10)

    if (allButchers) {
      console.log('Sample static params:')
      allButchers.forEach((butcher, index) => {
        const pathParts = butcher.full_url_path.split('/')
        const butcherSlug = pathParts[2]

        console.log(`${index + 1}. {`)
        console.log(`     county: "${butcher.county_slug}",`)
        console.log(`     city: "${butcher.city_slug}",`)
        console.log(`     butcher: "${butcherSlug}"`)
        console.log(`   }`)
      })
    }

    console.log(`\n✅ Total static params will be generated: ${allButchers?.length || 0}`)

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testButcherUrls()