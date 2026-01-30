import React, { memo, ReactNode } from 'react'
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../styles/theme'

type IconName = React.ComponentProps<typeof Ionicons>['name']

interface StatItemProps {
  /** The main value to display */
  value: string | number
  /** Label shown below or next to value */
  label?: string
  /** Unit shown after value (e.g., "km", "j") */
  unit?: string
  /** Icon name from Ionicons */
  icon?: IconName
  /** Display variant: 'card' for grid layouts, 'inline' for horizontal lists */
  variant?: 'card' | 'inline'
  /** Custom value style */
  valueStyle?: TextStyle
  /** Custom container style */
  style?: ViewStyle
}

/**
 * Reusable stat item component for displaying metrics.
 *
 * @example
 * // Card variant (for ProfileStats grid)
 * <StatItem value={42} unit="j" label="Sur la route" variant="card" />
 *
 * @example
 * // Inline variant (for TripStats horizontal)
 * <StatItem value="5 jours" icon="calendar-outline" variant="inline" />
 */
export const StatItem = memo(function StatItem({
  value,
  label,
  unit,
  icon,
  variant = 'card',
  valueStyle,
  style,
}: StatItemProps) {
  if (variant === 'inline') {
    return (
      <View style={[styles.inlineContainer, style]}>
        {icon ? <Ionicons name={icon} size={16} color={colors.text.tertiary} /> : null}
        <Text style={[styles.inlineValue, valueStyle]}>{value}</Text>
      </View>
    )
  }

  // Card variant
  return (
    <View style={[styles.cardContainer, style]}>
      <Text style={[styles.cardValue, valueStyle]}>
        {value}
        {unit ? <Text style={styles.cardUnit}> {unit}</Text> : null}
      </Text>
      {label ? <Text style={styles.cardLabel}>{label}</Text> : null}
    </View>
  )
})

/**
 * Separator component for use between inline stat items
 */
export const StatSeparator = memo(function StatSeparator() {
  return <View style={styles.separator} />
})

/**
 * Container for a row of card-style stats
 */
interface StatRowProps {
  children: ReactNode
  style?: ViewStyle
}

export const StatRow = memo(function StatRow({ children, style }: StatRowProps) {
  return <View style={[styles.row, style]}>{children}</View>
})

const styles = StyleSheet.create({
  // Card variant styles
  cardContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    ...shadows.small,
  },
  cardValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardUnit: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.text.tertiary,
  },
  cardLabel: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  // Inline variant styles
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  inlineValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.tertiary,
  },

  // Shared styles
  separator: {
    width: 1,
    height: 12,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
})
