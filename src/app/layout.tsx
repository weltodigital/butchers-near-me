import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Butchers Near Me - Find Quality Local Butchers in the UK',
  description: 'Discover the best local butchers near you across the UK. Find quality meat, contact details, reviews, and directions to traditional butcher shops in your area.',
  keywords: 'butchers, local butchers, meat shop, UK butchers, quality meat, butchers near me',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}