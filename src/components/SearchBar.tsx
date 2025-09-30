'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void
  loading?: boolean
}

interface SearchFilters {
  city?: string
  specialty?: string
  rating?: number
}

export default function SearchBar({ onSearch, loading = false }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    onSearch(query, filters)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const cities = ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Liverpool', 'Bristol', 'Leeds', 'Glasgow', 'Newcastle', 'Sheffield']
  const specialties = ['Dry-aged Beef', 'Organic', 'Traditional', 'Game', 'Sausages', 'Halal', 'Kosher', 'Sustainable', 'Local', 'Haggis']

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search for butchers, locations, or specialties..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full pl-12 pr-32 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          disabled={loading}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="mr-2"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                value={filters.city || ''}
                onChange={(e) => setFilters({ ...filters, city: e.target.value || undefined })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
              <select
                value={filters.specialty || ''}
                onChange={(e) => setFilters({ ...filters, specialty: e.target.value || undefined })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
              <select
                value={filters.rating || ''}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setFilters({})}
              className="mr-2"
            >
              Clear Filters
            </Button>
            <Button onClick={handleSearch}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Quick Search Suggestions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-600">Popular searches:</span>
        {['London butchers', 'Dry-aged beef', 'Organic meat', 'Traditional butchers'].map(suggestion => (
          <button
            key={suggestion}
            onClick={() => {
              setQuery(suggestion)
              handleSearch()
            }}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
