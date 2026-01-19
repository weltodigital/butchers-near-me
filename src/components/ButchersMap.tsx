'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

// Create custom butcher icon
const butcherIcon = L.divIcon({
  html: `<div style="background: #dc2626; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🥩</div>`,
  className: 'custom-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

interface Butcher {
  id: string
  name: string
  address: string
  phone: string
  website: string
  rating: number
  review_count: number
  latitude?: number | null
  longitude?: number | null
}

interface ButchersMapProps {
  butchers: Butcher[]
  city: string
  county: string
  center?: [number, number]
  zoom?: number
}

// Function to geocode addresses with multiple fallback strategies
const geocodeAddress = async (address: string, city: string): Promise<[number, number] | null> => {
  const queries = [
    `${address}, ${city}, UK`,
    `${address}, ${city}`,
    `${city}, UK`,
  ]

  for (const query of queries) {
    try {
      const encodedQuery = encodeURIComponent(query)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`)
      const data = await response.json()

      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
      }
    } catch (error) {
      console.error(`Geocoding error for "${query}":`, error)
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return null
}

// Dynamic geocoding for city center coordinates
const geocodeCityCenter = async (city: string): Promise<[number, number] | null> => {
  try {
    const query = encodeURIComponent(`${city}, UK`)
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`)
    const data = await response.json()

    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    }
  } catch (error) {
    console.error(`Failed to geocode city center for ${city}:`, error)
  }
  return null
}

// Default coordinates for UK cities and counties (fallback)
const getCityCoordinates = (city: string): [number, number] => {
  const coords: Record<string, [number, number]> = {
    // Major Cities
    london: [51.5074, -0.1278],
    manchester: [53.4808, -2.2426],
    birmingham: [52.4862, -1.8904],
    leeds: [53.8008, -1.5491],
    glasgow: [55.8642, -4.2518],
    liverpool: [53.4084, -2.9916],
    edinburgh: [55.9533, -3.1883],
    bristol: [51.4545, -2.5879],
    cardiff: [51.4816, -3.1791],
    bedford: [52.1360, -0.4667],
    cambridge: [52.2053, 0.1218],
    oxford: [51.7520, -1.2577],
    bath: [51.3758, -2.3599],
    york: [53.9600, -1.0873],
    newcastle: [54.9783, -1.617],
    southampton: [50.9097, -1.4044],
    portsmouth: [50.8198, -1.0880],
    brighton: [50.8225, -0.1372],
    exeter: [50.7236, -3.5269],
    winchester: [51.0632, -1.3080],
    fareham: [50.8507, -1.1822],
    andover: [51.2119, -1.4959],
    southsea: [50.7912, -1.0863],
    ringwood: [50.8486, -1.7854],
    fordingbridge: [50.9287, -1.7856],
    lymington: [50.7594, -1.5444],
    romsey: [50.9893, -1.4956],

    // Counties
    bedfordshire: [52.1360, -0.4667],
    berkshire: [51.4543, -1.0000],
    buckinghamshire: [51.8168, -0.8278],
    cambridgeshire: [52.2053, 0.1218],
    cheshire: [53.2000, -2.5000],
    cornwall: [50.4500, -4.5000],
    cumbria: [54.5000, -3.0000],
    derbyshire: [53.1000, -1.5000],
    devon: [50.7236, -3.5269],
    dorset: [50.7500, -2.3000],
    durham: [54.7753, -1.5849],
    essex: [51.7344, 0.4691],
    gloucestershire: [51.8642, -2.2382],
    hampshire: [51.0577, -1.3080],
    herefordshire: [52.0500, -2.7000],
    hertfordshire: [51.8000, -0.2000],
    kent: [51.2787, 0.5217],
    lancashire: [53.7632, -2.7031],
    leicestershire: [52.6342, -1.1309],
    lincolnshire: [53.2307, -0.5406],
    norfolk: [52.6309, 0.2973],
    northamptonshire: [52.2405, -0.9027],
    northumberland: [55.2083, -2.0784],
    nottinghamshire: [53.1000, -1.0000],
    oxfordshire: [51.7520, -1.2577],
    shropshire: [52.5679, -2.7808],
    somerset: [51.1040, -2.8382],
    staffordshire: [52.8382, -2.1309],
    suffolk: [52.1873, 0.9700],
    surrey: [51.2362, -0.5704],
    sussex: [50.9095, -0.1372],
    'west sussex': [50.9095, -0.1372],
    'east sussex': [50.9095, 0.2700],
    warwickshire: [52.2819, -1.5849],
    'west midlands': [52.4862, -1.8904],
    wiltshire: [51.3496, -1.9926],
    worcestershire: [52.1923, -2.2094],
    'greater london': [51.5074, -0.1278],
    'greater manchester': [53.4808, -2.2426],
    'south yorkshire': [53.3781, -1.4360],
    'west yorkshire': [53.8008, -1.5491],
    'north yorkshire': [54.2310, -1.7816],
    'tyne and wear': [54.9783, -1.617],
    merseyside: [53.4084, -2.9916],

    // Wales
    wales: [52.1307, -3.7837],
    gwynedd: [52.9048, -4.0875],
    powys: [52.3000, -3.3000],
    ceredigion: [52.2415, -4.0962],
    carmarthenshire: [51.8500, -4.1000],
    pembrokeshire: [51.7670, -4.9708],
    swansea: [51.6214, -3.9436],

    // Scotland
    scotland: [56.4907, -4.2026],
    'scottish highlands': [57.0000, -4.5000],
    aberdeenshire: [57.1526, -2.5210],
    'dumfries and galloway': [55.0000, -3.7500],
  }

  const normalizedCity = city.toLowerCase().replace(/[^a-z]/g, '')
  return coords[normalizedCity] || [52.3555, -1.1743] // Default to UK center
}

export default function ButchersMap({ butchers, city, county, center, zoom = 13 }: ButchersMapProps) {
  const mapRef = useRef<any>(null)
  const [geocodedCoords, setGeocodedCoords] = useState<Record<string, [number, number]>>({})
  const [mapCenter, setMapCenter] = useState<[number, number]>(center || getCityCoordinates(city))
  const [isGeocoding, setIsGeocoding] = useState(false)

  // Get default center coordinates
  const defaultCenter = mapCenter

  // Always try to geocode city center for accurate positioning
  useEffect(() => {
    const geocodeCityIfNeeded = async () => {
      const hardcodedCoords = getCityCoordinates(city)

      // Always try to geocode for better accuracy, but prioritize hardcoded if available
      const cityCenter = await geocodeCityCenter(city)
      if (cityCenter) {
        setMapCenter(cityCenter)
      } else if (hardcodedCoords[0] === 52.3555 && hardcodedCoords[1] === -1.1743) {
        // Only use UK center as absolute last resort
        console.warn(`Could not geocode ${city}, using UK center fallback`)
      }
    }

    geocodeCityIfNeeded()
  }, [city])

  // Geocode addresses for butchers without coordinates
  useEffect(() => {
    const geocodeButchers = async () => {
      const needGeocoding = butchers.filter(butcher =>
        !butcher.latitude && !butcher.longitude && !geocodedCoords[butcher.id]
      )

      if (needGeocoding.length === 0) return

      setIsGeocoding(true)
      const newCoords: Record<string, [number, number]> = {}
      const cityCenter = mapCenter

      for (const butcher of needGeocoding.slice(0, 15)) { // Increased to 15 for better coverage
        try {
          const coords = await geocodeAddress(butcher.address, city)
          if (coords) {
            newCoords[butcher.id] = coords
          } else {
            // Fallback: use city center with small random offset for each butcher
            const offset = 0.01 * Math.random() - 0.005 // ±0.005 degree offset
            newCoords[butcher.id] = [
              cityCenter[0] + offset,
              cityCenter[1] + offset
            ]
          }
          // Small delay to be respectful to the geocoding service
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (error) {
          console.error(`Failed to geocode ${butcher.name}:`, error)
          // Fallback: use city center with random offset
          const offset = 0.01 * Math.random() - 0.005
          newCoords[butcher.id] = [
            cityCenter[0] + offset,
            cityCenter[1] + offset
          ]
        }
      }

      setGeocodedCoords(prev => ({ ...prev, ...newCoords }))
      setIsGeocoding(false)
    }

    geocodeButchers()
  }, [butchers, city, geocodedCoords, mapCenter])

  // Get all mappable butchers (with coordinates or geocoded)
  const mappableButchers = butchers.filter(butcher => {
    return (butcher.latitude && butcher.longitude) || geocodedCoords[butcher.id]
  })

  if (typeof window === 'undefined') {
    return (
      <div className="w-full h-96 bg-slate-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
          <p className="text-slate-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg border border-slate-200 relative">
      {isGeocoding && (
        <div className="absolute top-2 right-2 z-1000 bg-white rounded-lg shadow px-3 py-2 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent mr-2"></div>
          <span className="text-sm text-gray-700">Loading locations...</span>
        </div>
      )}
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Actual butcher markers */}
        {mappableButchers.map((butcher) => {
          // Use stored coordinates or geocoded coordinates
          const coords = (butcher.latitude && butcher.longitude)
            ? [butcher.latitude, butcher.longitude] as [number, number]
            : geocodedCoords[butcher.id]

          if (!coords) return null

          return (
            <Marker
              key={butcher.id}
              position={coords}
              icon={butcherIcon}
            >
              <Popup>
                <div className="p-2 min-w-48">
                  <h3 className="font-bold text-gray-900 mb-1">{butcher.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{butcher.address}</p>
                  {butcher.rating && (
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 text-sm font-medium">{butcher.rating.toFixed(1)}</span>
                      {butcher.review_count && (
                        <span className="text-xs text-gray-500 ml-1">({butcher.review_count} reviews)</span>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    {butcher.phone && (
                      <a
                        href={`tel:${butcher.phone}`}
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Call
                      </a>
                    )}
                    {butcher.website && (
                      <a
                        href={butcher.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}