const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function removeEmsworthDuplicates() {
  console.log('🔧 Removing specific Emsworth duplicates...\n')

  // Remove the duplicate M.R. Starr (keeping the first one)
  console.log('Removing duplicate M.R. Starr...')
  const { error: error1 } = await supabase
    .from('butchers')
    .delete()
    .eq('id', '565bb2ca-acb2-4bd1-85d9-e8f6ca7cd84a')

  if (!error1) {
    console.log('✅ Removed duplicate M.R. Starr')
  } else {
    console.error('❌ Error removing M.R. Starr:', error1.message)
  }

  // Remove the duplicate Treagust Butchers (keeping the first one)
  console.log('Removing duplicate Treagust Butchers...')
  const { error: error2 } = await supabase
    .from('butchers')
    .delete()
    .eq('id', '42f58458-1e7c-4723-9c1a-4d2e67ab077f')

  if (!error2) {
    console.log('✅ Removed duplicate Treagust Butchers')
  } else {
    console.error('❌ Error removing Treagust Butchers:', error2.message)
  }

  // Verify Emsworth now has only 2 unique butchers
  console.log('\n🔍 Verifying Emsworth butchers after cleanup...')
  const { data: emsworthButchers, count } = await supabase
    .from('butchers')
    .select('id, name, address', { count: 'exact' })
    .eq('city', 'Emsworth')
    .eq('is_active', true)

  console.log(`📊 Emsworth now has ${count} butchers:`)
  emsworthButchers.forEach(butcher => {
    console.log(`   - ${butcher.name} at ${butcher.address}`)
  })

  // Final database count
  const { count: finalTotal } = await supabase
    .from('butchers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  console.log(`\n📊 Final database total: ${finalTotal} unique butchers`)
}

removeEmsworthDuplicates()