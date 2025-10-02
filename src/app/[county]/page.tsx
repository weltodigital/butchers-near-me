import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import EnhancedContent from '@/components/EnhancedContent';
import Link from 'next/link';

interface CountyPageProps {
  params: Promise<{
    county: string;
  }>;
}

interface Location {
  id: string;
  name: string;
  slug: string;
  type: string;
  full_path: string;
  seo_title: string;
  seo_description: string;
  meta_description: string;
  h1_title: string;
  intro_text: string;
  main_content: string;
  butcher_count: number;
  seo_keywords: string[];
}

async function getCountyData(countySlug: string): Promise<Location | null> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('public_locations')
    .select('*')
    .eq('slug', countySlug)
    .eq('type', 'county')
    .single();

  if (error || !data) {
    return null;
  }

  return data as Location;
}

async function getCountyCitiesAndTowns(countySlug: string): Promise<Location[]> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('public_locations')
    .select('*')
    .eq('county_slug', countySlug)
    .in('type', ['city', 'town'])
    .order('name');

  if (error) {
    console.error('Error fetching cities and towns:', error);
    return [];
  }

  return data as Location[];
}

export async function generateMetadata({ params }: CountyPageProps): Promise<Metadata> {
  const { county } = await params;
  const location = await getCountyData(county);

  if (!location) {
    return {
      title: 'County Not Found | Butchers Near Me',
      description: 'The requested county could not be found.',
    };
  }

  return {
    title: location.seo_title,
    description: location.meta_description,
    keywords: location.seo_keywords?.join(', '),
    openGraph: {
      title: location.seo_title,
      description: location.meta_description,
      type: 'website',
      locale: 'en_GB',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function StructuredData({ county, citiesAndTowns }: { county: Location; citiesAndTowns: Location[] }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: county.seo_title,
    description: county.meta_description,
    url: `https://butchersnearme.co.uk/${county.slug}`,
    mainEntity: {
      '@type': 'AdministrativeArea',
      name: county.name,
      containsPlace: citiesAndTowns.map(place => ({
        '@type': place.type === 'city' ? 'City' : 'Place',
        name: place.name,
        url: `https://butchersnearme.co.uk/${place.full_path}`
      }))
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://butchersnearme.co.uk'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: county.name,
          item: `https://butchersnearme.co.uk/${county.slug}`
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function CountyPage({ params }: CountyPageProps) {
  const { county } = await params;
  const location = await getCountyData(county);

  if (!location) {
    notFound();
  }

  const citiesAndTowns = await getCountyCitiesAndTowns(county);

  return (
    <>
      <StructuredData county={location} citiesAndTowns={citiesAndTowns} />

      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumbs */}
              <nav className="text-sm text-gray-600 mb-4">
                <ol className="flex space-x-2">
                  <li><Link href="/" className="hover:text-red-600">Home</Link></li>
                  <li className="before:content-['/'] before:mx-2 text-gray-900">{location.name}</li>
                </ol>
              </nav>

              {/* Page Header */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{location.h1_title}</h1>

              {/* County Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  County
                </span>
                <span>Cities & Towns: {citiesAndTowns.length}</span>
                <span>Butchers: {location.butcher_count}</span>
              </div>


              {/* Intro Text */}
              <p className="text-lg text-gray-700 leading-relaxed">{location.intro_text}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Cities and Towns Grid */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Cities & Towns in {location.name}
              </h2>

              {citiesAndTowns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {citiesAndTowns.map((place) => (
                    <Link
                      key={place.id}
                      href={`/${place.full_path}`}
                      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{place.name}</h3>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm capitalize">
                          {place.type}
                        </span>
                      </div>


                      <p className="text-sm text-gray-600 mb-3">
                        Butchers: {place.butcher_count}
                      </p>

                      <div className="text-red-600 font-medium text-sm">
                        View Butchers →
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">
                    No cities or towns found in {location.name}.
                  </p>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <EnhancedContent content={location.main_content} locationName={location.name} />
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">

                {/* Popular Cities */}
                {citiesAndTowns.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Popular Locations</h3>
                    <ul className="space-y-2">
                      {citiesAndTowns
                        .sort((a, b) => (b.butcher_count || 0) - (a.butcher_count || 0))
                        .slice(0, 6)
                        .map((place) => (
                          <li key={place.id}>
                            <Link
                              href={`/${place.full_path}`}
                              className="text-red-600 hover:underline flex justify-between"
                            >
                              <span>{place.name}</span>
                              <span className="text-gray-500 text-sm">
                                {place.butcher_count} butchers
                              </span>
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function generateStaticParams() {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Missing Supabase environment variables for county generateStaticParams');
      return [];
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (!supabase) {
      console.warn('Failed to create Supabase client for county generateStaticParams');
      return [];
    }

    const { data: counties } = await supabase
      .from('public_locations')
      .select('slug')
      .eq('type', 'county');

    return counties?.map((county) => ({
      county: county.slug,
    })) || [];
  } catch (error) {
    console.error('Error generating county static params:', error);
    return [];
  }
}