import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { county: string } }
) {
  try {
    const countySlug = params.county

    // First get all counties to find the matching one
    const { data: allCounties, error: countiesError } = await supabase
      .from('butchers')
      .select('county')
      .eq('is_active', true)
      .not('county', 'is', null)

    if (countiesError) {
      console.error('Database error fetching counties:', countiesError)
      return Response.json({ error: 'Failed to fetch counties' }, { status: 500 })
    }

    // Find the county that matches the slug
    const uniqueCounties = [...new Set(allCounties.map(item => item.county))]
    const county = uniqueCounties.find(c =>
      c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') === countySlug
    )

    if (!county) {
      return Response.json({ error: 'County not found' }, { status: 404 })
    }

    // Get butchers for this county
    const { data: butchers, error } = await supabase
      .from('butchers')
      .select('id, name, city, address, phone, website, rating, review_count, images, latitude, longitude')
      .eq('county', county)
      .eq('is_active', true)
      .order('rating', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return Response.json({ error: 'Failed to fetch butchers' }, { status: 500 })
    }

    // Group by city
    const cityCounts = butchers.reduce((acc, butcher) => {
      acc[butcher.city] = (acc[butcher.city] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const cities = Object.entries(cityCounts)
      .map(([city, count]) => ({
        city,
        count,
        slug: city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      }))
      .sort((a, b) => b.count - a.count)

    return Response.json({
      county,
      butchers,
      cities,
      totalButchers: butchers.length
    })
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}