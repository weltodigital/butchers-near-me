import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import ButcherCard from '@/components/ButcherCard';
import EnhancedContent from '@/components/EnhancedContent';
import AreaMap from '@/components/AreaMap';
import Link from 'next/link';

interface CityPageProps {
  params: Promise<{
    county: string;
    city: string;
  }>;
}

interface Location {
  id: string;
  name: string;
  slug: string;
  type: string;
  county_slug: string;
  full_path: string;
  seo_title: string;
  seo_description: string;
  meta_description: string;
  h1_title: string;
  intro_text: string;
  main_content: string;
  faq_content: {
    questions: Array<{
      question: string;
      answer: string;
    }>;
  };
  butcher_count: number;
  seo_keywords: string[];
}

interface County {
  id: string;
  name: string;
  slug: string;
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
  full_url_path: string;
}

async function getCityData(countySlug: string, citySlug: string): Promise<{ location: Location | null; county: County | null }> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get the county first
  const { data: countyData } = await supabase
    .from('public_locations')
    .select('id, name, slug')
    .eq('slug', countySlug)
    .eq('type', 'county')
    .single();

  if (!countyData) {
    return { location: null, county: null };
  }

  // Get the city/town
  const { data: locationData, error } = await supabase
    .from('public_locations')
    .select('*')
    .eq('slug', citySlug)
    .eq('county_slug', countySlug)
    .in('type', ['city', 'town'])
    .single();

  if (error || !locationData) {
    return { location: null, county: countyData as County };
  }

  return {
    location: locationData as Location,
    county: countyData as County
  };
}

async function getCityButchers(countySlug: string, citySlug: string): Promise<Butcher[]> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('public_butchers')
    .select('*')
    .eq('county_slug', countySlug)
    .eq('city_slug', citySlug)
    .order('rating', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching city butchers:', error);
    return [];
  }

  return data as Butcher[];
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { county, city } = await params;
  const { location } = await getCityData(county, city);

  if (!location) {
    return {
      title: 'Location Not Found | Butchers Near Me',
      description: 'The requested location could not be found.',
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

function StructuredData({ location, county, butchers }: { location: Location; county: County; butchers: Butcher[] }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: location.seo_title,
    description: location.meta_description,
    url: `https://findabutchers.co.uk/${location.full_path}`,
    mainEntity: {
      '@type': 'ItemList',
      name: `Butchers in ${location.name}`,
      description: `Directory of quality butchers in ${location.name}, ${county.name}`,
      numberOfItems: butchers.length,
      itemListElement: butchers.map((butcher, index) => ({
        '@type': 'LocalBusiness',
        '@id': `https://findabutchers.co.uk/${butcher.full_url_path}`,
        position: index + 1,
        name: butcher.name,
        description: butcher.description,
        address: {
          '@type': 'PostalAddress',
          streetAddress: butcher.address,
          addressLocality: butcher.city,
          addressRegion: butcher.county,
          postalCode: butcher.postcode,
          addressCountry: 'GB'
        },
        telephone: butcher.phone,
        url: butcher.website,
        aggregateRating: butcher.rating > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: butcher.rating,
          reviewCount: butcher.review_count,
          bestRating: 5,
          worstRating: 1
        } : undefined
      }))
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://findabutchers.co.uk'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: county.name,
          item: `https://findabutchers.co.uk/${county.slug}`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: location.name,
          item: `https://findabutchers.co.uk/${location.full_path}`
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

function FAQSection({ faqContent }: { faqContent: Location['faq_content'] }) {
  if (!faqContent?.questions?.length) return null;

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqContent.questions.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <section className="bg-gray-50 p-8 rounded-lg mb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
      <div className="space-y-6">
        {faqContent.questions.map((faq, index) => (
          <div key={index} className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function CityPage({ params }: CityPageProps) {
  const { county, city } = await params;
  const { location, county: countyData } = await getCityData(county, city);

  if (!location || !countyData) {
    notFound();
  }

  const butchers = await getCityButchers(county, city);

  return (
    <>
      <StructuredData location={location} county={countyData} butchers={butchers} />

      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumbs */}
              <nav className="text-sm text-gray-600 mb-4">
                <ol className="flex space-x-2">
                  <li><Link href="/" className="hover:text-red-600">Home</Link></li>
                  <li className="before:content-['/'] before:mx-2">
                    <Link href={`/${countyData.slug}`} className="hover:text-red-600">{countyData.name}</Link>
                  </li>
                  <li className="before:content-['/'] before:mx-2 text-gray-900">{location.name}</li>
                </ol>
              </nav>

              {/* Page Header */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{location.h1_title}</h1>

              {/* Location Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full capitalize">
                  {location.type}
                </span>
                <span>{countyData.name}</span>
                <span>Butchers: {butchers.length}</span>
              </div>

              {/* Intro Text */}
              <p className="text-lg text-gray-700 leading-relaxed">{location.intro_text}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">

            {/* Results Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Butchers in {location.name} ({butchers.length})
              </h2>

              {butchers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {butchers.map((butcher) => (
                    <ButcherCard key={butcher.id} butcher={butcher} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">
                    No butchers found in {location.name} yet.
                  </p>
                </div>
              )}
            </div>

            {/* Map Section */}
            {butchers.length > 0 && (
              <div className="mb-8">
                <AreaMap butchers={butchers} locationName={location.name} />
              </div>
            )}

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <EnhancedContent content={location.main_content} locationName={location.name} />
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">

                {/* Top Butchers */}
                {butchers.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                    <h3 className="text-lg font-semibold mb-4">Top Rated Butchers</h3>
                    <ul className="space-y-3">
                      {butchers
                        .sort((a, b) => b.rating - a.rating)
                        .slice(0, 5)
                        .map((butcher) => (
                          <li key={butcher.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                            <Link
                              href={`/${butcher.full_url_path}`}
                              className="block hover:bg-gray-50 p-2 rounded -m-2"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0 pr-3">
                                  <h4 className="font-medium text-red-600 truncate">{butcher.name}</h4>
                                  <p className="text-sm text-gray-500 truncate">{butcher.address}</p>
                                </div>
                                <div className="flex items-center flex-shrink-0">
                                  <span className="text-yellow-400">★</span>
                                  <span className="text-sm font-medium ml-1">{butcher.rating.toFixed(1)}</span>
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Back to County */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Explore {countyData.name}</h3>
                  <Link
                    href={`/${countyData.slug}`}
                    className="text-red-600 hover:underline block"
                  >
                    ← Back to {countyData.name} overview
                  </Link>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <FAQSection faqContent={location.faq_content} />
          </div>
        </div>
      </div>
    </>
  );
}

export async function generateStaticParams() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: citiesAndTowns } = await supabase
      .from('public_locations')
      .select('slug, county_slug')
      .in('type', ['city', 'town']);

    return citiesAndTowns?.map((location) => ({
      county: location.county_slug,
      city: location.slug,
    })) || [];
  } catch (error) {
    console.error('Error generating city static params:', error);
    return [];
  }
}