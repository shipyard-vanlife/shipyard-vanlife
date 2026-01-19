import { z } from 'zod'

/**
 * Parse les erreurs Supabase en clés i18n (common:errors.*)
 */
export function parseSupabaseError(error: Error): string {
  const message = error.message.toLowerCase()

  // Unique constraint violation (username already taken)
  if (message.includes('duplicate') || message.includes('unique') || message.includes('23505')) {
    if (message.includes('username')) {
      return 'errors.usernameTaken'
    }
    return 'errors.duplicateValue'
  }

  // RLS policy violation
  if (message.includes('policy') || message.includes('permission') || message.includes('42501')) {
    return 'errors.noPermission'
  }

  // Network error
  if (message.includes('network') || message.includes('fetch') || message.includes('failed')) {
    return 'errors.network'
  }

  // Default
  return 'errors.generic'
}

/**
 * Extrait le premier message d'erreur Zod (clé i18n)
 */
export function getFirstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'errors.generic'
}

/**
 * Transforme les erreurs Zod en objet field -> clé i18n
 */
export function getFieldErrors<T extends Record<string, unknown>>(
  zodError: z.ZodError
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {}
  for (const issue of zodError.issues) {
    const field = issue.path[0] as keyof T
    if (field && !errors[field]) {
      errors[field] = issue.message
    }
  }
  return errors
}
