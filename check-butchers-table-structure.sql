-- Check the actual structure of the butchers table
-- Run this in Supabase SQL Editor first

-- 1. Check what columns exist in butchers table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'butchers'
ORDER BY ordinal_position;

-- 2. Check if view exists and what columns it has
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'public_butchers'
ORDER BY ordinal_position;

-- 3. Simple test - just check if butchers exist
SELECT COUNT(*) as total_butchers FROM butchers;

-- 4. Check Bedfordshire butchers (without is_active filter)
SELECT id, name, city, county
FROM butchers
WHERE county ILIKE '%bedford%'
ORDER BY name;