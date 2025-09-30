#!/usr/bin/env node

/**
 * Scrape live butcher data using Firecrawl
 * This script will scrape real butcher data from various UK sources
 */

require('dotenv').config({ path: '.env.local' })

const { ButcherScraper } = require('../src/lib/scraper.js')

async function scrapeButchers() {
  console.log('🥩 MeatMap UK - Live Butcher Data Scraping')
  console.log('==========================================\n')

  // Check if Firecrawl API key is set
  if (!process.env.FIRECRAWL_API_KEY) {
    console.error('❌ FIRECRAWL_API_KEY not found in .env.local')
    console.log('\n🔑 To get your Firecrawl API key:')
    console.log('1. Go to: https://firecrawl.dev')
    console.log('2. Sign up for an account')
    console.log('3. Get your API key from the dashboard')
    console.log('4. Add it to your .env.local file:')
    console.log('   FIRECRAWL_API_KEY=your_api_key_here')
    console.log('\nThen run this script again.')
    process.exit(1)
  }

  try {
    const scraper = new ButcherScraper()
    
    // Define locations to scrape
    const locations = [
      'London',
      'Manchester', 
      'Birmingham',
      'Edinburgh',
      'Liverpool',
      'Bristol',
      'Leeds',
      'Glasgow',
      'Newcastle',
      'Sheffield'
    ]

    console.log('🎯 Scraping Strategy:')
    console.log('   - Sources: Yell.com, Google Search, Thomson Local')
    console.log('   - Locations: 10 major UK cities')
    console.log('   - Expected: 50-200 butchers per city')
    console.log('   - Total estimated: 500-2000 butchers')
    console.log('')

    // Ask user for confirmation
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question('Continue with scraping? This may take 10-20 minutes (y/n): ', async (answer) => {
      if (answer.toLowerCase() !== 'y') {
        console.log('Scraping cancelled.')
        rl.close()
        return
      }

      rl.close()

      // Start scraping
      const startTime = Date.now()
      const savedButchers = await scraper.scrapeMultipleSources(locations)
      const endTime = Date.now()
      const duration = Math.round((endTime - startTime) / 1000)

      console.log('\n🎉 Scraping Complete!')
      console.log('====================')
      console.log(`⏱️  Duration: ${duration} seconds`)
      console.log(`📊 Butchers saved: ${savedButchers.length}`)
      console.log(`💰 Estimated cost: $${(savedButchers.length * 0.01).toFixed(2)} (Firecrawl pricing)`)

      if (savedButchers.length > 0) {
        console.log('\n📋 Sample butchers:')
        savedButchers.slice(0, 5).forEach((butcher, index) => {
          console.log(`   ${index + 1}. ${butcher.name}`)
          console.log(`      📍 ${butcher.city}, ${butcher.postcode}`)
          console.log(`      ⭐ ${butcher.rating}/5`)
          console.log(`      🏷️  ${butcher.specialties?.join(', ') || 'None'}`)
          console.log('')
        })
      }

      console.log('\n🚀 Next steps:')
      console.log('1. Test the API: curl http://localhost:3000/api/butchers')
      console.log('2. Check the app: http://localhost:3000')
      console.log('3. Run database test: npm run test:db')
    })

  } catch (error) {
    console.error('❌ Scraping failed:', error.message)
    console.log('\nTroubleshooting:')
    console.log('1. Check your Firecrawl API key is correct')
    console.log('2. Ensure you have credits in your Firecrawl account')
    console.log('3. Check your internet connection')
    console.log('4. Verify your Supabase database is set up')
  }
}

scrapeButchers()
