import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://butchersnearme.co.uk'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/locations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  try {
    // Get all counties
    const { data: counties } = await supabase
      .from('butchers')
      .select('county')
      .eq('is_active', true)
      .not('county', 'is', null)

    const uniqueCounties = [...new Set(counties?.map(item => item.county) || [])]

    // County pages
    const countyPages: MetadataRoute.Sitemap = uniqueCounties.map((county) => ({
      url: `${baseUrl}/${county.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    // Get all cities
    const { data: cities } = await supabase
      .from('butchers')
      .select('city')
      .eq('is_active', true)
      .not('city', 'is', null)

    const uniqueCities = [...new Set(cities?.map(item => item.city) || [])]

    // City pages (limit to top 100 cities to avoid sitemap being too large)
    const cityStats = cities?.reduce((acc, item) => {
      acc[item.city] = (acc[item.city] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topCities = Object.entries(cityStats || {})
      .sort(([,a], [,b]) => b - a)
      .slice(0, 100)
      .map(([city]) => city)

    // For city pages, we need to get the county for each city to build proper URLs
    const { data: cityCountyData } = await supabase
      .from('butchers')
      .select('city, county')
      .eq('is_active', true)
      .not('city', 'is', null)
      .not('county', 'is', null)

    const cityCountyMap = cityCountyData?.reduce((acc, item) => {
      if (!acc[item.city]) {
        acc[item.city] = item.county
      }
      return acc
    }, {} as Record<string, string>) || {}

    const cityPages: MetadataRoute.Sitemap = topCities
      .filter(city => cityCountyMap[city])
      .map((city) => {
        const county = cityCountyMap[city]
        const countySlug = county.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
        const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

        return {
          url: `${baseUrl}/${countySlug}/${citySlug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        }
      })

    return [
      ...staticPages,
      ...countyPages,
      ...cityPages,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}