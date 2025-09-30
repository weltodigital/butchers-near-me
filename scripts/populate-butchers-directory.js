const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to create URL-friendly slugs
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// Generate realistic butcher names
const butcherNameTemplates = [
  "{lastName}'s Traditional Butchers",
  "{lastName} & Sons Butchers",
  "{cityName} Prime Meats",
  "The {adjective} Butcher",
  "{lastName} Family Butchers",
  "{cityName} Quality Meats",
  "{adjective} {meat} Company",
  "{lastName}'s Local Butchers",
  "Premium Cuts {cityName}",
  "{adjective} Meat Suppliers"
];

const lastNames = [
  'Smith', 'Jones', 'Brown', 'Wilson', 'Taylor', 'Davies', 'Evans', 'Thomas',
  'Roberts', 'Johnson', 'Lewis', 'Walker', 'Robinson', 'Wood', 'Thompson',
  'White', 'Watson', 'Jackson', 'Wright', 'Green', 'Harris', 'Cooper',
  'King', 'Lee', 'Martin', 'Clarke', 'James', 'Morgan', 'Hughes', 'Edwards'
];

const adjectives = [
  'Premium', 'Quality', 'Traditional', 'Family', 'Local', 'Fresh', 'Fine',
  'Heritage', 'Artisan', 'Classic', 'Superior', 'Finest', 'Choice', 'Prime',
  'Expert', 'Master', 'Craft', 'Village', 'Corner', 'High Street'
];

const meatTypes = ['Meat', 'Beef', 'Lamb', 'Pork', 'Poultry'];

const specialties = [
  'Dry-aged Beef', 'House Sausages', 'Organic', 'Traditional', 'Free Range',
  'Local Sourcing', 'Game Meats', 'Smoked Products', 'Ready Meals', 'BBQ Cuts',
  'Halal', 'Grass Fed', 'Rare Breeds', 'Homemade Pies', 'Charcuterie'
];

const streetNames = [
  'High Street', 'Church Lane', 'Market Square', 'King Street', 'Queen Street',
  'Victoria Road', 'Main Street', 'Mill Lane', 'Station Road', 'Park Avenue',
  'The Green', 'Crown Street', 'Bridge Street', 'Castle Street', 'Manor Road'
];

