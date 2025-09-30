import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <nav className="bg-white dark:bg-slate-800 border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Butchers Near Me"
                width={180}
                height={50}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* City Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/greater-london"
              className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
            >
              London Butchers
            </Link>
            <Link
              href="/greater-manchester/manchester"
              className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
            >
              Manchester Butchers
            </Link>
            <Link
              href="/merseyside/liverpool"
              className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
            >
              Liverpool Butchers
            </Link>
            <Link
              href="/bristol/bristol"
              className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
            >
              Bristol Butchers
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button size="sm" asChild>
              <Link href="/#browse-all-butchers">Browse Butchers</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}