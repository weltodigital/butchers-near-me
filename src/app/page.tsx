import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function Home() {
  const { data: butchers, error } = await supabase
    .from('butchers')
    .select('id, name, city, address, phone, website, rating, review_count')
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(12)

  if (error) {
    console.error('Error fetching butchers:', error)
  }

  const { count: totalButchers } = await supabase
    .from('butchers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Butchers Near Me
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover the finest local butchers across the UK. Find quality meat, traditional craftsmanship, and expert service in your area.
          </p>
          <div className="bg-white rounded-lg shadow-lg p-6 inline-block">
            <p className="text-3xl font-bold text-red-600">{totalButchers || 0}</p>
            <p className="text-gray-600">Quality Butchers Listed</p>
          </div>
        </header>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Featured Butchers
          </h2>

          {butchers && butchers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {butchers.map((butcher) => (
                <div key={butcher.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {butcher.name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    📍 {butcher.city}
                  </p>
                  <p className="text-gray-600 mb-3 text-sm">
                    {butcher.address}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    {butcher.rating && (
                      <div className="flex items-center">
                        <span className="text-yellow-500">⭐</span>
                        <span className="ml-1 text-gray-700">
                          {butcher.rating} ({butcher.review_count || 0})
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 text-sm">
                    {butcher.phone && (
                      <a
                        href={`tel:${butcher.phone}`}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        📞 Call
                      </a>
                    )}
                    {butcher.website && (
                      <a
                        href={butcher.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        🌐 Visit
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              <p>No butchers found. Please check back later.</p>
            </div>
          )}
        </section>

        <section className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Find Butchers by Location
            </h2>
            <p className="text-gray-600 mb-6">
              Browse by city to find the perfect local butcher near you
            </p>
            <Link
              href="/locations"
              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Browse All Locations
            </Link>
          </div>
        </section>
      </div>

      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-4">Butchers Near Me</h3>
          <p className="text-gray-400 mb-4">
            Connecting you with quality local butchers across the UK
          </p>
          <div className="flex justify-center gap-6">
            <Link href="/privacy" className="text-gray-400 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-white">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}