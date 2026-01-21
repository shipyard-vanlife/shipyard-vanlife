/**
 * Convert ISO 3166-1 alpha-2 country code to flag emoji
 * e.g., "FR" → "🇫🇷", "ES" → "🇪🇸", "PT" → "🇵🇹"
 *
 * Uses Unicode Regional Indicator Symbols:
 * Each letter A-Z has a corresponding regional indicator (U+1F1E6 - U+1F1FF)
 * Two regional indicators together form a flag emoji
 */
export function countryCodeToFlag(countryCode: string | null | undefined): string | null {
  if (!countryCode || countryCode.length !== 2) {
    return null
  }

  const code = countryCode.toUpperCase()

  // Validate that both characters are letters A-Z
  if (!/^[A-Z]{2}$/.test(code)) {
    return null
  }

  // Convert each letter to its regional indicator symbol
  // 'A' = 65 in ASCII, Regional Indicator 'A' = 0x1F1E6 (127462)
  const REGIONAL_INDICATOR_A = 0x1f1e6
  const ASCII_A = 65

  const firstChar = code.charCodeAt(0) - ASCII_A + REGIONAL_INDICATOR_A
  const secondChar = code.charCodeAt(1) - ASCII_A + REGIONAL_INDICATOR_A

  return String.fromCodePoint(firstChar, secondChar)
}
