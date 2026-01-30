import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Application error codes for centralized error handling.
 */
export type AppErrorCode =
  // Authentication errors
  | 'NOT_AUTHENTICATED'
  | 'SESSION_EXPIRED'
  // Verification errors
  | 'VERIFICATION_REQUIRED'
  // Invitation errors
  | 'INVITATION_SUSPENDED'
  | 'INVALID_CODE'
  | 'CODE_ALREADY_USED'
  | 'OWN_CODE'
  // Permission errors
  | 'PERMISSION_DENIED'
  | 'FORBIDDEN'
  // Rate limiting
  | 'RATE_LIMITED'
  | 'USERNAME_CHANGE_LIMIT'
  // Resource errors
  | 'NOT_FOUND'
  | 'ALREADY_EXISTS'
  // Help request errors
  | 'PENDING_REQUEST_EXISTS'
  | 'OWN_PENDING_REQUEST'
  // Network errors
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  // Generic
  | 'UNKNOWN_ERROR'

/**
 * Structured application error with i18n support.
 */
export interface AppError extends Error {
  code: AppErrorCode
  i18nKey: string
  originalError?: Error | PostgrestError
}

/**
 * Pattern configuration for mapping Supabase errors to app errors.
 */
interface ErrorPattern {
  pattern: string | RegExp
  code: AppErrorCode
  i18nKey: string
}

/**
 * Error patterns for mapping Supabase error messages to structured app errors.
 * Patterns are checked in order, first match wins.
 */
const ERROR_PATTERNS: ErrorPattern[] = [
  // Authentication
  { pattern: 'PGRST116', code: 'NOT_AUTHENTICATED', i18nKey: 'errors.notAuthenticated' },
  { pattern: 'JWT expired', code: 'SESSION_EXPIRED', i18nKey: 'errors.sessionExpired' },
  { pattern: 'Not authenticated', code: 'NOT_AUTHENTICATED', i18nKey: 'errors.notAuthenticated' },

  // Verification
  { pattern: 'Must be verified', code: 'VERIFICATION_REQUIRED', i18nKey: 'errors.verificationRequired' },

  // Invitations
  { pattern: 'suspended', code: 'INVITATION_SUSPENDED', i18nKey: 'errors.invitationSuspended' },
  { pattern: 'Invalid invitation code', code: 'INVALID_CODE', i18nKey: 'errors.invalidCode' },
  { pattern: 'already been used', code: 'CODE_ALREADY_USED', i18nKey: 'errors.codeAlreadyUsed' },
  { pattern: 'Cannot use your own', code: 'OWN_CODE', i18nKey: 'errors.ownCode' },

  // Rate limiting
  { pattern: 'once per month', code: 'USERNAME_CHANGE_LIMIT', i18nKey: 'errors.usernameChangeLimit' },
  { pattern: /rate limit/i, code: 'RATE_LIMITED', i18nKey: 'errors.rateLimited' },

  // Permissions
  { pattern: /permission denied/i, code: 'PERMISSION_DENIED', i18nKey: 'errors.permissionDenied' },
  { pattern: /forbidden/i, code: 'FORBIDDEN', i18nKey: 'errors.forbidden' },

  // Help requests
  { pattern: 'déjà une demande en attente', code: 'OWN_PENDING_REQUEST', i18nKey: 'errors.ownPendingRequest' },
  { pattern: "demande d'aide est déjà en cours", code: 'PENDING_REQUEST_EXISTS', i18nKey: 'errors.pendingRequestExists' },

  // Resource errors
  { pattern: /not found/i, code: 'NOT_FOUND', i18nKey: 'errors.notFound' },
  { pattern: /already exists/i, code: 'ALREADY_EXISTS', i18nKey: 'errors.alreadyExists' },
  { pattern: /duplicate key/i, code: 'ALREADY_EXISTS', i18nKey: 'errors.alreadyExists' },

  // Network errors
  { pattern: /network/i, code: 'NETWORK_ERROR', i18nKey: 'errors.network' },
  { pattern: /timeout/i, code: 'TIMEOUT', i18nKey: 'errors.timeout' },
  { pattern: 'Failed to fetch', code: 'NETWORK_ERROR', i18nKey: 'errors.network' },
]

/**
 * Creates a structured AppError from the given parameters.
 */
function createAppError(
  message: string,
  code: AppErrorCode,
  i18nKey: string,
  originalError?: Error | PostgrestError
): AppError {
  const appError = new Error(message) as AppError
  appError.code = code
  appError.i18nKey = i18nKey
  appError.originalError = originalError
  return appError
}

/**
 * Maps a Supabase/Postgrest error to a structured AppError.
 *
 * @example
 * try {
 *   const { error } = await supabase.rpc('generate_invitation_code')
 *   if (error) throw mapSupabaseError(error)
 * } catch (err) {
 *   if (err.code === 'VERIFICATION_REQUIRED') {
 *     // Handle verification required
 *   }
 *   // Show localized error: t(err.i18nKey)
 * }
 */
export function mapSupabaseError(error: PostgrestError | Error): AppError {
  const message = error.message || 'Unknown error'

  for (const { pattern, code, i18nKey } of ERROR_PATTERNS) {
    const matches =
      typeof pattern === 'string' ? message.includes(pattern) : pattern.test(message)

    if (matches) {
      return createAppError(message, code, i18nKey, error)
    }
  }

  return createAppError(message, 'UNKNOWN_ERROR', 'errors.unknown', error)
}

/**
 * Throws a mapped AppError. Useful as a one-liner in mutations.
 *
 * @example
 * const { data, error } = await supabase.rpc('some_function')
 * if (error) throwMappedError(error)
 */
export function throwMappedError(error: PostgrestError | Error): never {
  throw mapSupabaseError(error)
}

/**
 * Type guard to check if an error is an AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return (
    error instanceof Error &&
    'code' in error &&
    'i18nKey' in error &&
    typeof (error as AppError).code === 'string'
  )
}

/**
 * Gets a user-friendly error message for display.
 * Falls back to a generic message if the error is not an AppError.
 *
 * @param error - The error to get a message for
 * @param t - i18n translation function
 * @param fallback - Fallback message if translation not found
 */
export function getErrorMessage(
  error: unknown,
  t: (key: string) => string,
  fallback = 'Une erreur est survenue'
): string {
  if (isAppError(error)) {
    const translated = t(error.i18nKey)
    // If translation returns the key itself, use fallback
    return translated === error.i18nKey ? fallback : translated
  }

  if (error instanceof Error) {
    return error.message || fallback
  }

  return fallback
}
