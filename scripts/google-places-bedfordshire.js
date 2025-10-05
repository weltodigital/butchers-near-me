#!/usr/bin/env node

/**
 * Google Places API scraper for REAL Bedfordshire butchers
 * This replaces fake data with actual Google Places business data
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class BedfordshireGooglePlacesScraper {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    this.scraped = new Set()
    this.saved = []
    this.errors = []
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place'
  }

  async scrapeBedfordshireButchers() {
    console.log('🔍 Google Places API - REAL Bedfordshire Butchers')
    console.log('===============================================\n')

    if (!this.apiKey) {
      console.error('❌ Google Maps API key not found')
      console.log('Make sure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set in .env.local')
      process.exit(1)
    }

    // Bedfordshire cities with coordinates
    const bedfordshireCities = [
      { name: 'Bedford', lat: 52.1362, lng: -0.4606, county: 'Bedfordshire' },
      { name: 'Luton', lat: 51.8787, lng: -0.4200, county: 'Bedfordshire' },
      { name: 'Dunstable', lat: 51.8860, lng: -0.5204, county: 'Bedfordshire' },
      { name: 'Biggleswade', lat: 52.0862, lng: -0.2644, county: 'Bedfordshire' },
      { name: 'Leighton Buzzard', lat: 51.9168, lng: -0.6612, county: 'Bedfordshire' },
      { name: 'Ampthill', lat: 52.0263, lng: -0.4944, county: 'Bedfordshire' },
      { name: 'Flitwick', lat: 52.0039, lng: -0.4836, county: 'Bedfordshire' }
    ]

    console.log(`🎯 Target: ${bedfordshireCities.length} Bedfordshire towns`)
    console.log('📍 Source: Google Places API (real business data)')
    console.log('🎲 Expected: 10-20 real butcher businesses\n')

    for (const city of bedfordshireCities) {
      console.log(`\n🔍 Searching Google Places for butchers in ${city.name}...`)
      try {
        const cityButchers = await this.searchCityButchers(city)
        console.log(`   ✅ Found ${cityButchers.length} real butchers in ${city.name}`)
        await this.delay(1000) // Respect API rate limits
      } catch (error) {
        console.error(`   ❌ Error searching ${city.name}:`, error.message)
        this.errors.push({ city: city.name, error: error.message })
      }
    }

    // Save to database
    if (this.saved.length > 0) {
      await this.saveToDatabase()
      await this.updateLocationCounts()
    }

    // Report results
    console.log('\n🎉 Google Places Scraping Complete!')
    console.log('===================================')
    console.log(`🏪 Real butchers found: ${this.saved.length}`)
    console.log(`❌ Errors: ${this.errors.length}`)

    if (this.saved.length > 0) {
      console.log('\n📋 Real Bedfordshire butchers from Google Places:')
      this.saved.forEach((butcher, index) => {
        console.log(`   ${index + 1}. ${butcher.name}`)
        console.log(`      📍 ${butcher.address}`)
        console.log(`      ⭐ ${butcher.rating}/5 (${butcher.review_count} reviews)`)
        console.log(`      📞 ${butcher.phone || 'Phone not listed'}`)
        console.log('')
      })
    }

    return this.saved
  }

  /**
   * Search for butchers in a specific city using Google Places
   */
  async searchCityButchers(city) {
    const query = `butcher in ${city.name}, Bedfordshire, UK`
    const searchUrl = `${this.baseUrl}/textsearch/json?query=${encodeURIComponent(query)}&key=${this.apiKey}&region=uk`

    try {
      console.log(`   🌐 Google Places query: "${query}"`)

      const response = await fetch(searchUrl)
      const data = await response.json()

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || ''}`)
      }

      if (!data.results || data.results.length === 0) {
        console.log(`   ℹ️  No butchers found in ${city.name}`)
        return []
      }

      console.log(`   📄 Processing ${data.results.length} Google Places results...`)

      const butchers = []
      for (const place of data.results) {
        try {
          // Get detailed place information
          const details = await this.getPlaceDetails(place.place_id)
          if (details && this.isValidButcher(details, place)) {
            const butcher = this.convertToButcher(details, place, city)
            if (butcher && !this.scraped.has(this.getBusinessKey(butcher))) {
              this.scraped.add(this.getBusinessKey(butcher))
              butchers.push(butcher)
              this.saved.push(butcher)
            }
          }
          await this.delay(100) // Small delay between detail requests
        } catch (error) {
          console.log(`   ⚠️  Skipped place due to error: ${error.message}`)
        }
      }

      return butchers
    } catch (error) {
      console.error(`   ❌ Failed to search ${city.name}:`, error.message)
      return []
    }
  }

  /**
   * Get detailed place information
   */
  async getPlaceDetails(placeId) {
    const detailsUrl = `${this.baseUrl}/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,geometry,types&key=${this.apiKey}`

    const response = await fetch(detailsUrl)
    const data = await response.json()

    if (data.status === 'OK') {
      return data.result
    } else {
      throw new Error(`Place details error: ${data.status}`)
    }
  }

  /**
   * Check if place is actually a butcher
   */
  isValidButcher(details, place) {
    const name = (details.name || '').toLowerCase()
    const types = details.types || []

    // Must contain butcher-related keywords
    const butcherKeywords = ['butcher', 'meat', 'butchery']
    const hasButcherKeyword = butcherKeywords.some(keyword => name.includes(keyword))

    // Exclude non-butcher businesses
    const excludeKeywords = ['restaurant', 'pub', 'hotel', 'cafe', 'supermarket', 'grocery']
    const hasExcludedKeyword = excludeKeywords.some(keyword => name.includes(keyword))

    // Check Google place types
    const validTypes = ['food', 'store', 'establishment']
    const excludeTypes = ['restaurant', 'meal_takeaway', 'lodging']

    const hasValidType = types.some(type => validTypes.includes(type))
    const hasExcludedType = types.some(type => excludeTypes.includes(type))

    return hasButcherKeyword && !hasExcludedKeyword && hasValidType && !hasExcludedType
  }

  /**
   * Convert Google Place to our butcher format
   */
  convertToButcher(details, place, city) {
    try {
      // Extract postcode from address
      const postcode = this.extractPostcode(details.formatted_address || '')

      const butcher = {
        name: details.name,
        description: this.generateDescription(details.name, city.name),
        address: details.formatted_address || '',
        postcode: postcode,
        city: city.name,
        county: 'Bedfordshire',
        phone: details.formatted_phone_number || '',
        email: '',
        website: details.website || '',
        latitude: details.geometry?.location?.lat || null,
        longitude: details.geometry?.location?.lng || null,
        rating: details.rating || 0,
        review_count: details.user_ratings_total || 0,
        specialties: this.extractSpecialties(details.name),
        opening_hours: this.formatOpeningHours(details.opening_hours),
        images: [],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Generate URL paths
      butcher.city_slug = this.slugify(city.name)
      butcher.county_slug = this.slugify('Bedfordshire')
      butcher.full_url_path = `${butcher.county_slug}/${butcher.city_slug}/${this.slugify(butcher.name)}`

      return butcher
    } catch (error) {
      console.error(`   ⚠️  Error converting place to butcher:`, error.message)
      return null
    }
  }

  /**
   * Generate realistic description
   */
  generateDescription(name, city) {
    const templates = [
      `${name} is a traditional butcher serving the ${city} community with quality meats and expert service.`,
      `Located in ${city}, ${name} offers fresh, locally-sourced meat products and professional butchery services.`,
      `${name} provides high-quality meat products to customers in ${city} and surrounding areas.`,
      `A trusted local butcher in ${city}, ${name} specializes in fresh meat and traditional butchery.`
    ]
    return templates[Math.floor(Math.random() * templates.length)]
  }

  /**
   * Extract specialties from name
   */
  extractSpecialties(name) {
    const specialties = []
    const nameLower = name.toLowerCase()

    const specialtyMap = {
      'traditional': 'Traditional',
      'family': 'Family Business',
      'local': 'Local',
      'quality': 'Quality',
      'farm': 'Farm Fresh',
      'organic': 'Organic',
      'halal': 'Halal'
    }

    Object.entries(specialtyMap).forEach(([keyword, specialty]) => {
      if (nameLower.includes(keyword)) {
        specialties.push(specialty)
      }
    })

    // Add default if none found
    if (specialties.length === 0) {
      specialties.push('Fresh Meat', 'Local Service')
    }

    return specialties.slice(0, 3)
  }

  /**
   * Format opening hours
   */
  formatOpeningHours(openingHours) {
    if (!openingHours || !openingHours.weekday_text) {
      return {
        monday: '9:00 AM - 5:00 PM',
        tuesday: '9:00 AM - 5:00 PM',
        wednesday: '9:00 AM - 5:00 PM',
        thursday: '9:00 AM - 5:00 PM',
        friday: '9:00 AM - 5:00 PM',
        saturday: '9:00 AM - 4:00 PM',
        sunday: 'Closed'
      }
    }

    const hours = {}
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

    openingHours.weekday_text.forEach((dayText, index) => {
      if (index < days.length) {
        const timeMatch = dayText.match(/:\s*(.+)/)
        hours[days[index]] = timeMatch ? timeMatch[1] : 'Closed'
      }
    })

    return hours
  }

  /**
   * Extract UK postcode
   */
  extractPostcode(address) {
    const postcodePattern = /([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})/i
    const match = address.match(postcodePattern)
    return match ? match[1].toUpperCase() : ''
  }

  /**
   * Create URL slug
   */
  slugify(text) {
    if (!text) return ''
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  /**
   * Get unique business key
   */
  getBusinessKey(business) {
    return `${business.name.toLowerCase()}-${business.city.toLowerCase()}`
  }

  /**
   * Save butchers to database
   */
  async saveToDatabase() {
    console.log(`\n💾 Saving ${this.saved.length} REAL butchers to database...`)

    try {
      const batchSize = 5
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
        }

        await this.delay(500)
      }

      console.log(`   🎉 Successfully saved ${savedCount} REAL butchers from Google Places!`)

    } catch (error) {
      console.error('   ❌ Database save failed:', error.message)
    }
  }

  /**
   * Update location butcher counts
   */
  async updateLocationCounts() {
    console.log('\n🔢 Updating Bedfordshire location counts...')

    try {
      // Get actual counts for each city
      const { data: locations } = await supabase
        .from('public_locations')
        .select('slug, name')
        .eq('county_slug', 'bedfordshire')
        .in('type', ['city', 'town'])

      for (const location of locations || []) {
        const { data: butchers } = await supabase
          .from('public_butchers')
          .select('id')
          .eq('county_slug', 'bedfordshire')
          .eq('city_slug', location.slug)

        await supabase
          .from('public_locations')
          .update({ butcher_count: butchers?.length || 0 })
          .eq('slug', location.slug)

        console.log(`   ✅ ${location.name}: ${butchers?.length || 0} butchers`)
      }

      // Update county total
      const { data: allBedfordshireButchers } = await supabase
        .from('public_butchers')
        .select('id')
        .eq('county_slug', 'bedfordshire')

      await supabase
        .from('public_locations')
        .update({ butcher_count: allBedfordshireButchers?.length || 0 })
        .eq('slug', 'bedfordshire')

      console.log(`   ✅ Bedfordshire total: ${allBedfordshireButchers?.length || 0} butchers`)

    } catch (error) {
      console.error('   ❌ Failed to update location counts:', error.message)
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
    process.exit(1)
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Supabase environment variables not found')
    process.exit(1)
  }

  try {
    const scraper = new BedfordshireGooglePlacesScraper()
    const results = await scraper.scrapeBedfordshireButchers()

    console.log('\n🚀 Next steps:')
    console.log('1. Check your Supabase database for real Bedfordshire butchers')
    console.log('2. Visit: https://butchersnearme.co.uk/bedfordshire')
    console.log('3. Verify the businesses are real and showing correctly')
    console.log('4. Deploy changes to production')

  } catch (error) {
    console.error('❌ Google Places scraping failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { BedfordshireGooglePlacesScraper }