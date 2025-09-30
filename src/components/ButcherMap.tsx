'use client'

import GoogleMap from './GoogleMap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Butcher {
  id: string
  name: string
  address: string
  city: string
  postcode: string
  latitude?: number
  longitude?: number
  rating: number
  phone?: string
  website?: string
  full_url_path?: string
}

interface ButcherMapProps {
  butcher: Butcher
  className?: string
}

export default function ButcherMap({ butcher, className = '' }: ButcherMapProps) {
  if (!butcher.latitude || !butcher.longitude || isNaN(butcher.latitude) || isNaN(butcher.longitude)) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" style={{color: '#bf2d11'}} />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 h-64 rounded-lg flex items-center justify-center mb-4">
            <p className="text-gray-600">Location data not available</p>
          </div>
          <p className="text-sm text-gray-600">
            {butcher.address}, {butcher.city}, {butcher.postcode}
          </p>
        </CardContent>
      </Card>
    )
  }

  const openInGoogleMaps = () => {
    const encodedAddress = encodeURIComponent(`${butcher.address}, ${butcher.city}, ${butcher.postcode}`)
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
    window.open(url, '_blank')
  }

  const getDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${butcher.latitude},${butcher.longitude}`
    window.open(url, '_blank')
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" style={{color: '#bf2d11'}} />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <GoogleMap
          butchers={[butcher]}
          height="300px"
          className="w-full mb-4"
          showSingleMarker={true}
        />

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            {butcher.address}, {butcher.city}, {butcher.postcode}
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={getDirections}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Get Directions
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={openInGoogleMaps}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              View on Google Maps
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}