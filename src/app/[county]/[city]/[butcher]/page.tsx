import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { MapPin, Star, Phone, Clock, Mail, Globe, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface ButcherPageProps {
  params: Promise<{
    county: string;
    city: string;
    butcher: string;
  }>;
}

interface Butcher {
  id: string;
  name: string;
  description: string;
  address: string;
  postcode: string;
  city: string;
  county: string;
  phone?: string;
  email?: string;
  website?: string;
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
  county_slug: string;
  city_slug: string;
  full_url_path: string;
}


interface Location {
  name: string;
  slug: string;
}

async function getButcher(countySlug: string, citySlug: string, butcherSlug: string): Promise<Butcher | null> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // We need to find the butcher by matching the URL path structure
  const urlPath = `${countySlug}/${citySlug}/${butcherSlug}`;

  // First try to match by exact full URL path
  const { data, error } = await supabase
    .from('public_butchers')
    .select('*')
    .eq('full_url_path', urlPath)
    .single();

  if (data) {
    return data as Butcher;
  }

  // Fallback: try to find by approximate name match
  const butcherNamePattern = butcherSlug.replace(/-/g, ' ');

  const { data: fallbackData } = await supabase
    .from('public_butchers')
    .select('*')
    .eq('county_slug', countySlug)
    .eq('city_slug', citySlug)
    .ilike('name', `%${butcherNamePattern}%`)
    .single();

  return fallbackData as Butcher | null;
}


async function getLocationInfo(countySlug: string, citySlug: string): Promise<{ county: Location | null; city: Location | null }> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [countyResult, cityResult] = await Promise.all([
    supabase
      .from('public_locations')
      .select('name, slug')
      .eq('slug', countySlug)
      .eq('type', 'county')
      .single(),
    supabase
      .from('public_locations')
      .select('name, slug')
      .eq('slug', citySlug)
      .eq('county_slug', countySlug)
      .single()
  ]);

  return {
    county: countyResult.data as Location | null,
    city: cityResult.data as Location | null
  };
}

