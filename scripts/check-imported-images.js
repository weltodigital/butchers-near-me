const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkImportedImages() {
  console.log('🔍 Checking imported Google Maps images...\n')

  // Get all butchers
  const { data: googleImagesButchers, error } = await supabase
    .from('butchers')
    .select('id, name, city, images')
    .limit(10)

  if (error) {
    console.log('❌ Database error:', error.message)
    return
  }

  if (!googleImagesButchers || googleImagesButchers.length === 0) {
    console.log('❌ No data returned from query')
    return
  }

  console.log(`📊 Sample butchers from database:`)
  googleImagesButchers.forEach((b, i) => {
    console.log(`  ${i+1}. ${b.name} (${b.city}) - images: ${b.images ? JSON.stringify(b.images) : 'null'}`)
  })

  console.log(`\n📊 Total sample butchers: ${googleImagesButchers.length}`)

  const googleMapsImages = []
  const localImages = []

  googleImagesButchers.forEach(butcher => {
    if (butcher.images && Array.isArray(butcher.images)) {
      butcher.images.forEach(img => {
        if (typeof img === 'string') {
          if (img.includes('googleusercontent.com') || img.includes('googleapis.com')) {
            googleMapsImages.push({ name: butcher.name, city: butcher.city, image: img })
          } else if (img.startsWith('/images/butchers/')) {
            localImages.push({ name: butcher.name, city: butcher.city, image: img })
          }
        }
      })
    }
  })

  console.log(`🌐 Butchers with Google Maps images: ${googleMapsImages.length}`)
  console.log(`📁 Butchers with local images: ${localImages.length}`)

  if (googleMapsImages.length > 0) {
    console.log('\n✅ Sample Google Maps images:')
    googleMapsImages.slice(0, 5).forEach((item, i) => {
      console.log(`  ${i+1}. ${item.name} (${item.city})`)
      console.log(`     ${item.image.substring(0, 80)}...`)
    })
  }

  if (localImages.length > 0) {
    console.log('\n📁 Sample local images:')
    localImages.slice(0, 3).forEach((item, i) => {
      console.log(`  ${i+1}. ${item.name} (${item.city}) - ${item.image}`)
    })
  }

  // Check a few Bedford butchers specifically
  console.log('\n🎯 Bedford butchers:')
  const bedfordButchers = googleImagesButchers.filter(b => b.city?.toLowerCase() === 'bedford')
  bedfordButchers.slice(0, 3).forEach(butcher => {
    console.log(`  • ${butcher.name}: ${butcher.images?.length || 0} images`)
    if (butcher.images && butcher.images.length > 0) {
      console.log(`    First image: ${butcher.images[0].substring(0, 50)}...`)
    }
  })
}

checkImportedImages().catch(console.error)