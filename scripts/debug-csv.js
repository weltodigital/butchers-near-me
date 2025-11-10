const fs = require('fs')
const csv = require('csv-parser')

console.log('🔍 Debugging CSV file...')

const records = []

fs.createReadStream('dataset_google-maps-extractor_2025-11-09_21-12-15-079.csv')
  .pipe(csv())
  .on('data', (row) => {
    records.push(row)
    if (records.length <= 3) {
      console.log(`Record ${records.length}:`)
      console.log('  imageUrl:', row.imageUrl ? 'EXISTS' : 'MISSING')
      console.log('  title:', row.title ? `"${row.title}"` : 'MISSING')
      console.log('  city:', row.city ? `"${row.city}"` : 'MISSING')
      console.log('  Keys:', Object.keys(row))
      console.log('')
    }
  })
  .on('end', () => {
    console.log(`📊 Total records parsed: ${records.length}`)

    const withImages = records.filter(r => r.imageUrl && r.imageUrl.trim())
    console.log(`📸 Records with imageUrl: ${withImages.length}`)

    if (withImages.length > 0) {
      console.log('📋 First 3 records with images:')
      withImages.slice(0, 3).forEach((record, i) => {
        console.log(`  ${i+1}. ${record.title} - ${record.city}`)
        console.log(`     Image: ${record.imageUrl.substring(0, 60)}...`)
      })
    }
  })
  .on('error', (error) => {
    console.error('❌ CSV parsing error:', error)
  })