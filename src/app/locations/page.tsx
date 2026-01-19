import { Metadata } from 'next'
import LocationsClient from './locations-client'

export const metadata: Metadata = {
  title: 'Find Butchers by Location - UK Counties & Cities | Butchers Near Me',
  description: 'Browse 1000+ butchers across all UK counties and cities. Find quality local meat shops, traditional butchers, and specialty providers in your area with ratings and contact details.',
  keywords: 'butchers by location, UK counties, local butchers, find butchers near me, meat shops by area, traditional butchers UK, county butchers directory',
  openGraph: {
    title: 'Find Butchers by Location - UK Counties & Cities',
    description: 'Browse 1000+ quality butchers across all UK counties and cities. Find traditional meat shops and specialty providers in your local area.',
    url: 'https://www.butchersnearme.co.uk/locations',
  },
  twitter: {
    title: 'Find Butchers by Location - UK Counties & Cities',
    description: 'Browse 1000+ quality butchers across all UK counties and cities. Find local meat shops in your area.',
  },
}

export default function LocationsPage() {
  return <LocationsClient />
}