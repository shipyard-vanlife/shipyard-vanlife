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
export function formatDateLong(date: Date | string | null, fallback = '-'): string {
  if (!date) return fallback

  const dateObj = typeof date === 'string' ? new Date(date) : date
  const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US'

  return dateObj.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Formats a date with short month name.
 * Example: "15 janv. 2000" (FR) or "Jan 15, 2000" (EN)
 */
export function formatDateShort(date: Date | string | null, fallback = '-'): string {
  if (!date) return fallback

  const dateObj = typeof date === 'string' ? new Date(date) : date
  const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US'

  return dateObj.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Formats a date with only day and short month (no year).
 * Example: "15 janv." (FR) or "Jan 15" (EN)
 */
export function formatDateCompact(date: Date | string | null, fallback = '-'): string {
  if (!date) return fallback

  const dateObj = typeof date === 'string' ? new Date(date) : date
  const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US'

  return dateObj.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  })
}
