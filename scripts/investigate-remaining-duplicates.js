const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function investigateRemainingDuplicates() {
  console.log('🔍 Investigating remaining duplicates in the directory...\n')

  const { data: allButchers } = await supabase
    .from('butchers')
    .select('id, name, city, county, address, phone, website')
    .eq('is_active', true)
    .order('name')

  console.log(`📊 Total active butchers: ${allButchers.length}\n`)

  // 1. Check for similar business names (aggressive normalization)
  console.log('🔤 Checking for similar business names...')
  const normalizedNames = {}
  allButchers.forEach(butcher => {
    // Aggressive normalization to catch variations
    const normalized = butcher.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove punctuation
      .replace(/\b(ltd|limited|co|company|butchers|butcher|family|sons|son|the|and|&)\b/g, '') // Remove common business words
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()

    if (normalized.length > 2) { // Avoid very short normalized names
      if (!normalizedNames[normalized]) {
        normalizedNames[normalized] = []
      }
      normalizedNames[normalized].push(butcher)
    }
  })

  const similarNameGroups = Object.entries(normalizedNames)
    .filter(([name, butchers]) => butchers.length > 1)
    .slice(0, 10)

  if (similarNameGroups.length > 0) {
    console.log('Found businesses with similar names:')
    similarNameGroups.forEach(([normalized, butchers]) => {
      console.log(`\n📝 Normalized: "${normalized}"`)
      butchers.forEach(butcher => {
        console.log(`   - "${butcher.name}" in ${butcher.city}, ${butcher.county}`)
      })
    })
  }

  // 2. Check for same address different names
  console.log('\n🏠 Checking for same addresses with different business names...')
  const addressGroups = {}
  allButchers.forEach(butcher => {
    if (butcher.address && butcher.address.length > 10) {
      // Normalize address
      const normalizedAddress = butcher.address
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      if (!addressGroups[normalizedAddress]) {
        addressGroups[normalizedAddress] = []
      }
      addressGroups[normalizedAddress].push(butcher)
    }
  })

  const sameAddressGroups = Object.entries(addressGroups)
    .filter(([address, butchers]) => butchers.length > 1)
    .slice(0, 5)

  if (sameAddressGroups.length > 0) {
    console.log('Found multiple businesses at same address:')
    sameAddressGroups.forEach(([address, butchers]) => {
      console.log(`\n📍 Address: "${address}"`)
      butchers.forEach(butcher => {
        console.log(`   - "${butcher.name}" (${butcher.county})`)
      })
    })
  }

  // 3. Check for same phone number different names
  console.log('\n📞 Checking for same phone numbers with different business names...')
  const phoneGroups = {}
  allButchers.forEach(butcher => {
    if (butcher.phone) {
      // Normalize phone number
      const normalizedPhone = butcher.phone
        .replace(/[^0-9]/g, '') // Remove all non-digits
        .replace(/^44/, '') // Remove UK country code
        .replace(/^0/, '') // Remove leading 0

      if (normalizedPhone.length >= 7) {
        if (!phoneGroups[normalizedPhone]) {
          phoneGroups[normalizedPhone] = []
        }
        phoneGroups[normalizedPhone].push(butcher)
      }
    }
  })

  const samePhoneGroups = Object.entries(phoneGroups)
    .filter(([phone, butchers]) => butchers.length > 1)
    .slice(0, 5)

  if (samePhoneGroups.length > 0) {
    console.log('Found multiple businesses with same phone:')
    samePhoneGroups.forEach(([phone, butchers]) => {
      console.log(`\n📞 Phone: ${phone}`)
      butchers.forEach(butcher => {
        console.log(`   - "${butcher.name}" in ${butcher.city}, ${butcher.county}`)
      })
    })
  }

  // 4. Find potential chain stores/franchises
  console.log('\n🏪 Looking for potential chain stores or franchises...')
  const chainPatterns = ['waitrose', 'tesco', 'sainsbury', 'morrisons', 'asda', 'aldi', 'lidl', 'iceland', 'booker', 'nisa']

  const chains = {}
  allButchers.forEach(butcher => {
    const nameLower = butcher.name.toLowerCase()
    chainPatterns.forEach(pattern => {
      if (nameLower.includes(pattern)) {
        if (!chains[pattern]) {
          chains[pattern] = []
        }
        chains[pattern].push(butcher)
      }
    })
  })

  Object.entries(chains)
    .filter(([chain, butchers]) => butchers.length > 1)
    .forEach(([chain, butchers]) => {
      console.log(`\n🏪 ${chain.toUpperCase()} locations: ${butchers.length}`)
      butchers.slice(0, 3).forEach(butcher => {
        console.log(`   - ${butcher.name} in ${butcher.city}`)
      })
      if (butchers.length > 3) {
        console.log(`   ... and ${butchers.length - 3} more`)
      }
    })

  // Summary
  console.log('\n📊 INVESTIGATION SUMMARY:')
  console.log(`🔤 Similar name groups: ${similarNameGroups.length}`)
  console.log(`🏠 Same address groups: ${sameAddressGroups.length}`)
  console.log(`📞 Same phone groups: ${samePhoneGroups.length}`)

  // Calculate total potential duplicates
  const totalPotentialDuplicates =
    similarNameGroups.reduce((sum, [_, butchers]) => sum + (butchers.length - 1), 0) +
    sameAddressGroups.reduce((sum, [_, butchers]) => sum + (butchers.length - 1), 0) +
    samePhoneGroups.reduce((sum, [_, butchers]) => sum + (butchers.length - 1), 0)

  console.log(`📈 Total potential duplicate records: ${totalPotentialDuplicates}`)

  if (totalPotentialDuplicates > 0) {
    console.log('\n💡 These may be legitimate businesses at the same location or chain stores.')
    console.log('💡 Manual review recommended before removing any of these.')
  }
}

investigateRemainingDuplicates()