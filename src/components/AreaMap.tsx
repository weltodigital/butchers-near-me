'use client'

import GoogleMap from './GoogleMap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

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

interface AreaMapProps {
  butchers: Butcher[]
  locationName: string
  className?: string
}

export default function AreaMap({ butchers, locationName, className = '' }: AreaMapProps) {
  const validButchers = butchers.filter(butcher =>
    butcher.latitude &&
    butcher.longitude &&
    !isNaN(butcher.latitude) &&
    !isNaN(butcher.longitude)
  )

  if (validButchers.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-600" />
            Butchers in {locationName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 h-64 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">No location data available for butchers in this area</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-red-600" />
          Butchers in {locationName} ({validButchers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <GoogleMap
          butchers={validButchers}
          height="400px"
          className="w-full"
        />
        {validButchers.length < butchers.length && (
          <p className="text-sm text-gray-500 mt-2">
            Showing {validButchers.length} of {butchers.length} butchers with location data
          </p>
        )}
      </CardContent>
    </Card>
  )
}