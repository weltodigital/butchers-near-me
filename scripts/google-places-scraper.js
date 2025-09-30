#!/usr/bin/env node

/**
 * Google Places API scraper for real UK butcher businesses
 * This script fetches genuine butcher data from Google Places
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class GooglePlacesButcherScraper {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    this.scraped = new Set()
    this.saved = []
    this.errors = []
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place'
  }

  async scrapeRealButchers() {
    console.log('🔍 Google Places API - Real UK Butcher Data')
    console.log('=============================================\n')

    if (!this.apiKey) {
      console.error('❌ Google Maps API key not found')
      console.log('Make sure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set in .env.local')
      process.exit(1)
    }

    // Major UK cities to search
    const ukCities = [
      { name: 'London', lat: 51.5074, lng: -0.1278, county: 'Greater London' },
      { name: 'Manchester', lat: 53.4808, lng: -2.2426, county: 'Greater Manchester' },
      { name: 'Birmingham', lat: 52.4862, lng: -1.8904, county: 'West Midlands' },
      { name: 'Edinburgh', lat: 55.9533, lng: -3.1883, county: 'Scotland' },
      { name: 'Glasgow', lat: 55.8642, lng: -4.2518, county: 'Scotland' },
      { name: 'Leeds', lat: 53.8008, lng: -1.5491, county: 'West Yorkshire' },
      { name: 'Liverpool', lat: 53.4084, lng: -2.9916, county: 'Merseyside' },
      { name: 'Bristol', lat: 51.4545, lng: -2.5879, county: 'Bristol' },
      { name: 'Oxford', lat: 51.7520, lng: -1.2577, county: 'Oxfordshire' },
      { name: 'Cambridge', lat: 52.2053, lng: 0.1218, county: 'Cambridgeshire' },
      { name: 'Bath', lat: 51.3758, lng: -2.3599, county: 'Somerset' },
      { name: 'York', lat: 53.9600, lng: -1.0873, county: 'North Yorkshire' }
    ]

    console.log(`🎯 Searching ${ukCities.length} major UK cities`)
    console.log('📍 Using Google Places API for real business data\n')

    for (const city of ukCities) {
      console.log(`🔍 Searching for butchers in ${city.name}...`)
      try {
        const butchers = await this.searchButchersInCity(city)
        console.log(`   ✅ Found ${butchers.length} butchers in ${city.name}`)

        // Process each butcher found
        for (const butcher of butchers) {
          const processedButcher = await this.processButcherData(butcher, city)
          if (processedButcher && !this.scraped.has(this.getBusinessKey(processedButcher))) {
            this.scraped.add(this.getBusinessKey(processedButcher))
            this.saved.push(processedButcher)
          }
        }

        // Rate limiting - wait between cities
        await this.delay(1000)
      } catch (error) {
        console.error(`   ❌ Error searching ${city.name}:`, error.message)
        this.errors.push({ city: city.name, error: error.message })
      }
    }

    // Save to database
    if (this.saved.length > 0) {
      await this.saveToDatabase()
    }

    // Report results
    console.log('\n🎉 Google Places Scraping Complete!')
    console.log('===================================')
    console.log(`📊 Cities searched: ${ukCities.length}`)
    console.log(`🏪 Real butchers found: ${this.saved.length}`)
    console.log(`💾 Successfully saved: ${this.saved.filter(b => b.saved).length}`)
    console.log(`❌ Errors: ${this.errors.length}`)

    if (this.saved.length > 0) {
      console.log('\n📋 Sample real butchers found:')
      this.saved.slice(0, 5).forEach((butcher, index) => {
        console.log(`   ${index + 1}. ${butcher.name}`)
        console.log(`      📍 ${butcher.address}`)
        console.log(`      📞 ${butcher.phone || 'No phone listed'}`)
        console.log(`      ⭐ ${butcher.rating}/5 (${butcher.review_count} reviews)`)
        console.log('')
      })
    }

    return this.saved
  }

  async searchButchersInCity(city) {
    const radius = 15000 // 15km radius
    const type = 'establishment'
    const keyword = 'butcher'

    // Use Nearby Search API
    const url = `${this.baseUrl}/nearbysearch/json?` +
      `location=${city.lat},${city.lng}&` +
      `radius=${radius}&` +
      `type=${type}&` +
      `keyword=${keyword}&` +
      `key=${this.apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`)
    }

    return data.results || []
  }

  async processButcherData(place, city) {
    try {
      // Get detailed information
      const details = await this.getPlaceDetails(place.place_id)

      // Filter out non-butcher businesses
      if (!this.isActualButcher(place, details)) {
        return null
      }

      const processedData = {
        name: place.name,
        description: this.generateDescription(place, details),
        address: details?.formatted_address || place.vicinity || '',
        postcode: this.extractPostcode(details?.formatted_address || ''),
        city: city.name,
        county: city.county,
        phone: details?.formatted_phone_number || details?.international_phone_number || '',
        email: '', // Google Places doesn't provide emails
        website: details?.website || '',
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        rating: place.rating || 0,
        review_count: place.user_ratings_total || 0,
        specialties: this.extractSpecialties(place, details),
        opening_hours: this.formatOpeningHours(details?.opening_hours),
        images: this.extractImages(place),
        city_slug: this.slugify(city.name),
        county_slug: this.slugify(city.county),
        full_url_path: `${this.slugify(city.county)}/${this.slugify(city.name)}/${this.slugify(place.name)}`,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return processedData
    } catch (error) {
      console.error(`Error processing ${place.name}:`, error.message)
      return null
    }
  }

  async getPlaceDetails(placeId) {
    const fields = 'formatted_address,formatted_phone_number,international_phone_number,website,opening_hours,reviews,types'
    const url = `${this.baseUrl}/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.status === 'OK') {
        return data.result
      }
      return null
    } catch (error) {
      console.error('Error fetching place details:', error.message)
      return null
    }
  }

  isActualButcher(place, details) {
    const name = place.name.toLowerCase()
    const types = (place.types || []).concat(details?.types || [])

    // Check if it's actually a butcher
    const butcherKeywords = ['butcher', 'meat', 'abattoir', 'butchery']
    const hasButcherKeyword = butcherKeywords.some(keyword => name.includes(keyword))

    // Only exclude major supermarkets and restaurants, not specialized food stores
    const excludeTypes = [
      'supermarket', 'grocery_or_supermarket', 'restaurant', 'meal_takeaway',
      'convenience_store', 'gas_station', 'shopping_mall'
    ]
    const isExcludedType = excludeTypes.some(type => types.includes(type))

    // Also accept places that have 'food' and 'store' types but with butcher names
    const isFoodStore = types.includes('food') && types.includes('store')

    return (hasButcherKeyword && !isExcludedType) || (hasButcherKeyword && isFoodStore)
  }

  generateDescription(place, details) {
    const types = place.types || []
    const reviews = details?.reviews || []

    let description = `${place.name}`

    if (place.rating && place.user_ratings_total) {
      description += ` is a highly rated butcher shop with ${place.rating} stars from ${place.user_ratings_total} customer reviews.`
    } else {
      description += ` is a local butcher shop.`
    }

    // Add location context
    if (place.vicinity) {
      description += ` Located in ${place.vicinity}.`
    }

    // Add specialties based on types
    if (types.includes('food') || types.includes('establishment')) {
      description += ' Specializing in quality meats and traditional butchery services.'
    }

    return description.substring(0, 500) // Limit length
  }

  extractSpecialties(place, details) {
    const specialties = []
    const name = place.name.toLowerCase()
    const types = (place.types || []).concat(details?.types || [])

    // Extract from name
    if (name.includes('organic')) specialties.push('Organic')
    if (name.includes('traditional')) specialties.push('Traditional')
    if (name.includes('farm')) specialties.push('Farm-fresh')
    if (name.includes('halal')) specialties.push('Halal')
    if (name.includes('kosher')) specialties.push('Kosher')
    if (name.includes('artisan')) specialties.push('Artisan')
    if (name.includes('premium')) specialties.push('Premium')
    if (name.includes('family')) specialties.push('Family-run')

    // Add default if none found
    if (specialties.length === 0) {
      specialties.push('Fresh meats', 'Local')
    }

    return specialties
  }

  formatOpeningHours(openingHours) {
    if (!openingHours || !openingHours.weekday_text) {
      return {}
    }

    const hours = {}
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

    openingHours.weekday_text.forEach((dayText, index) => {
      const day = days[index]
      const timeMatch = dayText.match(/(\d{1,2}:\d{2}\s?[AP]M)\s*–\s*(\d{1,2}:\d{2}\s?[AP]M)/)

      if (timeMatch) {
        hours[day] = `${timeMatch[1]}-${timeMatch[2]}`
      } else if (dayText.toLowerCase().includes('closed')) {
        hours[day] = 'closed'
      }
    })

    return hours
  }

  extractImages(place) {
    const images = []

    if (place.photos && place.photos.length > 0) {
      // Use Google Places Photo API URLs
      place.photos.slice(0, 3).forEach(photo => {
        const photoUrl = `${this.baseUrl}/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${this.apiKey}`
        images.push(photoUrl)
      })
    }

    return images
  }

  extractPostcode(address) {
    const postcodeMatch = address.match(/[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}/i)
    return postcodeMatch ? postcodeMatch[0] : ''
  }

  slugify(text) {
    if (!text) return ''
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  getBusinessKey(business) {
    return `${business.name.toLowerCase()}-${business.city.toLowerCase()}`
  }

  async saveToDatabase() {
    console.log(`\n💾 Saving ${this.saved.length} real butchers to database...`)

    try {
      // Clear existing data first
      console.log('   🗑️  Clearing existing data...')
      await supabase
        .from('butchers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      // Insert new data in batches
      const batchSize = 10
      let savedCount = 0

      for (let i = 0; i < this.saved.length; i += batchSize) {
        const batch = this.saved.slice(i, i + batchSize)

        const { data, error } = await supabase
          .from('butchers')
          .insert(batch)
          .select()

        if (error) {
          console.error(`   ❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message)
        } else {
          savedCount += data.length
          console.log(`   ✅ Batch ${Math.floor(i/batchSize) + 1}: Saved ${data.length} real butchers`)

          // Mark as saved
          batch.forEach(butcher => butcher.saved = true)
        }

        await this.delay(500)
      }

      console.log(`   🎉 Successfully saved ${savedCount} real butchers to database!`)

    } catch (error) {
      console.error('   ❌ Database save failed:', error.message)
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Main execution
async function main() {
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    console.error('❌ Google Maps API key not found in .env.local')
    console.log('\n🔑 To get real data, you need a Google Maps API key with Places API enabled:')
    console.log('1. Go to: https://console.cloud.google.com/')
    console.log('2. Enable the Places API')
    console.log('3. Create an API key')
    console.log('4. Add it to your .env.local file')
    process.exit(1)
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Supabase environment variables not found')
    process.exit(1)
  }

  try {
    const scraper = new GooglePlacesButcherScraper()
    const results = await scraper.scrapeRealButchers()

    console.log('\n🚀 Next steps:')
    console.log('1. Check your database for real butcher entries')
    console.log('2. Test the website: http://localhost:3000')
    console.log('3. All data is from real Google Places listings')
    console.log('4. Business details include real addresses, phone numbers, and reviews')

  } catch (error) {
    console.error('❌ Scraping failed:', error.message)
    process.exit(1)
  }
}

// Run the scraper
if (require.main === module) {
  main()
}

module.exports = { GooglePlacesButcherScraper }