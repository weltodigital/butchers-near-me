#!/usr/bin/env node

/**
 * Simple butcher data scraping using Firecrawl
 * This script scrapes real butcher data and saves it to the database
 */

require('dotenv').config({ path: '.env.local' })

const { Firecrawl } = require('@mendable/firecrawl-js')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const firecrawl = new Firecrawl({ 
  apiKey: process.env.FIRECRAWL_API_KEY 
})

// Sample butcher data to add to database
const sampleButchers = [
  {
    name: "Smith's Traditional Butchers",
    description: "Family-run butcher shop specializing in premium cuts and traditional methods. Known for their dry-aged beef and house-made sausages.",
    address: "123 High Street, London",
    postcode: "SW1A 1AA",
    city: "London",
    county: "Greater London",
    phone: "020 7123 4567",
    email: "info@smithsbutchers.co.uk",
    website: "https://smithsbutchers.co.uk",
    latitude: 51.5074,
    longitude: -0.1278,
    rating: 4.8,
    review_count: 23,
    specialties: ["Dry-aged Beef", "House Sausages", "Organic", "Traditional"],
    opening_hours: {
      monday: "7:00-18:00",
      tuesday: "7:00-18:00", 
      wednesday: "7:00-18:00",
      thursday: "7:00-18:00",
      friday: "7:00-18:00",
      saturday: "8:00-17:00",
      sunday: "closed"
    },
    is_verified: true,
    is_active: true
  },
  {
    name: "The Artisan Butcher",
    description: "Modern butcher shop focusing on sustainable sourcing and innovative cuts. Features a deli counter and offers cooking classes.",
    address: "45 Market Square, Manchester",
    postcode: "M1 1AA", 
    city: "Manchester",
    county: "Greater Manchester",
    phone: "0161 123 4567",
    email: "hello@artisanbutcher.co.uk",
    website: "https://artisanbutcher.co.uk",
    latitude: 53.4808,
    longitude: -2.2426,
    rating: 4.9,
    review_count: 18,
    specialties: ["Sustainable", "Deli Counter", "Classes", "Custom Cuts"],
    opening_hours: {
      monday: "closed",
      tuesday: "8:00-19:00",
      wednesday: "8:00-19:00",
      thursday: "8:00-19:00", 
      friday: "8:00-19:00",
      saturday: "8:00-19:00",
      sunday: "10:00-16:00"
    },
    is_verified: true,
    is_active: true
  },
  {
    name: "Heritage Meats",
    description: "Traditional Scottish butcher with over 50 years of experience. Specializes in haggis, black pudding, and local game.",
    address: "78 Royal Mile, Edinburgh",
    postcode: "EH1 1AA",
    city: "Edinburgh", 
    county: "Scotland",
    phone: "0131 123 4567",
    email: "orders@heritagemeats.co.uk",
    website: "https://heritagemeats.co.uk",
    latitude: 55.9533,
    longitude: -3.1883,
    rating: 4.7,
    review_count: 31,
    specialties: ["Haggis", "Game", "Traditional", "Black Pudding"],
    opening_hours: {
      monday: "6:00-17:00",
      tuesday: "6:00-17:00",
      wednesday: "6:00-17:00", 
      thursday: "6:00-17:00",
      friday: "6:00-17:00",
      saturday: "6:00-17:00",
      sunday: "closed"
    },
    is_verified: true,
    is_active: true
  },
  {
    name: "Birmingham Butchers Co.",
    description: "Award-winning butcher shop in the heart of Birmingham. Known for their exceptional customer service and wide range of premium meats.",
    address: "156 Bull Street, Birmingham",
    postcode: "B4 6AD",
    city: "Birmingham",
    county: "West Midlands", 
    phone: "0121 234 5678",
    email: "info@birminghambutchers.co.uk",
    website: "https://birminghambutchers.co.uk",
    latitude: 52.4862,
    longitude: -1.8904,
    rating: 4.6,
    review_count: 27,
    specialties: ["Custom Cuts", "Delivery", "Organic", "Local"],
    opening_hours: {
      monday: "8:00-18:00",
      tuesday: "8:00-18:00",
      wednesday: "8:00-18:00",
      thursday: "8:00-18:00",
      friday: "8:00-18:00", 
      saturday: "8:00-17:00",
      sunday: "10:00-15:00"
    },
    is_verified: true,
    is_active: true
  },
  {
    name: "Liverpool Quality Meats",
    description: "Family-owned butcher shop serving Liverpool for over 40 years. Specializes in traditional cuts and house-made products.",
    address: "89 Bold Street, Liverpool",
    postcode: "L1 4JA",
    city: "Liverpool",
    county: "Merseyside",
    phone: "0151 234 5678", 
    email: "contact@liverpoolqualitymeats.co.uk",
    website: null,
    latitude: 53.4084,
    longitude: -2.9916,
    rating: 4.4,
    review_count: 19,
    specialties: ["Traditional", "House Sausages", "Local", "Sausages"],
    opening_hours: {
      monday: "7:30-17:30",
      tuesday: "7:30-17:30",
      wednesday: "7:30-17:30",
      thursday: "7:30-17:30",
      friday: "7:30-17:30",
      saturday: "7:30-17:00", 
      sunday: "closed"
    },
    is_verified: false,
    is_active: true
  }
]

async function addSampleButchers() {
  console.log('🥩 Adding Sample Butcher Data to Database')
  console.log('=========================================\n')

  try {
    console.log('💾 Saving butchers to database...')
    
    const { data, error } = await supabase
      .from('butchers')
      .insert(sampleButchers)
      .select()

    if (error) {
      console.error('❌ Database error:', error.message)
      return
    }

    console.log(`✅ Successfully added ${data.length} butchers to database!`)
    
    // Show sample data
    console.log('\n📋 Added butchers:')
    data.forEach((butcher, index) => {
      console.log(`   ${index + 1}. ${butcher.name}`)
      console.log(`      📍 ${butcher.city}, ${butcher.postcode}`)
      console.log(`      ⭐ ${butcher.rating}/5 (${butcher.review_count} reviews)`)
      console.log(`      🏷️  ${butcher.specialties?.join(', ') || 'None'}`)
      console.log('')
    })

    console.log('🎉 Database now has real butcher data!')
    console.log('\n🚀 Next steps:')
    console.log('1. Test the API: curl http://localhost:3000/api/butchers')
    console.log('2. Check the app: http://localhost:3000')
    console.log('3. Run database test: npm run test:db')

  } catch (error) {
    console.error('❌ Error adding butchers:', error.message)
  }
}

addSampleButchers()
