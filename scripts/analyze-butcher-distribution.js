#!/usr/bin/env node

/**
 * Analyze the distribution of butchers across cities and towns
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function analyzeButcherDistribution() {
  console.log('🔍 Analyzing Butcher Distribution Across Cities and Towns')
  console.log('========================================================\n')

  try {
    // Get all butchers with their city and county information
    const { data: butchers, error } = await supabase
      .from('public_butchers')
      .select('id, name, city, county, city_slug, county_slug, address')
      .order('city')

    if (error) {
      console.error('❌ Error fetching butchers:', error.message)
      return
    }

    console.log(`📊 Total butchers in database: ${butchers.length}\n`)

    // Group by city
    const cityCounts = {}
    const countyTotals = {}

    butchers.forEach(butcher => {
      const cityKey = `${butcher.city}, ${butcher.county}`

      if (!cityCounts[cityKey]) {
        cityCounts[cityKey] = {
          city: butcher.city,
          county: butcher.county,
          city_slug: butcher.city_slug,
          county_slug: butcher.county_slug,
          count: 0,
          butchers: []
        }
      }

      cityCounts[cityKey].count++
      cityCounts[cityKey].butchers.push(butcher.name)

      // County totals
      if (!countyTotals[butcher.county]) {
        countyTotals[butcher.county] = 0
      }
      countyTotals[butcher.county]++
    })

    // Sort cities by butcher count (descending)
    const sortedCities = Object.values(cityCounts)
      .sort((a, b) => b.count - a.count)

    console.log('🏙️ Cities/Towns with Butchers (sorted by count):')
    console.log('===============================================')

    sortedCities.forEach((cityData, index) => {
      console.log(`${index + 1}. ${cityData.city}, ${cityData.county}`)
      console.log(`   Butchers: ${cityData.count}`)
      console.log(`   URL: /${cityData.county_slug}/${cityData.city_slug}`)

      // Show first few butcher names
      const displayNames = cityData.butchers.slice(0, 3)
      if (cityData.count > 3) {
        displayNames.push(`... and ${cityData.count - 3} more`)
      }
      console.log(`   Examples: ${displayNames.join(', ')}`)
      console.log('')
    })

    console.log('📈 Summary Statistics:')
    console.log('=====================')
    console.log(`Total cities/towns with butchers: ${sortedCities.length}`)
    console.log(`Average butchers per city: ${(butchers.length / sortedCities.length).toFixed(1)}`)

    // Top 10 cities
    console.log('\n🔥 Top 10 Cities by Butcher Count:')
    console.log('==================================')
    sortedCities.slice(0, 10).forEach((cityData, index) => {
      console.log(`${index + 1}. ${cityData.city}, ${cityData.county} (${cityData.count} butchers)`)
    })

    // County breakdown
    console.log('\n🗺️ Butchers by County:')
    console.log('======================')
    const sortedCounties = Object.entries(countyTotals)
      .sort((a, b) => b[1] - a[1])

    sortedCounties.forEach(([county, count], index) => {
      console.log(`${index + 1}. ${county}: ${count} butchers`)
    })

    // Cities with only 1 butcher
    const singleButcherCities = sortedCities.filter(city => city.count === 1)
    console.log(`\n📍 Cities with only 1 butcher: ${singleButcherCities.length}`)

    // Cities with 5+ butchers
    const multiButcherCities = sortedCities.filter(city => city.count >= 5)
    console.log(`📍 Cities with 5+ butchers: ${multiButcherCities.length}`)

  } catch (error) {
    console.error('❌ Analysis failed:', error.message)
  }
}

analyzeButcherDistribution()