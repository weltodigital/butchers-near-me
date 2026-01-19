'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
}

interface City {
  slug: string
  city: string
  count: number
}

interface County {
  slug: string
  county: string
  count: number
  cities: City[]
}

export default function HomeClient() {
  const [butchers, setButchers] = useState<Butcher[]>([])
  const [totalButchers, setTotalButchers] = useState(0)
  const [counties, setCounties] = useState<County[]>([])
  const [countiesWithCities, setCountiesWithCities] = useState<County[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [butchersResponse, countResponse, countiesResponse, countiesWithCitiesResponse] = await Promise.all([
          fetch('/api/butchers?limit=12&featured=true'),
          fetch('/api/butchers/count'),
          fetch('/api/counties'),
          fetch('/api/counties/with-cities')
        ])

        const butchersData = await butchersResponse.json()
        const countData = await countResponse.json()
        const countiesData = await countiesResponse.json()
        const countiesWithCitiesData = await countiesWithCitiesResponse.json()

        if (butchersData.butchers) {
          // Filter butchers to only include those with complete info including images
          const completeButchers = butchersData.butchers.filter((butcher: Butcher) =>
            butcher.name &&
            butcher.city &&
            butcher.county &&
            butcher.address &&
            butcher.images &&
            butcher.images.length > 0 &&
            butcher.rating &&
            butcher.phone
          ).slice(0, 12) // Ensure we show exactly 12 butchers

          setButchers(completeButchers)
        }

        if (countData.count) {
          setTotalButchers(countData.count)
        }

        if (countiesData.counties) {
          setCounties(countiesData.counties)
        }

        if (countiesWithCitiesData.counties) {
          setCountiesWithCities(countiesWithCitiesData.counties)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-16">
          <div
            className="relative text-white rounded-3xl p-16 mb-12 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/Butchers Near Me Header.png')",
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-3xl"></div>
            <div className="relative z-10">
              <h1 className="text-7xl font-bold mb-6">
                Find The Best Butchers Near You
              </h1>
              <p className="text-2xl mb-10 max-w-4xl mx-auto opacity-90">
                Discover the finest local butchers across the UK. Find quality meat, traditional craftsmanship, and expert service in your area.
              </p>
            </div>
          </div>
        </header>

        {/* Key Features Section */}
        <section className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-gray-700 mb-6 leading-relaxed">
              We focus on independent, high-quality butcher shops, helping you find better meat and support local businesses. 1,200+ UK butchers listed
            </p>
            <p className="text-lg text-gray-600 font-medium">
              Covering England, Scotland, Wales & Northern Ireland
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Featured Butchers
          </h2>

          {butchers && butchers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {butchers.map((butcher) => (
                <article key={butcher.id} className="card hover-lift overflow-hidden">
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
                          {butcher.city}, {butcher.county}
                        </p>
                        <p className="text-xs text-slate-500 ml-6">
                          {butcher.address}
                        </p>
                      </div>
                    </header>

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
              <p className="text-lg">No butchers found. Please check back later.</p>
            </div>
          )}
        </section>

        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Find Butchers by Location
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Browse by county and city to find the perfect local butcher near you
            </p>
          </div>

          {countiesWithCities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {countiesWithCities.map((county) => (
                <div key={county.slug} className="card p-6">
                  <Link
                    href={`/${county.slug}`}
                    className="block mb-4 hover:text-red-600 transition-colors"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {county.county}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {county.count} butcher{county.count !== 1 ? 's' : ''}
                    </p>
                  </Link>

                  {county.cities && county.cities.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Cities & Towns:</h4>
                      <div className="flex flex-wrap gap-2">
                        {county.cities.slice(0, 8).map((city) => (
                          <Link
                            key={city.slug}
                            href={`/${county.slug}/${city.slug}`}
                            className="text-xs bg-gray-100 hover:bg-red-100 hover:text-red-700 text-gray-700 px-2 py-1 rounded transition-colors"
                          >
                            {city.city} ({city.count})
                          </Link>
                        ))}
                        {county.cities.length > 8 && (
                          <Link
                            href={`/${county.slug}`}
                            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                          >
                            +{county.cities.length - 8} more
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}