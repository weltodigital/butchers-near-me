import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="container mx-auto max-w-lg">
        <Card className="text-center shadow-lg">
          <CardHeader className="pb-4">
            <div className="w-24 h-24 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
              Page Not Found
            </CardTitle>
            <CardDescription className="text-lg">
              Sorry, we couldn't find the butcher or page you're looking for.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="text-slate-600 dark:text-slate-400">
              The butcher you're looking for might have moved, or the URL might be incorrect.
              Don't worry - you can find all our quality butchers from the homepage.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="javascript:history.back()">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Link>
              </Button>
            </div>

            <div className="border-t pt-6 mt-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Quick links to help you find what you need:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link
                  href="/greater-london"
                  className="text-sm text-red-600 hover:text-red-800 hover:underline"
                >
                  London Butchers
                </Link>
                <span className="text-slate-300">•</span>
                <Link
                  href="/greater-manchester"
                  className="text-sm text-red-600 hover:text-red-800 hover:underline"
                >
                  Manchester Butchers
                </Link>
                <span className="text-slate-300">•</span>
                <Link
                  href="/scotland"
                  className="text-sm text-red-600 hover:text-red-800 hover:underline"
                >
                  Scotland Butchers
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Need help? Visit our{' '}
            <Link href="/" className="text-red-600 hover:underline">
              homepage
            </Link>{' '}
            to browse all butchers by location.
          </p>
        </div>
      </div>
    </div>
  )
}