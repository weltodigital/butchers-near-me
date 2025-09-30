#!/usr/bin/env node

/**
 * Populate database with realistic UK butcher data
 * This creates a comprehensive dataset for development and testing
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Initialize client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const realisticButchersData = [
  // London
  {
    name: "Smithfield Market Butchers",
    description: "Historic butchers at London's famous meat market. Specializing in premium cuts and traditional British meats since 1868.",
    address: "87 Charterhouse Street, Smithfield",
    postcode: "EC1M 6HL",
    city: "London",
    county: "Greater London",
    phone: "020 7253 4567",
    email: "info@smithfieldbutchers.co.uk",
    website: "https://smithfieldbutchers.co.uk",
    rating: 4.8,
    review_count: 127,
    specialties: ["Dry-aged beef", "Organic", "Game", "Traditional"],
    opening_hours: {
      "monday": "6:00-16:00",
      "tuesday": "6:00-16:00",
      "wednesday": "6:00-16:00",
      "thursday": "6:00-16:00",
      "friday": "6:00-16:00",
      "saturday": "6:00-14:00",
      "sunday": "closed"
    }
  },
  {
    name: "Harrods Butchery & Charcuterie",
    description: "Luxury butchers offering the finest meats from around the world. Award-winning charcuterie and premium wagyu beef.",
    address: "87-135 Brompton Road, Knightsbridge",
    postcode: "SW1X 7XL",
    city: "London",
    county: "Greater London",
    phone: "020 7730 1234",
    email: "butchery@harrods.com",
    website: "https://harrods.com/butchery",
    rating: 4.9,
    review_count: 89,
    specialties: ["Wagyu", "Charcuterie", "Premium", "International"],
    opening_hours: {
      "monday": "10:00-21:00",
      "tuesday": "10:00-21:00",
      "wednesday": "10:00-21:00",
      "thursday": "10:00-21:00",
      "friday": "10:00-21:00",
      "saturday": "10:00-21:00",
      "sunday": "11:30-18:00"
    }
  },
  {
    name: "Borough Market Artisan Meats",
    description: "Family-run butchers in historic Borough Market. Sourcing the best British and European meats for over 30 years.",
    address: "8 Southwark Street, Borough Market",
    postcode: "SE1 1TL",
    city: "London",
    county: "Greater London",
    phone: "020 7407 8765",
    email: "hello@boroughartisan.co.uk",
    website: "https://boroughartisanmeats.co.uk",
    rating: 4.7,
    review_count: 203,
    specialties: ["Artisan", "European", "Sustainable", "Local"],
    opening_hours: {
      "monday": "closed",
      "tuesday": "10:00-17:00",
      "wednesday": "10:00-17:00",
      "thursday": "10:00-17:00",
      "friday": "10:00-17:00",
      "saturday": "8:00-17:00",
      "sunday": "10:00-16:00"
    }
  },

  // Manchester
  {
    name: "Northern Quarter Butchers",
    description: "Modern butchers in Manchester's creative quarter. Focusing on local Lancashire farms and innovative cuts.",
    address: "45 Tib Street, Northern Quarter",
    postcode: "M4 1LX",
    city: "Manchester",
    county: "Greater Manchester",
    phone: "0161 832 4567",
    email: "meat@nqbutchers.co.uk",
    website: "https://northernquarterbutchers.co.uk",
    rating: 4.6,
    review_count: 156,
    specialties: ["Local", "Lancashire", "Innovative", "Farm-to-table"],
    opening_hours: {
      "monday": "9:00-18:00",
      "tuesday": "9:00-18:00",
      "wednesday": "9:00-18:00",
      "thursday": "9:00-18:00",
      "friday": "9:00-18:00",
      "saturday": "9:00-17:00",
      "sunday": "10:00-16:00"
    }
  },
  {
    name: "Chorlton Green Butchers",
    description: "Award-winning family butchers serving South Manchester. Specializing in organic and free-range meats.",
    address: "23 Beech Road, Chorlton",
    postcode: "M21 9EL",
    city: "Manchester",
    county: "Greater Manchester",
    phone: "0161 881 2345",
    email: "orders@chorltongreen.co.uk",
    website: "https://chorltonbutchers.co.uk",
    rating: 4.8,
    review_count: 94,
    specialties: ["Organic", "Free-range", "Award-winning", "Family"],
    opening_hours: {
      "monday": "8:00-17:30",
      "tuesday": "8:00-17:30",
      "wednesday": "8:00-17:30",
      "thursday": "8:00-17:30",
      "friday": "8:00-17:30",
      "saturday": "8:00-16:00",
      "sunday": "closed"
    }
  },

  // Birmingham
  {
    name: "Digbeth Artisan Butchery",
    description: "Contemporary butchers in Birmingham's cultural quarter. Nose-to-tail philosophy with house-made sausages.",
    address: "78 Digbeth High Street",
    postcode: "B5 6DY",
    city: "Birmingham",
    county: "West Midlands",
    phone: "0121 622 7890",
    email: "info@digbethartisan.co.uk",
    website: "https://digbethbutchers.co.uk",
    rating: 4.5,
    review_count: 142,
    specialties: ["Nose-to-tail", "House sausages", "Artisan", "Contemporary"],
    opening_hours: {
      "monday": "closed",
      "tuesday": "9:00-18:00",
      "wednesday": "9:00-18:00",
      "thursday": "9:00-18:00",
      "friday": "9:00-18:00",
      "saturday": "8:00-17:00",
      "sunday": "10:00-15:00"
    }
  },
  {
    name: "Moseley Village Butchers",
    description: "Traditional butchers serving Birmingham's Moseley district. Three generations of family expertise.",
    address: "156 Alcester Road, Moseley",
    postcode: "B13 8HS",
    city: "Birmingham",
    county: "West Midlands",
    phone: "0121 449 3456",
    email: "butchers@moseleyvillage.co.uk",
    website: "https://moseleybutchers.co.uk",
    rating: 4.7,
    review_count: 78,
    specialties: ["Traditional", "Three generations", "Local", "Family expertise"],
    opening_hours: {
      "monday": "8:00-17:00",
      "tuesday": "8:00-17:00",
      "wednesday": "8:00-17:00",
      "thursday": "8:00-17:00",
      "friday": "8:00-17:00",
      "saturday": "8:00-16:00",
      "sunday": "9:00-14:00"
    }
  },

  // Edinburgh
  {
    name: "George IV Bridge Traditional Butchers",
    description: "Edinburgh's finest traditional Scottish butchers. Specializing in haggis, black pudding and Highland beef.",
    address: "67 George IV Bridge, Old Town",
    postcode: "EH1 1EE",
    city: "Edinburgh",
    county: "Scotland",
    phone: "0131 225 7890",
    email: "info@georgeivbutchers.co.uk",
    website: "https://edinburghbutchers.co.uk",
    rating: 4.9,
    review_count: 167,
    specialties: ["Scottish", "Haggis", "Black pudding", "Highland beef"],
    opening_hours: {
      "monday": "8:00-18:00",
      "tuesday": "8:00-18:00",
      "wednesday": "8:00-18:00",
      "thursday": "8:00-18:00",
      "friday": "8:00-18:00",
      "saturday": "8:00-17:00",
      "sunday": "10:00-16:00"
    }
  },
  {
    name: "Stockbridge Artisan Meats",
    description: "Modern butchers in trendy Stockbridge. Focusing on Scottish produce and sustainable farming practices.",
    address: "34 Raeburn Place, Stockbridge",
    postcode: "EH4 1HN",
    city: "Edinburgh",
    county: "Scotland",
    phone: "0131 332 4567",
    email: "meat@stockbridgeartisan.co.uk",
    website: "https://stockbridgemeats.co.uk",
    rating: 4.6,
    review_count: 89,
    specialties: ["Scottish produce", "Sustainable", "Modern", "Artisan"],
    opening_hours: {
      "monday": "9:00-18:00",
      "tuesday": "9:00-18:00",
      "wednesday": "9:00-18:00",
      "thursday": "9:00-18:00",
      "friday": "9:00-18:00",
      "saturday": "9:00-17:00",
      "sunday": "closed"
    }
  },

  // Glasgow
  {
    name: "West End Premium Butchers",
    description: "Glasgow's premier butchers in the heart of the West End. Dry-aged steaks and traditional Scottish fare.",
    address: "123 Byres Road, West End",
    postcode: "G12 8TT",
    city: "Glasgow",
    county: "Scotland",
    phone: "0141 339 5678",
    email: "orders@westendpremium.co.uk",
    website: "https://glasgowwestendbutchers.co.uk",
    rating: 4.8,
    review_count: 134,
    specialties: ["Dry-aged steaks", "Scottish fare", "Premium", "West End"],
    opening_hours: {
      "monday": "8:30-18:00",
      "tuesday": "8:30-18:00",
      "wednesday": "8:30-18:00",
      "thursday": "8:30-18:00",
      "friday": "8:30-18:00",
      "saturday": "8:30-17:00",
      "sunday": "10:00-16:00"
    }
  },

  // Leeds
  {
    name: "Kirkgate Market Traditional Butchers",
    description: "Historic butchers in Leeds' famous covered market. Serving the community for over 100 years.",
    address: "Unit 47, Kirkgate Market",
    postcode: "LS2 7HY",
    city: "Leeds",
    county: "West Yorkshire",
    phone: "0113 245 6789",
    email: "info@kirkgatebutchers.co.uk",
    website: "https://kirkgatebutchers.co.uk",
    rating: 4.5,
    review_count: 178,
    specialties: ["Historic", "100 years", "Community", "Traditional"],
    opening_hours: {
      "monday": "8:00-17:00",
      "tuesday": "8:00-17:00",
      "wednesday": "8:00-17:00",
      "thursday": "8:00-17:00",
      "friday": "8:00-17:00",
      "saturday": "8:00-16:00",
      "sunday": "closed"
    }
  },

  // Liverpool
  {
    name: "Bold Street Gourmet Butchers",
    description: "Contemporary butchers on Liverpool's iconic Bold Street. Specializing in Merseyside lamb and Cheshire beef.",
    address: "89 Bold Street, City Centre",
    postcode: "L1 4HF",
    city: "Liverpool",
    county: "Merseyside",
    phone: "0151 709 3456",
    email: "gourmet@boldstreetbutchers.co.uk",
    website: "https://boldstreetbutchers.co.uk",
    rating: 4.7,
    review_count: 112,
    specialties: ["Merseyside lamb", "Cheshire beef", "Contemporary", "Gourmet"],
    opening_hours: {
      "monday": "9:00-18:00",
      "tuesday": "9:00-18:00",
      "wednesday": "9:00-18:00",
      "thursday": "9:00-18:00",
      "friday": "9:00-18:00",
      "saturday": "9:00-17:00",
      "sunday": "10:00-16:00"
    }
  },

  // Bristol
  {
    name: "Clifton Village Butchers",
    description: "Boutique butchers in historic Clifton Village. Sourcing from local Somerset and Gloucestershire farms.",
    address: "23 The Mall, Clifton Village",
    postcode: "BS8 4DP",
    city: "Bristol",
    county: "Bristol",
    phone: "0117 973 4567",
    email: "orders@cliftonbutchers.co.uk",
    website: "https://cliftonvillagebutchers.co.uk",
    rating: 4.6,
    review_count: 95,
    specialties: ["Somerset farms", "Gloucestershire", "Boutique", "Local sourcing"],
    opening_hours: {
      "monday": "8:30-17:30",
      "tuesday": "8:30-17:30",
      "wednesday": "8:30-17:30",
      "thursday": "8:30-17:30",
      "friday": "8:30-17:30",
      "saturday": "8:30-16:30",
      "sunday": "closed"
    }
  },

  // Oxford
  {
    name: "Covered Market Heritage Butchers",
    description: "Traditional butchers in Oxford's historic Covered Market. University city's favorite for over 80 years.",
    address: "12 Covered Market, High Street",
    postcode: "OX1 3DY",
    city: "Oxford",
    county: "Oxfordshire",
    phone: "01865 248 567",
    email: "heritage@oxfordbutchers.co.uk",
    website: "https://coveredmarketbutchers.co.uk",
    rating: 4.8,
    review_count: 156,
    specialties: ["Heritage", "University city", "80 years", "Historic market"],
    opening_hours: {
      "monday": "8:00-17:30",
      "tuesday": "8:00-17:30",
      "wednesday": "8:00-17:30",
      "thursday": "8:00-17:30",
      "friday": "8:00-17:30",
      "saturday": "8:00-17:00",
      "sunday": "closed"
    }
  },

  // Cambridge
  {
    name: "Market Square Fine Meats",
    description: "Cambridge's award-winning butchers overlooking the historic market square. Specializing in rare breed pork.",
    address: "7 Market Square, City Centre",
    postcode: "CB2 3QF",
    city: "Cambridge",
    county: "Cambridgeshire",
    phone: "01223 367 890",
    email: "finemeats@cambridge-butchers.co.uk",
    website: "https://marketsquaremeats.co.uk",
    rating: 4.9,
    review_count: 143,
    specialties: ["Award-winning", "Rare breed pork", "Market square", "Historic"],
    opening_hours: {
      "monday": "8:00-17:00",
      "tuesday": "8:00-17:00",
      "wednesday": "8:00-17:00",
      "thursday": "8:00-17:00",
      "friday": "8:00-17:00",
      "saturday": "8:00-16:00",
      "sunday": "closed"
    }
  },

  // Bath
  {
    name: "Pulteney Bridge Artisan Butchers",
    description: "Boutique butchers near Bath's famous Pulteney Bridge. Georgian city charm meets modern butchery.",
    address: "15 Argyle Street, City Centre",
    postcode: "BA2 4BQ",
    city: "Bath",
    county: "Somerset",
    phone: "01225 446 789",
    email: "artisan@bathbutchers.co.uk",
    website: "https://pulteneybutchers.co.uk",
    rating: 4.7,
    review_count: 87,
    specialties: ["Georgian city", "Boutique", "Artisan", "Historic charm"],
    opening_hours: {
      "monday": "9:00-17:30",
      "tuesday": "9:00-17:30",
      "wednesday": "9:00-17:30",
      "thursday": "9:00-17:30",
      "friday": "9:00-17:30",
      "saturday": "9:00-17:00",
      "sunday": "10:00-16:00"
    }
  }
]

async function populateRealisticData() {
  console.log('🥩 Populating Database with Realistic UK Butcher Data')
  console.log('====================================================\n')

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Supabase environment variables not found')
    process.exit(1)
  }

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing butcher data...')
    const { error: clearError } = await supabase
      .from('butchers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all except non-existent ID

    if (clearError && clearError.code !== 'PGRST116') { // PGRST116 = no rows found (which is fine)
      console.error('Warning: Could not clear existing data:', clearError.message)
    }

    // Enhance data with additional fields
    const enhancedData = realisticButchersData.map(butcher => ({
      ...butcher,
      latitude: generateLatLng(butcher.city).lat,
      longitude: generateLatLng(butcher.city).lng,
      city_slug: slugify(butcher.city),
      county_slug: slugify(butcher.county),
      full_url_path: `${slugify(butcher.county)}/${slugify(butcher.city)}/${slugify(butcher.name)}`,
      images: generateImages(butcher.name),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    // Insert data in batches
    console.log(`💾 Inserting ${enhancedData.length} realistic butcher records...`)

    const batchSize = 5
    let insertedCount = 0

    for (let i = 0; i < enhancedData.length; i += batchSize) {
      const batch = enhancedData.slice(i, i + batchSize)

      const { data, error } = await supabase
        .from('butchers')
        .insert(batch)
        .select()

      if (error) {
        console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message)
      } else {
        insertedCount += data.length
        console.log(`   ✅ Batch ${Math.floor(i/batchSize) + 1}: Inserted ${data.length} butchers`)
      }
    }

    console.log(`\n🎉 Successfully populated database!`)
    console.log(`📊 Total butchers added: ${insertedCount}`)
    console.log(`🏙️  Cities covered: ${[...new Set(realisticButchersData.map(b => b.city))].length}`)
    console.log(`🗺️  Counties covered: ${[...new Set(realisticButchersData.map(b => b.county))].length}`)

    console.log('\n🚀 Next steps:')
    console.log('1. Visit http://localhost:3000 to see your butcher directory')
    console.log('2. Browse locations and view individual butcher pages')
    console.log('3. The data includes realistic specialties, hours, and contact info')

  } catch (error) {
    console.error('❌ Population failed:', error.message)
    process.exit(1)
  }
}

// Helper functions
function slugify(text) {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function generateLatLng(city) {
  const coordinates = {
    'London': { lat: 51.5074, lng: -0.1278 },
    'Manchester': { lat: 53.4808, lng: -2.2426 },
    'Birmingham': { lat: 52.4862, lng: -1.8904 },
    'Edinburgh': { lat: 55.9533, lng: -3.1883 },
    'Glasgow': { lat: 55.8642, lng: -4.2518 },
    'Leeds': { lat: 53.8008, lng: -1.5491 },
    'Liverpool': { lat: 53.4084, lng: -2.9916 },
    'Bristol': { lat: 51.4545, lng: -2.5879 },
    'Oxford': { lat: 51.7520, lng: -1.2577 },
    'Cambridge': { lat: 52.2053, lng: 0.1218 },
    'Bath': { lat: 51.3758, lng: -2.3599 }
  }

  const base = coordinates[city] || { lat: 51.5074, lng: -0.1278 }

  // Add small random offset for realistic variation
  return {
    lat: +(base.lat + (Math.random() - 0.5) * 0.01).toFixed(6),
    lng: +(base.lng + (Math.random() - 0.5) * 0.01).toFixed(6)
  }
}

function generateImages(name) {
  // Generate realistic placeholder images
  return [
    `https://picsum.photos/800/600?random=${slugify(name)}-1`,
    `https://picsum.photos/800/600?random=${slugify(name)}-2`
  ]
}

// Run the population script
if (require.main === module) {
  populateRealisticData()
}

module.exports = { populateRealisticData }