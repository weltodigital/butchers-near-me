const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Function to create a URL-friendly slug
function createSlug(title, city) {
  const combined = `${title} ${city}`
  return combined
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim()
}

async function createTable() {
  console.log('Creating butchers table...')

  const { error } = await supabase.rpc('exec', {
    sql: `
      CREATE TABLE IF NOT EXISTS butchers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        image_url TEXT,
        total_score DECIMAL(2,1),
        reviews_count INTEGER,
        street TEXT,
        city TEXT NOT NULL,
        state TEXT,
        country_code TEXT NOT NULL DEFAULT 'GB',
        website TEXT,
        phone TEXT,
        category_name TEXT NOT NULL DEFAULT 'Butcher shop',
        google_url TEXT,
        slug TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_butchers_city ON butchers(city);
      CREATE INDEX IF NOT EXISTS idx_butchers_slug ON butchers(slug);
      CREATE INDEX IF NOT EXISTS idx_butchers_total_score ON butchers(total_score);
    `
  })

  if (error) {
    console.error('Error creating table:', error)
    return false
  }

  console.log('Table created successfully')
  return true
}

async function importCSVData() {
  console.log('Starting CSV import...')

  const results = []
  const csvPath = 'dataset_google-maps-extractor_2025-11-09_21-12-15-079.csv'

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        // Clean and prepare the data
        const butcher = {
          title: data.title?.trim() || '',
          image_url: data.imageUrl?.trim() || null,
          total_score: data.totalScore ? parseFloat(data.totalScore) : null,
          reviews_count: data.reviewsCount ? parseInt(data.reviewsCount) : null,
          street: data.street?.trim() || null,
          city: data.city?.trim() || '',
          state: data.state?.trim() || null,
          country_code: data.countryCode?.trim() || 'GB',
          website: data.website?.trim() || null,
          phone: data.phone?.trim() || null,
          category_name: data.categoryName?.trim() || 'Butcher shop',
          google_url: data.url?.trim() || null,
          slug: createSlug(data.title?.trim() || '', data.city?.trim() || '')
        }

        if (butcher.title && butcher.city) {
          results.push(butcher)
        }
      })
      .on('end', async () => {
        console.log(`Parsed ${results.length} records from CSV`)

        // Insert data in batches
        const batchSize = 100
        let inserted = 0

        for (let i = 0; i < results.length; i += batchSize) {
          const batch = results.slice(i, i + batchSize)

          const { data, error } = await supabase
            .from('butchers')
            .insert(batch)
            .select('id')

          if (error) {
            console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error)
          } else {
            inserted += batch.length
            console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}: ${inserted}/${results.length} records`)
          }
        }

        console.log(`Import completed. Total records inserted: ${inserted}`)
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
    // Create table
    const tableCreated = await createTable()
    if (!tableCreated) {
      console.error('Failed to create table')
      return
    }

    // Import data
    await importCSVData()

    console.log('Database setup completed successfully!')
  } catch (error) {
    console.error('Setup failed:', error)
  }
}

main()