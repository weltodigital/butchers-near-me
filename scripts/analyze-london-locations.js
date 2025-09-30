#!/usr/bin/env node

/**
 * Analyze London locations and butcher mapping
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function analyzeLondonLocations() {
  console.log('🔍 Analyzing London Locations and Butcher Mapping')
  console.log('================================================\n')

  try {
    // Check Greater London locations
    const { data: londonLocations, error: locError } = await supabase
      .from('public_locations')
      .select('*')
      .eq('county_slug', 'greater-london')
      .order('name')

    if (locError) {
      console.error('❌ Error fetching London locations:', locError.message)
      return
    }

    console.log(`📍 Greater London locations in database: ${londonLocations.length}`)
    console.log('==========================================')

    londonLocations.forEach((location, index) => {
      console.log(`${index + 1}. ${location.name} (${location.type})`)
      console.log(`   Slug: ${location.slug}`)
      console.log(`   URL: /${location.full_path}`)
      console.log(`   Butchers: ${location.butcher_count || 0}`)
      console.log('')
    })

    // Check London butchers
    const { data: londonButchers, error: butcherError } = await supabase
      .from('public_butchers')
      .select('id, name, address, city, county, city_slug, county_slug')
      .eq('county_slug', 'greater-london')
      .order('name')

    if (butcherError) {
      console.error('❌ Error fetching London butchers:', butcherError.message)
      return
    }

    console.log(`🏪 London butchers: ${londonButchers.length}`)
    console.log('====================')

    londonButchers.forEach((butcher, index) => {
      console.log(`${index + 1}. ${butcher.name}`)
      console.log(`   Address: ${butcher.address}`)
      console.log(`   Mapped to: ${butcher.city}, ${butcher.county}`)
      console.log(`   URL would be: /${butcher.county_slug}/${butcher.city_slug}`)

      // Try to identify the borough from the address
      const address = butcher.address.toLowerCase()
      let suggestedBorough = 'Unknown'

      // Common London boroughs/areas
      const boroughs = {
        'westminster': 'Westminster',
        'camden': 'Camden',
        'islington': 'Islington',
        'hackney': 'Hackney',
        'tower hamlets': 'Tower Hamlets',
        'greenwich': 'Greenwich',
        'lewisham': 'Lewisham',
        'southwark': 'Southwark',
        'lambeth': 'Lambeth',
        'wandsworth': 'Wandsworth',
        'hammersmith': 'Hammersmith and Fulham',
        'fulham': 'Hammersmith and Fulham',
        'kensington': 'Kensington and Chelsea',
        'chelsea': 'Kensington and Chelsea',
        'brent': 'Brent',
        'ealing': 'Ealing',
        'hounslow': 'Hounslow',
        'richmond': 'Richmond upon Thames',
        'kingston': 'Kingston upon Thames',
        'merton': 'Merton',
        'sutton': 'Sutton',
        'croydon': 'Croydon',
        'bromley': 'Bromley',
        'bexley': 'Bexley',
        'havering': 'Havering',
        'barking': 'Barking and Dagenham',
        'redbridge': 'Redbridge',
        'newham': 'Newham',
        'waltham forest': 'Waltham Forest',
        'haringey': 'Haringey',
        'enfield': 'Enfield',
        'barnet': 'Barnet',
        'harrow': 'Harrow',
        'hillingdon': 'Hillingdon',
        'shoreditch': 'Hackney',
        'bethnal green': 'Tower Hamlets',
        'whitechapel': 'Tower Hamlets',
        'bermondsey': 'Southwark',
        'clapham': 'Lambeth',
        'battersea': 'Wandsworth',
        'putney': 'Wandsworth',
        'notting hill': 'Kensington and Chelsea',
        'paddington': 'Westminster',
        'marylebone': 'Westminster',
        'fitzrovia': 'Camden',
        'bloomsbury': 'Camden'
      }

      for (const [area, borough] of Object.entries(boroughs)) {
        if (address.includes(area)) {
          suggestedBorough = borough
          break
        }
      }

      console.log(`   Suggested Borough: ${suggestedBorough}`)
      console.log('')
    })

    // Summary
    console.log('📊 Summary:')
    console.log('===========')
    console.log(`Greater London locations available: ${londonLocations.length}`)
    console.log(`London butchers needing proper mapping: ${londonButchers.length}`)
    console.log(`Current mapping issue: All London butchers mapped to generic "London" instead of specific boroughs`)

    console.log('\n💡 Recommendations:')
    console.log('===================')
    console.log('1. Create location pages for major London boroughs')
    console.log('2. Re-map London butchers to their specific boroughs based on addresses')
    console.log('3. Update city_slug and full_url_path for each London butcher')
    console.log('4. Ensure each borough has a proper location page with SEO content')

  } catch (error) {
    console.error('❌ Analysis failed:', error.message)
  }
}

analyzeLondonLocations()