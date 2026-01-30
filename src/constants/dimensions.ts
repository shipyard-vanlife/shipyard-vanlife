/**
 * Centralized dimension constants for consistent sizing across the app.
 * Use these instead of magic numbers.
 */

/**
 * Icon sizes for Ionicons and lucide-react icons
 */
export const iconSize = {
  /** 10px - micro badges, indicators */
  xs: 10,
  /** 12px - small inline icons */
  sm: 12,
  /** 14px - compact icons, labels */
  md: 14,
  /** 16px - default inline icons */
  base: 16,
  /** 18px - medium icons */
  lg: 18,
  /** 20px - buttons, inputs */
  xl: 20,
  /** 24px - headers, nav icons */
  xxl: 24,
  /** 26px - bottom tab icons */
  tab: 26,
  /** 28px - modal headers, close buttons */
  header: 28,
  /** 30px - close buttons overlay */
  close: 30,
  /** 32px - floating action buttons */
  fab: 32,
  /** 48px - large icons in cards/sections */
  large: 48,
  /** 64px - empty state icons */
  empty: 64,
  /** 80px - hero/splash icons */
  hero: 80,
} as const

/**
 * Avatar sizes for profile images
 */
export const avatarSize = {
  /** 18px - micro avatar badges */
  xs: 18,
  /** 32px - small inline avatars */
  sm: 32,
  /** 40px - list item avatars */
  md: 40,
  /** 48px - card avatars */
  lg: 48,
  /** 50px - map markers */
  map: 50,
  /** 56px - search result avatars */
  search: 56,
  /** 60px - profile section avatars */
  xl: 60,
  /** 80px - profile header avatars */
  profile: 80,
  /** 120px - profile editor avatars */
  editor: 120,
} as const

/**
 * Touch target sizes (accessibility minimums)
 */
export const touchTarget = {
  /** 36px - minimum touch target */
  sm: 36,
  /** 40px - default touch target */
  md: 40,
  /** 44px - recommended touch target */
  lg: 44,
  /** 48px - large touch target */
  xl: 48,
} as const

/**
 * Component-specific dimensions
 */
export const componentSize = {
  /** Modal header close button */
  modalCloseButton: 40,
  /** Bottom sheet handle width */
  sheetHandleWidth: 40,
  /** Bottom sheet handle height */
  sheetHandleHeight: 5,
  /** Action button height */
  actionButtonHeight: 48,
  /** Input field height */
  inputHeight: 48,
  /** Tab bar icon container */
  tabIconContainer: 20,
  /** Card avatar container */
  cardAvatar: 60,
  /** Map preview height */
  mapPreviewHeight: 200,
  /** Textarea min height */
  textareaHeight: 100,
} as const

/**
 * Badge sizes
 */
export const badgeSize = {
  /** 16px - notification dot */
  dot: 16,
  /** 18px - count badge */
  sm: 18,
  /** 20px - status badge */
  md: 20,
  /** 24px - large badge */
  lg: 24,
} as const

/**
 * Separator dimensions
 */
export const separatorSize = {
  /** 1px - thin separator */
  thin: 1,
  /** 2px - medium separator */
  medium: 2,
  /** 12px - stat separator height */
  statHeight: 12,
} as const
