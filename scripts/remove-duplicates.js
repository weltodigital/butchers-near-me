const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function removeDuplicates() {
  console.log('🗑️  REMOVING DUPLICATES...\n')

  // Get all butchers
  const { data: butchers, error } = await supabase
    .from('butchers')
    .select('id, name, city, address, phone, website, created_at, rating, review_count')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching butchers:', error)
    return
  }

  console.log(`📊 Starting with ${butchers.length} butchers`)

  // Group by name + city
  const duplicatesByNameCity = {}

  butchers.forEach(butcher => {
    const nameCity = `${butcher.name.toLowerCase().trim()}|${butcher.city.toLowerCase().trim()}`
    if (!duplicatesByNameCity[nameCity]) {
      duplicatesByNameCity[nameCity] = []
    }
    duplicatesByNameCity[nameCity].push(butcher)
  })

  // Find groups with duplicates
  const duplicateGroups = Object.values(duplicatesByNameCity).filter(group => group.length > 1)

  console.log(`🔍 Found ${duplicateGroups.length} duplicate groups`)
  console.log(`📝 Total duplicate records to remove: ${duplicateGroups.reduce((total, group) => total + (group.length - 1), 0)}`)

  let removed = 0
  let kept = 0

  for (const group of duplicateGroups) {
    // Sort by priority:
    // 1. Higher rating first
    // 2. More reviews first
    // 3. More complete data (phone, website, address)
    // 4. Older record (created_at)
    const sortedGroup = group.sort((a, b) => {
      // Priority 1: Rating (higher is better)
      if (a.rating !== b.rating) {
        if (a.rating && !b.rating) return -1
        if (!a.rating && b.rating) return 1
        if (a.rating && b.rating) return b.rating - a.rating
      }

      // Priority 2: Review count (more is better)
      if (a.review_count !== b.review_count) {
        if (a.review_count && !b.review_count) return -1
        if (!a.review_count && b.review_count) return 1
        if (a.review_count && b.review_count) return b.review_count - a.review_count
      }

      // Priority 3: Data completeness (more fields filled is better)
      const aComplete = [a.phone, a.website, a.address].filter(Boolean).length
      const bComplete = [b.phone, b.website, b.address].filter(Boolean).length
      if (aComplete !== bComplete) {
        return bComplete - aComplete
      }

      // Priority 4: Older record (created earlier)
      return new Date(a.created_at) - new Date(b.created_at)
    })

    const keepRecord = sortedGroup[0]
    const removeRecords = sortedGroup.slice(1)

    console.log(`\n📍 ${keepRecord.name} in ${keepRecord.city}`)
    console.log(`   ✅ Keeping: ID ${keepRecord.id} (Rating: ${keepRecord.rating || 'N/A'}, Reviews: ${keepRecord.review_count || 0})`)
    console.log(`   🗑️  Removing: ${removeRecords.length} duplicate(s)`)

    kept++

    // Remove the duplicate records
    for (const record of removeRecords) {
      const { error } = await supabase
        .from('butchers')
        .delete()
        .eq('id', record.id)

      if (error) {
        console.error(`   ❌ Error removing ID ${record.id}: ${error.message}`)
      } else {
        console.log(`   ✓ Removed ID ${record.id} (Rating: ${record.rating || 'N/A'}, Reviews: ${record.review_count || 0})`)
        removed++
      }
    }

    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  console.log(`\n✅ DUPLICATE REMOVAL COMPLETE:`)
  console.log(`📊 Results:`)
  console.log(`   - Duplicate groups processed: ${duplicateGroups.length}`)
  console.log(`   - Records kept (best quality): ${kept}`)
  console.log(`   - Records removed: ${removed}`)

  // Final count
  const { count: finalCount } = await supabase
    .from('butchers')
    .select('*', { count: 'exact', head: true })

  console.log(`\n📈 Final database count: ${finalCount} butchers`)
  console.log(`💾 Database reduced by ${removed} duplicate records`)

  // Quick verification - check if duplicates still exist
  console.log('\n🔍 Quick verification...')
  const { data: verifyButchers } = await supabase
    .from('butchers')
    .select('id, name, city')

  const verifyDuplicates = {}
  verifyButchers?.forEach(butcher => {
    const nameCity = `${butcher.name.toLowerCase().trim()}|${butcher.city.toLowerCase().trim()}`
    if (!verifyDuplicates[nameCity]) {
      verifyDuplicates[nameCity] = []
    }
    verifyDuplicates[nameCity].push(butcher)
  })

  const remainingDuplicates = Object.values(verifyDuplicates).filter(group => group.length > 1)

  if (remainingDuplicates.length === 0) {
    console.log('✅ Verification passed: No duplicates found!')
  } else {
    console.log(`⚠️  Warning: ${remainingDuplicates.length} duplicate groups still exist`)
  }
}

removeDuplicates()