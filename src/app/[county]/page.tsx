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

// Generate comprehensive SEO keywords for county pages
function generateCountyKeywords(county: string): string {
  const location = county.toLowerCase()
  const keywords = [
    // Core butcher keywords
    `butchers in ${location}`,
    `butcher shops in ${location}`,
    `butcher shop ${location}`,
    `local butchers ${location}`,
    `local butcher ${location}`,
    `butcher near me ${location}`,
    `butchers near me ${location}`,
    `best butchers in ${location}`,
    `best butcher in ${location}`,
    `top rated butchers ${location}`,
    `trusted butchers ${location}`,
    `recommended butcher ${location}`,
    `popular butchers in ${location}`,
    `highly rated butcher ${location}`,
    `independent butchers ${location}`,
    `independent butcher ${location}`,
    `family run butcher ${location}`,
    `traditional butcher ${location}`,
    `artisan butcher ${location}`,
    `local independent butcher ${location}`,
    `quality butcher ${location}`,
    `premium butcher ${location}`,
    `fresh meat butcher ${location}`,
    `ethical butcher ${location}`,
    `sustainable butcher ${location}`,
    `locally sourced meat ${location}`,
    // Question-based keywords
    `where to buy quality meat in ${location}`,
    `best place to buy meat in ${location}`,
    `recommended meat shops in ${location}`,
    `where to find a good butcher in ${location}`,
    `what is the best butcher in ${location}`,
    `are there any good butchers in ${location}`,
    `best local butcher near me in ${location}`,
    `which butcher has the best meat in ${location}`,
    `how to choose a good butcher in ${location}`,
    `is there an independent butcher near me in ${location}`,
    // Descriptive keywords
    `affordable butcher ${location}`,
    `cheap butcher ${location}`,
    `high quality butcher ${location}`,
    `specialist butcher ${location}`,
    `award winning butcher ${location}`,
    `${location} butcher directory`,
    `${location} meat shops`,
    `quality meat ${location}`
  ]
  return keywords.join(', ')
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
        keywords: generateCountyKeywords(county),
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
    title: `Best Butchers in ${countyName} - Find Quality Local Meat Shops | Butchers Near Me`,
    description: `Discover quality butchers in ${countyName}. Find traditional meat shops, independent butchers, and premium cuts with expert service and locally sourced meat.`,
    keywords: generateCountyKeywords(countyName),
  }
}

export default async function CountyPage({ params }: PageProps) {
  const { county: countySlug } = await params
  return <CountyClient countySlug={countySlug} />
}