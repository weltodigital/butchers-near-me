-- Create butchers table
CREATE TABLE IF NOT EXISTS butchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  total_score DECIMAL(3,1),
  reviews_count INTEGER,
  street TEXT,
  city TEXT NOT NULL,
  state TEXT,
  country_code TEXT NOT NULL DEFAULT 'GB',
  website TEXT,
  phone TEXT,
  category_name TEXT NOT NULL DEFAULT 'Butcher shop',
  google_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_butchers_city ON butchers(city);
CREATE INDEX IF NOT EXISTS idx_butchers_slug ON butchers(slug);
CREATE INDEX IF NOT EXISTS idx_butchers_total_score ON butchers(total_score);
CREATE INDEX IF NOT EXISTS idx_butchers_country ON butchers(country_code);