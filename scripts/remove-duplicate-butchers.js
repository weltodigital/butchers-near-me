#!/usr/bin/env node

/**
 * Remove duplicate butcher entries
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function removeDuplicateButchers() {
  console.log('🔧 Removing Duplicate Butcher Entries')
  console.log('====================================\n')

  try {
    // Get all butchers and group by name and address to find duplicates
    const { data: allButchers, error: allError } = await supabase
      .from('butchers')
      .select('*')
      .order('created_at', { ascending: true }) // Keep the first created entry

    if (allError) {
      console.error('❌ Error fetching butchers:', allError.message)
      return
    }

    console.log(`📊 Total butchers: ${allButchers.length}`)

    // Group by name + address combination
    const grouped = {}
    const duplicates = []

    allButchers.forEach(butcher => {
      const key = `${butcher.name.toLowerCase()}|${butcher.address}`

      if (grouped[key]) {
        // This is a duplicate
        duplicates.push(butcher)
        console.log(`⚠️  Found duplicate: ${butcher.name} (ID: ${butcher.id})`)
        console.log(`   Address: ${butcher.address}`)
        console.log(`   Created: ${butcher.created_at}`)
        console.log(`   Will remove this duplicate\n`)
      } else {
        // First occurrence, keep it
        grouped[key] = butcher
      }
    })

    console.log(`📊 Found ${duplicates.length} duplicate entries to remove\n`)

    if (duplicates.length > 0) {
      console.log('🗑️  Removing duplicates:')
      console.log('=======================')

      let removedCount = 0

      for (const duplicate of duplicates) {
        const { error: deleteError } = await supabase
          .from('butchers')
          .delete()
          .eq('id', duplicate.id)

        if (deleteError) {
          console.log(`❌ Failed to remove ${duplicate.name} (${duplicate.id}): ${deleteError.message}`)
        } else {
          console.log(`✅ Removed duplicate: ${duplicate.name} (${duplicate.id})`)
          removedCount++
        }
      }

      console.log(`\n📊 Summary:`)
      console.log(`==========`)
      console.log(`Duplicates found: ${duplicates.length}`)
      console.log(`Successfully removed: ${removedCount}`)
      console.log(`Remaining butchers: ${allButchers.length - removedCount}`)

      if (removedCount > 0) {
        console.log('\n🔄 Next steps:')
        console.log('- Verify the fixed URLs work correctly')
        console.log('- Test the affected butcher pages')
      }
    } else {
      console.log('✅ No duplicates found')
    }

  } catch (error) {
    console.error('❌ Duplicate removal failed:', error.message)
  }
}

removeDuplicateButchers()