const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function scoreRecord(butcher) {
  let score = 0
  if (butcher.address && butcher.address !== 'Address not available' && butcher.address.length > 10) score += 3
  if (butcher.phone) score += 2
  if (butcher.website) score += 2
  if (butcher.rating && butcher.rating > 0) score += 3
  if (butcher.review_count && butcher.review_count > 0) score += 2
  if (butcher.images && butcher.images.length > 0) score += 4
  return score
}

async function finalDuplicateCleanup() {
  console.log('🧹 Final duplicate cleanup - targeting obvious duplicates...\n')

  const { data: allButchers } = await supabase
    .from('butchers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  let removed = 0

  // 1. Clean up same phone number duplicates (these are definitely the same business)
  console.log('📞 Cleaning up same phone number duplicates...')
  const phoneGroups = {}
  allButchers.forEach(butcher => {
    if (butcher.phone) {
      const normalizedPhone = butcher.phone.replace(/[^0-9]/g, '').replace(/^44/, '').replace(/^0/, '')
      if (normalizedPhone.length >= 7) {
        if (!phoneGroups[normalizedPhone]) {
          phoneGroups[normalizedPhone] = []
        }
        phoneGroups[normalizedPhone].push(butcher)
      }
    }
  })

  const phoneGroupsToClean = Object.entries(phoneGroups)
    .filter(([phone, butchers]) => butchers.length > 1)
    .filter(([phone, butchers]) => {
      // Only clean if all butchers have the same normalized name (definitely same business)
      const firstNormalized = butchers[0].name.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(ltd|limited|butchers|butcher)/, '')
      return butchers.every(b => {
        const normalized = b.name.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(ltd|limited|butchers|butcher)/, '')
        return normalized === firstNormalized
      })
    })

  for (const [phone, butchers] of phoneGroupsToClean) {
    const scoredGroup = butchers.map(b => ({ ...b, score: scoreRecord(b) }))
    scoredGroup.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return new Date(a.created_at) - new Date(b.created_at)
    })

    const keepRecord = scoredGroup[0]
    const removeRecords = scoredGroup.slice(1)

    console.log(`📞 Phone ${phone}: Keeping "${keepRecord.name}" in ${keepRecord.city}`)

    for (const record of removeRecords) {
      console.log(`   🗑️  Removing: "${record.name}" in ${record.city} (Score: ${record.score})`)

      const { error } = await supabase
        .from('butchers')
        .delete()
        .eq('id', record.id)

      if (!error) {
        removed++
      }
    }

    await new Promise(resolve => setTimeout(resolve, 50))
  }

  // 2. Clean up exact same addresses with very similar names
  console.log('\n🏠 Cleaning up same address duplicates with similar names...')
  const addressGroups = {}
  allButchers.forEach(butcher => {
    if (butcher.address && butcher.address !== 'Address not available' && butcher.address.length > 10) {
      const normalizedAddress = butcher.address.toLowerCase().trim()
      if (!addressGroups[normalizedAddress]) {
        addressGroups[normalizedAddress] = []
      }
      addressGroups[normalizedAddress].push(butcher)
    }
  })

  const addressGroupsToClean = Object.entries(addressGroups)
    .filter(([address, butchers]) => butchers.length > 1)
    .filter(([address, butchers]) => {
      // Only clean if names are very similar (likely same business)
      if (butchers.length === 2) {
        const name1 = butchers[0].name.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(ltd|limited|butchers|butcher)/, '')
        const name2 = butchers[1].name.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(ltd|limited|butchers|butcher)/, '')
        return name1 === name2
      }
      return false
    })

  for (const [address, butchers] of addressGroupsToClean) {
    const scoredGroup = butchers.map(b => ({ ...b, score: scoreRecord(b) }))
    scoredGroup.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return new Date(a.created_at) - new Date(b.created_at)
    })

    const keepRecord = scoredGroup[0]
    const removeRecords = scoredGroup.slice(1)

    console.log(`🏠 Address "${address.slice(0, 50)}...": Keeping "${keepRecord.name}"`)

    for (const record of removeRecords) {
      console.log(`   🗑️  Removing: "${record.name}" (Score: ${record.score})`)

      const { error } = await supabase
        .from('butchers')
        .delete()
        .eq('id', record.id)

      if (!error) {
        removed++
      }
    }

    await new Promise(resolve => setTimeout(resolve, 50))
  }

  // 3. Clean up records with missing addresses that have the same name+city
  console.log('\n❓ Cleaning up records with missing addresses...')
  const missingAddresses = allButchers.filter(b => !b.address || b.address === 'Address not available')

  for (const butcher of missingAddresses) {
    // Look for another butcher with the same name and city but with a real address
    const betterVersion = allButchers.find(b =>
      b.id !== butcher.id &&
      b.name.toLowerCase().trim() === butcher.name.toLowerCase().trim() &&
      b.city.toLowerCase().trim() === butcher.city.toLowerCase().trim() &&
      b.address &&
      b.address !== 'Address not available' &&
      b.address.length > 5
    )

    if (betterVersion) {
      console.log(`❓ Removing "${butcher.name}" (no address) - keeping version with address`)

      const { error } = await supabase
        .from('butchers')
        .delete()
        .eq('id', butcher.id)

      if (!error) {
        removed++
      }

      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }

  console.log(`\n✅ FINAL CLEANUP COMPLETE:`)
  console.log(`🗑️  Removed ${removed} obvious duplicate records`)

  // Final count
  const { count: finalCount } = await supabase
    .from('butchers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  console.log(`📊 Final database count: ${finalCount} unique butchers`)

  // Check for remaining duplicates
  const { data: remainingButchers } = await supabase
    .from('butchers')
    .select('name, city')
    .eq('is_active', true)

  const nameGroups = {}
  remainingButchers.forEach(butcher => {
    const key = `${butcher.name.toLowerCase().trim()}|${butcher.city.toLowerCase().trim()}`
    nameGroups[key] = (nameGroups[key] || 0) + 1
  })

  const remainingDuplicates = Object.values(nameGroups).filter(count => count > 1).length
  console.log(`🔍 Remaining exact name+city duplicates: ${remainingDuplicates}`)

  if (remainingDuplicates === 0) {
    console.log('🎉 All exact duplicates have been eliminated!')
  } else {
    console.log('💡 Remaining duplicates may be legitimate multi-location businesses or chains.')
  }
}

finalDuplicateCleanup()