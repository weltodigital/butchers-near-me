-- Create public_butchers view for the butchers directory
-- Run this SQL in your Supabase dashboard SQL editor

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
  email,
  website,
  latitude,
  longitude,
  rating,
  review_count,
  specialties,
  opening_hours,
  images,
  county_slug,
  city_slug,
  full_url_path,
  created_at,
  updated_at
FROM butchers
WHERE is_active = true;

-- Grant permissions to anonymous and authenticated users
GRANT SELECT ON public_butchers TO anon, authenticated;