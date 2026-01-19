import * as Location from 'expo-location'
import { useCallback, useState } from 'react'

export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error'

export type LocationErrorCode = 'PERMISSION_DENIED' | 'LOCATION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN'

export interface LocationError {
  code: LocationErrorCode
  message: string
}

export interface LocationData {
  latitude: number
  longitude: number
  city: string | null
}

export interface UseLocationReturn {
  status: LocationStatus
  location: LocationData | null
  error: LocationError | null
  requestLocation: () => Promise<LocationData | null>
  isLoading: boolean
}

export function useLocation(): UseLocationReturn {
  const [status, setStatus] = useState<LocationStatus>('idle')
  const [location, setLocation] = useState<LocationData | null>(null)
  const [error, setError] = useState<LocationError | null>(null)

  const requestLocation = useCallback(async (): Promise<LocationData | null> => {
    setStatus('requesting')
    setError(null)

    try {
      // Request permission
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync()

      if (permissionStatus !== 'granted') {
        setStatus('denied')
        setError({
          code: 'PERMISSION_DENIED',
          message: 'Location permission was denied',
        })
        return null
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const { latitude, longitude } = position.coords

      // Reverse geocode to get city name
      let city: string | null = null
      try {
        const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude })
        if (geocode) {
          // Build city string: "City, Country" or just "City" or "Country"
          const parts = [geocode.city, geocode.country].filter(Boolean)
          city = parts.join(', ') || null
        }
      } catch {
        // Reverse geocoding failed, continue without city
        console.warn('Reverse geocoding failed')
      }

      const locationData: LocationData = { latitude, longitude, city }
      setLocation(locationData)
      setStatus('granted')
      return locationData
    } catch (err) {
      console.error('Location error:', err)

      let errorCode: LocationErrorCode = 'UNKNOWN'
      let errorMessage = 'An unknown error occurred'

      if (err instanceof Error) {
        if (err.message.includes('permission')) {
          errorCode = 'PERMISSION_DENIED'
          errorMessage = 'Location permission was denied'
        } else if (err.message.includes('timeout')) {
          errorCode = 'TIMEOUT'
          errorMessage = 'Location request timed out'
        } else if (err.message.includes('unavailable') || err.message.includes('disabled')) {
          errorCode = 'LOCATION_UNAVAILABLE'
          errorMessage = 'Location services are unavailable'
        } else {
          errorMessage = err.message
        }
      }

      setStatus('error')
      setError({ code: errorCode, message: errorMessage })
      return null
    }
  }, [])

  return {
    status,
    location,
    error,
    requestLocation,
    isLoading: status === 'requesting',
  }
}
