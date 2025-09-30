import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export the createClient function for use in server components
export { createClient }

// Database schema setup function
export async function setupDatabaseSchema() {
  try {
    console.log('🚀 Setting up MeatMap UK database schema...')

    // Create butchers table
    const { error: butchersError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS butchers (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          address TEXT NOT NULL,
          postcode VARCHAR(10) NOT NULL,
          city VARCHAR(100) NOT NULL,
          county VARCHAR(100),
          phone VARCHAR(20),
          email VARCHAR(255),
          website VARCHAR(255),
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
          review_count INTEGER DEFAULT 0,
          specialties TEXT[] DEFAULT '{}',
          opening_hours JSONB DEFAULT '{}',
          images TEXT[] DEFAULT '{}',
          full_url_path VARCHAR(500),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (butchersError) {
      console.log('⚠️  Butchers table may already exist:', butchersError.message)
    } else {
      console.log('✅ Butchers table created')
    }

    // Create reviews table
    const { error: reviewsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS reviews (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          butcher_id UUID NOT NULL REFERENCES butchers(id) ON DELETE CASCADE,
          user_name VARCHAR(255) NOT NULL,
          user_email VARCHAR(255),
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          title VARCHAR(255),
          comment TEXT,
          is_approved BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (reviewsError) {
      console.log('⚠️  Reviews table may already exist:', reviewsError.message)
    } else {
      console.log('✅ Reviews table created')
    }

    // Create specialties table
    const { error: specialtiesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS specialties (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (specialtiesError) {
      console.log('⚠️  Specialties table may already exist:', specialtiesError.message)
    } else {
      console.log('✅ Specialties table created')
    }

    console.log('🎉 Database schema setup complete!')
    return true

  } catch (error) {
    console.error('❌ Error setting up database schema:', error.message)
    return false
  }
}

// Helper functions for data operations
export async function getAllButchers() {
  const { data, error } = await supabase
    .from('butchers')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false })

  if (error) {
    console.error('Error fetching butchers:', error.message)
    return []
  }

  return data || []
}

export async function getButcherById(id) {
  const { data, error } = await supabase
    .from('butchers')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching butcher:', error.message)
    return null
  }

  return data
}

export async function getButchersByCity(city) {
  const { data, error } = await supabase
    .from('butchers')
    .select('*')
    .eq('city', city)
    .eq('is_active', true)
    .order('rating', { ascending: false })

  if (error) {
    console.error('Error fetching butchers by city:', error.message)
    return []
  }

  return data || []
}

export async function searchButchers(query) {
  const { data, error } = await supabase
    .from('butchers')
    .select('*')
    .or(`name.ilike.%${query}%, city.ilike.%${query}%, description.ilike.%${query}%`)
    .eq('is_active', true)
    .order('rating', { ascending: false })

  if (error) {
    console.error('Error searching butchers:', error.message)
    return []
  }

  return data || []
}

export async function getReviewsByButcherId(butcherId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('butcher_id', butcherId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error.message)
    return []
  }

  return data || []
}

export async function addReview(butcherId, reviewData) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      butcher_id: butcherId,
      ...reviewData
    }])
    .select()

  if (error) {
    console.error('Error adding review:', error.message)
    return null
  }

  return data?.[0] || null
}

export async function getAllSpecialties() {
  const { data, error } = await supabase
    .from('specialties')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching specialties:', error.message)
    return []
  }

  return data || []
}

// Helper function to generate URL slug
export function generateUrlSlug(name, city, county) {
  const slugify = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-') // Remove leading/trailing hyphens
  }

  const nameSlug = slugify(name)
  const citySlug = slugify(city)
  const countySlug = slugify(county || '')

  if (countySlug) {
    return `${countySlug}/${citySlug}/${nameSlug}`
  } else {
    return `${citySlug}/${nameSlug}`
  }
}

// Add full_url_path column to existing table (migration)
export async function addUrlPathColumn() {
  try {
    console.log('🔄 Adding full_url_path column to butchers table...')

    const { error } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE butchers
        ADD COLUMN IF NOT EXISTS full_url_path VARCHAR(500);
      `
    })

    if (error) {
      console.log('⚠️  Column may already exist:', error.message)
    } else {
      console.log('✅ full_url_path column added')
    }

    return true
  } catch (error) {
    console.error('❌ Error adding column:', error.message)
    return false
  }
}

// Update all existing butchers with URL paths
export async function updateAllButchersWithUrlPaths() {
  try {
    console.log('🔄 Updating all butchers with URL paths...')

    // Get all butchers without full_url_path
    const { data: butchers, error: fetchError } = await supabase
      .from('butchers')
      .select('id, name, city, county')
      .or('full_url_path.is.null,full_url_path.eq.')

    if (fetchError) {
      throw fetchError
    }

    if (!butchers || butchers.length === 0) {
      console.log('✅ All butchers already have URL paths')
      return true
    }

    console.log(`   Found ${butchers.length} butchers to update`)

    // Update each butcher with generated URL path
    for (const butcher of butchers) {
      const urlPath = generateUrlSlug(butcher.name, butcher.city, butcher.county)

      const { error: updateError } = await supabase
        .from('butchers')
        .update({ full_url_path: urlPath })
        .eq('id', butcher.id)

      if (updateError) {
        console.error(`   ❌ Error updating ${butcher.name}:`, updateError.message)
      } else {
        console.log(`   ✅ Updated ${butcher.name} -> ${urlPath}`)
      }
    }

    console.log('🎉 All butchers updated with URL paths!')
    return true

  } catch (error) {
    console.error('❌ Error updating butchers:', error.message)
    return false
  }
}
