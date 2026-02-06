import React, { useState } from 'react'
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../styles/theme'
import { useLocation } from '../../hooks/useLocation'
import { usePremiumGate } from '../../hooks/usePremiumGate'
import { useAddStage } from '../../hooks/useTrips'

const MIN_DISTANCE_KM = 5

/** Haversine distance in km between two lat/lng points */
function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

interface AddStageButtonProps {
  stagesCount: number
  lastStageLocation?: { latitude: number; longitude: number } | null
  onSuccess?: () => void
}

export function AddStageButton({ stagesCount, lastStageLocation, onSuccess }: AddStageButtonProps) {
  const { t } = useTranslation(['trips', 'common'])
  const { requestLocation, isLoading: locationLoading } = useLocation()
  const { mutate: addStage, isPending: addingStage } = useAddStage()
  const { canAddStage, maxStages, showPaywall } = usePremiumGate()
  const [isProcessing, setIsProcessing] = useState(false)

  const isLoading = locationLoading || addingStage || isProcessing

  const handlePress = async () => {
    // Check stage limit
    if (!canAddStage(stagesCount)) {
      Alert.alert(
        t('common:premium.upgradeTitle'),
        t('common:premium.stagesLimit', { max: maxStages })
      )
      await showPaywall()
      return
    }

    setIsProcessing(true)
    try {
      const location = await requestLocation()
      if (!location) {
        Alert.alert(t('trips:errors.addStageFailed'))
        return
      }

      // Check minimum distance from last stage
      if (lastStageLocation) {
        const distance = getDistanceKm(
          lastStageLocation.latitude,
          lastStageLocation.longitude,
          location.latitude,
          location.longitude
        )
        if (distance < MIN_DISTANCE_KM) {
          Alert.alert(t('trips:errors.tooCloseToLastStage'))
          return
        }
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
            Alert.alert(t('trips:errors.addStageFailed'))
          },
        }
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handlePress}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <>
            <ActivityIndicator size="small" color={colors.white} />
            <Text style={styles.text}>{t('trips:detail.addingStage')}</Text>
          </>
        ) : (
          <>
            <Ionicons name="add-circle" size={20} color={colors.white} />
            <Text style={styles.text}>{t('trips:detail.addStage')}</Text>
          </>
        )}
      </TouchableOpacity>
      <Text style={styles.counter}>
        {t('common:premium.stagesCounter', { current: stagesCount, max: maxStages })}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    width: '100%',
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
  counter: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
  },
})
