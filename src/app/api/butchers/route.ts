import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('butchers')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(limit)

    // Apply filters
    if (city) {
      query = query.eq('city', city)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%, city.ilike.%${search}%, description.ilike.%${search}%`)
    }

    const { data: butchers, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch butchers' },
        { status: 500 }
      )
    }

    return NextResponse.json({ butchers: butchers || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
