import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, fontSize, fontWeight, spacing } from '../../styles/theme'
import type { TripStage } from '../../types/trip'
import { TripStageItem } from './TripStageItem'

interface TripStagesListProps {
  stages: TripStage[]
}

export function TripStagesList({ stages }: TripStagesListProps) {
  const { t } = useTranslation('trips')

  if (stages.length === 0) {
    return null
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
