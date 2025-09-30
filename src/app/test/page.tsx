'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [butchers, setButchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchButchers = async () => {
      try {
        console.log('Fetching butchers...')
        const response = await fetch('/api/butchers')
        console.log('Response:', response)
        
        if (!response.ok) {
          throw new Error('Failed to fetch butchers')
        }
        
        const data = await response.json()
        console.log('Data:', data)
        setButchers(data.butchers || [])
      } catch (err) {
        console.error('Error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchButchers()
  }, [])

  if (loading) {
    return <div>Loading butchers...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page - Butchers</h1>
      <p>Found {butchers.length} butchers</p>
      
      {butchers.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Butchers:</h2>
          <ul className="space-y-2">
            {butchers.slice(0, 5).map((butcher: any) => (
              <li key={butcher.id} className="p-2 border rounded">
                <strong>{butcher.name}</strong> - {butcher.city} ({butcher.rating}⭐)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
