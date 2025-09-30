#!/usr/bin/env node

/**
 * Debug Google Places API responses for butcher searches
 */

require('dotenv').config({ path: '.env.local' })

async function debugGooglePlaces() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.error('❌ Google Maps API key not found')
    process.exit(1)
  }

  const baseUrl = 'https://maps.googleapis.com/maps/api/place'

  // Test London search
  const lat = 51.5074
  const lng = -0.1278
  const radius = 15000
  const type = 'establishment'
  const keyword = 'butcher'

  const url = `${baseUrl}/nearbysearch/json?` +
    `location=${lat},${lng}&` +
    `radius=${radius}&` +
    `type=${type}&` +
    `keyword=${keyword}&` +
    `key=${apiKey}`

  console.log('🔍 Testing Google Places API for London butchers')
  console.log('URL:', url.replace(apiKey, 'API_KEY_HIDDEN'))

  try {
    const response = await fetch(url)
    const data = await response.json()

    console.log('Status:', data.status)
    console.log('Results count:', data.results?.length || 0)

    if (data.results && data.results.length > 0) {
      console.log('\n📋 First 5 results:')
      data.results.slice(0, 5).forEach((place, index) => {
        console.log(`\n${index + 1}. ${place.name}`)
        console.log(`   Types: ${place.types?.join(', ')}`)
        console.log(`   Address: ${place.vicinity}`)
        console.log(`   Rating: ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews)`)
        console.log(`   Business Status: ${place.business_status}`)

        // Check filtering logic
        const name = place.name.toLowerCase()
        const types = place.types || []

        const butcherKeywords = ['butcher', 'meat', 'abattoir', 'butchery']
        const hasButcherKeyword = butcherKeywords.some(keyword => name.includes(keyword))

        const excludeTypes = [
          'supermarket', 'grocery_or_supermarket', 'restaurant', 'meal_takeaway',
          'food', 'store', 'convenience_store', 'gas_station'
        ]
        const isExcludedType = excludeTypes.some(type => types.includes(type))

        console.log(`   Has butcher keyword: ${hasButcherKeyword}`)
        console.log(`   Is excluded type: ${isExcludedType}`)
        console.log(`   Would pass filter: ${hasButcherKeyword && !isExcludedType}`)
      })
    }

    if (data.error_message) {
      console.error('Error message:', data.error_message)
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }
}

debugGooglePlaces()