-- Final working SQL fix - this should definitely work
-- Run this in Supabase SQL Editor

-- Step 1: Drop any existing broken view
DROP VIEW IF EXISTS public_butchers;

-- Step 2: Create the working view with proper schema
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
  email,
  website,
  latitude,
  longitude,
  rating,
  review_count,
  specialties,
  opening_hours,
  images,
  full_url_path,
  is_active,
  created_at,
  updated_at,

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
  ) as city_slug

FROM butchers
WHERE is_active = true;

-- Step 3: Grant permissions
GRANT SELECT ON public_butchers TO anon, authenticated;

-- Step 4: Test the view works
SELECT COUNT(*) as total_butchers FROM public_butchers;

-- Step 5: Test Bedfordshire specifically
SELECT id, name, city, county, county_slug, city_slug
FROM public_butchers
WHERE county ILIKE '%bedford%'
LIMIT 5;