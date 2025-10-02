-- Simple test to check if the view is working at all
-- Run this in Supabase SQL Editor

-- Just check if the view exists and has any data
SELECT COUNT(*) as total_butchers FROM public_butchers;

-- Check the first few butchers to see their slugs
SELECT
  name,
  city,
  county,
  county_slug,
  city_slug
FROM public_butchers
LIMIT 5;