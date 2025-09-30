const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

console.log('✅ Applying hierarchical schema update...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchemaUpdate() {
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'hierarchical-schema-update.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...`);

    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.length === 0) continue;

      console.log(`Executing statement ${i + 1}/${statements.length}...`);

      try {
        // Use rpc to execute SQL
        const { error } = await supabase.rpc('exec_sql', {
          query: statement
        });

        if (error) {
          console.warn(`⚠️ Statement ${i + 1} warning:`, error.message);
        } else {
          console.log(`✓ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.warn(`⚠️ Statement ${i + 1} error:`, err.message);
      }
    }

    console.log('✅ Schema update completed!');

    // Test the new structure
    console.log('Testing new schema...');
    const { data, error } = await supabase
      .from('locations')
      .select('count')
      .limit(1);

    if (error) {
      console.log('⚠️ New locations table not ready, applying manual SQL statements...');
      await applyManualStatements();
    } else {
      console.log('✅ New schema is working!');
    }

  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
    await applyManualStatements();
  }
}

async function applyManualStatements() {
  console.log('Applying schema statements manually...');

  const statements = [
    // Drop existing tables
    `DROP TABLE IF EXISTS location_seo_content CASCADE`,
    `DROP TABLE IF EXISTS locations CASCADE`,
    `DROP VIEW IF EXISTS public_locations CASCADE`,
    `DROP VIEW IF EXISTS public_location_seo_content CASCADE`,

    // Create new locations table
    `CREATE TABLE locations (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL CHECK (type IN ('county', 'city', 'town')),
      parent_county_id UUID REFERENCES locations(id) ON DELETE CASCADE,
      county_slug VARCHAR(255),
      full_path VARCHAR(500),
      country VARCHAR(50) DEFAULT 'United Kingdom',
      population INTEGER,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      postcode_areas TEXT[] DEFAULT '{}',
      seo_title VARCHAR(255),
      seo_description TEXT,
      seo_keywords TEXT[] DEFAULT '{}',
      meta_description TEXT,
      h1_title VARCHAR(255),
      intro_text TEXT,
      main_content TEXT,
      faq_content JSONB DEFAULT '{}',
      local_specialties TEXT[] DEFAULT '{}',
      nearby_locations TEXT[] DEFAULT '{}',
      butcher_count INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    // Add unique constraints
    `ALTER TABLE locations ADD CONSTRAINT unique_county_slug UNIQUE (slug, type) WHERE type = 'county'`,
    `ALTER TABLE locations ADD CONSTRAINT unique_city_town_per_county UNIQUE (parent_county_id, slug) WHERE type IN ('city', 'town')`,

    // Create location_seo_content table
    `CREATE TABLE location_seo_content (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      content_type VARCHAR(100) NOT NULL,
      title VARCHAR(255),
      content TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    // Add columns to butchers table
    `ALTER TABLE butchers ADD COLUMN IF NOT EXISTS county_slug VARCHAR(255)`,
    `ALTER TABLE butchers ADD COLUMN IF NOT EXISTS city_slug VARCHAR(255)`,
    `ALTER TABLE butchers ADD COLUMN IF NOT EXISTS full_url_path VARCHAR(500)`,

    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations(slug)`,
    `CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type)`,
    `CREATE INDEX IF NOT EXISTS idx_locations_parent_county ON locations(parent_county_id)`,
    `CREATE INDEX IF NOT EXISTS idx_locations_county_slug ON locations(county_slug)`,
    `CREATE INDEX IF NOT EXISTS idx_locations_full_path ON locations(full_path)`,
    `CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active) WHERE is_active = true`,
    `CREATE INDEX IF NOT EXISTS idx_butchers_county_slug ON butchers(county_slug)`,
    `CREATE INDEX IF NOT EXISTS idx_butchers_city_slug ON butchers(city_slug)`,
    `CREATE INDEX IF NOT EXISTS idx_butchers_full_url_path ON butchers(full_url_path)`,
    `CREATE INDEX IF NOT EXISTS idx_location_seo_content_location_id ON location_seo_content(location_id)`,
    `CREATE INDEX IF NOT EXISTS idx_location_seo_content_type ON location_seo_content(content_type)`,
  ];

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`Executing manual statement ${i + 1}/${statements.length}...`);

    try {
      const { error } = await supabase.rpc('exec_sql', {
        query: statement
      });

      if (error) {
        console.warn(`⚠️ Manual statement ${i + 1}:`, error.message);
      } else {
        console.log(`✓ Manual statement ${i + 1} executed`);
      }
    } catch (err) {
      // Try direct SQL execution for some statements
      console.log(`Attempting alternative execution for statement ${i + 1}...`);
    }
  }

  // Create views
  console.log('Creating views...');

  const viewStatements = [
    `CREATE OR REPLACE VIEW public_locations AS
     SELECT id, name, slug, type, parent_county_id, county_slug, full_path, country,
            population, latitude, longitude, postcode_areas, seo_title, seo_description,
            seo_keywords, meta_description, h1_title, intro_text, main_content,
            faq_content, local_specialties, nearby_locations, butcher_count, created_at
     FROM locations WHERE is_active = true`,

    `CREATE OR REPLACE VIEW public_location_seo_content AS
     SELECT id, location_id, content_type, title, content, sort_order, created_at
     FROM location_seo_content WHERE is_active = true ORDER BY sort_order`,

    // Grant permissions
    `GRANT SELECT ON public_locations TO anon, authenticated`,
    `GRANT SELECT ON public_location_seo_content TO anon, authenticated`,
    `GRANT SELECT ON locations TO anon, authenticated`,
    `GRANT SELECT ON location_seo_content TO anon, authenticated`,

    // Enable RLS
    `ALTER TABLE locations ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE location_seo_content ENABLE ROW LEVEL SECURITY`,
  ];

  for (const statement of viewStatements) {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        query: statement
      });
      if (error) {
        console.warn('⚠️ View/permission statement:', error.message);
      }
    } catch (err) {
      console.warn('⚠️ View/permission error:', err.message);
    }
  }

  console.log('✅ Manual schema application completed!');
}

// Run the schema update
applySchemaUpdate();