-- Simple hierarchical schema update
-- Drop existing tables and views
DROP TABLE IF EXISTS location_seo_content CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP VIEW IF EXISTS public_locations CASCADE;
DROP VIEW IF EXISTS public_location_seo_content CASCADE;

-- Create new hierarchical locations table
CREATE TABLE locations (
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
);

-- Create location_seo_content table
CREATE TABLE location_seo_content (
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

-- Add new columns to butchers table
ALTER TABLE butchers ADD COLUMN IF NOT EXISTS county_slug VARCHAR(255);
ALTER TABLE butchers ADD COLUMN IF NOT EXISTS city_slug VARCHAR(255);
ALTER TABLE butchers ADD COLUMN IF NOT EXISTS full_url_path VARCHAR(500);

-- Add unique constraints
ALTER TABLE locations ADD CONSTRAINT unique_county_slug UNIQUE (slug, type) WHERE type = 'county';
ALTER TABLE locations ADD CONSTRAINT unique_city_town_per_county UNIQUE (parent_county_id, slug) WHERE type IN ('city', 'town');

-- Create indexes
CREATE INDEX idx_locations_slug ON locations(slug);
CREATE INDEX idx_locations_type ON locations(type);
CREATE INDEX idx_locations_parent_county ON locations(parent_county_id);
CREATE INDEX idx_locations_county_slug ON locations(county_slug);
CREATE INDEX idx_locations_full_path ON locations(full_path);
CREATE INDEX idx_locations_active ON locations(is_active) WHERE is_active = true;
CREATE INDEX idx_butchers_county_slug ON butchers(county_slug);
CREATE INDEX idx_butchers_city_slug ON butchers(city_slug);
CREATE INDEX idx_butchers_full_url_path ON butchers(full_url_path);
CREATE INDEX idx_location_seo_content_location_id ON location_seo_content(location_id);
CREATE INDEX idx_location_seo_content_type ON location_seo_content(content_type);

-- Create full-text search index
CREATE INDEX idx_locations_search ON locations USING gin(
  to_tsvector('english', name || ' ' || COALESCE(county_slug, '') || ' ' || COALESCE(intro_text, ''))
);

-- Create views
CREATE VIEW public_locations AS
SELECT
  id,
  name,
  slug,
  type,
  parent_county_id,
  county_slug,
  full_path,
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
  butcher_count,
  created_at
FROM locations
WHERE is_active = true;

CREATE VIEW public_location_seo_content AS
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

-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_seo_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to active locations" ON locations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to active location seo content" ON location_seo_content
  FOR SELECT USING (is_active = true);