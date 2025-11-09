import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '12')
  const city = searchParams.get('city')

  try {
    let query = supabase
      .from('butchers')
      .select('id, name, city, address, phone, website, rating, review_count')
      .eq('is_active', true)

    if (city) {
      query = query.eq('city', city)
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