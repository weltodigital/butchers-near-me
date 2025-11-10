const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testCountyPages() {
  console.log('🔍 Testing county page data access...\n')

  // Test a few counties that we just updated
  const testCounties = ['Hampshire', 'Wiltshire', 'Bedfordshire', 'Surrey', 'London']

  for (const county of testCounties) {
    console.log(`📍 Testing ${county}:`)

    // Get butchers in this county
    const { data: butchers, error: butchersError } = await supabase
      .from('butchers')
      .select('id, name, city, county')
      .eq('county', county)
      .eq('is_active', true)
      .order('city')

    if (butchersError) {
      console.error(`   ❌ Error fetching butchers: ${butchersError.message}`)
      continue
    }

    // Get unique cities in this county
    const cities = {}
    butchers.forEach(butcher => {
      if (!cities[butcher.city]) {
        cities[butcher.city] = 0
      }
      cities[butcher.city]++
    })

    console.log(`   📊 Total butchers: ${butchers.length}`)
    console.log(`   🏘️  Cities: ${Object.keys(cities).length}`)
    console.log(`   📋 Sample cities: ${Object.keys(cities).slice(0, 5).join(', ')}`)

    // Test API endpoint format
    const countySlug = county.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    console.log(`   🔗 URL slug: /${countySlug}`)
    console.log('')
  }

  // Now test if our API endpoints work with these counties
  console.log('🧪 Testing API endpoint compatibility...\n')

  // Check if we need to create API routes for counties
  console.log('📄 Checking existing API routes...')

  // Test Hampshire as an example
  console.log('\n🎯 Testing Hampshire data structure:')
  const { data: hampshireButchers, error: hampshireError } = await supabase
    .from('butchers')
    .select('id, name, city, county, address, phone, website, rating, review_count, images')
    .eq('county', 'Hampshire')
    .eq('is_active', true)
    .limit(5)

  if (hampshireError) {
    console.error(`❌ Error: ${hampshireError.message}`)
  } else {
    console.log(`✅ Successfully retrieved ${hampshireButchers.length} sample Hampshire butchers`)
    hampshireButchers.forEach(butcher => {
      console.log(`   - ${butcher.name} in ${butcher.city}`)
    })
  }

  // Test cities in Hampshire
  console.log('\n🏙️ Testing Hampshire cities:')
  const { data: hampshireCities } = await supabase
    .from('butchers')
    .select('city')
    .eq('county', 'Hampshire')
    .eq('is_active', true)

  if (hampshireCities) {
    const cityCount = {}
    hampshireCities.forEach(butcher => {
      cityCount[butcher.city] = (cityCount[butcher.city] || 0) + 1
    })

    const sortedCities = Object.entries(cityCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)

    console.log('   Top 10 cities in Hampshire:')
    sortedCities.forEach(([city, count]) => {
      console.log(`     ${city}: ${count} butcher(s)`)
    })
  }
}

testCountyPages()