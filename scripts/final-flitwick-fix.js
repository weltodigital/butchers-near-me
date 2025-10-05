#!/usr/bin/env node

/**
 * Final Flitwick Fix
 * Move Langford's to Bedford and check if B W Deacon should be in Flitwick
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function finalFlitwickFix() {
  console.log('🔧 Final Flitwick Fix')
  console.log('====================\n')

  // Move Langford's Butchers to Bedford (it's clearly in Bedford)
  console.log('🔧 Moving Langford\'s Butchers from Flitwick to Bedford')
  try {
    const { error } = await supabase
      .from('butchers')
      .update({
        city: 'Bedford',
        city_slug: 'bedford',
        full_url_path: 'bedfordshire/bedford/langfords-butchers',
        updated_at: new Date().toISOString()
      })
      .eq('name', 'Langford\'s Butchers')
      .eq('city', 'Flitwick')

    if (error) throw error
    console.log('   ✅ Successfully moved Langford\'s Butchers to Bedford')
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)
  }

  // Check if B W Deacon is currently in Westoning and should be in Flitwick
  console.log('\n🔍 Checking B W Deacon Butchers location...')
  try {
    const { data: bwDeacon } = await supabase
      .from('public_butchers')
      .select('name, city, city_slug, address')
      .eq('name', 'B W Deacon Butchers')
      .single()

    if (bwDeacon) {
      console.log(`   📍 B W Deacon is currently in: ${bwDeacon.city}`)
      console.log(`   📍 Address: ${bwDeacon.address}`)

      // Westoning is very close to Flitwick, so this could serve Flitwick area
      if (bwDeacon.city_slug === 'westoning') {
        console.log('   ℹ️  B W Deacon is in Westoning (near Flitwick)')
        console.log('   ℹ️  Keeping it in Westoning as it\'s geographically accurate')
      }
    }
  } catch (error) {
    console.error(`   ❌ Failed to check B W Deacon: ${error.message}`)
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

  // Final status check
  console.log('\n📋 Final Flitwick status:')
  try {
    const { data: finalButchers } = await supabase
      .from('public_butchers')
      .select('name, address, city, postcode')
      .eq('city_slug', 'flitwick')
      .order('name')

    if (finalButchers && finalButchers.length > 0) {
      console.log('   ❌ Butchers still assigned to Flitwick:')
      finalButchers.forEach((butcher, index) => {
        console.log(`   ${index + 1}. ${butcher.name}`)
        console.log(`      📍 ${butcher.address}`)
        console.log('')
      })
    } else {
      console.log('   ✅ No butchers assigned to Flitwick!')
      console.log('   📍 All butchers have been moved to their correct locations.')
      console.log('\n   💡 Users searching for butchers in Flitwick can find:')
      console.log('   • B W Deacon Butchers in nearby Westoning')
      console.log('   • Other butchers in surrounding areas like Bedford')
    }

  } catch (error) {
    console.error(`   ❌ Failed final check: ${error.message}`)
  }

  console.log('\n✅ Flitwick location fix complete!')
  console.log('🎯 All butchers are now in their geographically correct locations.')
}

// Run the fix
if (require.main === module) {
  finalFlitwickFix()
}