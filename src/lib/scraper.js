import FirecrawlApp from '@mendable/firecrawl-js'
import { supabase, generateUrlSlug } from './supabase.js'

// Initialize Firecrawl
const firecrawl = new FirecrawlApp({ 
  apiKey: process.env.FIRECRAWL_API_KEY 
})

/**
 * Scrape butcher data from various UK sources
 */
export class ButcherScraper {
  constructor() {
    this.sources = {
      yell: {
        baseUrl: 'https://www.yell.com',
        searchPath: '/search/butchers',
        selectors: {
          name: 'h2[data-testid="business-name"]',
          address: '[data-testid="business-address"]',
          phone: '[data-testid="business-phone"]',
          website: '[data-testid="business-website"]',
          rating: '[data-testid="business-rating"]',
          description: '[data-testid="business-description"]'
        }
      },
      google: {
        baseUrl: 'https://www.google.com',
        searchPath: '/search',
        selectors: {
          name: 'h3',
          address: '.LrzXr',
          phone: '.LrzXr',
          rating: '.Aq14fc',
          description: '.VwiC3b'
        }
      },
      thomsonLocal: {
        baseUrl: 'https://www.thomsonlocal.com',
        searchPath: '/search/butchers',
        selectors: {
          name: '.business-name',
          address: '.business-address',
          phone: '.business-phone',
          website: '.business-website',
          rating: '.business-rating'
        }
      }
    }
  }

  /**
   * Scrape butchers from a specific source and location
   */
  async scrapeButchers(source, location, maxResults = 20) {
    try {
      console.log(`🔍 Scraping ${source} for butchers in ${location}...`)
      
      const sourceConfig = this.sources[source]
      if (!sourceConfig) {
        throw new Error(`Unknown source: ${source}`)
      }

      // Build search URL
      const searchUrl = this.buildSearchUrl(sourceConfig, location)
      console.log(`   URL: ${searchUrl}`)

      // Scrape the page
      const scrapeResult = await firecrawl.scrapeUrl(searchUrl, {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        waitFor: 3000, // Wait 3 seconds for dynamic content
        timeout: 30000
      })

      if (!scrapeResult.success) {
        throw new Error(`Scraping failed: ${scrapeResult.error}`)
      }

      // Parse the scraped data
      const butchers = this.parseScrapedData(scrapeResult.data, sourceConfig, location)
      
      console.log(`   ✅ Found ${butchers.length} butchers`)
      return butchers

    } catch (error) {
      console.error(`❌ Error scraping ${source}:`, error.message)
      return []
    }
  }

  /**
   * Build search URL for different sources
   */
  buildSearchUrl(sourceConfig, location) {
    const encodedLocation = encodeURIComponent(location)
    
    switch (sourceConfig.baseUrl) {
      case 'https://www.yell.com':
        return `${sourceConfig.baseUrl}${sourceConfig.searchPath}/${encodedLocation}`
      
      case 'https://www.google.com':
        return `${sourceConfig.baseUrl}${sourceConfig.searchPath}?q=butchers+in+${encodedLocation}+UK`
      
      case 'https://www.thomsonlocal.com':
        return `${sourceConfig.baseUrl}${sourceConfig.searchPath}/${encodedLocation}`
      
      default:
        return `${sourceConfig.baseUrl}${sourceConfig.searchPath}`
    }
  }

  /**
   * Parse scraped HTML data into structured butcher objects
   */
  parseScrapedData(scrapedData, sourceConfig, location) {
    const butchers = []
    
    try {
      // Use the HTML content for parsing
      const html = scrapedData.html || scrapedData.markdown
      if (!html) {
        console.log('   ⚠️  No HTML content found')
        return butchers
      }

      // Simple regex-based parsing (you might want to use cheerio for more complex parsing)
      const businessBlocks = this.extractBusinessBlocks(html, sourceConfig.baseUrl)
      
      for (const block of businessBlocks) {
        const butcher = this.parseBusinessBlock(block, sourceConfig, location)
        if (butcher && this.validateButcher(butcher)) {
          butchers.push(butcher)
        }
      }

    } catch (error) {
      console.error('   ❌ Error parsing scraped data:', error.message)
    }

    return butchers
  }

