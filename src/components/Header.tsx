'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-lg border-b border-red-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/Butchers Near Me.png"
              alt="Butchers Near Me Logo"
              width={120}
              height={120}
              className="h-20 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/blog"
              className="text-gray-700 hover:text-red-600 font-medium transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/gloucestershire"
              className="text-gray-700 hover:text-red-600 font-medium transition-colors"
            >
              Gloucestershire
            </Link>
            <Link
              href="/devon"
              className="text-gray-700 hover:text-red-600 font-medium transition-colors"
            >
              Devon
            </Link>
            <Link
              href="/west-midlands"
              className="text-gray-700 hover:text-red-600 font-medium transition-colors"
            >
              West Midlands
            </Link>
            <Link
              href="/wiltshire"
              className="text-gray-700 hover:text-red-600 font-medium transition-colors"
            >
              Wiltshire
            </Link>
            <Link
              href="/isle-of-wight"
              className="text-gray-700 hover:text-red-600 font-medium transition-colors"
            >
              Isle of Wight
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-red-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-2">
            <nav className="flex flex-col space-y-4 pt-4">
              <Link
                href="/blog"
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/gloucestershire"
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Gloucestershire
              </Link>
              <Link
                href="/devon"
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Devon
              </Link>
              <Link
                href="/west-midlands"
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                West Midlands
              </Link>
              <Link
                href="/wiltshire"
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Wiltshire
              </Link>
              <Link
                href="/isle-of-wight"
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Isle of Wight
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}