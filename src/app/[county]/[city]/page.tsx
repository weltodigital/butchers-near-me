'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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

export default function CityPage() {
  const params = useParams()
  const countySlug = params.county as string
  const citySlug = params.city as string
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
    "url": `https://butchersnearme.co.uk/${countySlug}/${citySlug}`,
    "mainEntity": {
      "@type": "ItemList",
      "name": `Butchers in ${city}`,
      "numberOfItems": totalButchers,
      "itemListElement": butchers.map((butcher, index) => ({
        "@type": "LocalBusiness",
        "position": index + 1,
        "name": butcher.name,
        "@id": `https://butchersnearme.co.uk/butcher/${butcher.id}`,
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
          "reviewCount": butcher.review_count || 1,
          "bestRating": 5,
          "worstRating": 1
        } : undefined,
        "priceRange": "$$",
        "servesCuisine": "British",
        "paymentAccepted": "Cash, Credit Card",
        "hasMap": `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(butcher.name + ' ' + butcher.address + ' ' + city)}`,
        "image": butcher.images?.[0] || undefined
      }))
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://butchersnearme.co.uk"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": `${county} Butchers`,
          "item": `https://butchersnearme.co.uk/${countySlug}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": `${city} Butchers`,
          "item": `https://butchersnearme.co.uk/${countySlug}/${citySlug}`
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
              <li className="text-gray-900 font-medium">{city} Butchers</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="text-center mb-16">
            <div className="gradient-hero text-white rounded-2xl p-12 mb-8">
              <h1 className="text-6xl font-bold mb-6">
                Best Butchers in {city} Near You
              </h1>
              <p className="text-xl mb-8 max-w-4xl mx-auto opacity-90">
                Discover {totalButchers} premium butchers in {city}, {county}. From traditional family-run establishments to
                modern specialty meat providers, find the finest local butchers offering expert cuts, quality meats, and
                personalized service in your area.
              </p>
              <div className="flex justify-center gap-6 flex-wrap">
                <div className="glass rounded-xl p-6">
                  <p className="text-4xl font-bold mb-2">{totalButchers}</p>
                  <p className="text-white/80">Local Butchers</p>
                </div>
                <div className="glass rounded-xl p-6">
                  <p className="text-4xl font-bold mb-2">{city}</p>
                  <p className="text-white/80">{county}</p>
                </div>
              </div>
            </div>
          </header>

          {/* All Butchers */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              All Butchers in {city}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {butchers.map((butcher) => (
                <article key={butcher.id} className="card hover-lift overflow-hidden">
                  {/* Image Section */}
                  <div className="relative h-48 bg-slate-200">
                    {butcher.images && butcher.images.length > 0 ? (
                      <Image
                        src={butcher.images[0]}
                        alt={`${butcher.name} - Butcher in ${city}`}
                        fill
                        className="object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const parent = e.currentTarget.parentElement
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-slate-100 to-slate-300 flex items-center justify-center">
                              <div class="text-center">
                                <div class="text-4xl mb-2">🥩</div>
                                <div class="text-sm text-slate-600 font-medium">Local Butcher</div>
                              </div>
                            </div>`
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-300 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🥩</div>
                          <div className="text-sm text-slate-600 font-medium">Local Butcher</div>
                        </div>
                      </div>
                    )}
                    {butcher.rating && (
                      <div className="absolute top-3 right-3 glass rounded-lg px-3 py-1">
                        <div className="flex items-center text-white text-sm font-medium">
                          <span className="text-yellow-400 mr-1">★</span>
                          {butcher.rating.toFixed(1)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card-content pt-8">
                    <header className="mb-4">
                      <h3 className="card-title text-xl mb-3">
                        {butcher.name}
                      </h3>
                      <div className="space-y-2">
                        <p className="text-slate-600 flex items-center text-sm">
                          <svg className="w-4 h-4 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {butcher.address}
                        </p>
                        <p className="text-xs text-slate-500 ml-6">
                          {city}, {county}
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
          </section>

          {/* Map Section */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Find Butchers Near You in {city}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore the locations of all {totalButchers} butchers in {city} on our interactive map.
                Click on any marker to view butcher details and contact information.
              </p>
            </div>
            <div className="max-w-5xl mx-auto">
              <ButchersMap
                butchers={butchers}
                city={city}
                county={county}
              />
            </div>
          </section>

          {/* SEO Content */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Premium Butchers in {city}, {county}
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                {city} boasts {totalButchers} exceptional {totalButchers === 1 ? 'butcher' : 'butchers'} known for their
                commitment to quality, traditional craftsmanship, and outstanding customer service. Whether you&apos;re looking
                for premium steaks, specialty sausages, or expert advice on meat preparation, {city}&apos;s local butchers
                deliver unmatched expertise and quality.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🥩</span>
                    Quality Meats
                  </h3>
                  <p className="text-gray-600">
                    Local butchers in {city} source their meat from trusted farms and suppliers, ensuring freshness and quality.
                    Many offer organic, free-range, and grass-fed options to meet diverse dietary preferences.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">👨‍🍳</span>
                    Expert Service
                  </h3>
                  <p className="text-gray-600">
                    The butchers in {city} bring years of experience and traditional skills to their craft. They provide
                    expert advice on cuts, cooking methods, and can prepare custom orders for special occasions.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🏪</span>
                    Local Heritage
                  </h3>
                  <p className="text-gray-600">
                    Many butchers in {city} are family-run businesses with generations of experience, maintaining traditional
                    methods while embracing modern food safety standards and customer preferences.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🌱</span>
                    Sustainability
                  </h3>
                  <p className="text-gray-600">
                    Local butchers in {city} often prioritize sustainable sourcing, working with local farms and reducing
                    food miles while supporting the regional economy and agricultural community.
                  </p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Why Choose Local Butchers in {city}?
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Fresher meat:</strong> Daily deliveries and proper storage ensure maximum freshness</li>
                  <li><strong>Custom cuts:</strong> Get exactly what you need, cut to your specifications</li>
                  <li><strong>Expert knowledge:</strong> Professional advice on cooking methods and preparation</li>
                  <li><strong>Specialty products:</strong> Unique items not available in supermarkets</li>
                  <li><strong>Community support:</strong> Keep local businesses thriving in {city}</li>
                  <li><strong>Personal service:</strong> Build relationships with knowledgeable professionals</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <section className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Explore More Locations
              </h2>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link
                  href={`/${countySlug}`}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  All {county} Butchers
                </Link>
                <Link
                  href="/"
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  All Counties
                </Link>
                <Link
                  href="/locations"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
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