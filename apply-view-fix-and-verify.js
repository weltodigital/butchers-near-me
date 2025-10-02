#!/usr/bin/env node

/**
 * Apply the public_butchers view fix and verify Bedfordshire butchers appear correctly
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyFixAndVerify() {
  console.log('🔧 APPLYING PUBLIC_BUTCHERS VIEW FIX AND VERIFICATION')
  console.log('======================================================\n')

  try {
    // 1. Read and apply the SQL fix
    console.log('1️⃣ APPLYING SQL FIX')
    console.log('====================\n')

    const sqlPath = path.join(__dirname, 'fix-public-butchers-view-properly.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    console.log('📄 Executing SQL fix...')
    const { error: sqlError } = await supabase.rpc('exec', { sql: sqlContent })

    if (sqlError) {
      console.error('❌ Error applying SQL fix:', sqlError.message)
      return
    }

    console.log('✅ SQL fix applied successfully!\n')

    // 2. Wait a moment for the view to be created
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 3. Test the fixed view
    console.log('2️⃣ TESTING FIXED VIEW')
    console.log('======================\n')

    // Test a sample to see the new structure
    const { data: sample, error: sampleError } = await supabase
      .from('public_butchers')
      .select('*')
      .limit(1)

    if (sampleError) {
      console.error('❌ Error testing view:', sampleError.message)
      return
    }

    if (sample && sample.length > 0) {
      console.log('✅ View structure after fix:')
      Object.keys(sample[0]).forEach(column => {
        console.log(`   - ${column}: ${sample[0][column]}`)
      })
      console.log()
    }

    // 4. Test Bedfordshire queries
    console.log('3️⃣ TESTING BEDFORDSHIRE QUERIES')
    console.log('=================================\n')

    const testQueries = [
      {
        desc: 'All Bedfordshire butchers',
        filter: { county_slug: 'bedfordshire' }
      },
      {
        desc: 'Luton butchers',
        filter: { county_slug: 'bedfordshire', city_slug: 'luton' }
      },
      {
        desc: 'Bedford butchers',
        filter: { county_slug: 'bedfordshire', city_slug: 'bedford' }
      },
      {
        desc: 'Leighton Buzzard butchers',
        filter: { county_slug: 'bedfordshire', city_slug: 'leighton-buzzard' }
      }
    ]

    for (const test of testQueries) {
      let query = supabase.from('public_butchers').select('name, city, county, city_slug, county_slug')

      Object.entries(test.filter).forEach(([key, value]) => {
        query = query.eq(key, value)
      })

      const { data, error } = await query.limit(10)

      if (error) {
        console.log(`❌ ${test.desc}: ${error.message}`)
      } else {
        console.log(`🔍 ${test.desc}: Found ${data?.length || 0} butchers`)
        if (data && data.length > 0) {
          data.forEach(butcher => {
            console.log(`   • ${butcher.name} - ${butcher.city} (${butcher.city_slug})`)
          })
        }
        console.log()
      }
    }

    // 5. Check if locations need butcher count updates
    console.log('4️⃣ CHECKING LOCATION BUTCHER COUNTS')
    console.log('====================================\n')

    const { data: bedfordshireCount } = await supabase
      .from('public_butchers')
      .select('id', { count: 'exact' })
      .eq('county_slug', 'bedfordshire')

    console.log(`📊 Total Bedfordshire butchers in view: ${bedfordshireCount?.length || 0}`)

    // Check location counts
    const { data: locations } = await supabase
      .from('public_locations')
      .select('name, butcher_count, slug, county_slug')
      .eq('county_slug', 'bedfordshire')

    if (locations) {
      console.log('\n📍 Location butcher counts:')
      for (const location of locations) {
        if (location.slug === 'bedfordshire') {
          console.log(`   County - ${location.name}: ${location.butcher_count} (should be ${bedfordshireCount?.length || 0})`)
        } else {
          // Count for specific city
          const { data: cityCount } = await supabase
            .from('public_butchers')
            .select('id', { count: 'exact' })
            .eq('county_slug', 'bedfordshire')
            .eq('city_slug', location.slug)

          console.log(`   ${location.name}: ${location.butcher_count} (actual: ${cityCount?.length || 0})`)
        }
      }
    }

    console.log('\n✅ FIX APPLIED AND VERIFICATION COMPLETE!')
    console.log('\n📋 SUMMARY:')
    console.log('=============')
    console.log('✅ public_butchers view has been fixed to generate proper slugs')
    console.log('✅ Bedfordshire butchers should now be visible on the website')
    console.log('📝 You may need to update the butcher_count in public_locations')
    console.log('🔄 The website should now show Bedfordshire butchers correctly')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

applyFixAndVerify().catch(console.error)