  /**
   * Extract business blocks from HTML
   */
  extractBusinessBlocks(html, source) {
    // This is a simplified extraction - you might want to use cheerio for better parsing
    const blocks = []
    
    if (source.includes('yell.com')) {
      // Yell.com specific extraction
      const businessRegex = /<div[^>]*class="[^"]*business[^"]*"[^>]*>.*?<\/div>/gs
      const matches = html.match(businessRegex) || []
      blocks.push(...matches)
    } else if (source.includes('google.com')) {
      // Google search results extraction
      const resultRegex = /<div[^>]*class="[^"]*g[^"]*"[^>]*>.*?<\/div>/gs
      const matches = html.match(resultRegex) || []
      blocks.push(...matches)
    }
    
    return blocks.slice(0, 20) // Limit to 20 results
  }

  /**
   * Parse individual business block
   */
  parseBusinessBlock(block, sourceConfig, location) {
    try {
      const name = this.extractText(block, sourceConfig.selectors.name)
      const city = location
      const county = this.extractCounty(this.extractText(block, sourceConfig.selectors.address))

      const butcher = {
        name,
        address: this.extractText(block, sourceConfig.selectors.address),
        phone: this.extractText(block, sourceConfig.selectors.phone),
        website: this.extractHref(block, sourceConfig.selectors.website),
        rating: this.extractRating(block, sourceConfig.selectors.rating),
        description: this.extractText(block, sourceConfig.selectors.description),
        city,
        county,
        postcode: this.extractPostcode(this.extractText(block, sourceConfig.selectors.address)),
        specialties: this.extractSpecialties(block),
        full_url_path: generateUrlSlug(name, city, county),
        is_active: true,
        created_at: new Date().toISOString()
      }

      // Clean and validate data
      butcher.name = this.cleanText(butcher.name)
      butcher.address = this.cleanText(butcher.address)
      butcher.phone = this.cleanPhone(butcher.phone)
      butcher.website = this.cleanUrl(butcher.website)
      butcher.rating = this.parseRating(butcher.rating)

      return butcher

    } catch (error) {
      console.error('   ❌ Error parsing business block:', error.message)
      return null
    }
  }

  /**
   * Extract text content using CSS selector
   */
  extractText(html, selector) {
    if (!selector || !html) return ''
    
    // Simple regex-based extraction (cheerio would be better)
    const regex = new RegExp(`<[^>]*class="[^"]*${selector.replace('.', '')}[^"]*"[^>]*>([^<]*)</[^>]*>`, 'i')
    const match = html.match(regex)
    return match ? match[1].trim() : ''
  }

  /**
   * Extract href attribute
   */
  extractHref(html, selector) {
    if (!selector || !html) return ''
    
    const regex = new RegExp(`<a[^>]*class="[^"]*${selector.replace('.', '')}[^"]*"[^>]*href="([^"]*)"`, 'i')
    const match = html.match(regex)
    return match ? match[1].trim() : ''
  }

  /**
   * Extract rating from text
   */
  extractRating(html, selector) {
    const text = this.extractText(html, selector)
    const ratingMatch = text.match(/(\d+\.?\d*)\s*\/?\s*5/)
    return ratingMatch ? parseFloat(ratingMatch[1]) : 0
  }

  /**
   * Extract postcode from address
   */
  extractPostcode(address) {
    if (!address) return ''
    const postcodeMatch = address.match(/([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})/i)
    return postcodeMatch ? postcodeMatch[1].toUpperCase() : ''
  }

  /**
   * Extract county from address
   */
  extractCounty(address) {
    if (!address) return ''

    // Common UK counties - this is a simplified approach
    const counties = [
      'Greater London', 'West Midlands', 'Greater Manchester', 'West Yorkshire', 'Merseyside',
      'South Yorkshire', 'Tyne and Wear', 'Avon', 'Bedfordshire', 'Berkshire', 'Buckinghamshire',
      'Cambridgeshire', 'Cheshire', 'Cleveland', 'Cornwall', 'Cumbria', 'Derbyshire', 'Devon',
      'Dorset', 'Durham', 'East Sussex', 'Essex', 'Gloucestershire', 'Hampshire', 'Herefordshire',
      'Hertfordshire', 'Humberside', 'Huntingdonshire', 'Isle of Wight', 'Kent', 'Lancashire',
      'Leicestershire', 'Lincolnshire', 'Norfolk', 'Northamptonshire', 'Northumberland',
      'North Yorkshire', 'Nottinghamshire', 'Oxfordshire', 'Rutland', 'Shropshire', 'Somerset',
      'Staffordshire', 'Suffolk', 'Surrey', 'Warwickshire', 'West Sussex', 'Wiltshire',
      'Worcestershire', 'East Yorkshire', 'North Lincolnshire', 'South Gloucestershire',
      'Bath and North East Somerset', 'Bristol', 'North Somerset'
    ]

    const addressLower = address.toLowerCase()
    for (const county of counties) {
      if (addressLower.includes(county.toLowerCase())) {
        return county
      }
    }

    return ''
  }

