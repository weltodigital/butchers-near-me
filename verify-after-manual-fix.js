#!/usr/bin/env node

/**
 * Verify Bedfordshire butchers after manual SQL fix has been applied
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyAfterFix() {
  console.log('🔍 VERIFYING BEDFORDSHIRE BUTCHERS AFTER MANUAL FIX')
  console.log('====================================================\n')

  try {
    // 1. Test the view structure
    console.log('1️⃣ CHECKING VIEW STRUCTURE')
    console.log('===========================\n')

    const { data: sample, error: sampleError } = await supabase
      .from('public_butchers')
      .select('*')
      .limit(1)

    if (sampleError) {
      console.error('❌ Error accessing view:', sampleError.message)
      return
    }

    if (sample && sample.length > 0) {
      console.log('✅ public_butchers view columns:')
      Object.keys(sample[0]).forEach(column => {
        const value = sample[0][column]
        const type = typeof value
        console.log(`   - ${column}: ${type} ${type === 'string' && value ? `(e.g., "${value}")` : ''}`)
      })
      console.log()
    }

    // 2. Test Bedfordshire queries
    console.log('2️⃣ TESTING BEDFORDSHIRE QUERIES')
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
      },
      {
        desc: 'Dunstable butchers',
        filter: { county_slug: 'bedfordshire', city_slug: 'dunstable' }
      }
    ]

    let totalFound = 0

    for (const test of testQueries) {
      let query = supabase.from('public_butchers').select('name, city, county, city_slug, county_slug, full_url_path')

      Object.entries(test.filter).forEach(([key, value]) => {
        query = query.eq(key, value)
      })

      const { data, error } = await query.limit(10)

      if (error) {
        console.log(`❌ ${test.desc}: ${error.message}`)
      } else {
        console.log(`🔍 ${test.desc}: Found ${data?.length || 0} butchers`)
        totalFound += data?.length || 0
        if (data && data.length > 0) {
          data.forEach(butcher => {
            console.log(`   • ${butcher.name}`)
            console.log(`     Location: ${butcher.city}, ${butcher.county}`)
            console.log(`     Slugs: ${butcher.county_slug}/${butcher.city_slug}`)
            console.log(`     URL: ${butcher.full_url_path}`)
            console.log()
          })
        }
      }
    }

    // 3. Compare with raw data
    console.log('3️⃣ COMPARING WITH RAW DATA')
    console.log('===========================\n')

    const { data: rawButchers, error: rawError } = await supabase
      .from('butchers')
      .select('name, city, county, is_active')
      .or('county.ilike.%bedford%,city.ilike.%bedford%,city.ilike.%luton%,city.ilike.%dunstable%')
      .eq('is_active', true)

    if (rawError) {
      console.error('❌ Error accessing raw butchers:', rawError.message)
    } else {
      console.log(`📊 Raw butchers table: ${rawButchers?.length || 0} Bedfordshire butchers`)
      console.log(`📊 public_butchers view: ${totalFound} accessible via queries`)

      if ((rawButchers?.length || 0) !== totalFound) {
        console.log('⚠️  Mismatch detected! Some butchers may not be accessible.')
      } else {
        console.log('✅ All raw butchers are accessible via the view!')
      }
    }

    // 4. Test website routing patterns
    console.log('\n4️⃣ TESTING WEBSITE ROUTING PATTERNS')
    console.log('=====================================\n')

    // Test the exact patterns the website uses
    const routingTests = [
      {
        desc: 'County page: /bedfordshire',
        query: () => supabase.from('public_butchers').select('*').eq('county_slug', 'bedfordshire')
      },
      {
        desc: 'City page: /bedfordshire/luton',
        query: () => supabase.from('public_butchers').select('*').eq('county_slug', 'bedfordshire').eq('city_slug', 'luton')
      },
      {
        desc: 'Individual butcher page routing test',
        query: () => supabase.from('public_butchers').select('name, full_url_path').eq('county_slug', 'bedfordshire').limit(3)
      }
    ]

    for (const test of routingTests) {
      const { data, error } = await test.query()

      if (error) {
        console.log(`❌ ${test.desc}: ${error.message}`)
      } else {
        console.log(`🔍 ${test.desc}: ${data?.length || 0} results`)
        if (data && data.length > 0 && test.desc.includes('Individual')) {
          data.forEach(butcher => {
            console.log(`   • ${butcher.name} -> /${butcher.full_url_path}`)
          })
        }
      }
    }

    console.log('\n✅ VERIFICATION COMPLETE!')
    console.log('\n📋 RECOMMENDATION:')
    console.log('====================')

    if (totalFound > 0) {
      console.log('✅ SUCCESS! Bedfordshire butchers are now accessible via the public_butchers view.')
      console.log('✅ The website should now display them correctly.')
      console.log('🔄 You may need to refresh/rebuild the website to see the changes.')
      console.log('📝 Consider updating the butcher_count in public_locations for accuracy.')
    } else {
      console.log('❌ Issue persists: No butchers found via county_slug queries.')
      console.log('🔧 Manual SQL fix may not have been applied correctly.')
      console.log('📋 Please apply the fix-public-butchers-view-properly.sql manually in Supabase.')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

verifyAfterFix().catch(console.error)