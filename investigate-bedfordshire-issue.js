#!/usr/bin/env node

/**
 * Comprehensive investigation of Bedfordshire butchers issue
 * Checks database structure, data presence, and website query compatibility
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

async function investigateBedfordshireIssue() {
  console.log('🔍 COMPREHENSIVE BEDFORDSHIRE BUTCHERS INVESTIGATION')
  console.log('=======================================================\n')

  try {
    // 1. Check what tables and views exist
    console.log('1️⃣ CHECKING DATABASE STRUCTURE')
    console.log('================================\n')

    const { data: tables } = await supabase.rpc('exec', {
      sql: `
        SELECT table_name, table_type
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND (table_name LIKE '%butcher%' OR table_name LIKE '%location%')
        ORDER BY table_name;
      `
    })

    console.log('📊 Available tables and views:')
    if (tables && tables.length > 0) {
      tables.forEach(table => {
        console.log(`   - ${table.table_name} (${table.table_type})`)
      })
    } else {
      console.log('   No tables found')
    }
    console.log()

    // 2. Check public_butchers view structure and content
    console.log('2️⃣ CHECKING PUBLIC_BUTCHERS VIEW')
    console.log('==================================\n')

    try {
      const { data: viewSample, error: viewError } = await supabase
        .from('public_butchers')
        .select('*')
        .limit(1)

      if (viewError) {
        console.log('❌ public_butchers view error:', viewError.message)
      } else if (viewSample && viewSample.length > 0) {
        console.log('✅ public_butchers view exists with columns:')
        Object.keys(viewSample[0]).forEach(column => {
          console.log(`   - ${column}: ${typeof viewSample[0][column]} (${viewSample[0][column]})`)
        })
      } else {
        console.log('⚠️ public_butchers view exists but has no data')
      }
    } catch (err) {
      console.log('❌ Cannot access public_butchers view:', err.message)
    }
    console.log()

    // 3. Search for Bedfordshire butchers in public_butchers view
    console.log('3️⃣ SEARCHING FOR BEDFORDSHIRE BUTCHERS IN PUBLIC_BUTCHERS VIEW')
    console.log('===============================================================\n')

    try {
      // Try different search strategies
      const searches = [
        { field: 'county_slug', value: 'bedfordshire', desc: 'county_slug = bedfordshire' },
        { field: 'county', value: 'Bedfordshire', desc: 'county = Bedfordshire' },
        { field: 'city', value: '%bedford%', desc: 'city LIKE %bedford%', operator: 'ilike' },
        { field: 'city', value: '%luton%', desc: 'city LIKE %luton%', operator: 'ilike' },
        { field: 'city', value: '%dunstable%', desc: 'city LIKE %dunstable%', operator: 'ilike' }
      ]

      for (const search of searches) {
        try {
          let query = supabase.from('public_butchers').select('*')

          if (search.operator === 'ilike') {
            query = query.ilike(search.field, search.value)
          } else {
            query = query.eq(search.field, search.value)
          }

          const { data, error } = await query.limit(10)

          if (error) {
            console.log(`❌ ${search.desc}: ${error.message}`)
          } else {
            console.log(`🔍 ${search.desc}: Found ${data?.length || 0} butchers`)
            if (data && data.length > 0) {
              data.forEach(butcher => {
                console.log(`   • ${butcher.name} - ${butcher.city}, ${butcher.county} (${butcher.county_slug}/${butcher.city_slug})`)
              })
            }
          }
        } catch (err) {
          console.log(`❌ ${search.desc}: ${err.message}`)
        }
      }
    } catch (err) {
      console.log('❌ Error searching public_butchers:', err.message)
    }
    console.log()

    // 4. Check raw butchers table
    console.log('4️⃣ CHECKING RAW BUTCHERS TABLE')
    console.log('===============================\n')

    try {
      const { data: rawButchers, error: rawError } = await supabase
        .from('butchers')
        .select('*')
        .or('county.ilike.%bedford%,city.ilike.%bedford%,city.ilike.%luton%,city.ilike.%dunstable%')
        .limit(10)

      if (rawError) {
        console.log('❌ Raw butchers table error:', rawError.message)
      } else {
        console.log(`🥩 Found ${rawButchers?.length || 0} Bedfordshire butchers in raw table:`)
        if (rawButchers && rawButchers.length > 0) {
          rawButchers.forEach(butcher => {
            console.log(`   • ${butcher.name} - ${butcher.city}, ${butcher.county}`)
            console.log(`     Address: ${butcher.address}, ${butcher.postcode}`)
            console.log(`     Active: ${butcher.is_active}`)
            console.log(`     URL Path: ${butcher.full_url_path || 'Not set'}`)
            console.log()
          })
        }
      }
    } catch (err) {
      console.log('❌ Error accessing raw butchers table:', err.message)
    }
    console.log()

    // 5. Check public_locations for Bedfordshire
    console.log('5️⃣ CHECKING PUBLIC_LOCATIONS FOR BEDFORDSHIRE')
    console.log('===============================================\n')

    try {
      const { data: locations, error: locError } = await supabase
        .from('public_locations')
        .select('*')
        .or('name.ilike.%bedford%,county_slug.eq.bedfordshire,slug.ilike.%bedford%')
        .limit(10)

      if (locError) {
        console.log('❌ public_locations error:', locError.message)
      } else {
        console.log(`📍 Found ${locations?.length || 0} Bedfordshire locations:`)
        if (locations && locations.length > 0) {
          locations.forEach(location => {
            console.log(`   • ${location.name} (${location.type}) - Slug: ${location.slug}`)
            console.log(`     County Slug: ${location.county_slug}`)
            console.log(`     Butcher Count: ${location.butcher_count || 0}`)
            console.log(`     Full Path: ${location.full_path}`)
            console.log()
          })
        }
      }
    } catch (err) {
      console.log('❌ Error accessing public_locations:', err.message)
    }
    console.log()

    // 6. Check view definitions
    console.log('6️⃣ CHECKING VIEW DEFINITIONS')
    console.log('=============================\n')

    try {
      const { data: viewDef } = await supabase.rpc('exec', {
        sql: `
          SELECT definition
          FROM pg_views
          WHERE viewname = 'public_butchers';
        `
      })

      if (viewDef && viewDef.length > 0) {
        console.log('📋 public_butchers view definition:')
        console.log(viewDef[0].definition)
      } else {
        console.log('❌ Could not find public_butchers view definition')
      }
    } catch (err) {
      console.log('❌ Error getting view definition:', err.message)
    }
    console.log()

    // 7. Test the website's exact query pattern
    console.log('7️⃣ TESTING WEBSITE QUERY PATTERNS')
    console.log('===================================\n')

    // Test query patterns used by the website
    const testQueries = [
      {
        desc: 'Bedfordshire county page query',
        table: 'public_butchers',
        filter: { county_slug: 'bedfordshire' }
      },
      {
        desc: 'Luton city page query',
        table: 'public_butchers',
        filter: { county_slug: 'bedfordshire', city_slug: 'luton' }
      },
      {
        desc: 'Bedford city page query',
        table: 'public_butchers',
        filter: { county_slug: 'bedfordshire', city_slug: 'bedford' }
      }
    ]

    for (const test of testQueries) {
      try {
        let query = supabase.from(test.table).select('*')

        Object.entries(test.filter).forEach(([key, value]) => {
          query = query.eq(key, value)
        })

        const { data, error } = await query.limit(5)

        if (error) {
          console.log(`❌ ${test.desc}: ${error.message}`)
        } else {
          console.log(`🔍 ${test.desc}: Found ${data?.length || 0} results`)
          if (data && data.length > 0) {
            data.forEach(item => {
              console.log(`   • ${item.name} - ${item.city_slug}/${item.county_slug}`)
            })
          }
        }
      } catch (err) {
        console.log(`❌ ${test.desc}: ${err.message}`)
      }
    }

    console.log('\n✅ INVESTIGATION COMPLETE!')
    console.log('\n📋 SUMMARY OF FINDINGS:')
    console.log('========================')
    console.log('The investigation above shows:')
    console.log('1. Database structure and available tables/views')
    console.log('2. Content of public_butchers view for Bedfordshire')
    console.log('3. Raw butchers table data for Bedfordshire')
    console.log('4. Location data and butcher counts')
    console.log('5. How the website queries match the actual data')
    console.log('\nReview the output above to identify the root cause of the issue.')

  } catch (error) {
    console.error('❌ Unexpected error during investigation:', error.message)
  }
}

investigateBedfordshireIssue().catch(console.error)