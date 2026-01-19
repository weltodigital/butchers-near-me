import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all butchers to extract counties and cities
    const { data: butchers, error } = await supabase
      .from('butchers')
      .select('county, city')
      .eq('is_active', true)
      .not('county', 'is', null)
      .not('city', 'is', null)

    if (error) {
      console.error('Database error:', error)
      return Response.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // Group butchers by county and city
    const countiesMap = new Map()

    butchers.forEach(butcher => {
      const county = butcher.county
      const city = butcher.city

      if (!countiesMap.has(county)) {
        countiesMap.set(county, {
          county,
          slug: county.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
          count: 0,
          cities: new Map()
        })
      }

      const countyData = countiesMap.get(county)
      countyData.count++

      if (!countyData.cities.has(city)) {
        countyData.cities.set(city, {
          city,
          slug: city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
          count: 0
        })
      }

      countyData.cities.get(city).count++
    })

    // Convert to array format and sort
    const result = Array.from(countiesMap.values())
      .map(county => ({
        ...county,
        cities: Array.from(county.cities.values()).sort((a, b) => b.count - a.count)
      }))
      .sort((a, b) => b.count - a.count)

    return Response.json({ counties: result })
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}