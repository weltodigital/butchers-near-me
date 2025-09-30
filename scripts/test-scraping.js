#!/usr/bin/env node

/**
 * Test Firecrawl scraping with a simple example
 */

require('dotenv').config({ path: '.env.local' })

const { Firecrawl } = require('@mendable/firecrawl-js')

async function testScraping() {
  console.log('🧪 Testing Firecrawl Scraping')
  console.log('=============================\n')

  if (!process.env.FIRECRAWL_API_KEY) {
    console.error('❌ FIRECRAWL_API_KEY not found in .env.local')
    console.log('\nTo get your Firecrawl API key:')
    console.log('1. Go to: https://firecrawl.dev')
    console.log('2. Sign up for an account')
    console.log('3. Get your API key from the dashboard')
    console.log('4. Add it to your .env.local file:')
    console.log('   FIRECRAWL_API_KEY=your_api_key_here')
    return
  }

  const firecrawl = new Firecrawl({ 
    apiKey: process.env.FIRECRAWL_API_KEY 
  })

  try {
    console.log('🔍 Testing with a simple website...')
    
    // Test with a simple website first
    const testUrl = 'https://example.com'
    console.log(`   URL: ${testUrl}`)

    const scrapeResult = await firecrawl.v1.scrapeUrl(testUrl, {
      formats: ['markdown', 'html'],
      onlyMainContent: true,
      waitFor: 1000,
      timeout: 10000
    })

    if (!scrapeResult.success) {
      console.error('❌ Scraping failed:', scrapeResult.error)
      return
    }

    console.log('✅ Scraping successful!')
    console.log(`   Content length: ${scrapeResult.data?.html?.length || 0} characters`)
    console.log(`   Markdown length: ${scrapeResult.data?.markdown?.length || 0} characters`)

    // Show a preview of the content
    if (scrapeResult.data?.markdown) {
      console.log('\n📄 Content preview:')
      console.log(scrapeResult.data.markdown.substring(0, 500) + '...')
    } else if (scrapeResult.data?.html) {
      console.log('\n📄 HTML content preview:')
      console.log(scrapeResult.data.html.substring(0, 500) + '...')
    }

    console.log('\n🎉 Firecrawl is working correctly!')
    console.log('You can now run the full scraping scripts:')
    console.log('   npm run scrape:butchers')
    console.log('   npm run scrape:specific')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\nTroubleshooting:')
    console.log('1. Check your Firecrawl API key is correct')
    console.log('2. Ensure you have credits in your Firecrawl account')
    console.log('3. Check your internet connection')
  }
}

testScraping()
