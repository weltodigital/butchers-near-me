#!/usr/bin/env node

/**
 * Verify and summarize all Bedfordshire butchers added to the database
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

async function verifyBedfordshireButchers() {
  console.log('📊 Bedfordshire Butchers Directory - Final Verification Report')
  console.log('==========================================================\n')

  try {
    // Get all Bedfordshire locations
    const { data: locations, error: locError } = await supabase
      .from('locations')
      .select('*')
      .or('county_slug.ilike.%bedford%,name.ilike.%bedford%,slug.ilike.%bedford%,full_path.ilike.%bedford%')
      .order('name')

    if (locError) {
      console.error('❌ Error fetching locations:', locError.message)
      return
    }

    console.log(`📍 Bedfordshire Locations Found: ${locations?.length || 0}`)
    if (locations && locations.length > 0) {
      locations.forEach(location => {
        console.log(`   - ${location.name} (${location.type}) - Slug: ${location.slug}`)
      })
    }
    console.log()

    // Get all Bedfordshire butchers
    const { data: butchers, error: butError } = await supabase
      .from('butchers')
      .select('*')
      .or('county.ilike.%bedford%,city.ilike.%bedford%,city.ilike.%luton%,city.ilike.%dunstable%,city.ilike.%biggleswade%,city.ilike.%leighton%,city.ilike.%kempston%,city.ilike.%westoning%,city.ilike.%wilden%')
      .eq('is_active', true)
      .order('city', { ascending: true })
      .order('name', { ascending: true })

    if (butError) {
      console.error('❌ Error fetching butchers:', butError.message)
      return
    }

    console.log(`🥩 Total Bedfordshire Butchers: ${butchers?.length || 0}\n`)

    if (butchers && butchers.length > 0) {
      // Group by city
      const butchersByCity = {}
      butchers.forEach(butcher => {
        if (!butchersByCity[butcher.city]) {
          butchersByCity[butcher.city] = []
        }
        butchersByCity[butcher.city].push(butcher)
      })

      console.log('📋 Butchers by City/Town:')
      console.log('========================\n')

      Object.keys(butchersByCity).sort().forEach(city => {
        console.log(`🏘️  ${city} (${butchersByCity[city].length} butchers):`)
        butchersByCity[city].forEach(butcher => {
          console.log(`   • ${butcher.name}`)
          console.log(`     Address: ${butcher.address}, ${butcher.postcode}`)
          console.log(`     Phone: ${butcher.phone || 'Not provided'}`)
          console.log(`     Website: ${butcher.website || 'Not provided'}`)
          console.log(`     Specialties: ${butcher.specialties?.join(', ') || 'None listed'}`)
          console.log(`     Rating: ${butcher.rating || 'Not rated'} (${butcher.review_count || 0} reviews)`)
          console.log(`     URL Slug: ${butcher.full_url_path || 'Not generated'}`)
          console.log()
        })
      })

      // Summary statistics
      console.log('📈 Summary Statistics:')
      console.log('=====================')
      console.log(`🏘️  Cities/Towns covered: ${Object.keys(butchersByCity).length}`)
      console.log(`🥩 Total butchers: ${butchers.length}`)
      console.log(`📱 Butchers with phone numbers: ${butchers.filter(b => b.phone).length}`)
      console.log(`🌐 Butchers with websites: ${butchers.filter(b => b.website).length}`)
      console.log(`⭐ Average rating: ${(butchers.reduce((sum, b) => sum + (b.rating || 0), 0) / butchers.length).toFixed(1)}`)
      console.log(`📝 Total reviews: ${butchers.reduce((sum, b) => sum + (b.review_count || 0), 0)}`)

      // Specialties analysis
      const allSpecialties = []
      butchers.forEach(butcher => {
        if (butcher.specialties) {
          allSpecialties.push(...butcher.specialties)
        }
      })
      const specialtyCount = {}
      allSpecialties.forEach(specialty => {
        specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1
      })

      console.log('\n🎯 Most Common Specialties:')
      console.log('===========================')
      Object.entries(specialtyCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([specialty, count]) => {
          console.log(`   ${specialty}: ${count} butchers`)
        })

    } else {
      console.log('⚠️  No Bedfordshire butchers found in database.')
    }

    console.log('\n✅ Verification complete!')

  } catch (error) {
    console.error('❌ Error during verification:', error.message)
  }
}

verifyBedfordshireButchers().catch(console.error)