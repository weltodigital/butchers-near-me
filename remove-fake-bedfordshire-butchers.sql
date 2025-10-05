-- Remove fake/sample butcher data from Bedfordshire
-- Run this AFTER confirming which ones are fake with check-current-bedfordshire-butchers.sql

-- STEP 1: First run check-current-bedfordshire-butchers.sql to identify fake data
-- STEP 2: Then uncomment and run the appropriate DELETE statements below

-- Remove butchers with obvious fake indicators
-- DELETE FROM butchers
-- WHERE county_slug = 'bedfordshire'
-- AND (
--   name ILIKE '%sample%' OR
--   name ILIKE '%test%' OR
--   name ILIKE '%demo%' OR
--   description ILIKE '%sample%' OR
--   description ILIKE '%lorem%' OR
--   description ILIKE '%placeholder%'
-- );

-- Alternative: Remove ALL Bedfordshire butchers if they're all fake
-- UNCOMMENT ONLY IF ALL BEDFORDSHIRE BUTCHERS ARE CONFIRMED FAKE:
-- DELETE FROM butchers WHERE county_slug = 'bedfordshire';

-- Verify removal
SELECT
  'REMAINING BEDFORDSHIRE BUTCHERS:' as info,
  COUNT(*) as count
FROM butchers
WHERE county_slug = 'bedfordshire';