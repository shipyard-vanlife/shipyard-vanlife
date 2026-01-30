import React, { memo, ReactNode } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme'

type IconName = React.ComponentProps<typeof Ionicons>['name']

interface ModalHeaderProps {
  /** Modal title */
  title: string
  /** Optional subtitle below the title */
  subtitle?: string
  /** Close button callback (shows X button on right) */
  onClose?: () => void
  /** Back button callback (shows back arrow on left) */
  onBack?: () => void
  /** Whether to show border at bottom */
  showBorder?: boolean
  /** Left side icon or element (alternative to back button) */
  leftElement?: ReactNode
  /** Right side icon or element (alternative to close button) */
  rightElement?: ReactNode
  /** Disable close/back buttons */
  disabled?: boolean
  /** Custom container style */
  style?: ViewStyle
}

/**
 * Generic modal header component with title, close button, and optional back button.
 *
 * @example
 * // Simple modal header with close button
 * <ModalHeader title="Edit Profile" onClose={handleClose} />
 *
 * @example
 * // Modal header with back and close buttons
 * <ModalHeader
 *   title="Select Location"
 *   onBack={handleBack}
 *   onClose={handleClose}
 * />
 *
 * @example
 * // Modal header with custom right element
 * <ModalHeader
 *   title="Settings"
 *   rightElement={<SaveButton onPress={handleSave} />}
 * />
 */
export const ModalHeader = memo(function ModalHeader({
  title,
  subtitle,
  onClose,
  onBack,
  showBorder = true,
  leftElement,
  rightElement,
  disabled = false,
  style,
}: ModalHeaderProps) {
  const renderLeftElement = () => {
    if (leftElement) return leftElement
    if (onBack) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBack}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={disabled ? colors.text.disabled : colors.text.primary}
          />
        </TouchableOpacity>
      )
    }
    return <View style={styles.placeholder} />
  }

  const renderRightElement = () => {
    if (rightElement) return rightElement
    if (onClose) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onClose}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons
            name="close"
            size={24}
            color={disabled ? colors.text.disabled : colors.text.primary}
          />
        </TouchableOpacity>
      )
    }
    return <View style={styles.placeholder} />
  }

  return (
    <View style={[styles.container, showBorder && styles.withBorder, style]}>
      {renderLeftElement()}

      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {renderRightElement()}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.card,
  },
  withBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
})
