#!/usr/bin/env node

/**
 * Fix London butcher mapping to correct boroughs
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

async function fixLondonButcherMapping() {
  console.log('🔧 Fixing London Butcher Borough Mapping')
  console.log('========================================\n')

  try {
    // Get London butchers that need remapping
    const { data: londonButchers, error: butcherError } = await supabase
      .from('butchers')
      .select('*')
      .eq('city', 'London')
      .eq('county', 'Greater London')

    if (butcherError) {
      console.error('❌ Error fetching London butchers:', butcherError.message)
      return
    }

    console.log(`🏪 Found ${londonButchers.length} London butchers to remap\n`)

    // Manual mapping based on addresses analysis
    const butcherMappings = [
      {
        name: "Bevan's Butchers",
        address: "136 Richmond Rd, Kingston upon Thames KT2 5EZ, UK",
        borough: "Kingston upon Thames",
        borough_slug: "kingston-upon-thames"
      },
      {
        name: "Family Butchers",
        address: "164 Battersea Bridge Rd, London SW11 3AW, UK",
        borough: "Wandsworth",
        borough_slug: "wandsworth"
      },
      {
        name: "HG Walter Butchers",
        address: "51 Palliser Rd, London W14 9EB, UK",
        borough: "Hammersmith & Fulham",
        borough_slug: "hammersmith-fulham"
      },
      {
        name: "HR Parsons & Sons Butchers",
        address: "147 High St, London E17 7BX, UK",
        borough: "Waltham Forest",
        borough_slug: "waltham-forest"
      },
      {
        name: "Hussey Butchers",
        address: "64 Wapping Ln, London E1W 2RL, UK",
        borough: "Tower Hamlets",
        borough_slug: "tower-hamlets"
      },
      {
        name: "K Parsons Butchers",
        address: "Unit 4, Stratford Shopping Centre London Ground Floor, The Mall, London E15 1XA, UK",
        borough: "Newham",
        borough_slug: "newham"
      },
      {
        name: "Kola Butchers",
        address: "164 Trafalgar Rd, London SE10 9TZ, UK",
        borough: "Greenwich",
        borough_slug: "greenwich"
      },
      {
        name: "Meat N16",
        address: "104 Stoke Newington Church St, London N16 0LA, UK",
        borough: "Hackney",
        borough_slug: "hackney"
      },
      {
        name: "Meatlove Butcher",
        address: "158 High Rd. Leyton, London E15 2BX, UK",
        borough: "Waltham Forest",
        borough_slug: "waltham-forest"
      },
      {
        name: "New Eltham Butchers",
        address: "350 Footscray Rd, London SE9 2EB, UK",
        borough: "Greenwich",
        borough_slug: "greenwich"
      },
      {
        name: "Peckover Butchers",
        address: "195 Roman Rd, Bethnal Green, London E2 0QY, UK",
        borough: "Tower Hamlets",
        borough_slug: "tower-hamlets"
      },
      {
        name: "Perry's Butchers",
        address: "6a Lamb St, London E1 6EA, UK",
        borough: "Tower Hamlets",
        borough_slug: "tower-hamlets"
      },
      {
        name: "Porterford Butchers",
        address: "72 Watling St, London EC4M 9EB, UK",
        borough: "City of London",
        borough_slug: "city-of-london"
      },
      {
        name: "Provenance Village Butcher Wimbledon Village",
        address: "Unit 2, 28-31 High Street Wimbledon, London SW19 5BY, UK",
        borough: "Merton",
        borough_slug: "merton"
      },
      {
        name: "Salam Butchers",
        address: "Blackstock Rd, Finsbury Park, London N4 2JF, UK",
        borough: "Islington",
        borough_slug: "islington"
      },
      {
        name: "The Ealing Butcher & Charcutier London",
        address: "Station Parade, Uxbridge Rd, London W5 3LD, UK",
        borough: "Ealing",
        borough_slug: "ealing"
      },
      {
        name: "The Green Butcher",
        address: "Unit 2, 18 Mereway Rd, Twickenham TW2 6RG, UK",
        borough: "Richmond upon Thames",
        borough_slug: "richmond-upon-thames"
      }
    ]

    let updatedCount = 0

    console.log('🔄 Remapping butchers to correct boroughs:')
    console.log('==========================================')

    for (const mapping of butcherMappings) {
      // Find the butcher in our database
      const butcher = londonButchers.find(b => b.name === mapping.name)

      if (!butcher) {
        console.log(`⚠️  Butcher not found: ${mapping.name}`)
        continue
      }

      const newSlug = generateSlug(butcher.name)
      const newFullUrlPath = `greater-london/${mapping.borough_slug}/${newSlug}`

      console.log(`\n🔧 ${mapping.name}`)
      console.log(`   From: London, Greater London`)
      console.log(`   To: ${mapping.borough}, Greater London`)
      console.log(`   New URL: /${newFullUrlPath}`)

      // Update the butcher record
      const { error: updateError } = await supabase
        .from('butchers')
        .update({
          city: mapping.borough,
          city_slug: mapping.borough_slug,
          full_url_path: newFullUrlPath
        })
        .eq('id', butcher.id)

      if (updateError) {
        console.log(`   ❌ Failed: ${updateError.message}`)
      } else {
        console.log(`   ✅ Updated successfully`)
        updatedCount++
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`==========`)
    console.log(`Total butchers processed: ${butcherMappings.length}`)
    console.log(`Successfully updated: ${updatedCount}`)
    console.log(`Failed updates: ${butcherMappings.length - updatedCount}`)

    if (updatedCount > 0) {
      console.log('\n🎉 London butchers are now properly distributed across boroughs!')
      console.log('🔄 Next steps:')
      console.log('- Verify the updated URLs work correctly')
      console.log('- Check that butchers appear on their borough pages')
      console.log('- Update the public_locations butcher counts')
    }

  } catch (error) {
    console.error('❌ Mapping fix failed:', error.message)
  }
}

fixLondonButcherMapping()