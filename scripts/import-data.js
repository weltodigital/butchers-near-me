const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Service Key available:', !!supabaseServiceKey)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  console.error('SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

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

async function importCSVData() {
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
            console.log('Skipping invalid record:', { title, city })
            return
          }

          const butcher = {
            title: title,
            image_url: data.imageUrl?.trim() || null,
            total_score: data.totalScore ? parseFloat(data.totalScore) : null,
            reviews_count: data.reviewsCount ? parseInt(data.reviewsCount) : null,
            street: data.street?.trim() || null,
            city: city,
            state: data.state?.trim() || null,
            country_code: 'GB',
            website: data.website?.trim() || null,
            phone: data.phone?.trim() || null,
            google_url: data.url?.trim() || null,
            slug: createSlug(title, city)
          }

          results.push(butcher)
        } catch (error) {
          console.error('Error processing row:', error, data)
        }
      })
      .on('end', async () => {
        console.log(`Parsed ${results.length} records from CSV`)

        if (results.length === 0) {
          console.log('No valid records to insert')
          resolve(0)
          return
        }

        // Insert data in smaller batches to avoid timeouts
        const batchSize = 50
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

              // Try inserting individually to identify problem records
              for (const record of batch) {
                const { error: individualError } = await supabase
                  .from('butchers')
                  .insert([record])
                  .select('id')

                if (individualError) {
                  console.error(`Failed to insert: ${record.title} - ${individualError.message}`)
                } else {
                  inserted++
                }
              }
            } else {
              inserted += batch.length
              console.log(`✓ Batch ${Math.floor(i/batchSize) + 1} inserted successfully`)
            }

            // Add a small delay between batches
            await new Promise(resolve => setTimeout(resolve, 100))

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
    console.log('Testing Supabase connection...')

    // Test connection
    const { count, error } = await supabase
      .from('butchers')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Connection test failed:', error.message)
      return
    }

    console.log('✓ Connection successful')
    console.log(`Current records in database: ${count || 0}`)

    // Import data
    await importCSVData()

    console.log('Database import completed!')
  } catch (error) {
    console.error('Import failed:', error)
  }
}

main()