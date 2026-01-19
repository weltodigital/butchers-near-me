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
  county: string
  address: string
  phone: string
  website: string
  rating: number
  review_count: number
  images: string[]
  latitude?: number | null
  longitude?: number | null
}

interface CityClientProps {
  citySlug: string
  countySlug: string
}

export default function CityClient({ citySlug, countySlug }: CityClientProps) {
  const [data, setData] = useState<{
    city: string
    county: string
    butchers: Butcher[]
    totalButchers: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/cities/${citySlug}`)
        if (!response.ok) {
          throw new Error('City not found')
        }
        const result = await response.json()
        setData(result)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [citySlug])

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
          <h1 className="text-4xl font-bold text-slate-900 mb-4">City Not Found</h1>
          <p className="text-slate-600 mb-6">{error || 'The requested city could not be found.'}</p>
          <Link href="/" className="btn btn-primary">
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  const { city, county, butchers, totalButchers } = data

  // Create JSON-LD schema markup
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Best Butchers in ${city}, ${county} - Premium Local Meat Shops`,
    "description": `Find the ${totalButchers} best butchers in ${city}, ${county}. Quality local meat shops, traditional butchers, and specialty providers offering premium cuts and expert service.`,
    "url": `https://www.butchersnearme.co.uk/${countySlug}/${citySlug}`,
    "mainEntity": {
      "@type": "ItemList",
      "name": `Butchers in ${city}`,
      "numberOfItems": totalButchers,
      "itemListElement": butchers.map((butcher, index) => ({
        "@type": "LocalBusiness",
        "position": index + 1,
        "name": butcher.name,
        "@id": `https://www.butchersnearme.co.uk/butcher/${butcher.id}`,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": butcher.address,
          "addressLocality": city,
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
          "item": `https://www.butchersnearme.co.uk/${countySlug}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": city,
          "item": `https://www.butchersnearme.co.uk/${countySlug}/${citySlug}`
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
              <li><Link href={`/${countySlug}`} className="hover:text-red-600">{county}</Link></li>
              <li>→</li>
              <li className="text-gray-900 font-medium">{city}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="text-center mb-16">
            <div className="bg-white rounded-2xl p-12 shadow-lg">
              <h1 className="text-5xl font-bold mb-6">
                Best Butchers in {city}, {county}
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
                Find the {totalButchers} best butchers in {city}. Quality local meat shops, traditional butchers,
                and specialty providers offering premium cuts and expert service.
              </p>
              <div className="flex justify-center gap-8 flex-wrap">
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-600">{totalButchers}</p>
                  <p className="text-gray-600">Quality Butchers</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600">{city}</p>
                  <p className="text-gray-600">Local Area</p>
                </div>
              </div>
            </div>
          </header>

          {/* Featured Butchers */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Premium Butchers in {city}
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
                          alt={`${butcher.name} - Butcher in ${city}`}
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
                            {city}, {county}
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
                <p className="text-lg">No butchers found in {city}.</p>
                <Link href={`/${countySlug}`} className="btn btn-secondary mt-4">
                  View all {county} butchers
                </Link>
              </div>
            )}
          </section>

          {/* Map Section */}
          {butchers.length > 0 && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Map of Butchers in {city}
              </h2>
              <p className="text-gray-600 mb-6">
                Interactive map showing all {totalButchers} butchers in {city}, {county}.
              </p>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <ButchersMap butchers={butchers} city={city} county={county} />
              </div>
            </section>
          )}

          {/* Local Information */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Local Butchers in {city}, {county}
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Why Choose Local?</h3>
                  <p className="text-gray-600 mb-4">
                    The {totalButchers} butchers in {city} offer unparalleled quality and personalized service.
                    These local businesses source from trusted suppliers and provide expert knowledge about cuts,
                    preparation methods, and cooking techniques.
                  </p>
                  <p className="text-gray-600">
                    By choosing local butchers in {city}, you&apos;re supporting the {county} community while
                    getting access to premium meats, custom cuts, and traditional butchery skills.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">What to Expect</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>✓ Freshly cut meats from trusted sources</li>
                    <li>✓ Expert advice on cooking and preparation</li>
                    <li>✓ Custom cuts and special orders</li>
                    <li>✓ Traditional butchery techniques</li>
                    <li>✓ Personal service from experienced butchers</li>
                    <li>✓ Supporting local {city} businesses</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="card p-12">
              <h2 className="card-title text-3xl mb-6">
                Find Your Perfect Butcher in {city}
              </h2>
              <p className="card-description text-lg mb-8 max-w-2xl mx-auto text-gray-600">
                Ready to experience the quality and service of {city}&apos;s finest butchers?
                Contact them directly or visit their shops for the best meat selections in {county}.
              </p>
              <div className="flex justify-center gap-6 flex-wrap">
                <Link href={`/${countySlug}`} className="btn btn-primary text-lg px-8 py-4">
                  More {county} Butchers
                </Link>
                <Link href="/locations" className="btn btn-outline text-lg px-8 py-4">
                  Browse All Locations
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}