  /**
   * Extract specialties from business description
   */
  extractSpecialties(html) {
    const specialties = []
    const text = html.toLowerCase()
    
    const specialtyKeywords = [
      'dry-aged', 'organic', 'traditional', 'game', 'sausages',
      'halal', 'kosher', 'sustainable', 'local', 'haggis',
      'black pudding', 'deli', 'cooking classes', 'custom cuts'
    ]
    
    specialtyKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        specialties.push(keyword.charAt(0).toUpperCase() + keyword.slice(1))
      }
    })
    
    return specialties
  }

  /**
   * Clean and validate text data
   */
  cleanText(text) {
    if (!text) return ''
    return text.replace(/\s+/g, ' ').trim()
  }

  /**
   * Clean phone number
   */
  cleanPhone(phone) {
    if (!phone) return ''
    return phone.replace(/[^\d\s\+\-\(\)]/g, '').trim()
  }

  /**
   * Clean URL
   */
  cleanUrl(url) {
    if (!url) return ''
    if (url.startsWith('http')) return url
    if (url.startsWith('//')) return 'https:' + url
    if (url.startsWith('/')) return 'https://www.yell.com' + url
    return 'https://' + url
  }

  /**
   * Parse rating to number
   */
  parseRating(rating) {
    if (!rating) return 0
    const num = parseFloat(rating)
    return isNaN(num) ? 0 : Math.min(Math.max(num, 0), 5)
  }

  /**
   * Validate butcher data
   */
  validateButcher(butcher) {
    return butcher.name && 
           butcher.name.length > 2 && 
           butcher.address && 
           butcher.address.length > 5
  }

  /**
   * Save scraped butchers to database
   */
  async saveButchers(butchers) {
    if (!butchers || butchers.length === 0) {
      console.log('   ⚠️  No butchers to save')
      return []
    }

    try {
      console.log(`💾 Saving ${butchers.length} butchers to database...`)
      
      const { data, error } = await supabase
        .from('butchers')
        .insert(butchers)
        .select()

      if (error) {
        console.error('   ❌ Database error:', error.message)
        return []
      }

      console.log(`   ✅ Saved ${data.length} butchers`)
      return data

    } catch (error) {
      console.error('   ❌ Error saving butchers:', error.message)
      return []
    }
  }

  /**
   * Scrape multiple sources and locations
   */
  async scrapeMultipleSources(locations = ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Liverpool']) {
    console.log('🚀 Starting comprehensive butcher scraping...')
    console.log(`   Locations: ${locations.join(', ')}`)
    console.log('')

    const allButchers = []
    const sources = Object.keys(this.sources)

    for (const location of locations) {
      console.log(`📍 Scraping ${location}...`)
      
      for (const source of sources) {
        try {
          const butchers = await this.scrapeButchers(source, location, 10)
          allButchers.push(...butchers)
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 2000))
          
        } catch (error) {
          console.error(`   ❌ Error scraping ${source} for ${location}:`, error.message)
        }
      }
    }

    // Remove duplicates based on name and address
    const uniqueButchers = this.removeDuplicates(allButchers)
    console.log(`\n📊 Total unique butchers found: ${uniqueButchers.length}`)

    // Save to database
    const savedButchers = await this.saveButchers(uniqueButchers)
    
    return savedButchers
  }

  /**
   * Remove duplicate butchers
   */
  removeDuplicates(butchers) {
    const seen = new Set()
    return butchers.filter(butcher => {
      const key = `${butcher.name.toLowerCase()}-${butcher.address.toLowerCase()}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }
}

export default ButcherScraper
