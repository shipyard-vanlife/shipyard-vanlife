/**
 * Thème global de l'application Nomli
 * Centralise toutes les couleurs et styles de l'app
 */

export const colors = {
  // Couleurs primaires
  primary: {
    main: '#F5F1E8',        // Beige clair - Background principal de l'app
    light: '#FEFCF9',       // Beige très clair - Pour les cartes/zones claires
    dark: '#E8DFD0',        // Beige moyen - Pour les bordures subtiles
  },

  // Couleurs secondaires
  secondary: {
    main: '#E07A5F',        // Coral/Saumon - Boutons principaux
    light: '#E89582',       // Coral clair - Hover/états actifs
    dark: '#C86B52',        // Coral foncé - Pressed states
  },

  // Couleurs tertiaires
  tertiary: {
    main: '#D4A373',        // Beige foncé - Barre BottomSheet, accents
    light: '#DEB68A',       // Beige doré clair
    dark: '#B88E5F',        // Beige doré foncé
  },

  // Bordures
  border: {
    light: '#E8DFD0',       // Bordure très claire
    main: '#D4C5B9',        // Bordure standard - Inputs, cartes
    dark: '#B8A895',        // Bordure accentuée
  },

  // Textes
  text: {
    primary: '#2C2C2C',     // Texte principal - Titres, texte important
    secondary: '#4A4A4A',   // Texte secondaire - Descriptions
    tertiary: '#666666',    // Texte tertiaire - Labels, infos
    muted: '#8B7355',       // Texte atténué - Hints, placeholders
    disabled: '#999999',    // Texte désactivé
  },

  // Couleurs utilitaires
  white: '#FFFFFF',
  black: '#000000',

  // États
  success: '#4CAF50',       // Vert - Succès
  error: '#DC2626',         // Rouge - Erreurs
  warning: '#F59E0B',       // Orange - Avertissements
  info: '#3B82F6',          // Bleu - Informations

  // Backgrounds spéciaux
  background: {
    main: '#F5F1E8',        // Background principal (alias de primary.main)
    card: '#FFFFFF',        // Background des cartes
    overlay: 'rgba(0, 0, 0, 0.5)',  // Overlay pour modaux
  },

  // Ombres
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    main: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.15)',
  },
}

/**
 * Espacements standardisés
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
}

/**
 * Border radius standardisés
 */
export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 24,
  full: 9999,
}

/**
 * Tailles de police
 */
export const fontSize = {
  xs: 12,
  sm: 13,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  xxl: 20,
  title: 24,
  heading: 28,
  display: 32,
}

/**
 * Poids de police
 */
export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
}

/**
 * Ombres prédéfinies pour React Native
 */
export const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
}

/**
 * Export du thème complet
 */
export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
}

export default theme
