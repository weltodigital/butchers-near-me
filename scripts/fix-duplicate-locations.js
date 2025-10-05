#!/usr/bin/env node

/**
 * Fix duplicate location pages for Bedfordshire towns
 * This script removes duplicate location entries that are causing multiple cards
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixDuplicateLocations() {
  console.log('🔧 Fixing Duplicate Location Pages')
  console.log('==================================\n')

  try {
    // Step 1: Check for duplicates
    console.log('🔍 Checking for duplicate locations...')

    const { data: duplicates, error: duplicateError } = await supabase
      .from('public_locations')
      .select('name, slug, county_slug, type, id, created_at')
      .eq('county_slug', 'bedfordshire')
      .in('name', ['Flitwick', 'Great Barford', 'Kempston', 'Westoning', 'Wilden'])
      .order('name, created_at')

    if (duplicateError) {
      console.error('❌ Error checking duplicates:', duplicateError.message)
      return
    }

    // Group by name to find duplicates
    const locationGroups = {}
    duplicates?.forEach(location => {
      if (!locationGroups[location.name]) {
        locationGroups[location.name] = []
      }
      locationGroups[location.name].push(location)
    })

    // Find and display duplicates
    const duplicateLocations = Object.entries(locationGroups).filter(([name, locations]) => locations.length > 1)

    if (duplicateLocations.length === 0) {
      console.log('✅ No duplicates found!')
      return
    }

    console.log(`📊 Found duplicates for ${duplicateLocations.length} locations:`)
    duplicateLocations.forEach(([name, locations]) => {
      console.log(`   ${name}: ${locations.length} entries`)
      locations.forEach((loc, index) => {
        console.log(`      ${index + 1}. ID: ${loc.id} (${loc.created_at})`)
      })
    })

    // Step 2: Remove duplicates (keep the first, remove the rest)
    console.log('\n🗑️  Removing duplicate entries...')

    for (const [name, locations] of duplicateLocations) {
      if (locations.length > 1) {
        // Sort by created_at to keep the oldest
        locations.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

        // Remove all but the first
        const toDelete = locations.slice(1).map(loc => loc.id)

        console.log(`   Removing ${toDelete.length} duplicate(s) for ${name}...`)

        const { error: deleteError } = await supabase
          .from('public_locations')
          .delete()
          .in('id', toDelete)

        if (deleteError) {
          console.error(`   ❌ Error removing duplicates for ${name}:`, deleteError.message)
        } else {
          console.log(`   ✅ Removed ${toDelete.length} duplicate(s) for ${name}`)
        }

        // Small delay between deletions
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    // Step 3: Verify cleanup
    console.log('\n🔍 Verifying cleanup...')

    const { data: afterCleanup, error: verifyError } = await supabase
      .from('public_locations')
      .select('name, slug, county_slug, type, id')
      .eq('county_slug', 'bedfordshire')
      .in('name', ['Flitwick', 'Great Barford', 'Kempston', 'Westoning', 'Wilden'])
      .order('name')

    if (verifyError) {
      console.error('❌ Error verifying cleanup:', verifyError.message)
      return
    }

    // Group again to check for remaining duplicates
    const afterGroups = {}
    afterCleanup?.forEach(location => {
      if (!afterGroups[location.name]) {
        afterGroups[location.name] = []
      }
      afterGroups[location.name].push(location)
    })

    console.log('📊 After cleanup:')
    Object.entries(afterGroups).forEach(([name, locations]) => {
      console.log(`   ${name}: ${locations.length} entry`)
    })

    // Step 4: Show all Bedfordshire locations
    console.log('\n📋 All Bedfordshire locations:')

    const { data: allLocations, error: allError } = await supabase
      .from('public_locations')
      .select('name, slug, type, butcher_count')
      .eq('county_slug', 'bedfordshire')
      .order('type, name')

    if (allError) {
      console.error('❌ Error fetching all locations:', allError.message)
      return
    }

    allLocations?.forEach(location => {
      console.log(`   ${location.name} (${location.type}): ${location.butcher_count} butchers`)
    })

    console.log('\n🎉 Duplicate location cleanup complete!')
    console.log('✅ Each town should now appear only once on the county page')

  } catch (error) {
    console.error('❌ Script failed:', error.message)
  }
}

// Run if called directly
if (require.main === module) {
  fixDuplicateLocations()
}

module.exports = { fixDuplicateLocations }