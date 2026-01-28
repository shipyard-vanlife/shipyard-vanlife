import i18n from '../i18n'

// Conversion constant
const KM_TO_MILES = 0.621371

// Countries that use miles (US, UK, etc.)
const MILES_LOCALES = ['en-US', 'en-GB']

/**
 * Checks if the current locale uses miles instead of kilometers
 */
export function usesMiles(): boolean {
  const locale = i18n.language === 'en' ? 'en-US' : 'fr-FR'
  return MILES_LOCALES.includes(locale)
}

/**
 * Converts kilometers to miles
 */
export function kmToMiles(km: number): number {
  return km * KM_TO_MILES
}

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Calculates the distance between two geographic points using the Haversine formula
 * @param lat1 Latitude of point 1
 * @param lng1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lng2 Longitude of point 2
 * @returns Distance in kilometers (rounded to 1 decimal place)
 */
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Math.round(R * c * 10) / 10
}

/**
 * Calculates distance between two location objects
 */
export function calculateDistance(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number {
  return haversineDistance(from.latitude, from.longitude, to.latitude, to.longitude)
}

/**
 * Returns the distance unit for the current locale
 */
export function getDistanceUnit(): string {
  return usesMiles() ? 'mi' : 'km'
}

/**
 * Converts a distance to the appropriate unit for display
 * @param km Distance in kilometers
 * @returns Distance in the locale-appropriate unit (km or miles)
 */
export function convertDistance(km: number): number {
  return usesMiles() ? kmToMiles(km) : km
}

/**
 * Returns distance params ready for i18n interpolation
 * @param km Distance in kilometers
 * @returns Object with { value, unit } for use in t('key', getDistanceParams(km))
 */
export function getDistanceParams(km: number): { value: number; unit: string } {
  return {
    value: Math.round(convertDistance(km)),
    unit: getDistanceUnit(),
  }
}

/**
 * Formats a distance value for display with locale-aware unit (km or mi).
 * - If >= 10: shows integer (e.g., "125 km" or "78 mi")
 * - If < 10: shows 1 decimal place (e.g., "3.5 km" or "2.2 mi")
 * @param km Distance in kilometers (always stored as km internally)
 * @param showUnit Whether to append unit (default: false)
 * @returns Formatted distance string with appropriate unit
 */
export function formatDistance(km: number | null | undefined, showUnit = false): string {
  if (km === null || km === undefined) return '-'

  const useMiles = usesMiles()
  const value = useMiles ? kmToMiles(km) : km
  const unit = useMiles ? 'mi' : 'km'

  const formatted = value >= 10 ? Math.round(value).toString() : value.toFixed(1)
  return showUnit ? `${formatted} ${unit}` : formatted
}
