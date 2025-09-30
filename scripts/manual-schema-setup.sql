-- Create locations table for SEO landing pages
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('city', 'town', 'county', 'region')),
  county VARCHAR(100),
  region VARCHAR(100),
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
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create location_seo_content table for dynamic content
CREATE TABLE IF NOT EXISTS location_seo_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  content_type VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  content TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for locations
CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations(slug);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_region ON locations(region);
CREATE INDEX IF NOT EXISTS idx_locations_county ON locations(county);
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_location_seo_content_location_id ON location_seo_content(location_id);
CREATE INDEX IF NOT EXISTS idx_location_seo_content_type ON location_seo_content(content_type);

-- Create full-text search index for locations
CREATE INDEX IF NOT EXISTS idx_locations_search ON locations USING gin(
  to_tsvector('english', name || ' ' || COALESCE(county, '') || ' ' || COALESCE(region, '') || ' ' || COALESCE(intro_text, ''))
);

-- Create triggers for locations (only if update function exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
    CREATE TRIGGER update_locations_updated_at
      BEFORE UPDATE ON locations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_location_seo_content_updated_at ON location_seo_content;
    CREATE TRIGGER update_location_seo_content_updated_at
      BEFORE UPDATE ON location_seo_content
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create views for public access
CREATE OR REPLACE VIEW public_locations AS
SELECT
  id,
  name,
  slug,
  type,
  county,
  region,
  country,
  population,
  latitude,
  longitude,
  postcode_areas,
  seo_title,
  seo_description,
  seo_keywords,
  meta_description,
  h1_title,
  intro_text,
  main_content,
  faq_content,
  local_specialties,
  nearby_locations,
  created_at
FROM locations
WHERE is_active = true;

CREATE OR REPLACE VIEW public_location_seo_content AS
SELECT
  id,
  location_id,
  content_type,
  title,
  content,
  sort_order,
  created_at
FROM location_seo_content
WHERE is_active = true
ORDER BY sort_order;

-- Grant permissions
GRANT SELECT ON public_locations TO anon, authenticated;
GRANT SELECT ON public_location_seo_content TO anon, authenticated;
GRANT SELECT ON locations TO anon, authenticated;
GRANT SELECT ON location_seo_content TO anon, authenticated;

-- Create RLS policies for locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_seo_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to active locations" ON locations;
CREATE POLICY "Allow public read access to active locations" ON locations
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow public read access to active location seo content" ON location_seo_content;
CREATE POLICY "Allow public read access to active location seo content" ON location_seo_content
  FOR SELECT USING (is_active = true);