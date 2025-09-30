#!/usr/bin/env node

/**
 * Debug Firecrawl scraper for butcher data
 * This script tests the data structure returned by Firecrawl
 */

require('dotenv').config({ path: '.env.local' })

const { Firecrawl } = require('@mendable/firecrawl-js')

// Initialize client
const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY
})

async function debugScraper() {
  console.log('🔧 Debug Firecrawl Response Structure')
  console.log('=====================================\n')

  if (!process.env.FIRECRAWL_API_KEY) {
    console.error('❌ FIRECRAWL_API_KEY not found in .env.local')
    process.exit(1)
  }

  try {
    const testUrl = 'https://www.yell.com/ucs/UcsSearchAction.do?keywords=butchers&location=London'
    console.log(`🔍 Testing URL: ${testUrl}`)

    const scrapeResult = await firecrawl.v1.scrapeUrl(testUrl, {
      formats: ['markdown', 'html'],
      onlyMainContent: true,
      waitFor: 3000,
      timeout: 30000
    })

    console.log('\n📊 Full Response Structure:')
    console.log('success:', scrapeResult.success)
    console.log('data keys:', scrapeResult.data ? Object.keys(scrapeResult.data) : 'no data')

    if (scrapeResult.data) {
      if (scrapeResult.data.markdown) {
        console.log('markdown length:', scrapeResult.data.markdown.length)
        console.log('markdown preview:', scrapeResult.data.markdown.substring(0, 500))
      } else {
        console.log('❌ No markdown in response')
      }

      if (scrapeResult.data.html) {
        console.log('html length:', scrapeResult.data.html.length)
        console.log('html preview:', scrapeResult.data.html.substring(0, 500))
      } else {
        console.log('❌ No html in response')
      }
    }

    console.log('\n🔍 Error details:')
    if (scrapeResult.error) {
      console.log('error:', scrapeResult.error)
    } else {
      console.log('No errors reported')
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message)
    console.error(error.stack)
  }
}

debugScraper()