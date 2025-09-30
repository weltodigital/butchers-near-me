'use client'

import { useState, useEffect } from 'react'
import ButcherCard from './ButcherCard'
import { Button } from '@/components/ui/button'
import { Loader2, MapPin, List, Grid3X3 } from 'lucide-react'

interface Butcher {
  id: string
  name: string
  description: string
  address: string
  postcode: string
  city: string
  county?: string
  phone?: string
  email?: string
  website?: string
  latitude?: number
  longitude?: number
  rating: number
  review_count: number
  specialties: string[]
  opening_hours: Record<string, string>
  images: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  full_url_path?: string
}

interface SearchFilters {
  city?: string
  specialty?: string
  rating?: number
}

interface ButcherListProps {
  searchQuery?: string
  filters?: SearchFilters
  initialButchers?: Butcher[]
}

export default function ButcherList({ 
  searchQuery = '', 
  filters = {}, 
  initialButchers = [] 
}: ButcherListProps) {
  const [butchers, setButchers] = useState<Butcher[]>(initialButchers)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Fetch butchers from API
  const fetchButchers = async (query: string = '', searchFilters: SearchFilters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (query) params.append('search', query)
      if (searchFilters.city) params.append('city', searchFilters.city)
      if (searchFilters.specialty) params.append('specialty', searchFilters.specialty)
      if (searchFilters.rating) params.append('rating', searchFilters.rating.toString())

      const response = await fetch(`/api/butchers?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch butchers')
      }

      const data = await response.json()
      setButchers(data.butchers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching butchers:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load butchers on mount and when search/filters change
  useEffect(() => {
    fetchButchers(searchQuery, filters)
  }, [searchQuery, filters])

  // Load initial data on mount if no search query
  useEffect(() => {
    if (!searchQuery && Object.keys(filters).length === 0) {
      fetchButchers()
    }
  }, [])



  const sortedButchers = [...butchers].sort((a, b) => {
    // Sort by rating (highest first), then by review count
    if (b.rating !== a.rating) {
      return b.rating - a.rating
    }
    return b.review_count - a.review_count
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading butchers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error loading butchers: {error}</p>
        <Button onClick={() => fetchButchers(searchQuery, filters)}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with results count and view controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Butchers'}
          </h2>
          <p className="text-gray-600">
            {butchers.length} butcher{butchers.length !== 1 ? 's' : ''} found
            {filters.city && ` in ${filters.city}`}
            {filters.specialty && ` specializing in ${filters.specialty}`}
            {filters.rating && ` with ${filters.rating}+ star rating`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Butchers Grid/List */}
      {butchers.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No butchers found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || Object.keys(filters).length > 0
              ? 'Try adjusting your search or filters'
              : 'No butchers are currently available'
            }
          </p>
          {(searchQuery || Object.keys(filters).length > 0) && (
            <Button onClick={() => fetchButchers()}>
              Clear Search & Filters
            </Button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {sortedButchers.map((butcher) => (
            <ButcherCard
              key={butcher.id}
              butcher={butcher}
            />
          ))}
        </div>
      )}

      {/* Load More Button (if needed) */}
      {butchers.length > 0 && (
        <div className="text-center pt-6">
          <Button variant="outline" size="lg">
            Load More Butchers
          </Button>
        </div>
      )}
    </div>
  )
}