export async function generateMetadata({ params }: ButcherPageProps): Promise<Metadata> {
  const { county, city, butcher } = await params;
  const butcherData = await getButcher(county, city, butcher);
  const { county: countyData, city: cityData } = await getLocationInfo(county, city);

  if (!butcherData) {
    return {
      title: 'Butcher Not Found | MeatMap UK',
      description: 'The requested butcher could not be found.',
    };
  }

  const title = `${butcherData.name} - Premium Butcher in ${cityData?.name || city}, ${countyData?.name || county}`;
  const description = `${butcherData.description || `Premium quality meat from ${butcherData.name}`} Located in ${cityData?.name || city}, ${countyData?.name || county}. ${butcherData.rating > 0 ? `Rated ${butcherData.rating.toFixed(1)}/5 with ${butcherData.review_count} reviews.` : ''}`;

  return {
    title,
    description,
    keywords: [
      butcherData.name,
      `${cityData?.name || city} butchers`,
      `${countyData?.name || county} butchers`,
      ...butcherData.specialties,
      'quality meat',
      'fresh meat',
      'local butcher'
    ].join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_GB',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function StructuredData({ butcher, county, city }: {
  butcher: Butcher;
  county: Location | null;
  city: Location | null;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://meatmap.co.uk/${butcher.full_url_path}`,
    name: butcher.name,
    description: butcher.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: butcher.address,
      addressLocality: city?.name || butcher.city,
      addressRegion: county?.name || butcher.county,
      postalCode: butcher.postcode,
      addressCountry: 'GB'
    },
    telephone: butcher.phone,
    email: butcher.email,
    url: butcher.website,
    priceRange: '££',
    category: 'Butcher',
    aggregateRating: butcher.rating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: butcher.rating,
      reviewCount: butcher.review_count,
      bestRating: 5,
      worstRating: 1
    } : undefined,
    openingHours: Object.entries(butcher.opening_hours || {})
      .filter(([, hours]) => hours && hours.toLowerCase() !== 'closed')
      .map(([day, hours]) => `${day.substring(0, 2).toUpperCase()} ${hours}`),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Meat Products',
      itemListElement: butcher.specialties.map(specialty => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: specialty,
          category: 'Food'
        }
      }))
    },
    geo: butcher.latitude && butcher.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: butcher.latitude,
      longitude: butcher.longitude
    } : undefined
  };

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://meatmap.co.uk'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: county?.name || butcher.county,
        item: `https://meatmap.co.uk/${butcher.county_slug}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: city?.name || butcher.city,
        item: `https://meatmap.co.uk/${butcher.county_slug}/${butcher.city_slug}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: butcher.name,
        item: `https://meatmap.co.uk/${butcher.full_url_path}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
    </>
  );
}

export default async function ButcherPage({ params }: ButcherPageProps) {
  const { county, city, butcher } = await params;
  const butcherData = await getButcher(county, city, butcher);
  const { county: countyData, city: cityData } = await getLocationInfo(county, city);

  if (!butcherData) {
    notFound();
  }


  const formatOpeningHours = (hours: Record<string, string>) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return hours[today] || 'Hours not available';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4) return 'text-yellow-600';
    if (rating >= 3) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <>
      <StructuredData butcher={butcherData} county={countyData} city={cityData} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumbs */}
              <nav className="text-sm text-gray-600 mb-4">
                <ol className="flex space-x-2">
                  <li><Link href="/" className="hover:text-red-600">Home</Link></li>
                  <li className="before:content-['/'] before:mx-2">
                    <Link href={`/${butcherData.county_slug}`} className="hover:text-red-600">
                      {countyData?.name || butcherData.county}
                    </Link>
                  </li>
                  <li className="before:content-['/'] before:mx-2">
                    <Link href={`/${butcherData.county_slug}/${butcherData.city_slug}`} className="hover:text-red-600">
                      {cityData?.name || butcherData.city}
                    </Link>
                  </li>
                  <li className="before:content-['/'] before:mx-2 text-gray-900">{butcherData.name}</li>
                </ol>
              </nav>

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{butcherData.name}</h1>
                  </div>
                  <p className="text-gray-600 flex items-center gap-1 mb-2">
                    <MapPin className="h-4 w-4" />
                    {butcherData.address}, {butcherData.city}, {butcherData.postcode}
                  </p>
                  {butcherData.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className={`ml-1 font-medium ${getRatingColor(butcherData.rating)}`}>
                          {butcherData.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/${butcherData.county_slug}/${butcherData.city_slug}`}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to {cityData?.name || butcherData.city}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>About {butcherData.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {butcherData.description || `${butcherData.name} is a quality butcher located in ${butcherData.city}, ${butcherData.county}. We provide fresh, high-quality meat and exceptional customer service.`}
                    </p>
                  </CardContent>
                </Card>

                {/* Images Gallery */}
                {butcherData.images && butcherData.images.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Photos of {butcherData.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {butcherData.images.map((image, index) => (
                          <div key={index} className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={image}
                              alt={`${butcherData.name} - Photo ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {butcherData.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <a href={`tel:${butcherData.phone}`} className="text-red-600 hover:underline">
                          {butcherData.phone}
                        </a>
                      </div>
                    )}
                    {butcherData.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <a href={`mailto:${butcherData.email}`} className="text-red-600 hover:underline">
                          {butcherData.email}
                        </a>
                      </div>
                    )}
                    {butcherData.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <a href={butcherData.website} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm">
                        Today: {formatOpeningHours(butcherData.opening_hours)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Specialties */}
                {butcherData.specialties && butcherData.specialties.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Specialties</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {butcherData.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Opening Hours */}
                {butcherData.opening_hours && Object.keys(butcherData.opening_hours).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Opening Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(butcherData.opening_hours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize font-medium">{day}</span>
                            <span className="text-gray-600">{hours}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
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
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: butchers } = await supabase
      .from('public_butchers')
      .select('county_slug, city_slug, full_url_path')
      .not('county_slug', 'is', null)
      .not('city_slug', 'is', null)
      .not('full_url_path', 'is', null);

    return butchers?.map((butcher) => {
      // Extract butcher slug from full_url_path
      const pathParts = butcher.full_url_path.split('/');
      const butcherSlug = pathParts[2]; // county/city/butcher

      return {
        county: butcher.county_slug,
        city: butcher.city_slug,
        butcher: butcherSlug,
      };
    }) || [];
  } catch (error) {
    console.error('Error generating butcher static params:', error);
    return [];
  }
}