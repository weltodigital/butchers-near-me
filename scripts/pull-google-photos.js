#!/usr/bin/env node

/**
 * Google Places Photo Puller
 * Downloads photos from Google Places API for existing butchers
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const https = require('https')
const fs = require('fs')
const path = require('path')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class GooglePhotoPuller {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place'
    this.maxPhotosPerButcher = 3
    this.processedCount = 0
    this.updatedCount = 0
    this.errors = []

    // Create photos directory if it doesn't exist
    this.photosDir = path.join(process.cwd(), 'public', 'images', 'butchers')
    if (!fs.existsSync(this.photosDir)) {
      fs.mkdirSync(this.photosDir, { recursive: true })
    }
  }

  async pullPhotosForAllButchers() {
    console.log('📸 Google Places Photo Puller')
    console.log('=============================\n')

    if (!this.apiKey) {
      console.error('❌ Google Maps API key not found')
      console.log('Make sure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set in .env.local')
      process.exit(1)
    }

    // Get all butchers that need photos
    const butchers = await this.getButchersNeedingPhotos()

    if (butchers.length === 0) {
      console.log('✅ All butchers already have photos!')
      return
    }

    console.log(`🎯 Found ${butchers.length} butchers needing photos`)
    console.log('📍 Will search Google Places for photos and download them\n')

    for (const butcher of butchers) {
      console.log(`\n📸 Processing photos for: ${butcher.name}`)
      console.log(`   📍 Location: ${butcher.city}, ${butcher.county}`)

      try {
        await this.processButcherPhotos(butcher)
        this.processedCount++

        // Rate limiting - respect Google's API limits
        await this.delay(1000)

      } catch (error) {
        console.error(`   ❌ Error processing ${butcher.name}:`, error.message)
        this.errors.push({
          butcher: butcher.name,
          error: error.message
        })
      }
    }

    // Report results
    console.log('\n🎉 Photo Processing Complete!')
    console.log('=============================')
    console.log(`📊 Butchers processed: ${this.processedCount}`)
    console.log(`✅ Butchers updated with photos: ${this.updatedCount}`)
    console.log(`❌ Errors: ${this.errors.length}`)

    if (this.errors.length > 0) {
      console.log('\n❌ Errors encountered:')
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.butcher}: ${error.error}`)
      })
    }
  }

  /**
   * Get butchers that don't have photos yet
   */
  async getButchersNeedingPhotos() {
    try {
      const { data, error } = await supabase
        .from('butchers')
        .select('id, name, address, city, county, latitude, longitude, images')
        .eq('is_active', true)
        .or('images.is.null,images.eq.{}')

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ Failed to fetch butchers:', error.message)
      return []
    }
  }

  /**
   * Process photos for a single butcher
   */
  async processButcherPhotos(butcher) {
    // First, try to find the place using coordinates
    let placeId = null

    if (butcher.latitude && butcher.longitude) {
      placeId = await this.findPlaceByCoordinates(butcher)
    }

    // If no place found by coordinates, try text search
    if (!placeId) {
      placeId = await this.findPlaceByTextSearch(butcher)
    }

    if (!placeId) {
      console.log(`   ⚠️  Could not find Google Place for ${butcher.name}`)
      return
    }

    console.log(`   🔍 Found Google Place ID: ${placeId.substring(0, 20)}...`)

    // Get photos for this place
    const photos = await this.getPlacePhotos(placeId)

    if (photos.length === 0) {
      console.log(`   📷 No photos available for ${butcher.name}`)
      return
    }

    console.log(`   📷 Found ${photos.length} photos, downloading...`)

    // Download and save photos
    const downloadedPhotos = await this.downloadPhotos(butcher, photos)

    if (downloadedPhotos.length > 0) {
      // Update butcher with photo URLs
      await this.updateButcherPhotos(butcher.id, downloadedPhotos)
      console.log(`   ✅ Updated ${butcher.name} with ${downloadedPhotos.length} photos`)
      this.updatedCount++
    }
  }

  /**
   * Find place by coordinates (more accurate)
   */
  async findPlaceByCoordinates(butcher) {
    const url = `${this.baseUrl}/nearbysearch/json?location=${butcher.latitude},${butcher.longitude}&radius=50&keyword=${encodeURIComponent(butcher.name)}&key=${this.apiKey}`

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.status === 'OK' && data.results.length > 0) {
        // Find exact match by name similarity
        const exactMatch = data.results.find(place =>
          this.calculateSimilarity(place.name.toLowerCase(), butcher.name.toLowerCase()) > 0.7
        )

        return exactMatch ? exactMatch.place_id : data.results[0].place_id
      }
    } catch (error) {
      console.log(`   ⚠️  Coordinate search failed: ${error.message}`)
    }

    return null
  }

  /**
   * Find place by text search (fallback)
   */
  async findPlaceByTextSearch(butcher) {
    const query = `${butcher.name} ${butcher.address}`
    const url = `${this.baseUrl}/textsearch/json?query=${encodeURIComponent(query)}&key=${this.apiKey}`

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].place_id
      }
    } catch (error) {
      console.log(`   ⚠️  Text search failed: ${error.message}`)
    }

    return null
  }

  /**
   * Get photos for a place
   */
  async getPlacePhotos(placeId) {
    const url = `${this.baseUrl}/details/json?place_id=${placeId}&fields=photos&key=${this.apiKey}`

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.status === 'OK' && data.result.photos) {
        // Return up to maxPhotosPerButcher photos
        return data.result.photos.slice(0, this.maxPhotosPerButcher)
      }
    } catch (error) {
      console.log(`   ⚠️  Failed to get photos: ${error.message}`)
    }

    return []
  }

  /**
   * Download photos and save locally
   */
  async downloadPhotos(butcher, photos) {
    const downloadedPhotos = []
    const butcherSlug = this.slugify(butcher.name)

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      const filename = `${butcherSlug}-${i + 1}.jpg`
      const filepath = path.join(this.photosDir, filename)
      const publicPath = `/images/butchers/${filename}`

      try {
        const photoUrl = `${this.baseUrl}/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${this.apiKey}`

        await this.downloadImage(photoUrl, filepath)
        downloadedPhotos.push(publicPath)

        console.log(`   💾 Downloaded: ${filename}`)

        // Small delay between downloads
        await this.delay(500)

      } catch (error) {
        console.log(`   ⚠️  Failed to download photo ${i + 1}: ${error.message}`)
      }
    }

    return downloadedPhotos
  }

  /**
   * Download image from URL with redirect handling
   */
  async downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filepath)

      const handleResponse = (response) => {
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          console.log(`   🔄 Following redirect to: ${response.headers.location.substring(0, 50)}...`)

          // Follow redirect
          https.get(response.headers.location, handleResponse).on('error', reject)
          return
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`))
          return
        }

        response.pipe(file)

        file.on('finish', () => {
          file.close()
          resolve()
        })

        file.on('error', (error) => {
          fs.unlink(filepath, () => {}) // Delete partial file
          reject(error)
        })
      }

      https.get(url, handleResponse).on('error', reject)
    })
  }

  /**
   * Update butcher with photo URLs
   */
  async updateButcherPhotos(butcherId, photoUrls) {
    try {
      const { error } = await supabase
        .from('butchers')
        .update({
          images: photoUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', butcherId)

      if (error) throw error
    } catch (error) {
      throw new Error(`Database update failed: ${error.message}`)
    }
  }

  /**
   * Calculate string similarity
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  /**
   * Calculate Levenshtein distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
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
    const puller = new GooglePhotoPuller()
    await puller.pullPhotosForAllButchers()

    console.log('\n🚀 Next steps:')
    console.log('1. Check the /public/images/butchers/ directory for downloaded photos')
    console.log('2. Visit your website to see butchers with photos')
    console.log('3. Verify images are displaying correctly')

  } catch (error) {
    console.error('❌ Photo pulling failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { GooglePhotoPuller }