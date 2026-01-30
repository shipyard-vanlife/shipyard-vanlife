import React, { memo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme'

type IconName = React.ComponentProps<typeof Ionicons>['name']

interface EmptyStateProps {
  /** Icon name from Ionicons */
  icon: IconName
  /** Main title text */
  title: string
  /** Optional description text */
  description?: string
  /** Optional action button label */
  actionLabel?: string
  /** Optional action button callback */
  onAction?: () => void
  /** Whether the action button is disabled */
  actionDisabled?: boolean
  /** Custom container style */
  style?: ViewStyle
}

/**
 * Generic empty state component for use when lists or screens have no data.
 *
 * @example
 * // Simple empty state
 * <EmptyState
 *   icon="people-outline"
 *   title="Aucun ami"
 *   description="Ajoutez des amis pour commencer"
 * />
 *
 * @example
 * // With action button
 * <EmptyState
 *   icon="map-outline"
 *   title="Aucun voyage"
 *   description="Créez votre premier voyage"
 *   actionLabel="Créer un voyage"
 *   onAction={handleCreateTrip}
 * />
 */
export const EmptyState = memo(function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled = false,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={48} color={colors.text.muted} />
      </View>

      <Text style={styles.title}>{title}</Text>

      {description ? <Text style={styles.description}>{description}</Text> : null}

      {actionLabel && onAction ? (
        <TouchableOpacity
          style={[styles.button, actionDisabled && styles.buttonDisabled]}
          onPress={onAction}
          disabled={actionDisabled}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={actionDisabled ? colors.text.disabled : colors.white}
          />
          <Text style={[styles.buttonText, actionDisabled && styles.buttonTextDisabled]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  buttonDisabled: {
    backgroundColor: colors.border.main,
  },
  buttonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  buttonTextDisabled: {
    color: colors.text.disabled,
  },
})
