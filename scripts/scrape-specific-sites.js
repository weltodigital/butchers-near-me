#!/usr/bin/env node

/**
 * Scrape specific butcher websites for detailed data
 * This script targets known butcher websites for high-quality data
 */

require('dotenv').config({ path: '.env.local' })

const { Firecrawl } = require('@mendable/firecrawl-js')
const { supabase } = require('../src/lib/supabase.js')

const firecrawl = new Firecrawl({ 
  apiKey: process.env.FIRECRAWL_API_KEY 
})

// Known butcher websites and directories
const butcherSources = [
  {
    name: 'Yell.com Butchers',
    url: 'https://www.yell.com/search/butchers/london',
    type: 'directory',
    selectors: {
      name: 'h2[data-testid="business-name"]',
      address: '[data-testid="business-address"]',
      phone: '[data-testid="business-phone"]',
      website: '[data-testid="business-website"]',
      rating: '[data-testid="business-rating"]'
    }
  },
  {
    name: 'Thomson Local Butchers',
    url: 'https://www.thomsonlocal.com/search/butchers/london',
    type: 'directory',
    selectors: {
      name: '.business-name',
      address: '.business-address',
      phone: '.business-phone',
      website: '.business-website'
    }
  },
  {
    name: 'Google Maps Butchers',
    url: 'https://www.google.com/maps/search/butchers+in+london+uk',
    type: 'maps',
    selectors: {
      name: 'h3',
      address: '.LrzXr',
      phone: '.LrzXr',
      rating: '.Aq14fc'
    }
  }
]

async function scrapeSpecificSites() {
  console.log('🎯 Targeted Butcher Website Scraping')
  console.log('====================================\n')

  if (!process.env.FIRECRAWL_API_KEY) {
    console.error('❌ FIRECRAWL_API_KEY not found in .env.local')
    console.log('Please add your Firecrawl API key to .env.local')
    process.exit(1)
  }

  const allButchers = []

  for (const source of butcherSources) {
    try {
      console.log(`🔍 Scraping ${source.name}...`)
      console.log(`   URL: ${source.url}`)

      const scrapeResult = await firecrawl.v1.scrapeUrl(source.url, {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        waitFor: 5000,
        timeout: 30000
      })

      if (!scrapeResult.success) {
        console.log(`   ❌ Failed: ${scrapeResult.error}`)
        continue
      }

      // Parse the scraped data
      const butchers = parseScrapedData(scrapeResult.data, source)
      console.log(`   ✅ Found ${butchers.length} butchers`)
      
      allButchers.push(...butchers)

      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 3000))

    } catch (error) {
      console.error(`   ❌ Error scraping ${source.name}:`, error.message)
    }
  }

  // Remove duplicates and clean data
  const uniqueButchers = removeDuplicates(allButchers)
  console.log(`\n📊 Total unique butchers: ${uniqueButchers.length}`)

  // Save to database
  if (uniqueButchers.length > 0) {
    try {
      console.log('\n💾 Saving to database...')
      
      const { data, error } = await supabase
        .from('butchers')
        .insert(uniqueButchers)
        .select()

      if (error) {
        console.error('❌ Database error:', error.message)
      } else {
        console.log(`✅ Saved ${data.length} butchers to database`)
        
        // Show sample data
        console.log('\n📋 Sample butchers:')
        data.slice(0, 3).forEach((butcher, index) => {
          console.log(`   ${index + 1}. ${butcher.name}`)
          console.log(`      📍 ${butcher.city}`)
          console.log(`      ⭐ ${butcher.rating}/5`)
          console.log('')
        })
      }

    } catch (error) {
      console.error('❌ Error saving to database:', error.message)
    }
  }

  console.log('\n🎉 Scraping complete!')
  console.log('Test your data: npm run test:db')
}

