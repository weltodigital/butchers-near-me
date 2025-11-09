const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

async function checkTableStructure() {
  const { data, error } = await supabase
    .from('butchers')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error checking table structure:', error.message)
    return null
  }

  if (data && data.length > 0) {
    console.log('Table structure (columns):', Object.keys(data[0]))
    return Object.keys(data[0])
  }

  return []
}

async function importData() {
  console.log('Checking existing table structure...')
  const columns = await checkTableStructure()

  if (!columns) {
    console.error('Could not determine table structure')
    return
  }

  console.log('Starting CSV import...')
  const results = []
  const csvPath = './dataset_google-maps-extractor_2025-11-09_21-12-15-079.csv'

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        try {
          const title = data.title?.trim()
          const city = data.city?.trim()

          if (!title || !city) {
            return
          }

          // Map CSV data to existing table structure
          const butcher = {
            name: title,
            city: city,
            postcode: 'N/A', // Required field - we'll use placeholder for now
            address: data.street?.trim() || 'Address not available', // Required field
            phone: data.phone?.trim() || null,
            website: data.website?.trim() || null,
            rating: data.totalScore ? parseFloat(data.totalScore) : null,
            review_count: data.reviewsCount ? parseInt(data.reviewsCount) : null,
            images: data.imageUrl?.trim() ? [data.imageUrl.trim()] : null,
            is_verified: false,
            is_active: true
          }

          results.push(butcher)
        } catch (error) {
          console.error('Error processing row:', error)
        }
      })
      .on('end', async () => {
        console.log(`Parsed ${results.length} records from CSV`)

        if (results.length === 0) {
          console.log('No valid records to insert')
          resolve(0)
          return
        }

        // Insert data in smaller batches
        const batchSize = 20
        let inserted = 0
        let errors = 0

        for (let i = 0; i < results.length; i += batchSize) {
          const batch = results.slice(i, i + batchSize)

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

            // Add delay between batches
            await new Promise(resolve => setTimeout(resolve, 500))

          } catch (error) {
            console.error(`Exception in batch ${Math.floor(i/batchSize) + 1}:`, error)
            errors += batch.length
          }
        }

        console.log(`\nImport completed:`)
        console.log(`- Successfully inserted: ${inserted} records`)
        console.log(`- Failed insertions: ${errors} records`)
        console.log(`- Total processed: ${results.length} records`)

        resolve(inserted)
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error)
        reject(error)
      })
  })
}

async function main() {
  try {
    await importData()
  } catch (error) {
    console.error('Import failed:', error)
  }
}

main()