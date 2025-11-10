const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupBrokenImages() {
  console.log('🧹 Cleaning up broken image references...\n')

  // Get all butchers
  const { data: allButchers } = await supabase
    .from('butchers')
    .select('id, name, city, images')

  console.log(`Found ${allButchers?.length || 0} butchers with image data\n`)

  let cleaned = 0

  for (const butcher of allButchers || []) {
    if (butcher.images && Array.isArray(butcher.images)) {
      // Filter out local image paths that don't exist anymore
      const validImages = butcher.images.filter(img => {
        if (typeof img === 'string') {
          // Keep external URLs (Google Maps API, etc.)
          if (img.startsWith('http://') || img.startsWith('https://')) {
            return true
          }
          // Remove local paths like "/images/butchers/..." since the files don't exist
          if (img.startsWith('/images/butchers/') || img.startsWith('images/')) {
            console.log(`❌ Removing broken local image: ${img} from ${butcher.name}`)
            return false
          }
        }
        return false
      })

      // Update if we removed any images
      if (validImages.length !== butcher.images.length) {
        const { error } = await supabase
          .from('butchers')
          .update({ images: validImages })
          .eq('id', butcher.id)

        if (!error) {
          cleaned++
          console.log(`✅ Cleaned images for ${butcher.name} (${validImages.length} valid images remain)`)
        } else {
          console.error(`❌ Error updating ${butcher.name}:`, error.message)
        }
      } else if (validImages.length > 0) {
        console.log(`✅ ${butcher.name} has ${validImages.length} valid external image(s)`)
      }
    }
  }

  console.log(`\n📊 Cleanup complete: ${cleaned} butchers updated`)

  // Final verification
  const { count: remainingWithImages } = await supabase
    .from('butchers')
    .select('*', { count: 'exact', head: true })
    .not('images', 'is', null)
    .neq('images', '[]')

  console.log(`📈 Butchers still with valid images: ${remainingWithImages || 0}`)
}

cleanupBrokenImages()