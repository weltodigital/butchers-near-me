import { Metadata } from 'next'
import HomeClient from './home-client'

export const metadata: Metadata = {
  title: 'Butchers Near Me - Find Quality Local Butchers in the UK',
  description: 'Discover 1000+ quality butchers across the UK. Find traditional meat shops, expert butchers, and premium cuts in your county and city. Browse by location, read reviews, and get contact details.',
  keywords: 'butchers near me, local butchers UK, quality meat shops, traditional butchers, meat suppliers, UK butcher directory, fresh meat, local meat shops, butcher reviews',
  openGraph: {
    title: 'Butchers Near Me - Find Quality Local Butchers in the UK',
    description: 'Discover 1000+ quality butchers across the UK. Find traditional meat shops, expert butchers, and premium cuts in your area.',
    url: 'https://www.butchersnearme.co.uk',
  },
  twitter: {
    title: 'Butchers Near Me - Find Quality Local Butchers in the UK',
    description: 'Discover 1000+ quality butchers across the UK. Find traditional meat shops and premium cuts near you.',
  },
}

export default function HomePage() {
  return <HomeClient />
}