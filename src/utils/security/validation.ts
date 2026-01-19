/**
 * Utilitaires de sécurité pour la validation et la sanitisation des inputs
 * Protection contre les injections XSS et validation des données utilisateur
 */

/**
 * Nettoie une chaîne de caractères pour éviter les attaques XSS
 * @param input - La chaîne à nettoyer
 * @returns La chaîne nettoyée
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return ''

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * Valide le format d'un email
 * @param email - L'email à valider
 * @returns true si l'email est valide
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Interface pour le résultat de validation du mot de passe
 */
export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Valide la force d'un mot de passe selon les critères suivants :
 * - Minimum 8 caractères
 * - Au moins une majuscule
 * - Au moins un chiffre
 * - Au moins un caractère spécial (!@#$%^&*()_+-=[]{}|;:,.<>?)
 *
 * @param password - Le mot de passe à valider
 * @returns Objet contenant isValid et la liste des erreurs
 */
export const validatePasswordStrength = (password: string): PasswordValidationResult => {
  const errors: string[] = []

  if (!password) {
    errors.push('Le mot de passe est requis')
    return { isValid: false, errors }
  }

  if (password.length < 8) {
    errors.push('Minimum 8 caractères')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins une majuscule')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Au moins un chiffre')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Au moins un caractère spécial (!@#$%^&*...)')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valide que deux mots de passe correspondent
 * @param password - Le mot de passe
 * @param confirmPassword - La confirmation du mot de passe
 * @returns true si les mots de passe correspondent
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword && password.length > 0
}

/**
 * Nettoie un email en supprimant les espaces et en le mettant en minuscules
 * @param email - L'email à nettoyer
 * @returns L'email nettoyé
 */
export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase()
}

/**
 * Vérifie si une chaîne contient des caractères potentiellement dangereux
 * @param input - La chaîne à vérifier
 * @returns true si la chaîne contient des caractères suspects
 */
export const containsSuspiciousCharacters = (input: string): boolean => {
  // Détecte les patterns de script injection
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onload=, onclick=, etc.
    /<iframe/i,
    /eval\(/i,
  ]

  return suspiciousPatterns.some(pattern => pattern.test(input))
}
