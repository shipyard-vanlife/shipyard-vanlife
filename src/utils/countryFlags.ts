/**
 * Converts an ISO 3166-1 alpha-2 country code to a flag emoji
 * @param countryCode - 2-letter country code (e.g., "FR", "ES", "US")
 * @returns Flag emoji (e.g., "🇫🇷", "🇪🇸", "🇺🇸")
 */
export function countryCodeToFlag(countryCode: string | null): string | null {
  if (!countryCode || countryCode.length !== 2) {
    return null
  }

  const code = countryCode.toUpperCase()
  const OFFSET = 127397 // Regional Indicator Symbol offset

  const flag = String.fromCodePoint(
    code.charCodeAt(0) + OFFSET,
    code.charCodeAt(1) + OFFSET
  )

  return flag
}

/**
 * Extracts unique country codes from an array and returns their flag emojis
 * @param countries - Array of country codes (can include nulls)
 * @returns Array of unique flag emojis in order of first appearance
 */
export function getUniqueCountryFlags(countries: (string | null)[]): string[] {
  const seen = new Set<string>()
  const flags: string[] = []

  for (const country of countries) {
    if (country && !seen.has(country)) {
      seen.add(country)
      const flag = countryCodeToFlag(country)
      if (flag) {
        flags.push(flag)
      }
    }
  }

  return flags
}
