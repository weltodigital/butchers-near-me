-- Step-by-step debugging - run each query one by one
-- Copy/paste each section individually in Supabase SQL Editor

-- STEP 1: Check if any butchers exist at all
SELECT COUNT(*) as total_butchers FROM butchers;

-- STEP 2: Check Bedfordshire butchers in raw table
SELECT id, name, city, county FROM butchers WHERE county ILIKE '%bedford%' LIMIT 5;

-- STEP 3: Check if view exists and has data
SELECT COUNT(*) FROM public_butchers;

-- STEP 4: Check Bedfordshire in view (if it exists)
SELECT id, name, city, county, county_slug, city_slug
FROM public_butchers
WHERE county ILIKE '%bedford%'
LIMIT 5;

-- STEP 5: Check specific Bedford location slugs
SELECT name, slug, county_slug
FROM public_locations
WHERE county_slug = 'bedfordshire' AND slug = 'bedford';

-- STEP 6: Test the exact query the website uses
SELECT id, name, city, county, county_slug, city_slug
FROM public_butchers
WHERE county_slug = 'bedfordshire' AND city_slug = 'bedford';