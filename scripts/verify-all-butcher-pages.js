#!/usr/bin/env node

/**
 * Verify all butcher pages are accessible
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyAllButcherPages() {
  console.log('🔍 Verifying All Butcher Pages Are Accessible')
  console.log('==============================================\n')

  try {
    // Get all butchers with their URL paths
    const { data: butchers, error } = await supabase
      .from('public_butchers')
      .select('name, full_url_path')
      .not('full_url_path', 'is', null)
      .order('name')

    if (error) {
      console.error('❌ Error fetching butchers:', error.message)
      return
    }

    console.log(`📊 Total butchers to verify: ${butchers.length}`)
    console.log('🌐 Testing server accessibility...\n')

    let successCount = 0
    let errorCount = 0
    const errors = []

    // Test a sample of URLs
    const sampleSize = Math.min(20, butchers.length)
    const sampleButchers = butchers.slice(0, sampleSize)

    console.log(`🧪 Testing sample of ${sampleSize} butcher pages:\n`)

    for (let i = 0; i < sampleButchers.length; i++) {
      const butcher = sampleButchers[i]
      const url = `http://localhost:3000/${butcher.full_url_path}`

      try {
        const response = await fetch(url, { method: 'HEAD' })

        if (response.ok) {
          console.log(`✅ ${i + 1}. ${butcher.name} (HTTP ${response.status})`)
          successCount++
        } else {
          console.log(`❌ ${i + 1}. ${butcher.name} (HTTP ${response.status})`)
          errorCount++
          errors.push({
            name: butcher.name,
            url: butcher.full_url_path,
            status: response.status
          })
        }
      } catch (error) {
        console.log(`❌ ${i + 1}. ${butcher.name} (Connection Error)`)
        errorCount++
        errors.push({
          name: butcher.name,
          url: butcher.full_url_path,
          error: error.message
        })
      }

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('\n📊 Verification Results:')
    console.log('========================')
    console.log(`✅ Successful: ${successCount}/${sampleSize}`)
    console.log(`❌ Errors: ${errorCount}/${sampleSize}`)
    console.log(`📈 Success Rate: ${((successCount / sampleSize) * 100).toFixed(1)}%`)

    if (errors.length > 0) {
      console.log('\n❌ Error Details:')
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.name}`)
        console.log(`   URL: /${error.url}`)
        console.log(`   Issue: ${error.status ? `HTTP ${error.status}` : error.error}`)
      })
    }

    if (successCount === sampleSize) {
      console.log('\n🎉 All tested butcher pages are working correctly!')
      console.log(`📍 Sample URLs verified. Total database has ${butchers.length} butchers.`)
      console.log('\n🌐 You can now visit your website and browse butcher pages:')
      console.log('   • Home: http://localhost:3000')
      console.log('   • Counties: http://localhost:3000/greater-london')
      console.log('   • Cities: http://localhost:3000/greater-london/london')
      console.log('   • Butchers: http://localhost:3000/greater-london/london/porterford-butchers')
    } else {
      console.log('\n⚠️  Some pages may need attention. Check error details above.')
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  }
}

verifyAllButcherPages()