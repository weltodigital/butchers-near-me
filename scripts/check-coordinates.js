#!/usr/bin/env node

/**
 * Check butcher coordinates data for maps functionality
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkCoordinates() {
  console.log('🗺️  Checking Butcher Coordinates Data')
  console.log('====================================\n')

  try {
    // Get sample of butchers to check coordinate data
    const { data: butchers, error } = await supabase
      .from('public_butchers')
      .select('id, name, address, city, latitude, longitude')
      .limit(20)

    if (error) {
      console.error('❌ Error fetching butchers:', error.message)
      return
    }

    console.log(`📍 Checking ${butchers.length} butchers for coordinate data\n`)

    let withCoordinates = 0
    let withoutCoordinates = 0
    let invalidCoordinates = 0

    butchers.forEach((butcher, index) => {
      const hasLat = butcher.latitude !== null && butcher.latitude !== undefined
      const hasLng = butcher.longitude !== null && butcher.longitude !== undefined
      const validLat = hasLat && !isNaN(butcher.latitude) && butcher.latitude >= -90 && butcher.latitude <= 90
      const validLng = hasLng && !isNaN(butcher.longitude) && butcher.longitude >= -180 && butcher.longitude <= 180

      console.log(`${index + 1}. ${butcher.name}`)
      console.log(`   Address: ${butcher.address}, ${butcher.city}`)
      console.log(`   Latitude: ${butcher.latitude}`)
      console.log(`   Longitude: ${butcher.longitude}`)

      if (validLat && validLng) {
        console.log(`   Status: ✅ Valid coordinates`)
        withCoordinates++
      } else if (hasLat || hasLng) {
        console.log(`   Status: ⚠️  Invalid coordinates`)
        invalidCoordinates++
      } else {
        console.log(`   Status: ❌ No coordinates`)
        withoutCoordinates++
      }
      console.log('')
    })

    // Get total counts from database
    const { count: totalCount } = await supabase
      .from('public_butchers')
      .select('*', { count: 'exact', head: true })

    const { count: withCoordsCount } = await supabase
      .from('public_butchers')
      .select('*', { count: 'exact', head: true })
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    console.log(`📊 Summary:`)
    console.log(`==========`)
    console.log(`Sample checked: ${butchers.length} butchers`)
    console.log(`With valid coordinates: ${withCoordinates}`)
    console.log(`With invalid coordinates: ${invalidCoordinates}`)
    console.log(`Without coordinates: ${withoutCoordinates}`)
    console.log(``)
    console.log(`Database totals:`)
    console.log(`Total butchers: ${totalCount}`)
    console.log(`With coordinates: ${withCoordsCount || 0}`)
    console.log(`Without coordinates: ${(totalCount || 0) - (withCoordsCount || 0)}`)

    if ((withCoordsCount || 0) === 0) {
      console.log(`\n⚠️  ISSUE FOUND: No butchers have coordinate data!`)
      console.log(`This explains why maps show "loading map..." forever.`)
      console.log(`\n💡 Solutions:`)
      console.log(`1. Populate latitude/longitude data for butchers`)
      console.log(`2. Use geocoding service to convert addresses to coordinates`)
      console.log(`3. Show fallback message when no coordinate data is available`)
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message)
  }
}

checkCoordinates()