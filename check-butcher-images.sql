-- Check image data for Bedfordshire butchers
-- Run this in Supabase SQL Editor

-- Check which butchers have images
SELECT
  name,
  city,
  county,
  images,
  CASE
    WHEN images IS NULL THEN 'NULL'
    WHEN images = '[]' THEN 'EMPTY_ARRAY'
    WHEN array_length(images, 1) IS NULL THEN 'NULL_ARRAY'
    ELSE 'HAS_IMAGES'
  END as image_status
FROM public_butchers
WHERE county_slug = 'bedfordshire'
ORDER BY city, name;

-- Count by image status
SELECT
  CASE
    WHEN images IS NULL THEN 'NULL'
    WHEN images = '[]' THEN 'EMPTY_ARRAY'
    WHEN array_length(images, 1) IS NULL THEN 'NULL_ARRAY'
    ELSE 'HAS_IMAGES'
  END as image_status,
  COUNT(*) as count
FROM public_butchers
WHERE county_slug = 'bedfordshire'
GROUP BY
  CASE
    WHEN images IS NULL THEN 'NULL'
    WHEN images = '[]' THEN 'EMPTY_ARRAY'
    WHEN array_length(images, 1) IS NULL THEN 'NULL_ARRAY'
    ELSE 'HAS_IMAGES'
  END;