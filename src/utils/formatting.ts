import i18n from '../i18n'

/**
 * Formats a number with locale-specific thousand separators.
 * Example: 1234 → "1 234" (FR) or "1,234" (EN)
 */
export function formatNumber(num: number | null | undefined, fallback = '-'): string {
  if (num === null || num === undefined) return fallback

  const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US'
  return num.toLocaleString(locale)
}

/**
 * Formats a number with a maximum number of decimal places.
 * Removes trailing zeros.
 * Example: formatDecimal(3.50, 2) → "3.5"
 */
export function formatDecimal(
  num: number | null | undefined,
  maxDecimals = 1,
  fallback = '-'
): string {
  if (num === null || num === undefined) return fallback

  return parseFloat(num.toFixed(maxDecimals)).toString()
}
