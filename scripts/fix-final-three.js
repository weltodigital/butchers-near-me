const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixLastThree() {
  console.log('🔧 Fixing the last 3 butchers...\n')

  // Fix the 2 in 'Hampshire' city - these should probably be marked as Hampshire county
  const { error: error1 } = await supabase
    .from('butchers')
    .update({ county: 'Hampshire' })
    .eq('city', 'Hampshire')
    .eq('county', 'Other')

  if (!error1) {
    console.log('✅ Fixed 2 butchers in "Hampshire" city')
  } else {
    console.error('Error fixing Hampshire:', error1.message)
  }

  // Fix the 1 in 'Cowleaze' - this is a hamlet in Wiltshire
  const { error: error2 } = await supabase
    .from('butchers')
    .update({ county: 'Wiltshire' })
    .eq('city', 'Cowleaze')
    .eq('county', 'Other')

  if (!error2) {
    console.log('✅ Fixed 1 butcher in Cowleaze (Wiltshire)')
  } else {
    console.error('Error fixing Cowleaze:', error2.message)
  }

  // Final check
  const { count } = await supabase
    .from('butchers')
    .select('*', { count: 'exact', head: true })
    .eq('county', 'Other')

  console.log(`\n🎉 Final check: ${count} butchers remaining in "Other" category`)

  if (count === 0) {
    console.log('🎉 SUCCESS! All butchers have been properly categorized!')
  }

  // Show final comprehensive county distribution
  console.log('\n📈 Final comprehensive county distribution:')
  const { data: allCounties } = await supabase
    .from('butchers')
    .select('county')
    .not('county', 'is', null)
    .order('county')

  if (allCounties) {
    const countyCounts = {}
    allCounties.forEach(butcher => {
      countyCounts[butcher.county] = (countyCounts[butcher.county] || 0) + 1
    })

    const sortedCounties = Object.entries(countyCounts)
      .sort(([,a], [,b]) => b - a)

    sortedCounties.forEach(([county, count]) => {
      console.log(`   ${county}: ${count} butchers`)
    })

    console.log(`\n📊 Total counties: ${Object.keys(countyCounts).length}`)
    console.log(`📊 Total butchers: ${allCounties.length}`)
  }
}

fixLastThree()