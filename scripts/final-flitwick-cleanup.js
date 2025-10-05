#!/usr/bin/env node

/**
 * Final Flitwick Cleanup
 * Fix the last 2 incorrectly assigned butchers
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function finalCleanup() {
  console.log('🧹 Final Flitwick Cleanup')
  console.log('========================\n')

  // Fix Langford's Butchers - clearly in Bedford
  console.log('🔧 Moving Langford\'s Butchers from Flitwick to Bedford')
  try {
    const { error: langfordError } = await supabase
      .from('butchers')
      .update({
        city: 'Bedford',
        city_slug: 'bedford',
        full_url_path: 'bedfordshire/bedford/langfords-butchers',
        updated_at: new Date().toISOString()
      })
      .eq('name', 'Langford\'s Butchers')
      .eq('city', 'Flitwick')

    if (langfordError) throw langfordError
    console.log('   ✅ Successfully moved Langford\'s Butchers to Bedford')
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)
  }

  // Fix Evans & Son Butchers - in Marston Moretaine
  console.log('\n🔧 Moving Evans & Son Butchers from Flitwick to Marston Moretaine')
  try {
    // First ensure Marston Moretaine location exists
    const { data: existingLocation } = await supabase
      .from('public_locations')
      .select('id')
      .eq('slug', 'marston-moretaine')
      .single()

    if (!existingLocation) {
      const { error: locationError } = await supabase
        .from('public_locations')
        .insert({
          name: 'Marston Moretaine',
          slug: 'marston-moretaine',
          county_slug: 'bedfordshire',
          type: 'town',
          butcher_count: 0
        })

      if (locationError) {
        console.log(`   ⚠️  Could not create location: ${locationError.message}`)
        // Fallback to Bedford
        console.log('   🔧 Using Bedford as fallback location')

        const { error: evansError } = await supabase
          .from('butchers')
          .update({
            city: 'Bedford',
            city_slug: 'bedford',
            full_url_path: 'bedfordshire/bedford/evans-son-butchers',
            updated_at: new Date().toISOString()
          })
          .eq('name', 'Evans & Son Butchers')
          .eq('city', 'Flitwick')

        if (evansError) throw evansError
        console.log('   ✅ Successfully moved Evans & Son Butchers to Bedford (fallback)')
      } else {
        console.log('   ✅ Created Marston Moretaine location')

        const { error: evansError } = await supabase
          .from('butchers')
          .update({
            city: 'Marston Moretaine',
            city_slug: 'marston-moretaine',
            full_url_path: 'bedfordshire/marston-moretaine/evans-son-butchers',
            updated_at: new Date().toISOString()
          })
          .eq('name', 'Evans & Son Butchers')
          .eq('city', 'Flitwick')

        if (evansError) throw evansError
        console.log('   ✅ Successfully moved Evans & Son Butchers to Marston Moretaine')
      }
    } else {
      console.log('   ℹ️  Marston Moretaine location exists')

      const { error: evansError } = await supabase
        .from('butchers')
        .update({
          city: 'Marston Moretaine',
          city_slug: 'marston-moretaine',
          full_url_path: 'bedfordshire/marston-moretaine/evans-son-butchers',
          updated_at: new Date().toISOString()
        })
        .eq('name', 'Evans & Son Butchers')
        .eq('city', 'Flitwick')

      if (evansError) throw evansError
      console.log('   ✅ Successfully moved Evans & Son Butchers to Marston Moretaine')
    }
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)
  }

  // Update location counts
  console.log('\n🔢 Updating location counts...')
  try {
    // Count remaining Flitwick butchers
    const { data: flitwickButchers } = await supabase
      .from('public_butchers')
      .select('id')
      .eq('city_slug', 'flitwick')

    const flitwickCount = flitwickButchers?.length || 0

    // Update Flitwick count
    await supabase
      .from('public_locations')
      .update({ butcher_count: flitwickCount })
      .eq('slug', 'flitwick')

    // Update Bedford count
    const { data: bedfordButchers } = await supabase
      .from('public_butchers')
      .select('id')
      .eq('city_slug', 'bedford')

    await supabase
      .from('public_locations')
      .update({ butcher_count: bedfordButchers?.length || 0 })
      .eq('slug', 'bedford')

    console.log(`   ✅ Flitwick: ${flitwickCount} butchers`)
    console.log(`   ✅ Bedford: ${bedfordButchers?.length || 0} butchers`)

  } catch (error) {
    console.error(`   ❌ Failed to update counts: ${error.message}`)
  }

  // Final check
  console.log('\n📋 Final Flitwick butchers check:')
  try {
    const { data: finalButchers } = await supabase
      .from('public_butchers')
      .select('name, address, city, postcode')
      .eq('city_slug', 'flitwick')
      .order('name')

    if (finalButchers && finalButchers.length > 0) {
      finalButchers.forEach((butcher, index) => {
        console.log(`   ${index + 1}. ${butcher.name}`)
        console.log(`      📍 ${butcher.address}`)
        console.log('')
      })
      console.log(`✅ Final result: ${finalButchers.length} butchers in Flitwick`)
    } else {
      console.log('   ✅ No butchers remaining in Flitwick!')
      console.log('   📍 All butchers have been moved to their correct locations.')
    }

  } catch (error) {
    console.error(`   ❌ Failed final check: ${error.message}`)
  }

  console.log('\n🎉 Flitwick cleanup complete!')
}

// Run the cleanup
if (require.main === module) {
  finalCleanup()
}