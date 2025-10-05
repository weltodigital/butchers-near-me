#!/usr/bin/env node

/**
 * Fix Remaining Location Issues
 * Final cleanup of remaining location assignment issues
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class RemainingLocationFixer {
  constructor() {
    this.fixedCount = 0
    this.errors = []
  }

  async fixRemainingIssues() {
    console.log('🔧 Fixing Remaining Location Issues')
    console.log('===================================\n')

    // Additional corrections needed
    const corrections = [
      // B W Deacon is in Westoning, not Flitwick
      {
        name: 'B W Deacon Butchers',
        currentCity: 'Flitwick',
        correctCity: 'Westoning',
        correctSlug: 'westoning',
        address: '10 High St, Westoning, Bedford MK45 5JG, UK'
      },
      // Langford's is still in Flitwick list but should be in Bedford
      {
        name: 'Langford\'s Butchers',
        currentCity: 'Flitwick',
        correctCity: 'Bedford',
        correctSlug: 'bedford',
        address: '6 Library Walk, Bedford MK41 8HF, UK'
      },
      // Steve's Family Butchers is in Barton-le-Clay, not Flitwick
      {
        name: 'Steve\'s Family Butchers',
        currentCity: 'Flitwick',
        correctCity: 'Barton-le-Clay',
        correctSlug: 'barton-le-clay',
        address: 'Windsor Rd, Barton-le-Clay, Bedford MK45 4NA, UK'
      },
      // The Old Butchers Shop is in Maulden, not Flitwick
      {
        name: 'The Old Butchers Shop Online',
        currentCity: 'Flitwick',
        correctCity: 'Maulden',
        correctSlug: 'maulden',
        address: '27 Clophill Rd, Maulden, Bedford MK45 2AS, UK'
      }
    ]

    // Apply each correction
    for (const correction of corrections) {
      await this.applyCorrection(correction)
    }

    // Ensure missing locations exist
    await this.ensureLocationsExist([
      { name: 'Westoning', slug: 'westoning', county_slug: 'bedfordshire', type: 'village' },
      { name: 'Barton-le-Clay', slug: 'barton-le-clay', county_slug: 'bedfordshire', type: 'village' },
      { name: 'Maulden', slug: 'maulden', county_slug: 'bedfordshire', type: 'village' }
    ])

    // Update location counts
    await this.updateLocationCounts()

    // Report results
    console.log('\n✅ Remaining Location Fix Complete!')
    console.log('===================================')
    console.log(`🔧 Butchers corrected: ${this.fixedCount}`)
    console.log(`❌ Errors: ${this.errors.length}`)

    if (this.errors.length > 0) {
      console.log('\n❌ Errors encountered:')
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`)
      })
    }

    // Show final Flitwick butchers
    await this.showFinalFlitwickButchers()
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

        if (butchers?.length > 0) {
          console.log(`   ✅ ${location.name}: ${butchers.length} butchers`)
        }
      }

    } catch (error) {
      const errorMsg = `Failed to update location counts: ${error.message}`
      console.error(`   ❌ ${errorMsg}`)
      this.errors.push(errorMsg)
    }
  }

  async showFinalFlitwickButchers() {
    console.log('\n📋 Final remaining butchers in Flitwick:')
    console.log('======================================')

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
        console.log('   ✅ No butchers remaining in Flitwick (this might be correct!)')
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
    const fixer = new RemainingLocationFixer()
    await fixer.fixRemainingIssues()

    console.log('\n🚀 All location corrections complete!')
    console.log('Check /bedfordshire/flitwick to see the results')

  } catch (error) {
    console.error('❌ Location fixing failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { RemainingLocationFixer }