function parseScrapedData(scrapedData, source) {
  const butchers = []
  const html = scrapedData.html || scrapedData.markdown

  if (!html) {
    console.log('   ⚠️  No HTML content found')
    return butchers
  }

  // Simple regex-based parsing
  // In a real implementation, you'd use cheerio or similar
  const businessBlocks = extractBusinessBlocks(html, source.type)

  for (const block of businessBlocks) {
    const butcher = parseBusinessBlock(block, source)
    if (butcher && validateButcher(butcher)) {
      butchers.push(butcher)
    }
  }

  return butchers
}

function extractBusinessBlocks(html, type) {
  const blocks = []
  
  if (type === 'directory') {
    // Extract business listings
    const businessRegex = /<div[^>]*class="[^"]*business[^"]*"[^>]*>.*?<\/div>/gs
    const matches = html.match(businessRegex) || []
    blocks.push(...matches.slice(0, 20))
  } else if (type === 'maps') {
    // Extract Google Maps results
    const resultRegex = /<div[^>]*class="[^"]*g[^"]*"[^>]*>.*?<\/div>/gs
    const matches = html.match(resultRegex) || []
    blocks.push(...matches.slice(0, 20))
  }
  
  return blocks
}

function parseBusinessBlock(block, source) {
  try {
    const butcher = {
      name: extractText(block, source.selectors.name),
      address: extractText(block, source.selectors.address),
      phone: extractText(block, source.selectors.phone),
      website: extractHref(block, source.selectors.website),
      rating: extractRating(block, source.selectors.rating),
      city: 'London', // Default for now
      postcode: extractPostcode(extractText(block, source.selectors.address)),
      specialties: ['Traditional'], // Default
      is_verified: false,
      is_active: true,
      created_at: new Date().toISOString()
    }

    // Clean data
    butcher.name = cleanText(butcher.name)
    butcher.address = cleanText(butcher.address)
    butcher.phone = cleanPhone(butcher.phone)
    butcher.website = cleanUrl(butcher.website)
    butcher.rating = parseRating(butcher.rating)

    return butcher

  } catch (error) {
    return null
  }
}

function extractText(html, selector) {
  if (!selector || !html) return ''
  const regex = new RegExp(`<[^>]*class="[^"]*${selector.replace('.', '')}[^"]*"[^>]*>([^<]*)</[^>]*>`, 'i')
  const match = html.match(regex)
  return match ? match[1].trim() : ''
}

function extractHref(html, selector) {
  if (!selector || !html) return ''
  const regex = new RegExp(`<a[^>]*class="[^"]*${selector.replace('.', '')}[^"]*"[^>]*href="([^"]*)"`, 'i')
  const match = html.match(regex)
  return match ? match[1].trim() : ''
}

function extractRating(html, selector) {
  const text = extractText(html, selector)
  const ratingMatch = text.match(/(\d+\.?\d*)\s*\/?\s*5/)
  return ratingMatch ? parseFloat(ratingMatch[1]) : 0
}

function extractPostcode(address) {
  if (!address) return ''
  const postcodeMatch = address.match(/([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})/i)
  return postcodeMatch ? postcodeMatch[1].toUpperCase() : ''
}

function cleanText(text) {
  if (!text) return ''
  return text.replace(/\s+/g, ' ').trim()
}

function cleanPhone(phone) {
  if (!phone) return ''
  return phone.replace(/[^\d\s\+\-\(\)]/g, '').trim()
}

function cleanUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('//')) return 'https:' + url
  if (url.startsWith('/')) return 'https://www.yell.com' + url
  return 'https://' + url
}

function parseRating(rating) {
  if (!rating) return 0
  const num = parseFloat(rating)
  return isNaN(num) ? 0 : Math.min(Math.max(num, 0), 5)
}

function validateButcher(butcher) {
  return butcher.name && 
         butcher.name.length > 2 && 
         butcher.address && 
         butcher.address.length > 5
}

function removeDuplicates(butchers) {
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

scrapeSpecificSites()
