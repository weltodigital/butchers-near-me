'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// Dynamically import the map component to avoid SSR issues
const ButchersMap = dynamic(() => import('@/components/ButchersMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-slate-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
        <p className="text-slate-600">Loading map...</p>
      </div>
    </div>
  )
})

interface Butcher {
  id: string
  name: string
  city: string
  address: string
  phone: string
  website: string
  rating: number
  review_count: number
  images: string[]
  latitude?: number | null
  longitude?: number | null
}

interface City {
  city: string
  count: number
  slug: string
}

interface CountyClientProps {
  countySlug: string
}

export default function CountyClient({ countySlug }: CountyClientProps) {
  const [data, setData] = useState<{
    county: string
    butchers: Butcher[]
    cities: City[]
    totalButchers: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/counties/${countySlug}`)
        if (!response.ok) {
          throw new Error('County not found')
        }
        const result = await response.json()
        setData(result)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    if (countySlug) {
      fetchData()
    }
  }, [countySlug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading butchers...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">County Not Found</h1>
          <p className="text-slate-600 mb-6">{error || 'The requested county could not be found.'}</p>
          <Link href="/" className="btn btn-primary">
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  const { county, butchers, cities, totalButchers } = data
  const countySlugForURL = county.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  // Create JSON-LD schema markup
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Best Butchers in ${county} - Find Quality Local Meat Shops`,
    "description": `Discover ${totalButchers} quality butchers in ${county}. Find the best local meat shops, traditional butchers, and specialty meat providers near you.`,
    "url": `https://www.butchersnearme.co.uk/${countySlugForURL}`,
    "mainEntity": {
      "@type": "ItemList",
      "name": `Butchers in ${county}`,
      "numberOfItems": totalButchers,
      "itemListElement": butchers.slice(0, 10).map((butcher, index) => ({
        "@type": "LocalBusiness",
        "position": index + 1,
        "name": butcher.name,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": butcher.address,
          "addressLocality": butcher.city,
          "addressRegion": county,
          "addressCountry": "GB"
        },
        "telephone": butcher.phone,
        "url": butcher.website,
        "aggregateRating": butcher.rating ? {
          "@type": "AggregateRating",
          "ratingValue": butcher.rating,
          "reviewCount": butcher.review_count || 1
        } : undefined
      }))
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.butchersnearme.co.uk"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": county,
          "item": `https://www.butchersnearme.co.uk/${countySlugForURL}`
        }
      ]
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-red-600">Home</Link></li>
              <li>→</li>
              <li className="text-gray-900 font-medium">{county}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="text-center mb-16">
            <div className="bg-white rounded-2xl p-12 shadow-lg">
              <h1 className="text-6xl font-bold mb-6">
                Best Butchers in {county}
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
                Discover {totalButchers} quality butchers across {county}. Find traditional meat shops,
                expert butchers, and premium cuts with detailed information, ratings, and contact details.
              </p>
              <div className="flex justify-center gap-8 flex-wrap">
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-600">{totalButchers}</p>
                  <p className="text-gray-600">Total Butchers</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600">{cities.length}</p>
                  <p className="text-gray-600">Cities & Towns</p>
                </div>
              </div>
            </div>
          </header>

          {/* Cities in County */}
          {cities.length > 0 && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Cities & Towns in {county}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${countySlugForURL}/${city.slug}`}
                    className="card hover-lift p-4 text-center group"
                  >
                    <h3 className="font-semibold text-slate-900 group-hover:text-red-600 mb-2">
                      {city.city}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {city.count} butcher{city.count !== 1 ? 's' : ''}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Featured Butchers */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Featured Butchers in {county}
            </h2>

            {butchers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {butchers.map((butcher) => (
                  <article key={butcher.id} className="card hover-lift overflow-hidden">
                    {/* Image Section */}
                    {butcher.images && butcher.images.length > 0 && (
                      <div className="relative h-48 bg-slate-200">
                        <Image
                          src={butcher.images[0]}
                          alt={`${butcher.name} - Butcher in ${butcher.city}`}
                          fill
                          className="object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.parentElement?.classList.add('hidden')
                          }}
                        />
                        {butcher.rating && (
                          <div className="absolute top-3 right-3 glass rounded-lg px-3 py-1">
                            <div className="flex items-center text-white text-sm font-medium">
                              <span className="text-yellow-400 mr-1">★</span>
                              {butcher.rating.toFixed(1)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="card-content">
                      <header className="mb-4">
                        <h3 className="card-title text-xl mb-3">
                          {butcher.name}
                        </h3>
                        <div className="space-y-2">
                          <p className="text-slate-600 flex items-center text-sm">
                            <svg className="w-4 h-4 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {butcher.city}, {county}
                          </p>
                          <p className="text-xs text-slate-500 ml-6">
                            {butcher.address}
                          </p>
                        </div>
                      </header>

                      {/* Rating Section */}
                      {butcher.rating && (
                        <div className="mb-6 p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < Math.floor(butcher.rating) ? 'text-yellow-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <div className="text-sm text-slate-600">
                              <span className="font-semibold">{butcher.rating.toFixed(1)}/5</span>
                              <span className="text-xs ml-1">({butcher.review_count || 0} reviews)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <footer className="flex flex-wrap gap-2">
                        {butcher.phone && (
                          <a
                            href={`tel:${butcher.phone}`}
                            className="btn btn-secondary flex-1 text-center text-xs"
                            title={`Call ${butcher.name}`}
                          >
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            Call
                          </a>
                        )}
                        {butcher.website && (
                          <a
                            href={butcher.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline flex-1 text-center text-xs"
                            title={`Visit ${butcher.name} website`}
                          >
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                            </svg>
                            Website
                          </a>
                        )}
                      </footer>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-600 py-16">
                <p className="text-lg">No butchers found in {county}.</p>
              </div>
            )}
          </section>

          {/* Map Section */}
          {butchers.length > 0 && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Map of Butchers in {county}
              </h2>
              <p className="text-gray-600 mb-6">
                Interactive map showing all {totalButchers} butchers across {county}.
              </p>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <ButchersMap butchers={butchers} city="" county={county} />
              </div>
            </section>
          )}

          {/* Why Choose Section */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Local Butchers in {county}?
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality & Freshness</h3>
                  <p className="text-gray-600 text-sm">
                    Local butchers in {county} pride themselves on providing the freshest, highest-quality meat
                    sourced from trusted local farms and suppliers.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Knowledge</h3>
                  <p className="text-gray-600 text-sm">
                    With years of experience, our {county} butchers offer expert advice on cuts, preparation
                    methods, and cooking techniques to help you get the best results.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Custom Cuts</h3>
                  <p className="text-gray-600 text-sm">
                    Unlike supermarkets, local butchers in {county} can provide custom cuts, special preparations,
                    and personalized service tailored to your specific needs.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Support</h3>
                  <p className="text-gray-600 text-sm">
                    By choosing local butchers in {county}, you&apos;re supporting small businesses and contributing
                    to the local economy while getting exceptional products and service.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <div className="card p-8">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                Frequently Asked Questions About Butchers in {county}
              </h2>
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Where can I find the best butchers in {county}?
                  </h3>
                  <p className="text-gray-600">
                    You can find the best butchers in {county} through our comprehensive directory above. We list independent butchers, traditional butcher shops, and premium meat suppliers with ratings, reviews, and contact details to help you choose quality local butchers in {county}.
                  </p>
                </div>
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    What makes a good butcher in {county}?
                  </h3>
                  <p className="text-gray-600">
                    A good butcher in {county} typically offers high-quality, locally sourced meat, expert cutting services, knowledgeable staff, and excellent customer service. Look for independent butchers who work with local farms, offer specialty cuts, and maintain high hygiene standards.
                  </p>
                </div>
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Are there independent butchers near me in {county}?
                  </h3>
                  <p className="text-gray-600">
                    Yes, {county} has many independent butchers who pride themselves on traditional butchery skills, locally sourced meat, and personal customer service. Our directory features family-run butcher shops and artisan butchers throughout {county}.
                  </p>
                </div>
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    How do I choose the best butcher shop in {county}?
                  </h3>
                  <p className="text-gray-600">
                    To choose the best butcher shop in {county}, look for shops with good reviews, fresh meat displays, knowledgeable staff, and proper food safety standards. Consider factors like meat quality, variety of cuts, local sourcing, and customer service when selecting a butcher in {county}.
                  </p>
                </div>
                <div className="pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    What services do butchers in {county} typically offer?
                  </h3>
                  <p className="text-gray-600">
                    Butchers in {county} typically offer custom cutting, specialty meats, sausage making, game preparation, and meat advice. Many also provide services like special orders for events, vacuum packing, and recommendations for cooking different cuts of meat.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="card p-12">
              <h2 className="card-title text-3xl mb-6">
                Find Your Perfect Butcher in {county}
              </h2>
              <p className="card-description text-lg mb-8 max-w-2xl mx-auto text-gray-600">
                Whether you&apos;re looking for premium steaks, fresh poultry, or specialty sausages,
                our directory of {totalButchers} butchers in {county} has everything you need.
              </p>
              <div className="flex justify-center gap-6 flex-wrap">
                <Link href="/locations" className="btn btn-primary text-lg px-8 py-4">
                  Browse All Counties
                </Link>
                <Link href="/" className="btn btn-outline text-lg px-8 py-4">
                  Back to Home
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}