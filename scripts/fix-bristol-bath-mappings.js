#!/usr/bin/env node

/**
 * Fix Bristol/Bath mapping issues identified in the analysis
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Function to generate URL slug from text
function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
}

async function fixBristolBathMappings() {
  console.log('🔧 Fixing Bristol/Bath Mapping Issues')
  console.log('====================================\n')

  try {
    // Get butchers with Bristol addresses mapped to Bath
    const { data: bristolButchers, error: bristolError } = await supabase
      .from('butchers')
      .select('*')
      .ilike('address', '%bristol%')
      .eq('city', 'Bath')

    if (bristolError) {
      console.error('❌ Error fetching Bristol butchers:', bristolError.message)
      return
    }

    // Get butchers with Bath addresses mapped to Bristol
    const { data: bathButchers, error: bathError } = await supabase
      .from('butchers')
      .select('*')
      .ilike('address', '%bath%')
      .eq('city', 'Bristol')

    if (bathError) {
      console.error('❌ Error fetching Bath butchers:', bathError.message)
      return
    }

    console.log(`Found ${bristolButchers.length} Bristol butchers incorrectly mapped to Bath`)
    console.log(`Found ${bathButchers.length} Bath butchers incorrectly mapped to Bristol\n`)

    let fixedCount = 0

    // Fix Bristol butchers (map to Bristol)
    if (bristolButchers.length > 0) {
      console.log('🔧 Fixing Bristol butchers mapped to Bath:')
      console.log('==========================================')

      for (const butcher of bristolButchers) {
        console.log(`Fixing: ${butcher.name}`)
        console.log(`  From: Bath, Somerset`)
        console.log(`  To: Bristol, Bristol`)

        const newSlug = generateSlug(butcher.name)
        const newFullUrlPath = `bristol/bristol/${newSlug}`

        const { error: updateError } = await supabase
          .from('butchers')
          .update({
            city: 'Bristol',
            county: 'Bristol',
            city_slug: 'bristol',
            county_slug: 'bristol',
            full_url_path: newFullUrlPath
          })
          .eq('id', butcher.id)

        if (updateError) {
          console.log(`  ❌ Failed: ${updateError.message}`)
        } else {
          console.log(`  ✅ Fixed: /${newFullUrlPath}`)
          fixedCount++
        }
        console.log('')
      }
    }

    // Fix Bath butchers (map to Bath)
    if (bathButchers.length > 0) {
      console.log('🔧 Fixing Bath butchers mapped to Bristol:')
      console.log('=========================================')

      for (const butcher of bathButchers) {
        console.log(`Fixing: ${butcher.name}`)
        console.log(`  From: Bristol, Bristol`)
        console.log(`  To: Bath, Somerset`)

        const newSlug = generateSlug(butcher.name)
        const newFullUrlPath = `somerset/bath/${newSlug}`

        const { error: updateError } = await supabase
          .from('butchers')
          .update({
            city: 'Bath',
            county: 'Somerset',
            city_slug: 'bath',
            county_slug: 'somerset',
            full_url_path: newFullUrlPath
          })
          .eq('id', butcher.id)

        if (updateError) {
          console.log(`  ❌ Failed: ${updateError.message}`)
        } else {
          console.log(`  ✅ Fixed: /${newFullUrlPath}`)
          fixedCount++
        }
        console.log('')
      }
    }

    console.log('📊 Summary:')
    console.log('===========')
    console.log(`Total butchers fixed: ${fixedCount}`)
    console.log(`Bristol butchers fixed: ${bristolButchers.length}`)
    console.log(`Bath butchers fixed: ${bathButchers.length}`)

    if (fixedCount > 0) {
      console.log('\n🔄 Next steps:')
      console.log('- Run the location sync script to update public_locations')
      console.log('- Regenerate static pages if using static generation')
      console.log('- Test the fixed URLs to ensure they work correctly')
    }

  } catch (error) {
    console.error('❌ Fix failed:', error.message)
  }
}

fixBristolBathMappings()