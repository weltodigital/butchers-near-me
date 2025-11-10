import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '12')
  const city = searchParams.get('city')
  const featured = searchParams.get('featured') === 'true'

  try {
    let query = supabase
      .from('butchers')
      .select('id, name, city, county, address, phone, website, rating, review_count, images')
      .eq('is_active', true)

    if (city) {
      query = query.eq('city', city)
    }

    if (featured) {
      // Filter for featured butchers with good images, websites, and high ratings
      query = query
        .not('website', 'is', null)
        .neq('website', '')
        .not('images', 'is', null)
        .gte('rating', 4.5)
        .gte('review_count', 10)
    }

    const { data: butchers, error } = await query
      .order('rating', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Database error:', error)
      return Response.json({ error: 'Failed to fetch butchers' }, { status: 500 })
    }

    return Response.json({ butchers })
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}