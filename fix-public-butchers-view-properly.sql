-- Fix public_butchers view by generating slugs from existing data
-- Run this SQL in your Supabase dashboard SQL editor

-- First check what columns exist in butchers table
SELECT column_name FROM information_schema.columns WHERE table_name = 'butchers';

-- Drop the existing view first
DROP VIEW IF EXISTS public_butchers;

-- Create the corrected view with generated slugs (without is_active filter for now)
CREATE VIEW public_butchers AS
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
  images,

  -- Generate county_slug from county field
  lower(
    regexp_replace(
      regexp_replace(county, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  ) as county_slug,

  -- Generate city_slug from city field
  lower(
    regexp_replace(
      regexp_replace(city, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  ) as city_slug,

  -- Generate full_url_path for butcher pages
  lower(
    regexp_replace(
      regexp_replace(county, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  ) || '/' ||
  lower(
    regexp_replace(
      regexp_replace(city, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  ) || '/' ||
  lower(
    regexp_replace(
      regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  ) as full_url_path,

  created_at,
  updated_at
FROM butchers;

-- Grant permissions to anonymous and authenticated users
GRANT SELECT ON public_butchers TO anon, authenticated;