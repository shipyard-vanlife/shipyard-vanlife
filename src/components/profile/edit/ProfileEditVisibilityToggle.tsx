import React from 'react'
import { View, Text, Switch, StyleSheet } from 'react-native'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../styles/theme'

interface ProfileEditVisibilityToggleProps {
  label: string
  description: string
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
}

export const ProfileEditVisibilityToggle: React.FC<ProfileEditVisibilityToggleProps> = ({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}) => {
  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border.main, true: colors.secondary.light }}
        thumbColor={value ? colors.secondary.main : colors.white}
        ios_backgroundColor={colors.border.main}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
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
})
