'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface County {
  county: string
  count: number
  slug: string
}

export default function LocationsClient() {
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
    "url": "https://www.butchersnearme.co.uk/locations",
    "mainEntity": {
      "@type": "ItemList",
      "name": "UK Counties with Butchers",
      "numberOfItems": counties.length,
      "itemListElement": counties.map((county, index) => ({
        "@type": "Place",
        "position": index + 1,
        "name": county.county,
        "url": `https://www.butchersnearme.co.uk/${county.slug}`,
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {counties.map((county) => (
                <Link
                  key={county.slug}
                  href={`/${county.slug}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100 hover:border-red-200 group"
                >
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-red-600 mb-3 transition-colors">
                    {county.county}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-red-600">{county.count}</span>
                    <span className="text-gray-600 text-sm">
                      {county.count === 1 ? 'Butcher' : 'Butchers'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Popular Counties */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Most Popular Counties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {counties.slice(0, 8).map((county) => (
                <Link
                  key={county.slug}
                  href={`/${county.slug}`}
                  className="text-center bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 hover:border-red-200 border border-transparent group"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                    {county.county}
                  </h3>
                  <p className="text-3xl font-bold text-red-600 mb-2">{county.count}</p>
                  <p className="text-gray-600 text-sm">
                    {county.count === 1 ? 'Butcher' : 'Butchers'} available
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* About Section */}
          <section className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Your Guide to Quality Local Butchers
              </h2>
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Regional Specialties</h3>
                  <p className="text-gray-600 mb-4">
                    Discover regional meat specialties and traditional preparations unique to each area.
                    From Scottish Highland beef to Welsh lamb, each region offers distinctive flavors and cuts.
                  </p>
                  <p className="text-gray-600">
                    Our directory helps you find butchers who specialize in local breeds and traditional
                    curing methods, ensuring you get the most authentic regional experience.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality Standards</h3>
                  <p className="text-gray-600 mb-4">
                    All butchers in our directory are carefully selected for their commitment to quality,
                    freshness, and customer service. We only list established businesses with proven track records.
                  </p>
                  <p className="text-gray-600">
                    Look for detailed information about each butcher&apos;s sourcing practices, specialties,
                    and customer reviews to help you make informed choices about where to shop.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Find Your Local Area */}
          <section className="mt-12 text-center">
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-semibold text-white mb-4">
                Can&apos;t Find Your Area?
              </h3>
              <p className="text-red-100 mb-6 max-w-2xl mx-auto">
                If you can&apos;t find your local area or know of a quality butcher that should be listed,
                we&apos;d love to hear from you. Help us build the most comprehensive butcher directory in the UK.
              </p>
              <a
                href="mailto:butchersnearme@weltodigital.com"
                className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}