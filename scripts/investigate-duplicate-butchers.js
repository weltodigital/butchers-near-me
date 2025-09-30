#!/usr/bin/env node

/**
 * Investigate duplicate butcher entries and 404 issues
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function investigateDuplicateButchers() {
  console.log('🔍 Investigating Duplicate Butcher Entries and 404 Issues')
  console.log('======================================================\n')

  try {
    // Look for Beast Butchers specifically
    const { data: beastButchers, error: beastError } = await supabase
      .from('butchers')
      .select('*')
      .ilike('name', '%beast butchers%')

    if (beastError) {
      console.error('❌ Error fetching Beast Butchers:', beastError.message)
      return
    }

    console.log(`📊 Found ${beastButchers.length} "Beast Butchers" entries:\n`)

    beastButchers.forEach((butcher, index) => {
      console.log(`${index + 1}. ID: ${butcher.id}`)
      console.log(`   Name: ${butcher.name}`)
      console.log(`   Address: ${butcher.address}`)
      console.log(`   City: ${butcher.city}, County: ${butcher.county}`)
      console.log(`   URL Path: /${butcher.full_url_path}`)
      console.log(`   Created: ${butcher.created_at}`)
      console.log('')
    })

    // Check for duplicates by name
    console.log('🔍 Checking for all duplicate butcher names:')
    console.log('==========================================')

    const { data: allButchers, error: allError } = await supabase
      .from('butchers')
      .select('name, count(*)')
      .group('name')
      .having('count(*) > 1')

    if (allError) {
      console.error('❌ Error checking duplicates:', allError.message)
      return
    }

    if (allButchers.length > 0) {
      console.log(`Found ${allButchers.length} butcher names with duplicates:\n`)

      for (const duplicate of allButchers) {
        console.log(`📋 "${duplicate.name}" (${duplicate.count} entries)`)

        // Get the specific entries for this name
        const { data: entries, error: entriesError } = await supabase
          .from('butchers')
          .select('id, address, city, county, full_url_path')
          .eq('name', duplicate.name)

        if (!entriesError) {
          entries.forEach((entry, index) => {
            console.log(`   ${index + 1}. ID: ${entry.id} | ${entry.city}, ${entry.county} | /${entry.full_url_path}`)
          })
        }
        console.log('')
      }
    } else {
      console.log('✅ No duplicate butcher names found')
    }

    // Check public_butchers view as well
    console.log('🔍 Checking public_butchers view for Beast Butchers:')
    console.log('================================================')

    const { data: publicBeast, error: publicError } = await supabase
      .from('public_butchers')
      .select('*')
      .ilike('name', '%beast butchers%')

    if (publicError) {
      console.error('❌ Error fetching from public_butchers:', publicError.message)
    } else {
      console.log(`📊 Found ${publicBeast.length} "Beast Butchers" in public view:\n`)

      publicBeast.forEach((butcher, index) => {
        console.log(`${index + 1}. Name: ${butcher.name}`)
        console.log(`   City: ${butcher.city}, County: ${butcher.county}`)
        console.log(`   URL Path: /${butcher.full_url_path}`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ Investigation failed:', error.message)
  }
}

investigateDuplicateButchers()