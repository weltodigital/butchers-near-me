'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface County {
  county: string
  count: number
  slug: string
}

export default function LocationsPage() {
  const [counties, setCounties] = useState<County[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCounties() {
      try {
        const response = await fetch('/api/counties')
        const data = await response.json()
        setCounties(data.counties || [])
      } catch (error) {
        console.error('Error fetching counties:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCounties()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    )
  }

  const totalButchers = counties.reduce((sum, county) => sum + county.count, 0)

  // Schema markup for locations page
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Find Butchers by Location - UK Counties and Cities",
    "description": "Browse butchers by location across the UK. Find quality local meat shops and traditional butchers in your county and city.",
    "url": "https://butchersnearme.co.uk/locations",
    "mainEntity": {
      "@type": "ItemList",
      "name": "UK Counties with Butchers",
      "numberOfItems": counties.length,
      "itemListElement": counties.map((county, index) => ({
        "@type": "Place",
        "position": index + 1,
        "name": county.county,
        "url": `https://butchersnearme.co.uk/county/${county.slug}`,
        "description": `${county.count} butchers in ${county.county}`
      }))
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-red-600">Home</Link></li>
              <li>→</li>
              <li className="text-gray-900 font-medium">Locations</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Find Butchers by Location
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-4xl mx-auto">
              Browse our comprehensive directory of {totalButchers} quality butchers across the UK.
              Find the best local meat shops and traditional butchers in your county and city.
            </p>
            <div className="bg-white rounded-lg shadow-lg p-6 inline-block">
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{counties.length}</p>
                  <p className="text-gray-600">Counties</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{totalButchers}</p>
                  <p className="text-gray-600">Total Butchers</p>
                </div>
              </div>
            </div>
          </header>

          {/* Counties Grid */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Browse by County
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {counties.map((county) => (
                <Link
                  key={county.slug}
                  href={`/${county.slug}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 group"
                >
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-red-600 mb-3 transition-colors">
                      {county.county}
                    </h3>
                    <div className="mb-4">
                      <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        {county.count} butcher{county.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                      View all butchers →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured Counties */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Popular Counties
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {counties.slice(0, 6).map((county) => (
                  <Link
                    key={county.slug}
                    href={`/${county.slug}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-red-50 transition-colors group"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-red-600">
                        {county.county}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {county.count} butchers
                      </p>
                    </div>
                    <span className="text-red-500 group-hover:text-red-700">
                      →
                    </span>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Showing top 6 counties by number of butchers
                </p>
              </div>
            </div>
          </section>

          {/* SEO Content */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              UK&apos;s Finest Local Butchers
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-6 text-lg">
                Our comprehensive directory features {totalButchers} carefully selected butchers across {counties.length} counties
                throughout the United Kingdom. From traditional family-run shops to modern specialty meat providers,
                discover the finest local butchers offering premium quality meats and expert service.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mt-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Regional Specialties</h3>
                  <p className="text-gray-600 mb-4">
                    Each region of the UK has its own culinary traditions and specialties. Our butchers showcase
                    local varieties, from Scottish Highland beef to Welsh lamb, Cornish pasties to Cumberland sausages.
                  </p>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Traditional regional sausages and pies</li>
                    <li>• Locally sourced farm-fresh meats</li>
                    <li>• Specialty cuts and preparations</li>
                    <li>• Organic and free-range options</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality Standards</h3>
                  <p className="text-gray-600 mb-4">
                    All featured butchers meet our high standards for quality, freshness, and customer service.
                    We prioritize establishments that support local farms and maintain traditional butchery skills.
                  </p>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Expert meat preparation and cutting</li>
                    <li>• Excellent customer reviews and ratings</li>
                    <li>• Commitment to food safety and hygiene</li>
                    <li>• Support for local agricultural communities</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Why Choose Local Butchers?
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Superior Quality</h4>
                    <p className="text-gray-600 text-sm">
                      Local butchers source from trusted suppliers and offer fresher meat than supermarket alternatives.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Expert Knowledge</h4>
                    <p className="text-gray-600 text-sm">
                      Professional butchers provide invaluable advice on cuts, cooking methods, and preparation techniques.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Custom Service</h4>
                    <p className="text-gray-600 text-sm">
                      Get exactly what you need with custom cuts, special orders, and personalized recommendations.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Community Impact</h4>
                    <p className="text-gray-600 text-sm">
                      Supporting local butchers helps preserve traditional skills and supports regional economies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Find Your Local Butcher
              </h2>
              <p className="text-gray-600 mb-6">
                Discover quality butchers in your area and experience the difference of locally sourced,
                expertly prepared meats.
              </p>
              <Link
                href="/"
                className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Start Your Search
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}