import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { city: string } }
) {
  try {
    const citySlug = params.city

    // First get all cities to find the matching one
    const { data: allCities, error: citiesError } = await supabase
      .from('butchers')
      .select('city, county')
      .eq('is_active', true)
      .not('city', 'is', null)

    if (citiesError) {
      console.error('Database error fetching cities:', citiesError)
      return Response.json({ error: 'Failed to fetch cities' }, { status: 500 })
    }

    // Find the city that matches the slug
    const cityData = allCities.find(c =>
      c.city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') === citySlug
    )

    if (!cityData) {
      return Response.json({ error: 'City not found' }, { status: 404 })
    }

    // Get butchers for this city
    const { data: butchers, error } = await supabase
      .from('butchers')
      .select('id, name, city, county, address, phone, website, rating, review_count, images, latitude, longitude')
      .eq('city', cityData.city)
      .eq('is_active', true)
      .order('rating', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return Response.json({ error: 'Failed to fetch butchers' }, { status: 500 })
    }

    return Response.json({
      city: cityData.city,
      county: cityData.county,
      butchers,
      totalButchers: butchers.length
    })
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}