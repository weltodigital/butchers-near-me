#!/usr/bin/env node

/**
 * Debug script to check for duplicate locations in the database
 * This will tell us exactly what's causing the triplicate display issue
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugDatabaseDuplicates() {
  console.log('🔍 Database Duplicate Investigation')
  console.log('==================================\n')

  try {
    // 1. Show ALL Bedfordshire locations
    console.log('1. ALL BEDFORDSHIRE LOCATIONS:')
    console.log('--------------------------------')

    const { data: allLocations, error: allError } = await supabase
      .from('public_locations')
      .select('id, name, slug, type, county_slug, butcher_count, created_at')
      .eq('county_slug', 'bedfordshire')
      .order('name, created_at')

    if (allError) {
      console.error('❌ Error fetching all locations:', allError.message)
      return
    }

    allLocations?.forEach(location => {
      console.log(`   ID: ${location.id} | ${location.name} (${location.type}) | Slug: ${location.slug} | Butchers: ${location.butcher_count} | Created: ${location.created_at}`)
    })

    // 2. Group by name to find duplicates
    console.log('\n2. LOCATIONS GROUPED BY NAME:')
    console.log('------------------------------')

    const locationGroups = {}
    allLocations?.forEach(location => {
      if (!locationGroups[location.name]) {
        locationGroups[location.name] = []
      }
      locationGroups[location.name].push(location)
    })

    Object.entries(locationGroups).forEach(([name, locations]) => {
      if (locations.length > 1) {
        console.log(`   ⚠️  ${name}: ${locations.length} entries`)
        locations.forEach((loc, index) => {
          console.log(`      ${index + 1}. ID: ${loc.id} | Slug: ${loc.slug} | Type: ${loc.type} | Created: ${loc.created_at}`)
        })
      } else {
        console.log(`   ✅ ${name}: 1 entry`)
      }
    })

    // 3. Check specific problematic towns
    console.log('\n3. SPECIFIC PROBLEM TOWNS:')
    console.log('--------------------------')

    const problemTowns = ['Flitwick', 'Great Barford', 'Kempston', 'Westoning', 'Wilden']

    for (const town of problemTowns) {
      const { data: townData, error: townError } = await supabase
        .from('public_locations')
        .select('id, name, slug, type, county_slug, butcher_count, created_at')
        .eq('county_slug', 'bedfordshire')
        .eq('name', town)
        .order('created_at')

      if (townError) {
        console.error(`   ❌ Error fetching ${town}:`, townError.message)
        continue
      }

      console.log(`   ${town}: ${townData?.length || 0} entries`)
      townData?.forEach((entry, index) => {
        console.log(`      ${index + 1}. ID: ${entry.id} | Slug: ${entry.slug} | Type: ${entry.type} | Created: ${entry.created_at}`)
      })
    }

    // 4. Check the county page query exactly as it runs
    console.log('\n4. COUNTY PAGE QUERY SIMULATION:')
    console.log('---------------------------------')

    const { data: countyPageData, error: countyPageError } = await supabase
      .from('public_locations')
      .select('*')
      .eq('county_slug', 'bedfordshire')
      .in('type', ['city', 'town'])
      .order('name')

    if (countyPageError) {
      console.error('❌ Error simulating county page query:', countyPageError.message)
      return
    }

    console.log(`   Total results returned by county page query: ${countyPageData?.length || 0}`)

    const countyPageGroups = {}
    countyPageData?.forEach(location => {
      if (!countyPageGroups[location.name]) {
        countyPageGroups[location.name] = []
      }
      countyPageGroups[location.name].push(location)
    })

    Object.entries(countyPageGroups).forEach(([name, locations]) => {
      if (locations.length > 1) {
        console.log(`   ⚠️  DUPLICATE: ${name} appears ${locations.length} times`)
        locations.forEach((loc, index) => {
          console.log(`      ${index + 1}. ID: ${loc.id} | Type: ${loc.type} | Slug: ${loc.slug}`)
        })
      }
    })

    console.log('\n🎯 DIAGNOSIS:')
    console.log('=============')

    const duplicateNames = Object.entries(countyPageGroups).filter(([name, locations]) => locations.length > 1)

    if (duplicateNames.length > 0) {
      console.log(`❌ Found ${duplicateNames.length} towns with multiple database entries:`)
      duplicateNames.forEach(([name, locations]) => {
        console.log(`   • ${name}: ${locations.length} entries`)
      })
      console.log('\n💡 Solution: Remove duplicate entries from database')
    } else {
      console.log('✅ No duplicate entries found in database')
      console.log('💡 Issue may be in frontend caching or another source')
    }

  } catch (error) {
    console.error('❌ Debug script failed:', error.message)
  }
}

// Run if called directly
if (require.main === module) {
  debugDatabaseDuplicates()
}

module.exports = { debugDatabaseDuplicates }