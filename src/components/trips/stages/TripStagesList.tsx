import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, fontSize, fontWeight, spacing } from '../../../styles/theme'
import type { TripStage } from '../../../types/trip'
import { TripStageItem } from './TripStageItem'

interface TripStagesListProps {
  stages: TripStage[]
  onStagePress?: (stage: TripStage, previousStage: TripStage | null) => void
}

export function TripStagesList({ stages, onStagePress }: TripStagesListProps) {
  const { t } = useTranslation('trips')

  if (stages.length === 0) {
    return null
  }

  // Determine when to show country flag (first stage or country changed)
  const shouldShowFlag = (index: number): boolean => {
    const stage = stages[index]
    if (!stage.country) return false
    if (index === 0) return true // Always show flag for first stage
    const prevStage = stages[index - 1]
    return stage.country !== prevStage?.country
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('detail.stagesTitle')}</Text>
      <View style={styles.list}>
        {stages.map((stage, index) => (
          <TripStageItem
            key={stage.id}
            stage={stage}
            isFirst={index === 0}
            isLast={index === stages.length - 1}
            showCountryFlag={shouldShowFlag(index)}
            onPress={
              onStagePress
                ? () => onStagePress(stage, index > 0 ? stages[index - 1] : null)
                : undefined
            }
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  list: {
    paddingLeft: spacing.xs,
  },
})
