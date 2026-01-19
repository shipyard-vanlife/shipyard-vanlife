import { useState, useEffect } from 'react'
import * as Location from 'expo-location'

export interface LocationData {
  latitude: number
  longitude: number
  city: string
}


function randomizeCoordinates(lat: number, lng: number): { latitude: number; longitude: number } {
  const minRadiusInDegrees = 0.018 // ~2km
  const maxRadiusInDegrees = 0.09  // ~10km

  // Angle aléatoire (0 à 360 degrés)
  const angle = Math.random() * 2 * Math.PI

  // Distance aléatoire entre min et max
  const distance = minRadiusInDegrees + Math.random() * (maxRadiusInDegrees - minRadiusInDegrees)

  // Ajuster la longitude en fonction de la latitude pour une distribution correcte
  const randomLat = lat + distance * Math.cos(angle)
  const randomLng = lng + (distance * Math.sin(angle)) / Math.cos(lat * Math.PI / 180)

  return {
    latitude: randomLat,
    longitude: randomLng,
  }
}


export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestLocation = async (): Promise<LocationData | null> => {
    setLoading(true)
    setError(null)

    try {
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== 'granted') {
        setError('Permission de localisation refusée')
        setLoading(false)
        return null
      }

      
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      })

      // Randomiser les coordonnées pour la vie privée
      const randomized = randomizeCoordinates(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      )

      const locationData: LocationData = {
        latitude: randomized.latitude,
        longitude: randomized.longitude,
        city: geocode.city || geocode.subregion || geocode.region || 'Ville inconnue',
      }

      setLocation(locationData)
      setLoading(false)
      return locationData
    } catch (err) {
      console.error('Erreur de localisation:', err)
      setError('Impossible de récupérer la localisation')
      setLoading(false)
      return null
    }
  }

  return {
    location,
    loading,
    error,
    requestLocation,
  }
}
