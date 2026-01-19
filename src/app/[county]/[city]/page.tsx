import { Metadata } from 'next'
import CityClient from './city-client'

interface PageProps {
  params: Promise<{ county: string; city: string }>
}

// Helper function to transform slug back to readable name
function slugToName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { county: countySlug, city: citySlug } = await params
  const cityName = slugToName(citySlug)
  const countyName = slugToName(countySlug)

  try {
    // Fetch city data for accurate metadata
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.butchersnearme.co.uk'}/api/cities/${citySlug}`)

    if (response.ok) {
      const data = await response.json()
      const { city, county, totalButchers } = data

      return {
        title: `Best Butchers in ${city}, ${county} - Premium Local Meat Shops | Butchers Near Me`,
        description: `Find the ${totalButchers} best butchers in ${city}, ${county}. Quality local meat shops, traditional butchers, and specialty providers offering premium cuts and expert service.`,
        keywords: `butchers ${city.toLowerCase()}, ${city.toLowerCase()} butchers, ${city.toLowerCase()} meat shops, local butchers ${city.toLowerCase()}, ${county.toLowerCase()} butchers, ${city.toLowerCase()} ${county.toLowerCase()} meat, traditional butchers ${city.toLowerCase()}`,
        openGraph: {
          title: `Best Butchers in ${city}, ${county} - Premium Local Meat Shops`,
          description: `Find ${totalButchers} quality butchers in ${city}, ${county}. Premium local meat shops and traditional butchers.`,
          url: `https://www.butchersnearme.co.uk/${countySlug}/${citySlug}`,
        },
        twitter: {
          title: `Best Butchers in ${city}, ${county} - Premium Local Meat Shops`,
          description: `Find ${totalButchers} quality butchers in ${city}, ${county}. Premium cuts and expert service.`,
        },
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  // Fallback metadata
  return {
    title: `Butchers in ${cityName}, ${countyName} - Local Meat Shops | Butchers Near Me`,
    description: `Find quality butchers in ${cityName}, ${countyName}. Discover traditional meat shops, expert butchers, and premium cuts in your local area with reviews and contact details.`,
    keywords: `butchers ${cityName.toLowerCase()}, ${cityName.toLowerCase()} meat shops, local butchers ${cityName.toLowerCase()}, traditional butchers ${countyName.toLowerCase()}`,
  }
}

export default async function CityPage({ params }: PageProps) {
  const { county: countySlug, city: citySlug } = await params
  return <CityClient citySlug={citySlug} countySlug={countySlug} />
}