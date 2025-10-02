-- Test the EXACT query the website uses for Bedford
-- Run this in Supabase SQL Editor to see what's happening

-- 1. Test the exact query from getCityButchers function
SELECT
  'EXACT WEBSITE QUERY:' as test_type,
  COUNT(*) as total_found
FROM public_butchers
WHERE county_slug = 'bedfordshire'
  AND city_slug = 'bedford'
ORDER BY rating DESC
LIMIT 20;

-- 2. Show the actual butchers that should match
SELECT
  'MATCHING BUTCHERS:' as test_type,
  id,
  name,
  city,
  county,
  county_slug,
  city_slug
FROM public_butchers
WHERE county_slug = 'bedfordshire'
  AND city_slug = 'bedford'
ORDER BY rating DESC;

-- 3. Check if view exists and has any data at all
SELECT
  'VIEW STATUS:' as test_type,
  COUNT(*) as total_in_view
FROM public_butchers;

-- 4. Check if there are ANY Bedfordshire butchers in view
SELECT
  'BEDFORDSHIRE BUTCHERS:' as test_type,
  COUNT(*) as total_bedfordshire
FROM public_butchers
WHERE county_slug = 'bedfordshire';

-- 5. Show what city slugs exist for Bedfordshire
SELECT
  'BEDFORDSHIRE CITIES:' as test_type,
  city,
  city_slug,
  COUNT(*) as butcher_count
FROM public_butchers
WHERE county_slug = 'bedfordshire'
GROUP BY city, city_slug
ORDER BY city;