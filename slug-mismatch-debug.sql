-- Debug exact slug mismatches between butchers and locations
-- Run this in Supabase SQL Editor to find the problem

-- 1. Show what slugs the butcher view generates for Bedfordshire
SELECT
  'BUTCHER SLUGS:' as type,
  county,
  city,
  lower(regexp_replace(regexp_replace(county, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) as county_slug,
  lower(regexp_replace(regexp_replace(city, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) as city_slug
FROM butchers
WHERE county ILIKE '%bedford%'
GROUP BY county, city
ORDER BY city;

-- 2. Show what slugs exist in the locations table for Bedfordshire
SELECT
  'LOCATION SLUGS:' as type,
  name as city,
  slug as city_slug,
  county_slug
FROM public_locations
WHERE county_slug = 'bedfordshire' AND type IN ('city', 'town')
ORDER BY name;

-- 3. Find exact mismatches - butcher cities that don't match location slugs
SELECT
  'MISMATCHES:' as type,
  b.city as butcher_city,
  lower(regexp_replace(regexp_replace(b.city, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) as generated_city_slug,
  l.slug as location_city_slug,
  CASE
    WHEN l.slug IS NULL THEN 'NO MATCHING LOCATION'
    ELSE 'LOCATION EXISTS'
  END as status
FROM (
  SELECT DISTINCT city, county
  FROM butchers
  WHERE county ILIKE '%bedford%'
) b
LEFT JOIN public_locations l ON
  l.county_slug = 'bedfordshire'
  AND l.slug = lower(regexp_replace(regexp_replace(b.city, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
  AND l.type IN ('city', 'town')
ORDER BY b.city;