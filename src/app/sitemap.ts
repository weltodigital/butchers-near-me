import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.butchersnearme.co.uk'

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
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/choosing-perfect-steak`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/how-to-choose-good-local-butcher`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  try {
    // Helper function to create consistent slugs (same as in API routes)
    const createSlug = (text: string) => {
      return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    }

    // Get all counties with counts (same logic as counties API)
    const { data: counties } = await supabase
      .from('butchers')
      .select('county')
      .eq('is_active', true)
      .not('county', 'is', null)

    const countyCounts = counties?.reduce((acc, item) => {
      acc[item.county] = (acc[item.county] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // County pages
    const countyPages: MetadataRoute.Sitemap = Object.entries(countyCounts).map(([county]) => ({
      url: `${baseUrl}/${createSlug(county)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    // Get city-county data for building city pages
    const { data: cityCountyData } = await supabase
      .from('butchers')
      .select('city, county')
      .eq('is_active', true)
      .not('city', 'is', null)
      .not('county', 'is', null)

    // Count butchers per city (include ALL cities)
    const cityStats = cityCountyData?.reduce((acc, item) => {
      const key = `${item.city}|${item.county}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const allCityEntries = Object.entries(cityStats)
      .sort(([,a], [,b]) => b - a)

    // City pages (include ALL cities)
    const cityPages: MetadataRoute.Sitemap = allCityEntries.map(([cityCountyKey]) => {
      const [city, county] = cityCountyKey.split('|')
      const countySlug = createSlug(county)
      const citySlug = createSlug(city)

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