const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyImport() {
  console.log('🔍 Verifying CSV import...\n')

  // Count database records
  const { count: dbCount, error: countError } = await supabase
    .from('butchers')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('Error counting database records:', countError)
    return
  }

  console.log(`📊 Database contains: ${dbCount} butchers`)

  // Count CSV records
  const csvResults = []
  const csvPath = './dataset_google-maps-extractor_2025-11-09_21-12-15-079.csv'

  return new Promise((resolve) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        const title = data.title?.trim()
        const city = data.city?.trim()

        if (title && city) {
          csvResults.push({ title, city })
        }
      })
      .on('end', async () => {
        console.log(`📄 CSV contains: ${csvResults.length} valid records (${712 - 1} total lines minus header)`)

        const difference = csvResults.length - dbCount

        if (difference === 0) {
          console.log('✅ Perfect match! All CSV records are in the database.')
        } else if (difference > 0) {
          console.log(`⚠️  ${difference} CSV records are missing from the database.`)
        } else {
          console.log(`ℹ️  Database has ${Math.abs(difference)} more records than the CSV.`)
        }

        // Check for specific missing records
        console.log('\n🔍 Checking for missing records...')

        const { data: dbButchers, error: fetchError } = await supabase
          .from('butchers')
          .select('name, city')

        if (fetchError) {
          console.error('Error fetching database records:', fetchError)
          return
        }

        // Create a set of database records for quick lookup
        const dbSet = new Set(dbButchers.map(b => `${b.name}|${b.city}`))

        const missingRecords = csvResults.filter(csv =>
          !dbSet.has(`${csv.title}|${csv.city}`)
        )

        if (missingRecords.length > 0) {
          console.log(`\n❌ Found ${missingRecords.length} missing records:`)
          missingRecords.slice(0, 10).forEach(record => {
            console.log(`   - ${record.title} in ${record.city}`)
          })
          if (missingRecords.length > 10) {
            console.log(`   ... and ${missingRecords.length - 10} more`)
          }
        } else {
          console.log('✅ No missing records found!')
        }

        // Check database distribution
        console.log('\n📈 Database distribution:')
        const { data: counties } = await supabase
          .from('butchers')
          .select('county')
          .eq('is_active', true)
          .not('county', 'is', null)

        const countyCounts = counties?.reduce((acc, item) => {
          acc[item.county] = (acc[item.county] || 0) + 1
          return acc
        }, {}) || {}

        const sortedCounties = Object.entries(countyCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)

        sortedCounties.forEach(([county, count]) => {
          console.log(`   ${county}: ${count} butchers`)
        })

        resolve()
      })
  })
}

verifyImport()