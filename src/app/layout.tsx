import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Butchers Near Me - Quality Butchers Directory UK',
  description: 'Discover the best butcher shops across the UK with detailed information, reviews, and location data. Find your perfect butcher today.',
  keywords: 'butcher, meat, UK, directory, local, quality, reviews, London, Manchester, Edinburgh',
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
        {children}
        <Footer />
      </body>
    </html>
  )
}
