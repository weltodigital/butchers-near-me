const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// County mapping function
function mapCityToCounty(city) {
  const cityToCountyMap = {
    'Bristol': 'Gloucestershire',
    'Southampton': 'Hampshire',
    'Portsmouth': 'Hampshire',
    'Plymouth': 'Devon',
    'Exeter': 'Devon',
    'Bath': 'Somerset',
    'Gloucester': 'Gloucestershire',
    'Winchester': 'Hampshire',
    'Salisbury': 'Wiltshire',
    'Swindon': 'Wiltshire',
    'Taunton': 'Somerset',
    'Bridgwater': 'Somerset',
    'Yeovil': 'Somerset',
    'Frome': 'Somerset',
    'Wells': 'Somerset',
    'Chard': 'Somerset',
    'Burnham-on-Sea': 'Somerset',
    'Minehead': 'Somerset',
    'Clevedon': 'Somerset',
    'Nailsea': 'Somerset',
    'Portishead': 'Somerset',
    'Weston-super-Mare': 'Somerset'
  }

  if (cityToCountyMap[city]) {
    return cityToCountyMap[city]
  }

  // Default fallbacks
  if (city.toLowerCase().includes('bristol')) return 'Gloucestershire'

  return 'Other'
}

function createSlug(title, city) {
  const combined = `${title} ${city}`
  return combined
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim()
}

async function importMissing() {
  console.log('🔍 Finding and importing missing records...\n')

  // Get existing database records
  const { data: dbButchers, error: fetchError } = await supabase
    .from('butchers')
    .select('name, city')

  if (fetchError) {
    console.error('Error fetching database records:', fetchError)
    return
  }

  const dbSet = new Set(dbButchers.map(b => `${b.name}|${b.city}`))

  // Read CSV and find missing records
  const csvResults = []
  const csvPath = './dataset_google-maps-extractor_2025-11-09_21-12-15-079.csv'

  return new Promise((resolve) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        const title = data.title?.trim()
        const city = data.city?.trim()

        if (title && city && !dbSet.has(`${title}|${city}`)) {
          const county = mapCityToCounty(city)

          const butcher = {
            name: title,
            city: city,
            county: county,
            postcode: 'N/A',
            address: data.street?.trim() || 'Address not available',
            phone: data.phone?.trim() || null,
            website: data.website?.trim() || null,
            rating: data.totalScore ? parseFloat(data.totalScore) : null,
            review_count: data.reviewsCount ? parseInt(data.reviewsCount) : null,
            images: data.imageUrl?.trim() ? [data.imageUrl.trim()] : null,
            is_verified: false,
            is_active: true
          }

          csvResults.push(butcher)
        }
      })
      .on('end', async () => {
        console.log(`📄 Found ${csvResults.length} missing records to import`)

        if (csvResults.length === 0) {
          console.log('✅ No missing records found!')
          resolve()
          return
        }

        // Import missing records
        const batchSize = 20
        let inserted = 0
        let errors = 0

        for (let i = 0; i < csvResults.length; i += batchSize) {
          const batch = csvResults.slice(i, i + batchSize)

          try {
            console.log(`Inserting batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)...`)

            const { data, error } = await supabase
              .from('butchers')
              .insert(batch)
              .select('id')

            if (error) {
              console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error.message)
              errors += batch.length
            } else {
              inserted += batch.length
              console.log(`✓ Batch ${Math.floor(i/batchSize) + 1} inserted successfully`)
            }

            await new Promise(resolve => setTimeout(resolve, 200))

          } catch (error) {
            console.error(`Exception in batch ${Math.floor(i/batchSize) + 1}:`, error)
            errors += batch.length
          }
        }

        console.log(`\n✅ Import completed:`)
        console.log(`- Successfully imported: ${inserted} missing records`)
        console.log(`- Failed imports: ${errors} records`)

        // Final count
        const { count: finalCount } = await supabase
          .from('butchers')
          .select('*', { count: 'exact', head: true })

        console.log(`\n📊 Final database count: ${finalCount} butchers`)

        resolve()
      })
  })
}

importMissing()