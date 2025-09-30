import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase';

interface County {
  slug: string;
  created_at: string;
}

interface CityTown {
  full_path: string;
  created_at: string;
}

interface Butcher {
  full_url_path: string;
  created_at: string;
}

async function getCounties(): Promise<County[]> {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('public_locations')
      .select('slug, created_at')
      .eq('type', 'county');

    if (error) {
      console.error('Error fetching counties for sitemap:', error);
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

async function getCitiesAndTowns(): Promise<CityTown[]> {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('public_locations')
      .select('full_path, created_at')
      .in('type', ['city', 'town']);

    if (error) {
      console.error('Error fetching cities and towns for sitemap:', error);
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

async function getButchers(): Promise<Butcher[]> {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('public_butchers')
      .select('full_url_path, created_at')
      .not('full_url_path', 'is', null);

    if (error) {
      console.error('Error fetching butchers for sitemap:', error);
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://meatmap.co.uk';

  const counties = await getCounties();
  const citiesAndTowns = await getCitiesAndTowns();
  const butchers = await getButchers();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // County pages
  const countyPages: MetadataRoute.Sitemap = counties.map((county) => ({
    url: `${baseUrl}/${county.slug}`,
    lastModified: new Date(county.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // City and town pages
  const cityTownPages: MetadataRoute.Sitemap = citiesAndTowns
    .filter(location => location.full_path)
    .map((location) => ({
      url: `${baseUrl}/${location.full_path}`,
      lastModified: new Date(location.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  // Butcher pages
  const butcherPages: MetadataRoute.Sitemap = butchers
    .filter(butcher => butcher.full_url_path)
    .map((butcher) => ({
      url: `${baseUrl}/${butcher.full_url_path}`,
      lastModified: new Date(butcher.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [...staticPages, ...countyPages, ...cityTownPages, ...butcherPages];
}

export const revalidate = 86400; // Revalidate sitemap every 24 hours