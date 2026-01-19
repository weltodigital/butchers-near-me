import { Metadata } from 'next'
import CountyClient from './county-client'

interface PageProps {
  params: Promise<{ county: string }>
}

// Helper function to transform slug back to readable name
function slugToCountyName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { county: countySlug } = await params
  const countyName = slugToCountyName(countySlug)

  try {
    // Fetch county data for accurate metadata
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.butchersnearme.co.uk'}/api/counties/${countySlug}`)

    if (response.ok) {
      const data = await response.json()
      const { county, totalButchers } = data

      return {
        title: `Best Butchers in ${county} - Find Quality Local Meat Shops | Butchers Near Me`,
        description: `Discover ${totalButchers} quality butchers in ${county}. Find traditional meat shops, expert butchers, and premium cuts with ratings, reviews, and contact details.`,
        keywords: `butchers ${county.toLowerCase()}, ${county.toLowerCase()} meat shops, local butchers ${county.toLowerCase()}, traditional butchers ${county.toLowerCase()}, quality meat ${county.toLowerCase()}, ${county.toLowerCase()} butcher directory`,
        openGraph: {
          title: `Best Butchers in ${county} - Quality Local Meat Shops`,
          description: `Find ${totalButchers} quality butchers in ${county}. Traditional meat shops, expert service, and premium cuts near you.`,
          url: `https://www.butchersnearme.co.uk/${countySlug}`,
        },
        twitter: {
          title: `Best Butchers in ${county} - Quality Local Meat Shops`,
          description: `Find ${totalButchers} quality butchers in ${county}. Traditional meat shops and premium cuts.`,
        },
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  // Fallback metadata
  return {
    title: `Butchers in ${countyName} - Find Local Meat Shops | Butchers Near Me`,
    description: `Find quality butchers in ${countyName}. Discover traditional meat shops, expert butchers, and premium cuts in your local area with reviews and contact details.`,
    keywords: `butchers ${countyName.toLowerCase()}, ${countyName.toLowerCase()} meat shops, local butchers ${countyName.toLowerCase()}, traditional butchers`,
  }
}

export default async function CountyPage({ params }: PageProps) {
  const { county: countySlug } = await params
  return <CountyClient countySlug={countySlug} />
}