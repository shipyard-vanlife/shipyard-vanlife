import * as Location from 'expo-location'
import { useCallback, useState } from 'react'
import { Linking } from 'react-native'

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
  country: string | null // ISO 3166-1 alpha-2 code (e.g., "FR", "ES")
}

export interface UseLocationReturn {
  status: LocationStatus
  location: LocationData | null
  error: LocationError | null
  requestLocation: () => Promise<LocationData | null>
  isLoading: boolean
}

function randomizeCoordinates(lat: number, lng: number): { latitude: number; longitude: number } {
  const minRadiusInDegrees = 0.009 // ~1km
  const maxRadiusInDegrees = 0.027 // ~3km

  const angle = Math.random() * 2 * Math.PI
  const distance = minRadiusInDegrees + Math.random() * (maxRadiusInDegrees - minRadiusInDegrees)

  const randomLat = lat + distance * Math.cos(angle)
  const randomLng = lng + (distance * Math.sin(angle)) / Math.cos((lat * Math.PI) / 180)

  // Debug logs
  const distanceKm = distance * 111 // Rough conversion to km
  console.log(`🎲 Randomisation: ${distanceKm.toFixed(2)}km de distance`)
  console.log(`📍 Vraie position: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
  console.log(`🔀 Position randomisée: ${randomLat.toFixed(4)}, ${randomLng.toFixed(4)}`)

  return { latitude: randomLat, longitude: randomLng }
}

export function useLocation(): UseLocationReturn {
  const [status, setStatus] = useState<LocationStatus>('idle')
  const [location, setLocation] = useState<LocationData | null>(null)
  const [error, setError] = useState<LocationError | null>(null)

  const requestLocation = useCallback(async (): Promise<LocationData | null> => {
    setStatus('requesting')
    setError(null)

    try {
      // First check current permission status
      const { status: currentStatus } = await Location.getForegroundPermissionsAsync()

      // If already denied, open settings instead of re-requesting
      if (currentStatus === 'denied') {
        await Linking.openSettings()
        setStatus('denied')
        setError({
          code: 'PERMISSION_DENIED',
          message: 'Location permission was denied',
        })
        return null
      }

      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync()

      if (permissionStatus !== 'granted') {
        setStatus('denied')
        setError({
          code: 'PERMISSION_DENIED',
          message: 'Location permission was denied',
        })
        return null
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const { latitude, longitude } = position.coords

      let city: string | null = null
      let country: string | null = null
      try {
        const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude })
        if (geocode) {
          city = geocode.city || null
          // ISO 3166-1 alpha-2 country code (e.g., "FR", "ES")
          country = geocode.isoCountryCode || null
        }
      } catch {
        console.warn('Reverse geocoding failed')
      }

      const randomizedCoords = randomizeCoordinates(latitude, longitude)

      const locationData: LocationData = {
        latitude: randomizedCoords.latitude,
        longitude: randomizedCoords.longitude,
        city,
        country,
      }
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
