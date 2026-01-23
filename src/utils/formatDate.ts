import i18n from '../i18n'

/**
 * Formats a date according to the current app locale.
 * Uses short date format (DD/MM/YYYY for FR, MM/DD/YYYY for EN).
 */
export function formatDate(date: Date | null, fallback = '-'): string {
  if (!date) return fallback

  // Get current language from i18n
  const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US'

  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formats a date with long month name.
 * Example: "15 janvier 2000" (FR) or "January 15, 2000" (EN)
 */
export function formatDateLong(date: Date | null, fallback = '-'): string {
  if (!date) return fallback

  const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US'

  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
