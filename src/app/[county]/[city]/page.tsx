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

// Generate comprehensive SEO keywords for city pages
function generateCityKeywords(city: string, county: string): string {
  const cityLower = city.toLowerCase()
  const countyLower = county.toLowerCase()
  const keywords = [
    // Core butcher keywords
    `butchers in ${cityLower}`,
    `butcher shops in ${cityLower}`,
    `butcher shop ${cityLower}`,
    `local butchers ${cityLower}`,
    `local butcher ${cityLower}`,
    `butcher near me ${cityLower}`,
    `butchers near me ${cityLower}`,
    `best butchers in ${cityLower}`,
    `best butcher in ${cityLower}`,
    `top rated butchers ${cityLower}`,
    `trusted butchers ${cityLower}`,
    `recommended butcher ${cityLower}`,
    `popular butchers in ${cityLower}`,
    `highly rated butcher ${cityLower}`,
    `independent butchers ${cityLower}`,
    `independent butcher ${cityLower}`,
    `family run butcher ${cityLower}`,
    `traditional butcher ${cityLower}`,
    `artisan butcher ${cityLower}`,
    `local independent butcher ${cityLower}`,
    `quality butcher ${cityLower}`,
    `premium butcher ${cityLower}`,
    `fresh meat butcher ${cityLower}`,
    `ethical butcher ${cityLower}`,
    `sustainable butcher ${cityLower}`,
    `locally sourced meat ${cityLower}`,
    // Question-based keywords
    `where to buy quality meat in ${cityLower}`,
    `best place to buy meat in ${cityLower}`,
    `recommended meat shops in ${cityLower}`,
    `where to find a good butcher in ${cityLower}`,
    `what is the best butcher in ${cityLower}`,
    `are there any good butchers in ${cityLower}`,
    `best local butcher near me in ${cityLower}`,
    `which butcher has the best meat in ${cityLower}`,
    `how to choose a good butcher in ${cityLower}`,
    `is there an independent butcher near me in ${cityLower}`,
    // Descriptive keywords
    `affordable butcher ${cityLower}`,
    `cheap butcher ${cityLower}`,
    `high quality butcher ${cityLower}`,
    `specialist butcher ${cityLower}`,
    `award winning butcher ${cityLower}`,
    `${cityLower} butcher directory`,
    `${cityLower} meat shops`,
    `${cityLower} ${countyLower} butchers`,
    `quality meat ${cityLower}`,
    `butchers ${cityLower} ${countyLower}`
  ]
  return keywords.join(', ')
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
        keywords: generateCityKeywords(city, county),
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
    title: `Best Butchers in ${cityName}, ${countyName} - Premium Local Meat Shops | Butchers Near Me`,
    description: `Find quality butchers in ${cityName}, ${countyName}. Discover traditional meat shops, independent butchers, and premium cuts with expert service and locally sourced meat.`,
    keywords: generateCityKeywords(cityName, countyName),
  }
}

export default async function CityPage({ params }: PageProps) {
  const { county: countySlug, city: citySlug } = await params
  return <CityClient citySlug={citySlug} countySlug={countySlug} />
}