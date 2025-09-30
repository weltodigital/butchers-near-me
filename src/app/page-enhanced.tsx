'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, MapPin, Star, Phone, Clock, Filter, Heart, Share2 } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import ButcherList from '@/components/ButcherList'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilters, setSearchFilters] = useState({})
  const [showResults, setShowResults] = useState(false)

  const handleSearch = (query: string, filters: any) => {
    setSearchQuery(query)
    setSearchFilters(filters)
    setShowResults(true)
  }

  const handleBackToHome = () => {
    setShowResults(false)
    setSearchQuery('')
    setSearchFilters({})
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="text-2xl font-bold text-slate-900">
                  MeatMap UK
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={handleBackToHome}>
                  Back to Home
                </Button>
                <Button size="sm" asChild>
                  <Link href="/application">Browse All</Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <SearchBar onSearch={handleSearch} />
          <div className="mt-8">
            <ButcherList 
              searchQuery={searchQuery} 
              filters={searchFilters} 
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                MeatMap UK
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button size="sm" asChild>
                <Link href="/application">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Find Quality Butchers Near You
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Discover the best butcher shops across the UK with detailed information, reviews, and location data
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3" asChild>
              <Link href="/application">Browse All Butchers</Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3" asChild>
              <Link href="/application?view=map">View on Map</Link>
            </Button>
          </div>
        </div>

        {/* Featured Butchers */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Featured Butchers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample Butcher Card 1 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">Smith's Traditional Butchers</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      London, SW1A 1AA
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>Mon-Fri: 7AM-6PM</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4" />
                    <span>020 7123 4567</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Family-run butcher shop specializing in premium cuts and traditional methods. 
                    Known for their dry-aged beef and house-made sausages.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded-full">
                      Dry-aged Beef
                    </span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded-full">
                      House Sausages
                    </span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded-full">
                      Organic
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" className="flex-1" asChild>
                      <Link href="/application">View Details</Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sample Butcher Card 2 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">The Artisan Butcher</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      Manchester, M1 1AA
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>Tue-Sat: 8AM-7PM</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4" />
                    <span>0161 123 4567</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Modern butcher shop focusing on sustainable sourcing and innovative cuts. 
                    Features a deli counter and cooking classes.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded-full">
                      Sustainable
                    </span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded-full">
                      Deli Counter
                    </span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded-full">
                      Classes
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" className="flex-1" asChild>
                      <Link href="/application">View Details</Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sample Butcher Card 3 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">Heritage Meats</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      Edinburgh, EH1 1AA
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.7</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>Mon-Sat: 6AM-5PM</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4" />
                    <span>0131 123 4567</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Traditional Scottish butcher with over 50 years of experience. 
                    Specializes in haggis, black pudding, and local game.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded-full">
                      Haggis
                    </span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded-full">
                      Game
                    </span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded-full">
                      Traditional
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" className="flex-1" asChild>
                      <Link href="/application">View Details</Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Why Choose MeatMap UK?
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
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Verified Reviews</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Read genuine customer reviews and ratings to make informed decisions
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
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Butcher?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of customers who trust MeatMap UK for quality butcher recommendations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3" asChild>
              <Link href="/application">Start Searching Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-red-600" asChild>
              <Link href="/application">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MeatMap UK</h3>
              <p className="text-slate-400 text-sm">
                The UK's most trusted directory for finding quality butchers near you.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Popular Cities</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">London</a></li>
                <li><a href="#" className="hover:text-white">Manchester</a></li>
                <li><a href="#" className="hover:text-white">Birmingham</a></li>
                <li><a href="#" className="hover:text-white">Edinburgh</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Search Butchers</a></li>
                <li><a href="#" className="hover:text-white">Read Reviews</a></li>
                <li><a href="#" className="hover:text-white">Compare Prices</a></li>
                <li><a href="#" className="hover:text-white">Get Directions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2025 MeatMap UK. All rights reserved. Helping you find the best butchers across the UK.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
