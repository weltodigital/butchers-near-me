-- Check what location types are allowed
-- Run this in Supabase SQL Editor

-- Check existing types in the table
SELECT DISTINCT type FROM public_locations ORDER BY type;

-- Check the constraint
SELECT conname, consrc
FROM pg_constraint
WHERE conrelid = 'public_locations'::regclass
AND contype = 'c';