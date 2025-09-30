#!/usr/bin/env node

/**
 * Test database connection and data retrieval
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabase() {
  console.log('🧪 Testing MeatMap UK Database Connection')
  console.log('=========================================\n')

  try {
    // Test 1: Check if butchers table exists and has data
    console.log('1. Testing butchers table...')
    const { data: butchers, error: butchersError } = await supabase
      .from('butchers')
      .select('id, name, city, rating')
      .limit(5)

    if (butchersError) {
      console.log('   ❌ Error:', butchersError.message)
      console.log('   💡 Make sure the butchers table exists in your Supabase database')
    } else {
      console.log('   ✅ Butchers table accessible')
      console.log(`   📊 Found ${butchers.length} butchers:`)
      butchers.forEach(butcher => {
        console.log(`      - ${butcher.name} (${butcher.city}) - ⭐ ${butcher.rating}`)
      })
    }

    // Test 2: Check if reviews table exists and has data
    console.log('\n2. Testing reviews table...')
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, user_name, rating, title')
      .limit(3)

    if (reviewsError) {
      console.log('   ❌ Error:', reviewsError.message)
      console.log('   💡 Make sure the reviews table exists in your Supabase database')
    } else {
      console.log('   ✅ Reviews table accessible')
      console.log(`   📊 Found ${reviews.length} reviews:`)
      reviews.forEach(review => {
        console.log(`      - ${review.user_name}: "${review.title}" (${review.rating}/5)`)
      })
    }

    // Test 3: Test search functionality
    console.log('\n3. Testing search functionality...')
    const { data: searchResults, error: searchError } = await supabase
      .from('butchers')
      .select('name, city')
      .ilike('name', '%Smith%')
      .limit(3)

    if (searchError) {
      console.log('   ❌ Search error:', searchError.message)
    } else {
      console.log('   ✅ Search functionality working')
      console.log(`   📊 Found ${searchResults.length} results for "Smith"`)
    }

    // Test 4: Test city filtering
    console.log('\n4. Testing city filtering...')
    const { data: londonButchers, error: cityError } = await supabase
      .from('butchers')
      .select('name, city')
      .eq('city', 'London')
      .limit(3)

    if (cityError) {
      console.log('   ❌ City filter error:', cityError.message)
    } else {
      console.log('   ✅ City filtering working')
      console.log(`   📊 Found ${londonButchers.length} butchers in London`)
    }

    // Test 5: Test reviews by butcher
    if (butchers.length > 0) {
      console.log('\n5. Testing reviews by butcher...')
      const butcherId = butchers[0].id
      const { data: butcherReviews, error: reviewsByButcherError } = await supabase
        .from('reviews')
        .select('user_name, rating, title')
        .eq('butcher_id', butcherId)
        .limit(3)

      if (reviewsByButcherError) {
        console.log('   ❌ Reviews by butcher error:', reviewsByButcherError.message)
      } else {
        console.log('   ✅ Reviews by butcher working')
        console.log(`   📊 Found ${butcherReviews.length} reviews for ${butchers[0].name}`)
      }
    }

    console.log('\n🎉 Database test complete!')
    
    if (butchersError || reviewsError) {
      console.log('\n⚠️  Some tests failed. Please check:')
      console.log('   1. Database schema is properly set up')
      console.log('   2. Environment variables are correct')
      console.log('   3. Supabase project is active')
    } else {
      console.log('\n✅ All tests passed! Your database is ready.')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\nTroubleshooting:')
    console.log('1. Check your .env.local file has correct Supabase credentials')
    console.log('2. Ensure your Supabase project is active')
    console.log('3. Run the database setup script first')
  }
}

testDatabase()
