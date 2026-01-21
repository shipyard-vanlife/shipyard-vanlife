import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme'

interface TripEmptyStateProps {
  onCreatePress: () => void
  disabled?: boolean
}

export function TripEmptyState({ onCreatePress, disabled }: TripEmptyStateProps) {
  const { t } = useTranslation('trips')

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="map-outline" size={48} color={colors.text.muted} />
      </View>
      <Text style={styles.title}>{t('emptyState.title')}</Text>
      <Text style={styles.description}>{t('emptyState.description')}</Text>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onCreatePress}
        disabled={disabled}
      >
        <Ionicons
          name="add-circle-outline"
          size={20}
          color={disabled ? colors.text.disabled : colors.white}
        />
        <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
          {t('emptyState.createButton')}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

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
