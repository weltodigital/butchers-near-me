const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function scoreRecord(butcher) {
  let score = 0

  // Prefer records with more complete data
  if (butcher.address && butcher.address.length > 10) score += 3
  if (butcher.phone) score += 2
  if (butcher.website) score += 2
  if (butcher.rating && butcher.rating > 0) score += 3
  if (butcher.review_count && butcher.review_count > 0) score += 2
  if (butcher.images && butcher.images.length > 0) score += 4

  // Prefer more descriptive addresses
  if (butcher.address && (butcher.address.includes('UK') || butcher.address.includes('postcode'))) score += 2

  // Slight preference for older records (more established)
  const daysSinceCreation = (new Date() - new Date(butcher.created_at)) / (1000 * 60 * 60 * 24)
  if (daysSinceCreation > 30) score += 1

  return score
}

async function removeDuplicatesIntelligently() {
  console.log('🧠 Smart duplicate removal starting...\n')

  // Get all butchers
  const { data: butchers, error } = await supabase
    .from('butchers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching butchers:', error)
    return
  }

  console.log(`📊 Total butchers: ${butchers.length}`)

  // Group duplicates by name + city
  const duplicateGroups = {}
  butchers.forEach(butcher => {
    const key = `${butcher.name.toLowerCase().trim()}|${butcher.city.toLowerCase().trim()}`
    if (!duplicateGroups[key]) {
      duplicateGroups[key] = []
    }
    duplicateGroups[key].push(butcher)
  })

  // Find actual duplicate groups (more than 1 record)
  const duplicates = Object.values(duplicateGroups).filter(group => group.length > 1)

  console.log(`🔍 Found ${duplicates.length} duplicate groups`)

  let totalRemoved = 0
  let totalKept = 0

  for (const group of duplicates) {
    // Score each record in the group
    const scoredGroup = group.map(butcher => ({
      ...butcher,
      score: scoreRecord(butcher)
    }))

    // Sort by score (descending) then by creation date (ascending for tie-breaking)
    scoredGroup.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return new Date(a.created_at) - new Date(b.created_at)
    })

    const keepRecord = scoredGroup[0]
    const removeRecords = scoredGroup.slice(1)

    console.log(`\n📍 "${keepRecord.name}" in ${keepRecord.city}:`)
    console.log(`   ✅ KEEPING: ID ${keepRecord.id.slice(0, 8)}... (Score: ${keepRecord.score})`)
    console.log(`      Address: ${keepRecord.address || 'N/A'}`)
    console.log(`      Phone: ${keepRecord.phone || 'N/A'}`)
    console.log(`      Images: ${keepRecord.images ? keepRecord.images.length : 0}`)
    console.log(`      Rating: ${keepRecord.rating || 'N/A'}`)

    console.log(`   🗑️  REMOVING ${removeRecords.length} duplicate(s):`)

    for (const record of removeRecords) {
      console.log(`      - ID ${record.id.slice(0, 8)}... (Score: ${record.score}) - ${record.address || 'No address'}`)

      const { error: deleteError } = await supabase
        .from('butchers')
        .delete()
        .eq('id', record.id)

      if (deleteError) {
        console.error(`        ❌ Error removing: ${deleteError.message}`)
      } else {
        console.log(`        ✅ Removed successfully`)
        totalRemoved++
      }
    }

    totalKept++

    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`\n✅ SMART DEDUPLICATION COMPLETE:`)
  console.log(`📊 Kept ${totalKept} unique butchers (best records)`)
  console.log(`🗑️  Removed ${totalRemoved} duplicate records`)

  // Final verification
  const { count: finalCount } = await supabase
    .from('butchers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  console.log(`📈 Final active butcher count: ${finalCount}`)

  // Show updated county distribution
  console.log('\n📈 Updated county distribution (top 10):')
  const { data: finalCounties } = await supabase
    .from('butchers')
    .select('county')
    .eq('is_active', true)
    .not('county', 'is', null)

  if (finalCounties) {
    const countyCounts = {}
    finalCounties.forEach(butcher => {
      countyCounts[butcher.county] = (countyCounts[butcher.county] || 0) + 1
    })

    Object.entries(countyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([county, count]) => {
        console.log(`   ${county}: ${count} butchers`)
      })
  }
}

removeDuplicatesIntelligently()