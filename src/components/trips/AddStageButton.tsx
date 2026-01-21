import React, { useState } from 'react'
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../styles/theme'
import { useLocation } from '../../hooks/useLocation'
import { useAddStage } from '../../hooks/useTrips'

interface AddStageButtonProps {
  onSuccess?: () => void
}

export function AddStageButton({ onSuccess }: AddStageButtonProps) {
  const { t } = useTranslation('trips')
  const { requestLocation, isLoading: locationLoading } = useLocation()
  const { mutate: addStage, isPending: addingStage } = useAddStage()
  const [isProcessing, setIsProcessing] = useState(false)

  const isLoading = locationLoading || addingStage || isProcessing

  const handlePress = async () => {
    setIsProcessing(true)
    try {
      const location = await requestLocation()
      if (!location) {
        Alert.alert(t('errors.addStageFailed'))
        return
      }

      addStage(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          country: location.country,
        },
        {
          onSuccess: () => {
            onSuccess?.()
          },
          onError: () => {
            Alert.alert(t('errors.addStageFailed'))
          },
        }
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <TouchableOpacity
      style={[styles.button, isLoading && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color={colors.white} />
          <Text style={styles.text}>{t('detail.addingStage')}</Text>
        </>
      ) : (
        <>
          <Ionicons name="add-circle" size={20} color={colors.white} />
          <Text style={styles.text}>{t('detail.addStage')}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.medium,
  },
  buttonDisabled: {
    backgroundColor: colors.secondary.light,
  },
  text: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
})
