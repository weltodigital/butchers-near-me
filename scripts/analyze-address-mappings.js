#!/usr/bin/env node

/**
 * Analyze butcher addresses and location page mappings for inconsistencies
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function analyzeAddressMappings() {
  console.log('🔍 Analyzing Butcher Address and Location Mappings')
  console.log('================================================\n')

  try {
    // Get all butchers with their addresses and location mappings
    const { data: butchers, error } = await supabase
      .from('public_butchers')
      .select('id, name, address, city, county, city_slug, county_slug, full_url_path')
      .not('address', 'is', null)
      .order('name')

    if (error) {
      console.error('❌ Error fetching butchers:', error.message)
      return
    }

    console.log(`📊 Total butchers with addresses: ${butchers.length}\n`)

    // Analyze Bristol/Bath case specifically
    console.log('🔍 Bristol/Bath Analysis:')
    console.log('========================')

    const bristolBathCases = butchers.filter(butcher => {
      const address = butcher.address.toLowerCase()
      return (address.includes('bristol') && address.includes('bath')) ||
             (address.includes('bristol') && butcher.city.toLowerCase() === 'bath') ||
             (address.includes('bath') && butcher.city.toLowerCase() === 'bristol')
    })

    if (bristolBathCases.length > 0) {
      console.log(`Found ${bristolBathCases.length} potential Bristol/Bath mapping issues:\n`)
      bristolBathCases.forEach((butcher, index) => {
        console.log(`${index + 1}. ${butcher.name}`)
        console.log(`   Address: ${butcher.address}`)
        console.log(`   Mapped City: ${butcher.city}`)
        console.log(`   URL Path: /${butcher.full_url_path}`)
        console.log('')
      })
    } else {
      console.log('✅ No Bristol/Bath conflicts found\n')
    }

    // General address vs city mapping analysis
    console.log('🔍 General Address vs City Mapping Analysis:')
    console.log('==========================================')

    const potentialIssues = []

    butchers.forEach(butcher => {
      const address = butcher.address.toLowerCase()
      const mappedCity = butcher.city.toLowerCase()

      // Extract city names from address
      const addressWords = address.split(/[,\s]+/).map(word => word.trim())

      // Common UK cities to check for
      const ukCities = [
        'london', 'birmingham', 'manchester', 'liverpool', 'leeds', 'bristol', 'sheffield',
        'glasgow', 'edinburgh', 'cardiff', 'belfast', 'bradford', 'coventry', 'leicester',
        'nottingham', 'newcastle', 'brighton', 'hull', 'plymouth', 'stoke', 'wolverhampton',
        'derby', 'swansea', 'southampton', 'salford', 'aberdeen', 'westminster', 'reading',
        'luton', 'york', 'stockport', 'west bromwich', 'birmingham', 'coventry', 'bath',
        'oxford', 'cambridge', 'canterbury', 'chester', 'exeter', 'gloucester', 'hereford',
        'lichfield', 'lincoln', 'norwich', 'peterborough', 'portsmouth', 'preston', 'ripon',
        'salford', 'salisbury', 'truro', 'wakefield', 'wells', 'winchester', 'worcester'
      ]

      // Check if address contains different city names than mapped city
      const citiesInAddress = addressWords.filter(word =>
        ukCities.includes(word) && word !== mappedCity
      )

      if (citiesInAddress.length > 0 && !citiesInAddress.includes(mappedCity)) {
        potentialIssues.push({
          ...butcher,
          citiesInAddress,
          issue: 'Address contains different city than mapped'
        })
      }
    })

    if (potentialIssues.length > 0) {
      console.log(`Found ${potentialIssues.length} potential city mapping issues:\n`)

      // Show first 10 issues
      potentialIssues.slice(0, 10).forEach((butcher, index) => {
        console.log(`${index + 1}. ${butcher.name}`)
        console.log(`   Address: ${butcher.address}`)
        console.log(`   Mapped City: ${butcher.city}`)
        console.log(`   Cities found in address: ${butcher.citiesInAddress.join(', ')}`)
        console.log(`   URL Path: /${butcher.full_url_path}`)
        console.log('')
      })

      if (potentialIssues.length > 10) {
        console.log(`... and ${potentialIssues.length - 10} more issues\n`)
      }
    } else {
      console.log('✅ No obvious city mapping issues found\n')
    }

    // County analysis
    console.log('🔍 County Mapping Analysis:')
    console.log('===========================')

    // Check for common county mismatches
    const countyKeywords = {
      'greater london': ['london'],
      'greater manchester': ['manchester'],
      'west midlands': ['birmingham', 'coventry', 'wolverhampton'],
      'south yorkshire': ['sheffield', 'rotherham', 'barnsley', 'doncaster'],
      'west yorkshire': ['leeds', 'bradford', 'huddersfield', 'wakefield'],
      'tyne and wear': ['newcastle', 'sunderland', 'gateshead'],
      'merseyside': ['liverpool', 'birkenhead', 'bootle'],
      'avon': ['bristol', 'bath'],
      'somerset': ['bath', 'taunton', 'bridgwater'],
      'gloucestershire': ['gloucester', 'cheltenham'],
      'devon': ['exeter', 'plymouth', 'torquay'],
      'cornwall': ['truro', 'penzance', 'st ives']
    }

    const countyIssues = []

    butchers.forEach(butcher => {
      const address = butcher.address.toLowerCase()
      const mappedCounty = butcher.county.toLowerCase()
      const mappedCity = butcher.city.toLowerCase()

      // Check if city suggests different county
      for (const [county, cities] of Object.entries(countyKeywords)) {
        if (cities.includes(mappedCity) && !mappedCounty.includes(county.split(' ')[0])) {
          countyIssues.push({
            ...butcher,
            suggestedCounty: county,
            issue: `City ${mappedCity} typically belongs to ${county}, but mapped to ${mappedCounty}`
          })
        }
      }
    })

    if (countyIssues.length > 0) {
      console.log(`Found ${countyIssues.length} potential county mapping issues:\n`)

      countyIssues.slice(0, 10).forEach((butcher, index) => {
        console.log(`${index + 1}. ${butcher.name}`)
        console.log(`   Address: ${butcher.address}`)
        console.log(`   Mapped: ${butcher.city}, ${butcher.county}`)
        console.log(`   Issue: ${butcher.issue}`)
        console.log(`   URL Path: /${butcher.full_url_path}`)
        console.log('')
      })

      if (countyIssues.length > 10) {
        console.log(`... and ${countyIssues.length - 10} more county issues\n`)
      }
    } else {
      console.log('✅ No obvious county mapping issues found\n')
    }

    // Summary
    console.log('📊 Summary:')
    console.log('===========')
    console.log(`Total butchers analyzed: ${butchers.length}`)
    console.log(`Bristol/Bath conflicts: ${bristolBathCases.length}`)
    console.log(`City mapping issues: ${potentialIssues.length}`)
    console.log(`County mapping issues: ${countyIssues.length}`)
    console.log(`Total potential issues: ${bristolBathCases.length + potentialIssues.length + countyIssues.length}`)

  } catch (error) {
    console.error('❌ Analysis failed:', error.message)
  }
}

analyzeAddressMappings()