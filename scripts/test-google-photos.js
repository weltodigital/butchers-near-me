#!/usr/bin/env node

/**
 * Test Google Places Photo Puller for just a few butchers
 */

require('dotenv').config({ path: '.env.local' })

const { GooglePhotoPuller } = require('./pull-google-photos.js')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class TestPhotoPuller extends GooglePhotoPuller {
  /**
   * Get just a few butchers for testing
   */
  async getButchersNeedingPhotos() {
    try {
      const { data, error } = await supabase
        .from('butchers')
        .select('id, name, address, city, county, latitude, longitude, images')
        .eq('is_active', true)
        .eq('county', 'Bedfordshire')
        .or('images.is.null,images.eq.{}')
        .limit(3) // Just test with 3 butchers

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ Failed to fetch butchers:', error.message)
      return []
    }
  }
}

// Main execution
async function main() {
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    console.error('❌ Google Maps API key not found in .env.local')
    process.exit(1)
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Supabase environment variables not found')
    process.exit(1)
  }

  try {
    const puller = new TestPhotoPuller()
    await puller.pullPhotosForAllButchers()

    console.log('\n🧪 Test completed!')
    console.log('If this worked, run the full script: node scripts/pull-google-photos.js')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}