import { Metadata } from 'next'
import HomeClient from './home-client'

export const metadata: Metadata = {
  title: 'Find Quality Local Butchers Near You in The UK',
  description: 'Discover 1200+ quality butchers across the UK. Find traditional meat shops, expert butchers, and premium cuts in your county and city.',
  keywords: 'butchers near me, local butchers UK, quality meat shops, traditional butchers, meat suppliers, UK butcher directory, fresh meat, local meat shops, butcher reviews',
  openGraph: {
    title: 'Find Quality Local Butchers Near You in The UK',
    description: 'Discover 1200+ quality butchers across the UK. Find traditional meat shops, expert butchers, and premium cuts in your county and city.',
    url: 'https://www.butchersnearme.co.uk',
  },
  twitter: {
    title: 'Find Quality Local Butchers Near You in The UK',
    description: 'Discover 1200+ quality butchers across the UK. Find traditional meat shops, expert butchers, and premium cuts in your county and city.',
  },
}

export default function HomePage() {
  return <HomeClient />
}