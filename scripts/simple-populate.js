const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample location data
const counties = [
  { name: 'Hampshire', slug: 'hampshire', population: 1844245 },
  { name: 'Kent', slug: 'kent', population: 1846478 },
  { name: 'Surrey', slug: 'surrey', population: 1196236 },
  { name: 'Essex', slug: 'essex', population: 1832751 },
  { name: 'Lancashire', slug: 'lancashire', population: 1498300 }
];

const cities = [
  { name: 'Portsmouth', slug: 'portsmouth', type: 'city', county_slug: 'hampshire', population: 205400 },
  { name: 'Southampton', slug: 'southampton', type: 'city', county_slug: 'hampshire', population: 253651 },
  { name: 'Canterbury', slug: 'canterbury', type: 'city', county_slug: 'kent', population: 55240 },
  { name: 'Maidstone', slug: 'maidstone', type: 'town', county_slug: 'kent', population: 113137 },
  { name: 'Guildford', slug: 'guildford', type: 'town', county_slug: 'surrey', population: 77057 }
];

async function testSchema() {
  console.log('Testing current schema...');

  // Test if new locations table exists
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ New locations table not found:', error.message);
    console.log('\n📋 Please run this SQL in your Supabase dashboard:');
    console.log('='.repeat(60));
    console.log(`
-- Create hierarchical locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('county', 'city', 'town')),
  parent_county_id UUID REFERENCES locations(id),
  county_slug VARCHAR(255),
  full_path VARCHAR(500),
  country VARCHAR(50) DEFAULT 'United Kingdom',
  population INTEGER,
  seo_title VARCHAR(255),
  meta_description TEXT,
  h1_title VARCHAR(255),
  intro_text TEXT,
  main_content TEXT,
  faq_content JSONB DEFAULT '{}',
  butcher_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations(slug);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_county_slug ON locations(county_slug);

-- Create view
CREATE OR REPLACE VIEW public_locations AS
SELECT * FROM locations WHERE is_active = true;

-- Grant permissions
GRANT SELECT ON public_locations TO anon, authenticated;
GRANT SELECT ON locations TO anon, authenticated;

-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON locations FOR SELECT USING (is_active = true);
    `);
    console.log('='.repeat(60));
    return false;
  } else {
    console.log('✅ Schema is ready!');
    return true;
  }
}

async function populateSimpleData() {
  if (!(await testSchema())) {
    return;
  }

  console.log('Populating sample location data...');

  // Insert counties
  for (const county of counties) {
    const { data, error } = await supabase
      .from('locations')
      .insert({
        name: county.name,
        slug: county.slug,
        type: 'county',
        population: county.population,
        county_slug: county.slug,
        full_path: county.slug,
        seo_title: `${county.name} Butchers Directory | Quality Meat Suppliers`,
        meta_description: `Find premium butchers across ${county.name}. Quality meat suppliers with local sourcing and traditional methods.`,
        h1_title: `Butchers in ${county.name}`,
        intro_text: `Discover ${county.name}'s finest butchers offering premium quality meat and traditional service.`,
        main_content: `<h2>Quality Butchers in ${county.name}</h2><p>${county.name} hosts exceptional butchers maintaining traditional craftsmanship and modern standards.</p>`,
        butcher_count: 0
      })
      .select();

    if (error) {
      console.error(`Error inserting county ${county.name}:`, error);
    } else {
      console.log(`✓ Inserted county: ${county.name}`);
    }
  }

  // Get county IDs for cities
  const { data: countyData } = await supabase
    .from('locations')
    .select('id, slug')
    .eq('type', 'county');

  const countyMap = {};
  countyData?.forEach(county => {
    countyMap[county.slug] = county.id;
  });

  // Insert cities
  for (const city of cities) {
    const { data, error } = await supabase
      .from('locations')
      .insert({
        name: city.name,
        slug: city.slug,
        type: city.type,
        parent_county_id: countyMap[city.county_slug],
        county_slug: city.county_slug,
        full_path: `${city.county_slug}/${city.slug}`,
        population: city.population,
        seo_title: `${city.name} Butchers | Premium Meat Suppliers`,
        meta_description: `Find quality butchers in ${city.name}. Local meat suppliers offering fresh cuts and traditional service.`,
        h1_title: `Butchers in ${city.name}`,
        intro_text: `Discover ${city.name}'s finest butchers offering premium quality meat and traditional service.`,
        main_content: `<h2>Quality Meat Suppliers in ${city.name}</h2><p>${city.name} maintains a tradition of quality butchery with local suppliers committed to excellence.</p>`,
        butcher_count: 0
      })
      .select();

    if (error) {
      console.error(`Error inserting ${city.type} ${city.name}:`, error);
    } else {
      console.log(`✓ Inserted ${city.type}: ${city.name}`);
    }
  }

  console.log('✅ Sample location data populated!');

  // Test the data
  const { data: testData } = await supabase
    .from('public_locations')
    .select('name, slug, type, full_path')
    .order('type, name');

  console.log('\n📊 Current locations:');
  testData?.forEach(loc => {
    console.log(`- ${loc.name} (${loc.type}): /${loc.full_path || loc.slug}`);
  });
}

populateSimpleData();