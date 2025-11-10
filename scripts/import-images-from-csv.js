const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function importImagesFromCSV() {
  console.log('📊 Importing image URLs from CSV to database...\n')

  const csvData = []

  // Read CSV file
  return new Promise((resolve, reject) => {
    fs.createReadStream('dataset_google-maps-extractor_2025-11-09_21-12-15-079.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Handle BOM character in column names
        const imageUrl = row.imageUrl || row['﻿"imageUrl"'] || row['"imageUrl"']
        if (imageUrl && row.title) {
          csvData.push({
            imageUrl: imageUrl,
            title: row.title.trim(),
            city: row.city ? row.city.trim() : '',
            phone: row.phone ? row.phone.trim() : ''
          })
        }
      })
      .on('end', async () => {
        console.log(`📋 Found ${csvData.length} records with images in CSV`)

        let matched = 0
        let updated = 0

        for (const csvRecord of csvData) {
          try {
            // Try to find matching butcher by name and city
            const { data: existingButchers } = await supabase
              .from('butchers')
              .select('id, name, city, images')
              .eq('is_active', true)
              .ilike('name', `%${csvRecord.title}%`)

            let matchedButcher = null

            if (existingButchers && existingButchers.length > 0) {
              // Try exact city match first
              matchedButcher = existingButchers.find(b =>
                b.city && csvRecord.city &&
                b.city.toLowerCase().trim() === csvRecord.city.toLowerCase().trim()
              )

              // If no city match, try the first name match
              if (!matchedButcher) {
                matchedButcher = existingButchers[0]
              }
            }

            if (matchedButcher) {
              matched++

              // Check if they already have images
              if (!matchedButcher.images || matchedButcher.images.length === 0) {
                // Update with new image
                const { error } = await supabase
                  .from('butchers')
                  .update({ images: [csvRecord.imageUrl] })
                  .eq('id', matchedButcher.id)

                if (!error) {
                  updated++
                  console.log(`✅ Updated ${matchedButcher.name} (${matchedButcher.city}) with image`)
                } else {
                  console.error(`❌ Error updating ${matchedButcher.name}: ${error.message}`)
                }
              } else {
                console.log(`ℹ️  ${matchedButcher.name} already has ${matchedButcher.images.length} image(s)`)
              }
            } else {
              console.log(`⚠️  No match found for: ${csvRecord.title} (${csvRecord.city})`)
            }

            // Small delay to avoid overwhelming the database
            await new Promise(resolve => setTimeout(resolve, 50))

          } catch (error) {
            console.error(`❌ Error processing ${csvRecord.title}: ${error.message}`)
          }
        }

        console.log(`\n📊 IMPORT COMPLETE:`)
        console.log(`🔍 CSV records with images: ${csvData.length}`)
        console.log(`🎯 Database matches found: ${matched}`)
        console.log(`✅ Images successfully imported: ${updated}`)

        // Final verification
        const { count: totalWithImages } = await supabase
          .from('butchers')
          .select('*', { count: 'exact', head: true })
          .not('images', 'is', null)
          .neq('images', '[]')

        console.log(`📈 Total butchers now with images: ${totalWithImages}`)

        resolve()
      })
      .on('error', reject)
  })
}

importImagesFromCSV().catch(console.error)