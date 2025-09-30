#!/usr/bin/env node

/**
 * Check butcher URLs and full_url_path data
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkButcherUrls() {
  console.log('🔍 Checking Butcher URLs and Database Content')
  console.log('============================================\n')

  try {
    // Get all butchers with their URL paths
    const { data: butchers, error } = await supabase
      .from('butchers')
      .select('id, name, city, county, full_url_path, city_slug, county_slug')
      .order('name')

    if (error) {
      console.error('❌ Error fetching butchers:', error.message)
      return
    }

    console.log(`📊 Total butchers in database: ${butchers.length}`)

    if (butchers.length === 0) {
      console.log('❌ No butchers found in database')
      console.log('💡 Try running: npm run scrape:google')
      return
    }

    console.log('\n📋 Sample butcher URLs:')
    butchers.slice(0, 10).forEach((butcher, index) => {
      console.log(`${index + 1}. ${butcher.name}`)
      console.log(`   City: ${butcher.city} (${butcher.city_slug})`)
      console.log(`   County: ${butcher.county} (${butcher.county_slug})`)
      console.log(`   URL: /${butcher.full_url_path}`)
      console.log('')
    })

    // Check for missing URL components
    const withoutUrls = butchers.filter(b => !b.full_url_path)
    if (withoutUrls.length > 0) {
      console.log(`⚠️  ${withoutUrls.length} butchers missing full_url_path:`)
      withoutUrls.slice(0, 5).forEach(b => {
        console.log(`   - ${b.name} (${b.city})`)
      })
    }

    // Check county/city distribution
    const cities = [...new Set(butchers.map(b => b.city))]
    const counties = [...new Set(butchers.map(b => b.county))]

    console.log(`\n🏙️  Cities: ${cities.length}`)
    cities.forEach(city => {
      const count = butchers.filter(b => b.city === city).length
      console.log(`   ${city}: ${count} butchers`)
    })

    console.log(`\n🗺️  Counties: ${counties.length}`)
    counties.forEach(county => {
      const count = butchers.filter(b => b.county === county).length
      console.log(`   ${county}: ${count} butchers`)
    })

    // Check if public_locations needs updating
    const { data: locations, error: locError } = await supabase
      .from('public_locations')
      .select('*')
      .order('name')

    if (locError) {
      console.log('\n⚠️  Could not check public_locations table')
    } else {
      console.log(`\n📍 Public locations: ${locations?.length || 0}`)
      if (locations && locations.length < cities.length + counties.length) {
        console.log('⚠️  Public locations may need updating for new cities/counties')
      }
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message)
  }
}

checkButcherUrls()