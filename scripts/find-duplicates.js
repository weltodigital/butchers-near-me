const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function findDuplicates() {
  console.log('🔍 Searching for duplicate butchers...\n')

  // Get all butchers
  const { data: butchers, error } = await supabase
    .from('butchers')
    .select('id, name, city, address, phone, website, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching butchers:', error)
    return
  }

  console.log(`📊 Total butchers: ${butchers.length}`)

  // Find duplicates by different criteria
  const duplicatesByNameCity = {}
  const duplicatesByNameAddress = {}
  const duplicatesByPhone = {}
  const duplicatesByWebsite = {}

  butchers.forEach(butcher => {
    // Group by name + city (most common duplicate scenario)
    const nameCity = `${butcher.name.toLowerCase().trim()}|${butcher.city.toLowerCase().trim()}`
    if (!duplicatesByNameCity[nameCity]) {
      duplicatesByNameCity[nameCity] = []
    }
    duplicatesByNameCity[nameCity].push(butcher)

    // Group by name + address
    if (butcher.address) {
      const nameAddress = `${butcher.name.toLowerCase().trim()}|${butcher.address.toLowerCase().trim()}`
      if (!duplicatesByNameAddress[nameAddress]) {
        duplicatesByNameAddress[nameAddress] = []
      }
      duplicatesByNameAddress[nameAddress].push(butcher)
    }

    // Group by phone (if exists)
    if (butcher.phone) {
      const phone = butcher.phone.replace(/\s/g, '').toLowerCase()
      if (!duplicatesByPhone[phone]) {
        duplicatesByPhone[phone] = []
      }
      duplicatesByPhone[phone].push(butcher)
    }

    // Group by website (if exists)
    if (butcher.website) {
      const website = butcher.website.toLowerCase().trim()
      if (!duplicatesByWebsite[website]) {
        duplicatesByWebsite[website] = []
      }
      duplicatesByWebsite[website].push(butcher)
    }
  })

  // Find actual duplicates (groups with more than 1 record)
  const nameCityDuplicates = Object.values(duplicatesByNameCity).filter(group => group.length > 1)
  const nameAddressDuplicates = Object.values(duplicatesByNameAddress).filter(group => group.length > 1)
  const phoneDuplicates = Object.values(duplicatesByPhone).filter(group => group.length > 1)
  const websiteDuplicates = Object.values(duplicatesByWebsite).filter(group => group.length > 1)

  console.log('\n📋 DUPLICATE ANALYSIS:')
  console.log(`🏪 Name + City duplicates: ${nameCityDuplicates.length} groups`)
  console.log(`📍 Name + Address duplicates: ${nameAddressDuplicates.length} groups`)
  console.log(`📞 Phone number duplicates: ${phoneDuplicates.length} groups`)
  console.log(`🌐 Website duplicates: ${websiteDuplicates.length} groups`)

  // Show details for name + city duplicates (most important)
  if (nameCityDuplicates.length > 0) {
    console.log('\n🔍 NAME + CITY DUPLICATES (showing first 10):')
    nameCityDuplicates.slice(0, 10).forEach((group, index) => {
      console.log(`\n${index + 1}. "${group[0].name}" in ${group[0].city} (${group.length} records):`)
      group.forEach(butcher => {
        console.log(`   ID: ${butcher.id} | Address: ${butcher.address || 'N/A'} | Phone: ${butcher.phone || 'N/A'} | Created: ${butcher.created_at}`)
      })
    })

    if (nameCityDuplicates.length > 10) {
      console.log(`\n... and ${nameCityDuplicates.length - 10} more duplicate groups`)
    }
  }

  // Show phone duplicates if any
  if (phoneDuplicates.length > 0) {
    console.log('\n📞 PHONE NUMBER DUPLICATES (showing first 5):')
    phoneDuplicates.slice(0, 5).forEach((group, index) => {
      console.log(`\n${index + 1}. Phone: ${group[0].phone} (${group.length} records):`)
      group.forEach(butcher => {
        console.log(`   ID: ${butcher.id} | Name: ${butcher.name} | City: ${butcher.city}`)
      })
    })
  }

  // Calculate total duplicate records to remove
  const duplicateRecordsToRemove = nameCityDuplicates.reduce((total, group) => {
    return total + (group.length - 1) // Keep 1, remove the rest
  }, 0)

  console.log(`\n📊 SUMMARY:`)
  console.log(`Total records that could be removed: ${duplicateRecordsToRemove}`)
  console.log(`Database would shrink from ${butchers.length} to ${butchers.length - duplicateRecordsToRemove} butchers`)

  return {
    nameCityDuplicates,
    nameAddressDuplicates,
    phoneDuplicates,
    websiteDuplicates,
    duplicateRecordsToRemove
  }
}

async function removeDuplicates() {
  console.log('\n🗑️  REMOVING DUPLICATES...\n')

  const duplicateAnalysis = await findDuplicates()

  if (!duplicateAnalysis.nameCityDuplicates || duplicateAnalysis.nameCityDuplicates.length === 0) {
    console.log('✅ No duplicates found to remove!')
    return
  }

  console.log('\n⚠️  About to remove duplicate records...')
  console.log('This will keep the OLDEST record in each duplicate group (by created_at)')

  let removed = 0

  for (const group of duplicateAnalysis.nameCityDuplicates) {
    // Sort by created_at to keep the oldest one
    const sortedGroup = group.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    const keepRecord = sortedGroup[0]
    const removeRecords = sortedGroup.slice(1)

    console.log(`\nKeeping: ${keepRecord.name} in ${keepRecord.city} (ID: ${keepRecord.id})`)
    console.log(`Removing: ${removeRecords.length} duplicate(s)`)

    // Remove the duplicate records
    for (const record of removeRecords) {
      const { error } = await supabase
        .from('butchers')
        .delete()
        .eq('id', record.id)

      if (error) {
        console.error(`❌ Error removing ID ${record.id}:`, error.message)
      } else {
        console.log(`   ✓ Removed ID ${record.id}`)
        removed++
      }
    }

    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`\n✅ DUPLICATE REMOVAL COMPLETE:`)
  console.log(`Removed ${removed} duplicate records`)

  // Final count
  const { count: finalCount } = await supabase
    .from('butchers')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 Final database count: ${finalCount} butchers`)
}

// Run the analysis first
findDuplicates().then(() => {
  console.log('\n❓ Would you like to remove these duplicates?')
  console.log('💡 Run: node scripts/remove-duplicates.js to actually remove them')
})