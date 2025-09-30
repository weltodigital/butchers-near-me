import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface County {
  id: string;
  name: string;
  slug: string;
  butcher_count: number;
}

async function getCounties(): Promise<County[]> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('public_locations')
    .select('id, name, slug, butcher_count')
    .eq('type', 'county')
    .order('name');

  if (error) {
    console.error('Error fetching counties:', error);
    return [];
  }

  return data as County[];
}

export default async function Footer() {
  const counties = await getCounties();

  return (
    <footer className="bg-slate-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 font-cooper">Butchers Near Me</h3>
            <p className="text-slate-400 text-sm">
              The UK's most trusted directory for finding quality butchers near you.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 font-cooper">Popular Counties</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {counties.slice(0, 4).map((county) => (
                <li key={county.id}>
                  <Link href={`/${county.slug}`} className="hover:text-white">
                    {county.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 font-cooper">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2025 Butchers Near Me. All rights reserved. Helping you find the best butchers across the UK.</p>
        </div>
      </div>
    </footer>
  )
}