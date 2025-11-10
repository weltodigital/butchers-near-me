const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function restoreEmsworthButchers() {
  console.log('🔧 Restoring Emsworth butchers based on original data...\n')

  // Restore M.R. Starr
  const mrStarr = {
    name: 'M.R. Starr',
    city: 'Emsworth',
    county: 'Hampshire',
    address: '1 High St',
    postcode: 'PO10 7AG',
    phone: '+44 1243 372058',
    website: 'https://en-gb.facebook.com/MR-Starr-Butchers-629549970511384/',
    rating: 4.9,
    review_count: 35,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Restore Treagust Butchers
  const treagustButchers = {
    name: 'Treagust Butchers',
    city: 'Emsworth',
    county: 'Hampshire',
    address: '17 High St',
    postcode: 'PO10 7AG',
    phone: '+44 1243 372484',
    website: 'http://www.treagustbutchers.co.uk/',
    rating: 4.8,
    review_count: 33,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  console.log('Restoring M.R. Starr...')
  const { data: mrStarrResult, error: error1 } = await supabase
    .from('butchers')
    .insert([mrStarr])
    .select()

  if (error1) {
    console.error('❌ Error restoring M.R. Starr:', error1.message)
  } else {
    console.log(`✅ Restored M.R. Starr with ID: ${mrStarrResult[0].id}`)
  }

  console.log('Restoring Treagust Butchers...')
  const { data: treagustResult, error: error2 } = await supabase
    .from('butchers')
    .insert([treagustButchers])
    .select()

  if (error2) {
    console.error('❌ Error restoring Treagust Butchers:', error2.message)
  } else {
    console.log(`✅ Restored Treagust Butchers with ID: ${treagustResult[0].id}`)
  }

  // Verify restoration
  console.log('\n🔍 Verifying Emsworth butchers after restoration...')
  const { data: emsworthCheck, count } = await supabase
    .from('butchers')
    .select('id, name, address, phone, rating', { count: 'exact' })
    .eq('city', 'Emsworth')
    .eq('is_active', true)

  if (emsworthCheck) {
    console.log(`📊 Emsworth now has ${count} butchers:`)
    emsworthCheck.forEach(butcher => {
      console.log(`   - ${butcher.name} at ${butcher.address}`)
      console.log(`     Phone: ${butcher.phone} | Rating: ${butcher.rating}/5`)
    })
  }

  // Final database count
  const { count: totalCount } = await supabase
    .from('butchers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  console.log(`\n📊 Total database count: ${totalCount} butchers`)
}

restoreEmsworthButchers()