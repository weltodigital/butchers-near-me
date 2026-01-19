import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.butchersnearme.co.uk'),
  title: 'Butchers Near Me - Find Quality Local Butchers in the UK',
  description: 'Discover 1000+ quality butchers across the UK. Find traditional meat shops, expert butchers, and premium cuts in your county and city. Compare ratings, contact details, and directions.',
  keywords: 'butchers, local butchers, meat shop, UK butchers, quality meat, butchers near me, traditional butchers, county butchers, city butchers',
  authors: [{ name: 'Butchers Near Me' }],
  creator: 'Butchers Near Me',
  publisher: 'Butchers Near Me',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Butchers Near Me - Find Quality Local Butchers in the UK',
    description: 'Discover 1000+ quality butchers across the UK. Find traditional meat shops, expert butchers, and premium cuts in your county and city.',
    url: 'https://www.butchersnearme.co.uk',
    siteName: 'Butchers Near Me',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Butchers Near Me - Find Quality Local Butchers in the UK',
    description: 'Discover 1000+ quality butchers across the UK. Find traditional meat shops and premium cuts near you.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}