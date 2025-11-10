const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function removeExactDuplicates() {
  console.log('🔨 Removing exact duplicates with same name, city, address, and phone...\n')

  // Get all active butchers
  const { data: allButchers } = await supabase
    .from('butchers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true }) // Keep older records

  // Group by name + city + address + phone (exact matches)
  const duplicateGroups = {}
  allButchers.forEach(butcher => {
    const key = `${butcher.name?.toLowerCase().trim() || ''}|${butcher.city?.toLowerCase().trim() || ''}|${butcher.address?.toLowerCase().trim() || ''}|${butcher.phone?.toLowerCase().trim() || ''}`
    if (!duplicateGroups[key]) {
      duplicateGroups[key] = []
    }
    duplicateGroups[key].push(butcher)
  })

  // Find groups with multiple records
  const exactDuplicates = Object.entries(duplicateGroups)
    .filter(([key, butchers]) => butchers.length > 1)

  console.log(`Found ${exactDuplicates.length} groups of exact duplicates\n`)

  let totalRemoved = 0

  for (const [key, butchers] of exactDuplicates) {
    console.log(`📍 Duplicate group: "${butchers[0].name}" in ${butchers[0].city} (${butchers.length} records)`)

    // Sort by creation date (keep the oldest one)
    const sortedButchers = butchers.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    const keepRecord = sortedButchers[0]
    const removeRecords = sortedButchers.slice(1)

    console.log(`   ✅ Keeping: ${keepRecord.id} (created: ${keepRecord.created_at})`)

    for (const record of removeRecords) {
      console.log(`   🗑️  Removing: ${record.id} (created: ${record.created_at})`)

      const { error } = await supabase
        .from('butchers')
        .delete()
        .eq('id', record.id)

      if (error) {
        console.error(`   ❌ Error: ${error.message}`)
      } else {
        totalRemoved++
      }

      // Small delay to avoid overwhelming database
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    console.log('')
  }

  console.log(`✅ EXACT DUPLICATE REMOVAL COMPLETE:`)
  console.log(`🗑️  Removed ${totalRemoved} exact duplicate records`)

  // Final count
  const { count: finalCount } = await supabase
    .from('butchers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  console.log(`📊 Final database count: ${finalCount} unique butchers`)

  // Verify no exact duplicates remain
  console.log('\n🔍 Final verification...')
  const { data: finalButchers } = await supabase
    .from('butchers')
    .select('name, city, address, phone')
    .eq('is_active', true)

  const finalGroups = {}
  finalButchers.forEach(butcher => {
    const key = `${butcher.name?.toLowerCase().trim() || ''}|${butcher.city?.toLowerCase().trim() || ''}|${butcher.address?.toLowerCase().trim() || ''}|${butcher.phone?.toLowerCase().trim() || ''}`
    finalGroups[key] = (finalGroups[key] || 0) + 1
  })

  const remainingDuplicates = Object.values(finalGroups).filter(count => count > 1).length

  if (remainingDuplicates === 0) {
    console.log('🎉 SUCCESS: No exact duplicates remaining!')
  } else {
    console.log(`⚠️  Warning: ${remainingDuplicates} groups still have duplicates`)
  }
}

removeExactDuplicates()