-- MeatMap UK Database Schema
-- This file contains the complete database schema for the butcher directory

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create butchers table
CREATE TABLE IF NOT EXISTS butchers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  postcode VARCHAR(10) NOT NULL,
  city VARCHAR(100) NOT NULL,
  county VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  opening_hours JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  butcher_id UUID NOT NULL REFERENCES butchers(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create specialties table for better data management
CREATE TABLE IF NOT EXISTS specialties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create butcher_specialties junction table
CREATE TABLE IF NOT EXISTS butcher_specialties (
  butcher_id UUID NOT NULL REFERENCES butchers(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  PRIMARY KEY (butcher_id, specialty_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_butchers_city ON butchers(city);
CREATE INDEX IF NOT EXISTS idx_butchers_postcode ON butchers(postcode);
CREATE INDEX IF NOT EXISTS idx_butchers_rating ON butchers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_butchers_location ON butchers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_butchers_active ON butchers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_reviews_butcher_id ON reviews(butcher_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;

-- Create full-text search index for butchers
CREATE INDEX IF NOT EXISTS idx_butchers_search ON butchers USING gin(
  to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || city || ' ' || COALESCE(county, ''))
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_butchers_updated_at 
  BEFORE UPDATE ON butchers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update butcher rating when reviews change
CREATE OR REPLACE FUNCTION update_butcher_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the butcher's rating and review count
  UPDATE butchers 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM reviews 
      WHERE butcher_id = COALESCE(NEW.butcher_id, OLD.butcher_id) 
      AND is_approved = true
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM reviews 
      WHERE butcher_id = COALESCE(NEW.butcher_id, OLD.butcher_id) 
      AND is_approved = true
    )
  WHERE id = COALESCE(NEW.butcher_id, OLD.butcher_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers to update butcher ratings
CREATE TRIGGER update_butcher_rating_on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_butcher_rating();

CREATE TRIGGER update_butcher_rating_on_review_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_butcher_rating();

CREATE TRIGGER update_butcher_rating_on_review_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_butcher_rating();

-- Insert common specialties
INSERT INTO specialties (name, description) VALUES
  ('Dry-aged Beef', 'Specializes in dry-aged beef cuts'),
  ('Organic', 'Organic and free-range meat products'),
  ('Traditional', 'Traditional butchering methods and cuts'),
  ('Game', 'Wild game and specialty meats'),
  ('Sausages', 'House-made sausages and charcuterie'),
  ('Halal', 'Halal-certified meat products'),
  ('Kosher', 'Kosher-certified meat products'),
  ('Sustainable', 'Sustainably sourced meat products'),
  ('Local', 'Locally sourced meat products'),
  ('Haggis', 'Traditional Scottish haggis and specialties'),
  ('Black Pudding', 'Traditional black pudding and blood sausages'),
  ('Deli Counter', 'Deli counter with prepared foods'),
  ('Cooking Classes', 'Offers cooking classes and demonstrations'),
  ('Custom Cuts', 'Custom meat cutting services'),
  ('Delivery', 'Home delivery service available')
ON CONFLICT (name) DO NOTHING;

-- Insert sample butchers data
INSERT INTO butchers (name, description, address, postcode, city, county, phone, email, website, latitude, longitude, specialties, opening_hours, is_verified) VALUES
(
  'Smith''s Traditional Butchers',
  'Family-run butcher shop specializing in premium cuts and traditional methods. Known for their dry-aged beef and house-made sausages. Over 30 years of experience serving the local community.',
  '123 High Street',
  'SW1A 1AA',
  'London',
  'Greater London',
  '020 7123 4567',
  'info@smithsbutchers.co.uk',
  'https://smithsbutchers.co.uk',
  51.5074,
  -0.1278,
  ARRAY['Dry-aged Beef', 'House Sausages', 'Organic', 'Traditional'],
  '{"monday": "7:00-18:00", "tuesday": "7:00-18:00", "wednesday": "7:00-18:00", "thursday": "7:00-18:00", "friday": "7:00-18:00", "saturday": "8:00-17:00", "sunday": "closed"}',
  true
),
(
  'The Artisan Butcher',
  'Modern butcher shop focusing on sustainable sourcing and innovative cuts. Features a deli counter and offers cooking classes. Committed to supporting local farmers and sustainable practices.',
  '45 Market Square',
  'M1 1AA',
  'Manchester',
  'Greater Manchester',
  '0161 123 4567',
  'hello@artisanbutcher.co.uk',
  'https://artisanbutcher.co.uk',
  53.4808,
  -2.2426,
  ARRAY['Sustainable', 'Deli Counter', 'Classes', 'Custom Cuts'],
  '{"monday": "closed", "tuesday": "8:00-19:00", "wednesday": "8:00-19:00", "thursday": "8:00-19:00", "friday": "8:00-19:00", "saturday": "8:00-19:00", "sunday": "10:00-16:00"}',
  true
),
(
  'Heritage Meats',
  'Traditional Scottish butcher with over 50 years of experience. Specializes in haggis, black pudding, and local game. A true family business preserving traditional Scottish butchery methods.',
  '78 Royal Mile',
  'EH1 1AA',
  'Edinburgh',
  'Scotland',
  '0131 123 4567',
  'orders@heritagemeats.co.uk',
  'https://heritagemeats.co.uk',
  55.9533,
  -3.1883,
  ARRAY['Haggis', 'Game', 'Traditional', 'Black Pudding'],
  '{"monday": "6:00-17:00", "tuesday": "6:00-17:00", "wednesday": "6:00-17:00", "thursday": "6:00-17:00", "friday": "6:00-17:00", "saturday": "6:00-17:00", "sunday": "closed"}',
  true
),
(
  'Birmingham Butchers Co.',
  'Award-winning butcher shop in the heart of Birmingham. Known for their exceptional customer service and wide range of premium meats. Offers custom cutting and delivery services.',
  '156 Bull Street',
  'B4 6AD',
  'Birmingham',
  'West Midlands',
  '0121 234 5678',
  'info@birminghambutchers.co.uk',
  'https://birminghambutchers.co.uk',
  52.4862,
  -1.8904,
  ARRAY['Custom Cuts', 'Delivery', 'Organic', 'Local'],
  '{"monday": "8:00-18:00", "tuesday": "8:00-18:00", "wednesday": "8:00-18:00", "thursday": "8:00-18:00", "friday": "8:00-18:00", "saturday": "8:00-17:00", "sunday": "10:00-15:00"}',
  true
),
(
  'Liverpool Quality Meats',
  'Family-owned butcher shop serving Liverpool for over 40 years. Specializes in traditional cuts and house-made products. Known for their friendly service and competitive prices.',
  '89 Bold Street',
  'L1 4JA',
  'Liverpool',
  'Merseyside',
  '0151 234 5678',
  'contact@liverpoolqualitymeats.co.uk',
  NULL,
  53.4084,
  -2.9916,
  ARRAY['Traditional', 'House Sausages', 'Local', 'Sausages'],
  '{"monday": "7:30-17:30", "tuesday": "7:30-17:30", "wednesday": "7:30-17:30", "thursday": "7:30-17:30", "friday": "7:30-17:30", "saturday": "7:30-17:00", "sunday": "closed"}',
  false
);

-- Insert sample reviews
INSERT INTO reviews (butcher_id, user_name, user_email, rating, title, comment, is_verified, is_approved) VALUES
(
  (SELECT id FROM butchers WHERE name = 'Smith''s Traditional Butchers'),
  'John Smith',
  'john.smith@email.com',
  5,
  'Excellent quality and service',
  'The dry-aged beef here is absolutely fantastic. The staff are knowledgeable and always helpful. Highly recommended!',
  true,
  true
),
(
  (SELECT id FROM butchers WHERE name = 'Smith''s Traditional Butchers'),
  'Sarah Johnson',
  'sarah.j@email.com',
  4,
  'Great traditional butcher',
  'Love the traditional approach and the quality of meat. The sausages are particularly good. Only downside is the limited parking.',
  true,
  true
),
(
  (SELECT id FROM butchers WHERE name = 'The Artisan Butcher'),
  'Mike Wilson',
  'mike.wilson@email.com',
  5,
  'Modern and sustainable',
  'Really impressed with their commitment to sustainability. The cooking class I attended was excellent and the meat quality is outstanding.',
  true,
  true
),
(
  (SELECT id FROM butchers WHERE name = 'The Artisan Butcher'),
  'Emma Brown',
  'emma.brown@email.com',
  4,
  'Great deli counter',
  'The deli counter has amazing prepared foods. The staff are friendly and the meat is always fresh. A bit pricey but worth it.',
  true,
  true
),
(
  (SELECT id FROM butchers WHERE name = 'Heritage Meats'),
  'Robert MacLeod',
  'robert.macleod@email.com',
  5,
  'Authentic Scottish butcher',
  'The best haggis in Edinburgh! Traditional methods and excellent quality. The black pudding is also fantastic. A true Scottish institution.',
  true,
  true
),
(
  (SELECT id FROM butchers WHERE name = 'Birmingham Butchers Co.'),
  'David Taylor',
  'david.taylor@email.com',
  4,
  'Good service and quality',
  'Consistently good quality meat and friendly service. The custom cutting service is very helpful. Would recommend.',
  true,
  true
),
(
  (SELECT id FROM butchers WHERE name = 'Liverpool Quality Meats'),
  'Lisa Anderson',
  'lisa.anderson@email.com',
  3,
  'Decent local butcher',
  'Good value for money and friendly staff. The meat quality is decent but not exceptional. Good for everyday needs.',
  false,
  true
);

-- Create a view for public butcher data (without sensitive information)
CREATE OR REPLACE VIEW public_butchers AS
SELECT 
  id,
  name,
  description,
  address,
  postcode,
  city,
  county,
  phone,
  website,
  latitude,
  longitude,
  rating,
  review_count,
  specialties,
  opening_hours,
  is_verified,
  created_at
FROM butchers 
WHERE is_active = true;

-- Create a view for public reviews (only approved reviews)
CREATE OR REPLACE VIEW public_reviews AS
SELECT 
  id,
  butcher_id,
  user_name,
  rating,
  title,
  comment,
  created_at
FROM reviews 
WHERE is_approved = true;

-- Grant necessary permissions
GRANT SELECT ON public_butchers TO anon, authenticated;
GRANT SELECT ON public_reviews TO anon, authenticated;
GRANT SELECT ON specialties TO anon, authenticated;
GRANT SELECT ON butcher_specialties TO anon, authenticated;

-- Grant insert permissions for reviews (for public submissions)
GRANT INSERT ON reviews TO anon, authenticated;
GRANT SELECT ON butchers TO anon, authenticated;

-- Create RLS (Row Level Security) policies
ALTER TABLE butchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE butcher_specialties ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active butchers
CREATE POLICY "Allow public read access to active butchers" ON butchers
  FOR SELECT USING (is_active = true);

-- Allow public read access to approved reviews
CREATE POLICY "Allow public read access to approved reviews" ON reviews
  FOR SELECT USING (is_approved = true);

-- Allow public insert for reviews (for customer reviews)
CREATE POLICY "Allow public insert for reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Allow public read access to specialties
CREATE POLICY "Allow public read access to specialties" ON specialties
  FOR SELECT USING (true);

-- Allow public read access to butcher_specialties
CREATE POLICY "Allow public read access to butcher_specialties" ON butcher_specialties
  FOR SELECT USING (true);

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

-- Create triggers for locations
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_location_seo_content_updated_at
  BEFORE UPDATE ON location_seo_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

CREATE POLICY "Allow public read access to active locations" ON locations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to active location seo content" ON location_seo_content
  FOR SELECT USING (is_active = true);