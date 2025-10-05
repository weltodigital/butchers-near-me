#!/usr/bin/env node

/**
 * Fix Location Assignments Script
 * Fixes butchers that are assigned to incorrect cities/locations
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class LocationFixer {
  constructor() {
    this.fixedCount = 0
    this.errors = []
  }

  async fixLocationAssignments() {
    console.log('🔧 Fixing Location Assignments')
    console.log('=============================\n')

    // Define the corrections needed
    const corrections = [
      // Butchers incorrectly assigned to Flitwick
      {
        name: 'The Meat Shop',
        currentCity: 'Flitwick',
        correctCity: 'Bedford',
        correctSlug: 'bedford',
        address: '82 Queens Dr, Bedford MK41 9BS, UK'
      },
      {
        name: 'Johnstone Family Butchers',
        currentCity: 'Flitwick',
        correctCity: 'Bedford',
        correctSlug: 'bedford',
        address: '3 The Fairway, Bedford MK41 9HD, UK'
      },
      {
        name: 'Langford\'s Butchers',
        currentCity: 'Flitwick',
        correctCity: 'Bedford',
        correctSlug: 'bedford',
        address: '6 Library Walk, Bedford MK41 8HF, UK'
      },
      {
        name: 'Eric the Butcher',
        currentCity: 'Flitwick',
        correctCity: 'Bedford',
        correctSlug: 'bedford',
        address: '3 The Fairway, Bedford MK41 9HD, UK'
      },
      {
        name: 'Lingers high class Butchers LTD',
        currentCity: 'Flitwick',
        correctCity: 'Bedford',
        correctSlug: 'bedford',
        address: '1 St Cuthbert\'s St, Bedford MK40 3JB, UK'
      },
      {
        name: 'Meat Junction Centre',
        currentCity: 'Flitwick',
        correctCity: 'Bedford',
        correctSlug: 'bedford',
        address: '84 Ampthill Rd, Bedford MK42 9JA, UK'
      },
      {
        name: 'McKenzies Butchers',
        currentCity: 'Flitwick',
        correctCity: 'Kempston',
        correctSlug: 'kempston',
        address: '100 High St, Kempston, Bedford MK42 7AR, UK'
      },
      {
        name: 'Southall Turkeys & Butchers',
        currentCity: 'Flitwick',
        correctCity: 'Great Barford',
        correctSlug: 'great-barford',
        address: 'Home Farm, Bedford Rd, Great Barford, Bedford MK44 3JF, UK'
      }
    ]

    // Apply each correction
    for (const correction of corrections) {
      await this.applyCorrection(correction)
    }

    // Ensure missing locations exist
    await this.ensureLocationsExist([
      { name: 'Kempston', slug: 'kempston', county_slug: 'bedfordshire', type: 'town' },
      { name: 'Great Barford', slug: 'great-barford', county_slug: 'bedfordshire', type: 'village' }
    ])

    // Update location counts
    await this.updateLocationCounts()

    // Report results
    console.log('\n✅ Location Assignment Fix Complete!')
    console.log('=====================================')
    console.log(`🔧 Butchers corrected: ${this.fixedCount}`)
    console.log(`❌ Errors: ${this.errors.length}`)

    if (this.errors.length > 0) {
      console.log('\n❌ Errors encountered:')
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`)
      })
    }

    // Show remaining Flitwick butchers
    await this.showRemainingFlitwickButchers()
  }

  async applyCorrection(correction) {
    console.log(`🔧 Moving "${correction.name}" from ${correction.currentCity} to ${correction.correctCity}`)

    try {
      // Create new URL path
      const newUrlPath = `bedfordshire/${correction.correctSlug}/${this.slugify(correction.name)}`

      // Update the butcher record
      const { error } = await supabase
        .from('butchers')
        .update({
          city: correction.correctCity,
          city_slug: correction.correctSlug,
          full_url_path: newUrlPath,
          updated_at: new Date().toISOString()
        })
        .eq('name', correction.name)
        .eq('city', correction.currentCity)

      if (error) {
        throw error
      }

      console.log(`   ✅ Successfully moved ${correction.name}`)
      this.fixedCount++

    } catch (error) {
      const errorMsg = `Failed to move ${correction.name}: ${error.message}`
      console.error(`   ❌ ${errorMsg}`)
      this.errors.push(errorMsg)
    }
  }

  async ensureLocationsExist(locations) {
    console.log('\n📍 Ensuring missing locations exist...')

    for (const location of locations) {
      try {
        // Check if location exists
        const { data: existing } = await supabase
          .from('public_locations')
          .select('id')
          .eq('slug', location.slug)
          .single()

        if (!existing) {
          // Create the location
          const { error } = await supabase
            .from('public_locations')
            .insert({
              name: location.name,
              slug: location.slug,
              county_slug: location.county_slug,
              type: location.type,
              butcher_count: 0
            })

          if (error) {
            throw error
          }

          console.log(`   ✅ Created location: ${location.name}`)
        } else {
          console.log(`   ℹ️  Location already exists: ${location.name}`)
        }

      } catch (error) {
        const errorMsg = `Failed to create location ${location.name}: ${error.message}`
        console.error(`   ❌ ${errorMsg}`)
        this.errors.push(errorMsg)
      }
    }
  }

  async updateLocationCounts() {
    console.log('\n🔢 Updating location butcher counts...')

    try {
      // Get all Bedfordshire locations
      const { data: locations } = await supabase
        .from('public_locations')
        .select('slug, name')
        .eq('county_slug', 'bedfordshire')

      for (const location of locations || []) {
        // Count butchers in this location
        const { data: butchers } = await supabase
          .from('public_butchers')
          .select('id')
          .eq('county_slug', 'bedfordshire')
          .eq('city_slug', location.slug)

        // Update count
        await supabase
          .from('public_locations')
          .update({ butcher_count: butchers?.length || 0 })
          .eq('slug', location.slug)

        console.log(`   ✅ ${location.name}: ${butchers?.length || 0} butchers`)
      }

    } catch (error) {
      const errorMsg = `Failed to update location counts: ${error.message}`
      console.error(`   ❌ ${errorMsg}`)
      this.errors.push(errorMsg)
    }
  }

  async showRemainingFlitwickButchers() {
    console.log('\n📋 Remaining butchers in Flitwick:')
    console.log('=================================')

    try {
      const { data: flitwickButchers } = await supabase
        .from('public_butchers')
        .select('name, address, postcode')
        .eq('city_slug', 'flitwick')
        .order('name')

      if (flitwickButchers && flitwickButchers.length > 0) {
        flitwickButchers.forEach((butcher, index) => {
          console.log(`   ${index + 1}. ${butcher.name}`)
          console.log(`      📍 ${butcher.address}`)
          console.log('')
        })
        console.log(`Total: ${flitwickButchers.length} butchers remain in Flitwick`)
      } else {
        console.log('   ⚠️  No butchers remaining in Flitwick!')
      }

    } catch (error) {
      console.error(`   ❌ Failed to fetch remaining Flitwick butchers: ${error.message}`)
    }
  }

  slugify(text) {
    if (!text) return ''
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

// Main execution
async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Supabase environment variables not found')
    process.exit(1)
  }

  try {
    const fixer = new LocationFixer()
    await fixer.fixLocationAssignments()

    console.log('\n🚀 Next steps:')
    console.log('1. Check the website to verify corrections')
    console.log('2. Ensure all butchers are in their correct locations')

  } catch (error) {
    console.error('❌ Location fixing failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { LocationFixer }