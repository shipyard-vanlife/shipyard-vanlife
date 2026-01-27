import React from 'react'
import { View, Text, Switch, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../styles/theme'
import type { VerificationStatus } from '../../../types/verification'

interface ProfileEditVisibilityToggleProps {
  label: string
  description: string
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
  verificationStatus?: VerificationStatus | null
  verificationPendingText?: string
  verificationRequiredText?: string
}

export const ProfileEditVisibilityToggle: React.FC<ProfileEditVisibilityToggleProps> = ({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
  verificationStatus,
  verificationPendingText,
  verificationRequiredText,
}) => {
  const isVerified = verificationStatus === 'approved'
  const isPending = verificationStatus === 'pending'

  // Disable toggle completely if user is not verified
  const isToggleDisabled = disabled || !isVerified

  // Show warning if not verified
  const showWarning = !isVerified
  const warningText = isPending ? verificationPendingText : verificationRequiredText

  // Handle value change - prevent turning ON if not verified
  const handleValueChange = (newValue: boolean) => {
    // If trying to turn ON but not verified, ignore
    if (newValue && !isVerified) {
      return
    }
    onValueChange(newValue)
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, isToggleDisabled && styles.containerDisabled]}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.description, !isVerified && styles.descriptionDisabled]}>
            {description}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={handleValueChange}
          disabled={isToggleDisabled}
          trackColor={{ false: colors.border.main, true: colors.secondary.light }}
          thumbColor={value ? colors.secondary.main : colors.white}
          ios_backgroundColor={colors.border.main}
        />
      </View>

      {/* Verification warning */}
      {showWarning && warningText ? (
        <View style={styles.warningContainer}>
          <Ionicons
            name={isPending ? 'time-outline' : 'alert-circle-outline'}
            size={16}
            color={isPending ? colors.warning : colors.error}
          />
          <Text
            style={[
              styles.warningText,
              isPending ? styles.warningTextPending : styles.warningTextRequired,
            ]}
          >
            {warningText}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  descriptionDisabled: {
    color: colors.text.muted,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  warningText: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    flex: 1,
  },
  warningTextPending: {
    color: colors.warning,
  },
  warningTextRequired: {
    color: colors.error,
  },
})
