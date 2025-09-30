const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// All English counties (ceremonial and metropolitan)
const allEnglishCounties = [
  'Bedfordshire', 'Berkshire', 'Bristol', 'Buckinghamshire', 'Cambridgeshire',
  'Cheshire', 'Cornwall', 'Cumbria', 'Derbyshire', 'Devon', 'Dorset',
  'Durham', 'East Riding of Yorkshire', 'East Sussex', 'Essex',
  'Gloucestershire', 'Greater London', 'Greater Manchester', 'Hampshire',
  'Herefordshire', 'Hertfordshire', 'Isle of Wight', 'Kent', 'Lancashire',
  'Leicestershire', 'Lincolnshire', 'Merseyside', 'Norfolk', 'North Yorkshire',
  'Northamptonshire', 'Northumberland', 'Nottinghamshire', 'Oxfordshire',
  'Rutland', 'Shropshire', 'Somerset', 'South Yorkshire', 'Staffordshire',
  'Suffolk', 'Surrey', 'Tyne and Wear', 'Warwickshire', 'West Midlands',
  'West Sussex', 'West Yorkshire', 'Wiltshire', 'Worcestershire'
];

async function checkCurrentCounties() {
  console.log('🔍 Checking current counties in database...\n');

  const { data: counties, error } = await supabase
    .from('public_locations')
    .select('name, slug')
    .eq('type', 'county')
    .order('name');

  if (error) {
    console.error('Error fetching counties:', error);
    return;
  }

  console.log(`📊 Found ${counties.length} counties in database:`);
  const currentCounties = counties.map(c => c.name).sort();
  currentCounties.forEach(name => console.log(`  ✓ ${name}`));

  console.log(`\n🎯 Expected ${allEnglishCounties.length} English counties`);

  const missingCounties = allEnglishCounties.filter(county =>
    !currentCounties.includes(county)
  );

  if (missingCounties.length > 0) {
    console.log(`\n❌ Missing ${missingCounties.length} counties:`);
    missingCounties.forEach(name => console.log(`  - ${name}`));
  } else {
    console.log('\n✅ All English counties are present!');
  }

  return { currentCounties, missingCounties };
}

async function checkCitiesAndTowns() {
  console.log('\n🏙️ Checking cities and towns coverage...\n');

  const { data: locations, error } = await supabase
    .from('public_locations')
    .select('name, type, county_slug')
    .in('type', ['city', 'town'])
    .order('county_slug, name');

  if (error) {
    console.error('Error fetching cities and towns:', error);
    return;
  }

  console.log(`📊 Found ${locations.length} cities and towns in database`);

  const byCounty = {};
  locations.forEach(location => {
    if (!byCounty[location.county_slug]) {
      byCounty[location.county_slug] = [];
    }
    byCounty[location.county_slug].push(`${location.name} (${location.type})`);
  });

  console.log('\n📍 Breakdown by county:');
  Object.keys(byCounty).sort().forEach(countySlug => {
    console.log(`  ${countySlug}: ${byCounty[countySlug].length} locations`);
  });

  return { locations, byCounty };
}

async function main() {
  try {
    await checkCurrentCounties();
    await checkCitiesAndTowns();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();