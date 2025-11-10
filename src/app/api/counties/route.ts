import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: counties, error } = await supabase
      .from('butchers')
      .select('county')
      .eq('is_active', true)
      .not('county', 'is', null)

    if (error) {
      console.error('Database error:', error)
      return Response.json({ error: 'Failed to fetch counties' }, { status: 500 })
    }

    // Count butchers per county
    const countyCounts = counties.reduce((acc, item) => {
      acc[item.county] = (acc[item.county] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Convert to array and sort by count
    const sortedCounties = Object.entries(countyCounts)
      .map(([county, count]) => ({
        county,
        count,
        slug: county.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      }))
      .sort((a, b) => b.count - a.count)

    return Response.json({ counties: sortedCounties })
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}