function generateButcherName(cityName) {
  const template = butcherNameTemplates[Math.floor(Math.random() * butcherNameTemplates.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const meat = meatTypes[Math.floor(Math.random() * meatTypes.length)];

  return template
    .replace('{lastName}', lastName)
    .replace('{cityName}', cityName)
    .replace('{adjective}', adjective)
    .replace('{meat}', meat);
}

function generateDescription(name, cityName) {
  const templates = [
    `Family-run butcher shop in ${cityName} specializing in premium cuts and traditional methods. Known for exceptional quality and personal service to the local community.`,
    `Traditional butchers serving ${cityName} for over 25 years. Expert meat preparation with locally sourced produce and time-honored techniques.`,
    `Quality meat suppliers in ${cityName} offering fresh daily cuts, expert advice, and competitive prices. Committed to supporting local farmers and sustainable practices.`,
    `Independent butchers in ${cityName} providing premium meats, traditional cuts, and personalized service. Specializing in local sourcing and custom orders.`,
    `Established meat suppliers serving ${cityName} with quality cuts, friendly service, and expert knowledge. Family business with generations of butchery experience.`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

function generatePostcode(countySlug) {
  // Generate realistic UK postcodes based on county
  const postcodeMap = {
    'hampshire': ['SO', 'PO', 'RG', 'GU'],
    'kent': ['CT', 'ME', 'TN', 'DA'],
    'surrey': ['GU', 'RH', 'KT', 'CR'],
    'essex': ['CM', 'CO', 'SS', 'IG'],
    'lancashire': ['PR', 'BB', 'FY', 'LA'],
    'west-yorkshire': ['LS', 'BD', 'WF', 'HD'],
    'greater-manchester': ['M', 'BL', 'OL', 'SK'],
    'west-midlands': ['B', 'WV', 'DY', 'CV'],
    'devon': ['EX', 'TQ', 'PL', 'TQ'],
    'norfolk': ['NR', 'PE', 'IP', 'NR']
  };

  const prefixes = postcodeMap[countySlug] || ['AB'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 99) + 1;
  const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                String.fromCharCode(65 + Math.floor(Math.random() * 26));

  return `${prefix}${number} ${Math.floor(Math.random() * 9) + 1}${suffix}`;
}

function generateOpeningHours() {
  const standardHours = {
    monday: '8:00-17:30',
    tuesday: '8:00-17:30',
    wednesday: '8:00-17:30',
    thursday: '8:00-17:30',
    friday: '8:00-18:00',
    saturday: '8:00-16:00',
    sunday: 'closed'
  };

  // Randomly modify some days
  if (Math.random() > 0.7) standardHours.wednesday = '8:00-13:00'; // Half day Wednesday
  if (Math.random() > 0.8) standardHours.sunday = '9:00-13:00'; // Some open Sunday morning

  return standardHours;
}

function generateButcherImages() {
  // Generate 1-3 realistic butcher shop images using Unsplash
  const imageCount = Math.floor(Math.random() * 3) + 1;
  const images = [];

  const butcherImages = [
    'https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=800&h=600&fit=crop', // Butcher shop interior
    'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&h=600&fit=crop', // Meat display
    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=600&fit=crop', // Butcher at work
    'https://images.unsplash.com/photo-1574781330855-d0db2706b3d0?w=800&h=600&fit=crop', // Fresh meat cuts
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop', // Butcher shop exterior
    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=600&fit=crop', // Traditional butcher
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop', // Meat preparation
    'https://images.unsplash.com/photo-1549048913-deeae63d75b6?w=800&h=600&fit=crop', // Butcher shop counter
  ];

  for (let i = 0; i < imageCount; i++) {
    const randomIndex = Math.floor(Math.random() * butcherImages.length);
    const imageUrl = butcherImages[randomIndex];
    if (!images.includes(imageUrl)) {
      images.push(imageUrl);
    }
  }

  return images;
}

function generateCoordinates(cityName, countySlug) {
  // Approximate coordinates for realistic positioning
  const cityCoords = {
    // Hampshire
    'portsmouth': [50.8198, -1.0880],
    'southampton': [50.9097, -1.4044],
    'winchester': [51.0632, -1.3080],
    'basingstoke': [51.2664, -1.0840],

    // Kent
    'canterbury': [51.2802, 1.0789],
    'maidstone': [51.2704, 0.5227],
    'dover': [51.1279, 1.3134],
    'folkestone': [51.0814, 1.1696],

    // Surrey
    'guildford': [51.2362, -0.5704],
    'woking': [51.3168, -0.5590],
    'epsom': [51.3304, -0.2686],

    // Essex
    'chelmsford': [51.7356, 0.4685],
    'colchester': [51.8959, 0.9035],
    'southend-on-sea': [51.5459, 0.7077]
  };

  const baseCoords = cityCoords[cityName] || [51.5074, -0.1278]; // Default to London

  // Add small random offset for variety
  const lat = baseCoords[0] + (Math.random() - 0.5) * 0.02;
  const lng = baseCoords[1] + (Math.random() - 0.5) * 0.02;

  return [lat, lng];
}

async function createPublicButchersView() {
  console.log('Creating public_butchers view...');

  try {
    // Try to create view via direct query first
    const { error } = await supabase.rpc('exec_sql', {
      query: `
        CREATE OR REPLACE VIEW public_butchers AS
        SELECT
          id, name, description, address, postcode, city, county,
          phone, email, website, latitude, longitude, rating,
          review_count, specialties, opening_hours, images,
          county_slug, city_slug, full_url_path, created_at, updated_at
        FROM butchers
        WHERE is_active = true;

        GRANT SELECT ON public_butchers TO anon, authenticated;
      `
    });

    if (error) {
      console.log('⚠️ RPC failed, please manually create view in Supabase dashboard:');
      console.log(`
CREATE OR REPLACE VIEW public_butchers AS
SELECT
  id, name, description, address, postcode, city, county,
  phone, email, website, latitude, longitude, rating,
  review_count, specialties, opening_hours, images,
  county_slug, city_slug, full_url_path, created_at, updated_at
FROM butchers
WHERE is_active = true;

GRANT SELECT ON public_butchers TO anon, authenticated;
      `);
    } else {
      console.log('✅ public_butchers view created successfully');
    }
  } catch (err) {
    console.log('⚠️ Error creating view:', err.message);
  }
}

async function populateButchersDirectory() {
  try {
    await createPublicButchersView();

    console.log('Loading location data...');

    // Get all cities and towns from locations
    const { data: locations, error: locError } = await supabase
      .from('public_locations')
      .select('*')
      .in('type', ['city', 'town'])
      .order('county_slug, name');

    if (locError) {
      console.error('Error loading locations:', locError);
      return;
    }

    console.log(`Found ${locations.length} cities and towns to populate with butchers`);

    // Clear existing butchers (optional - comment out if you want to keep existing)
    console.log('Clearing existing butchers...');
    await supabase.from('butchers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    let totalButchers = 0;

    for (const location of locations) {
      const butchersPerLocation = Math.floor(Math.random() * 4) + 2; // 2-5 butchers per location

      console.log(`Populating ${butchersPerLocation} butchers for ${location.name}, ${location.county_slug}...`);

      for (let i = 0; i < butchersPerLocation; i++) {
        const name = generateButcherName(location.name);
        const slug = createSlug(name);
        const coords = generateCoordinates(location.slug, location.county_slug);

        const butcherData = {
          name: name,
          description: generateDescription(name, location.name),
          address: `${Math.floor(Math.random() * 199) + 1} ${streetNames[Math.floor(Math.random() * streetNames.length)]}`,
          postcode: generatePostcode(location.county_slug),
          city: location.name,
          county: location.county_slug.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          phone: `01${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900000) + 100000}`,
          email: `info@${slug}.co.uk`,
          website: `https://${slug}.co.uk`,
          latitude: coords[0],
          longitude: coords[1],
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0 rating
          review_count: Math.floor(Math.random() * 50) + 5,
          specialties: specialties.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 2),
          opening_hours: generateOpeningHours(),
          images: generateButcherImages(),
          is_verified: Math.random() > 0.3, // 70% verified
          is_active: true,
          county_slug: location.county_slug,
          city_slug: location.slug,
          full_url_path: `${location.county_slug}/${location.slug}/${slug}`
        };

        const { error: insertError } = await supabase
          .from('butchers')
          .insert(butcherData);

        if (insertError) {
          console.error(`Error inserting butcher ${name}:`, insertError);
        } else {
          totalButchers++;
          console.log(`✓ Added: ${name}`);
        }
      }
    }

    console.log(`\n✅ Successfully populated ${totalButchers} butchers across ${locations.length} locations!`);

    // Update location butcher counts
    console.log('Updating location butcher counts...');

    for (const location of locations) {
      const { data: butcherCount } = await supabase
        .from('butchers')
        .select('id', { count: 'exact' })
        .eq('city_slug', location.slug)
        .eq('county_slug', location.county_slug);

      await supabase
        .from('locations')
        .update({ butcher_count: butcherCount?.length || 0 })
        .eq('id', location.id);
    }

    // Update county butcher counts
    const { data: counties } = await supabase
      .from('public_locations')
      .select('*')
      .eq('type', 'county');

    for (const county of counties) {
      const { data: butcherCount } = await supabase
        .from('butchers')
        .select('id', { count: 'exact' })
        .eq('county_slug', county.slug);

      await supabase
        .from('locations')
        .update({ butcher_count: butcherCount?.length || 0 })
        .eq('id', county.id);
    }

    console.log('✅ Updated all location butcher counts!');

    // Final summary
    const { data: finalCount } = await supabase
      .from('butchers')
      .select('id', { count: 'exact' });

    console.log(`\n🎉 Directory population complete!`);
    console.log(`📊 Total butchers in directory: ${finalCount?.length || 0}`);
    console.log(`📍 Locations covered: ${locations.length} cities and towns`);
    console.log(`🗺️ Counties covered: ${counties?.length || 0}`);

  } catch (error) {
    console.error('❌ Error populating butchers directory:', error);
  }
}

// Run the population script
if (require.main === module) {
  populateButchersDirectory();
}

module.exports = { populateButchersDirectory };