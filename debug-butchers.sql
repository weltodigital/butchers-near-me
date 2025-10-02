-- Debug SQL to check why Bedfordshire butchers aren't showing
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if butchers exist in the raw table
SELECT 'Raw butchers table:' as check_type;
SELECT id, name, city, county, is_active
FROM butchers
WHERE county ILIKE '%bedford%'
ORDER BY name;

-- 2. Check the public_butchers view
SELECT 'Public butchers view:' as check_type;
SELECT id, name, city, county, county_slug, city_slug, is_active
FROM public_butchers
WHERE county_slug ILIKE '%bedford%'
ORDER BY name;

-- 3. Check specific slug combinations that website would query
SELECT 'Specific bedford queries:' as check_type;
SELECT id, name, city, county, county_slug, city_slug
FROM public_butchers
WHERE county_slug = 'bedfordshire' AND city_slug = 'bedford';

-- 4. Check all Bedfordshire city slugs
SELECT 'All Bedfordshire city slugs:' as check_type;
SELECT DISTINCT city, city_slug
FROM public_butchers
WHERE county_slug = 'bedfordshire'
ORDER BY city;

-- 5. Check if locations table has matching slugs
SELECT 'Location slugs for Bedfordshire:' as check_type;
SELECT name, slug, county_slug, type
FROM public_locations
WHERE county_slug = 'bedfordshire' AND type IN ('city', 'town')
ORDER BY name;