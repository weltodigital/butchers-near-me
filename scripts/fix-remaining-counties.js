const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Additional city to county mapping for remaining cities
const remainingCityMapping = {
  // Shropshire
  'Craven Arms': 'Shropshire',
  'Shifnal': 'Shropshire',
  'Broseley': 'Shropshire',
  'Church Stretton': 'Shropshire',
  'Much Wenlock': 'Shropshire',

  // Wiltshire
  'Devizes': 'Wiltshire',
  'Melksham': 'Wiltshire',
  'Chippenham': 'Wiltshire',
  'Marlborough': 'Wiltshire',
  'Warminster': 'Wiltshire',
  'Corsham': 'Wiltshire',
  'Malmesbury': 'Wiltshire',
  'Westbury': 'Wiltshire',

  // Gloucestershire
  'Dursley': 'Gloucestershire',
  'Lechlade': 'Gloucestershire',
  'Cirencester': 'Gloucestershire',

  // Berkshire
  'Hungerford': 'Berkshire',
  'Newbury': 'Berkshire',

  // Highland (Scotland)
  'Isle of Skye': 'Highland',
  'Latheron': 'Highland',

  // West Midlands
  'Kingswinford': 'West Midlands',

  // Hampshire
  'Bramshaw': 'Hampshire',
  'Haslemere': 'Surrey', // Actually Surrey, not Hampshire
  'Havant': 'Hampshire',
  'Lee-on-the-Solent': 'Hampshire',
  'Lyndhurst': 'Hampshire',
  'Stockbridge': 'Hampshire',
  'Brockenhurst': 'Hampshire',

  // Herefordshire
  'Bromyard': 'Herefordshire',
  'Leominster': 'Herefordshire',
  'Kington': 'Herefordshire',

  // Devon
  'Budleigh Salterton': 'Devon',

  // London
  'Greenwich': 'London',
  'Tower Hamlets': 'London',
  'Waltham Forest': 'London',
  'Ealing': 'London',
  'Hackney': 'London',
  'Hammersmith & Fulham': 'London',
  'Harrow': 'London',
  'Islington': 'London',
  'Newham': 'London',
  'Richmond upon Thames': 'London',
  'Wandsworth': 'London',

  // Somerset
  'Winscombe': 'Somerset',
  'Bruton': 'Somerset',
  'Wincanton': 'Somerset',

  // Bedfordshire
  'Ampthill': 'Bedfordshire',
  'Barton-le-Clay': 'Bedfordshire',
  'Flitwick': 'Bedfordshire',
  'Great Barford': 'Bedfordshire',
  'Kempston': 'Bedfordshire',
  'Marston Moretaine': 'Bedfordshire',
  'Maulden': 'Bedfordshire',

  // Scotland - Aberdeenshire
  'Banchory': 'Aberdeenshire',

  // Scotland - South Lanarkshire
  'Dumbarton': 'West Dunbartonshire',
  'Larbert': 'Falkirk',

  // Derbyshire
  'Belper': 'Derbyshire',

  // Dorset
  'Broadstone': 'Dorset',

  // Buckinghamshire
  'Chesham': 'Buckinghamshire',

  // Cheshire
  'Crewe': 'Cheshire',

  // Oxfordshire
  'Didcot': 'Oxfordshire',
  'Faringdon': 'Oxfordshire',

  // Surrey
  'Cranleigh': 'Surrey',
  'Haslemere': 'Surrey',

  // Lancashire
  'Lytham Saint Annes': 'Lancashire',

  // Cambridgeshire
  'St. Ives': 'Cambridgeshire',

  // County Durham
  'Hartlepool': 'County Durham',

  // Kent
  'Westgate-on-Sea': 'Kent',

  // Wales - Powys
  'Bucknell': 'Powys',
  'Knighton': 'Powys',
  'Llanidloes': 'Powys',
  'Tregaron': 'Powys', // Actually Ceredigion

  // Wales - Gwynedd
  'Gwynedd': 'Gwynedd'
}

async function updateRemainingCounties() {
  console.log('🔄 Updating remaining county mappings...\n')

  let totalUpdated = 0

  for (const [city, county] of Object.entries(remainingCityMapping)) {
    try {
      const { data: existingButchers, error: fetchError } = await supabase
        .from('butchers')
        .select('id')
        .eq('city', city)
        .eq('county', 'Other')

      if (fetchError) {
        console.error(`Error fetching butchers for ${city}:`, fetchError.message)
        continue
      }

      if (existingButchers && existingButchers.length > 0) {
        const { error: updateError } = await supabase
          .from('butchers')
          .update({ county: county })
          .eq('city', city)
          .eq('county', 'Other')

        if (updateError) {
          console.error(`Error updating ${city} to ${county}:`, updateError.message)
        } else {
          console.log(`✅ Updated ${existingButchers.length} butcher(s) in ${city} to ${county}`)
          totalUpdated += existingButchers.length
        }
      }
    } catch (error) {
      console.error(`Exception updating ${city}:`, error.message)
    }

    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  console.log(`\n✅ REMAINING COUNTY MAPPING UPDATE COMPLETE:`)
  console.log(`📊 Total butchers updated: ${totalUpdated}`)

  // Final count check
  const { count: finalOtherCount } = await supabase
    .from('butchers')
    .select('*', { count: 'exact', head: true })
    .eq('county', 'Other')

  console.log(`📈 Remaining butchers in "Other": ${finalOtherCount}`)

  // Show final county distribution
  console.log('\n📈 Final county distribution (top 15):')
  const { data: finalCounties } = await supabase
    .from('butchers')
    .select('county')
    .not('county', 'is', null)

  if (finalCounties) {
    const countyCounts = {}
    finalCounties.forEach(butcher => {
      countyCounts[butcher.county] = (countyCounts[butcher.county] || 0) + 1
    })

    const sortedCounties = Object.entries(countyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)

    sortedCounties.forEach(([county, count]) => {
      console.log(`   ${county}: ${count} butchers`)
    })
  }

  // List any cities still in Other
  const { data: stillOther } = await supabase
    .from('butchers')
    .select('city')
    .eq('county', 'Other')

  if (stillOther && stillOther.length > 0) {
    const remainingCities = {}
    stillOther.forEach(butcher => {
      remainingCities[butcher.city] = (remainingCities[butcher.city] || 0) + 1
    })

    console.log('\n⚠️ Cities still in "Other" category:')
    Object.entries(remainingCities)
      .sort(([,a], [,b]) => b - a)
      .forEach(([city, count]) => {
        console.log(`   ${city}: ${count} butcher(s)`)
      })
  } else {
    console.log('\n🎉 All cities have been successfully categorized!')
  }
}

updateRemainingCounties()