'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Star,
  Phone,
  Clock
} from 'lucide-react'

interface Butcher {
  id: string
  name: string
  description: string
  address: string
  postcode: string
  city: string
  county?: string
  phone?: string
  email?: string
  website?: string
  latitude?: number
  longitude?: number
  rating: number
  review_count: number
  specialties: string[]
  opening_hours: Record<string, string>
  images: string[]
  created_at: string
  updated_at: string
  full_url_path?: string
}

interface ButcherCardProps {
  butcher: Butcher
}

export default function ButcherCard({
  butcher
}: ButcherCardProps) {

  const formatOpeningHours = (hours: Record<string, string>) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    return hours[today] || 'Hours not available'
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4) return 'text-yellow-600'
    if (rating >= 3) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl group-hover:text-red-600 transition-colors">
                {butcher.name}
              </CardTitle>
            </div>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {butcher.city}, {butcher.postcode}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className={`text-sm font-medium ${getRatingColor(butcher.rating)}`}>
              {butcher.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">({butcher.review_count})</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Butcher Images */}
        <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={butcher.images && butcher.images.length > 0 ? butcher.images[0] : '/images/butchers near me.png'}
            alt={`${butcher.name} - Butcher shop`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
          {butcher.images && butcher.images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              +{butcher.images.length - 1} more
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          {butcher.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <a href={`tel:${butcher.phone}`} className="hover:text-red-600 transition-colors">
                {butcher.phone}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{formatOpeningHours(butcher.opening_hours)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 line-clamp-2">
          {butcher.description}
        </p>

        {/* Specialties */}
        {butcher.specialties && butcher.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {butcher.specialties.slice(0, 3).map((specialty, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
              >
                {specialty}
              </span>
            ))}
            {butcher.specialties.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{butcher.specialties.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" className="flex-1" asChild>
            <Link href={`/${butcher.full_url_path || `butchers/${butcher.id}`}`}>
              View Details
            </Link>
          </Button>
        </div>

        {/* Additional Info */}
        {butcher.county && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            <span>{butcher.county}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
