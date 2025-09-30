import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, Star, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import ButcherCard from '@/components/ButcherCard'

interface County {
  id: string;
  name: string;
  slug: string;
  butcher_count: number;
}

interface CityTown {
  id: string;
  name: string;
  slug: string;
  full_path: string;
  county_slug: string;
  butcher_count: number;
  type: 'city' | 'town';
}

interface CountyWithLocations {
  county: County;
  locations: CityTown[];
}

interface Butcher {
  id: string;
  name: string;
  description: string;
  address: string;
  postcode: string;
  city: string;
  county: string;
  phone: string;
  website: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  review_count: number;
  specialties: string[];
  opening_hours: Record<string, string>;
  images: string[];
  created_at: string;
  updated_at: string;
  full_url_path: string;
}

async function getCountiesWithLocations(): Promise<CountyWithLocations[]> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all counties
  const { data: counties, error: countiesError } = await supabase
    .from('public_locations')
    .select('id, name, slug, butcher_count')
    .eq('type', 'county')
    .order('name');

  if (countiesError) {
    console.error('Error fetching counties:', countiesError);
    return [];
  }

  // Get all cities and towns
  const { data: citiesAndTowns, error: locationsError } = await supabase
    .from('public_locations')
    .select('id, name, slug, full_path, county_slug, butcher_count, type')
    .in('type', ['city', 'town'])
    .order('name');

  if (locationsError) {
    console.error('Error fetching cities and towns:', locationsError);
    return [];
  }

  // Group locations by county
  return counties.map(county => ({
    county,
    locations: citiesAndTowns.filter(location => location.county_slug === county.slug)
  }));
}

async function getFeaturedButchers(): Promise<Butcher[]> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('public_butchers')
    .select('*')
    .order('rating', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching featured butchers:', error);
    return [];
  }

  return data as Butcher[];
}

export default async function Home() {
  const countiesWithLocations = await getCountiesWithLocations();
  const featuredButchers = await getFeaturedButchers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">

      {/* Hero Section with Background Image */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/find-a-butchers.png)',
          }}
        />

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-6 font-cooper drop-shadow-lg">
              Find Quality Butchers Near You
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-md">
              Discover the best butcher shops across the UK with detailed information, photos, and location data
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-3 bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg" asChild>
                <Link href="#browse-all-butchers">Browse Butchers</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">

        {/* Featured Butchers */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center font-cooper">
            Featured Butchers
          </h2>
          {featuredButchers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredButchers.map((butcher) => (
                <ButcherCard key={butcher.id} butcher={butcher} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                No featured butchers available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* All Locations by County Section */}
        <div id="browse-all-butchers" className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center font-cooper">
            Browse All Butchers
          </h2>
          {countiesWithLocations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {countiesWithLocations.map(({ county, locations }) => (
                <div key={county.id} className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <Link
                      href={`/${county.slug}`}
                      className="hover:text-red-600 transition-colors"
                    >
                      {county.name}
                    </Link>
                  </h3>

                  {locations.length > 0 ? (
                    <div className="space-y-2">
                      {locations.map((location) => (
                        <div key={location.id}>
                          <Link
                            href={`/${location.full_path}`}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm transition-colors inline-block"
                          >
                            {location.name}
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                      No cities or towns listed yet
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                No locations available at the moment.
              </p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div id="features" className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center font-cooper">
            Why Choose Butchers Near Me?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Local Discovery</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Find butchers in your area with detailed location information and directions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Quality Information</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                View authentic information about butcher shops and their products to make informed decisions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Smart Search</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Filter by specialty, location, price range, and more to find your perfect butcher
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-12 text-white">
          <h2 className="text-3xl font-bold mb-4 font-cooper">Ready to Find Your Perfect Butcher?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of customers who trust Butchers Near Me for quality butcher recommendations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3" asChild>
              <Link href="#browse-all-butchers">Browse Butchers</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}