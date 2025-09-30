#!/usr/bin/env node

/**
 * Update location butcher counts based on actual butcher data
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateLocationButcherCounts() {
  console.log('🔄 Updating Location Butcher Counts')
  console.log('==================================\n')

  try {
    // Get all locations (cities, towns, counties)
    const { data: locations, error: locError } = await supabase
      .from('public_locations')
      .select('id, name, slug, type, county_slug')
      .order('name')

    if (locError) {
      console.error('❌ Error fetching locations:', locError.message)
      return
    }

    console.log(`📍 Found ${locations.length} locations to update\n`)

    let updatedCount = 0
    let errors = 0

    for (const location of locations) {
      try {
        let butcherCount = 0

        if (location.type === 'county') {
          // For counties, count all butchers in that county
          const { count, error: countError } = await supabase
            .from('public_butchers')
            .select('*', { count: 'exact', head: true })
            .eq('county_slug', location.slug)

          if (countError) {
            console.log(`❌ Error counting butchers for ${location.name}:`, countError.message)
            errors++
            continue
          }

          butcherCount = count || 0
        } else {
          // For cities/towns, count butchers in that specific city
          const { count, error: countError } = await supabase
            .from('public_butchers')
            .select('*', { count: 'exact', head: true })
            .eq('county_slug', location.county_slug)
            .eq('city_slug', location.slug)

          if (countError) {
            console.log(`❌ Error counting butchers for ${location.name}:`, countError.message)
            errors++
            continue
          }

          butcherCount = count || 0
        }

        // Update the location with the new count
        const { error: updateError } = await supabase
          .from('public_locations')
          .update({ butcher_count: butcherCount })
          .eq('id', location.id)

        if (updateError) {
          console.log(`❌ Error updating ${location.name}:`, updateError.message)
          errors++
        } else {
          console.log(`✅ ${location.name} (${location.type}): ${butcherCount} butchers`)
          updatedCount++
        }

      } catch (error) {
        console.log(`❌ Exception updating ${location.name}:`, error.message)
        errors++
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`==========`)
    console.log(`Total locations: ${locations.length}`)
    console.log(`Successfully updated: ${updatedCount}`)
    console.log(`Errors: ${errors}`)

    if (updatedCount > 0) {
      console.log('\n🎉 Location butcher counts updated successfully!')
      console.log('🔄 Next steps:')
      console.log('- Verify the counts are correct on location pages')
      console.log('- Check homepage displays correct totals')
    }

  } catch (error) {
    console.error('❌ Update failed:', error.message)
  }
}

updateLocationButcherCounts()