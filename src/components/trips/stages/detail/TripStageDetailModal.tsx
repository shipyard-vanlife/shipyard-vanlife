import React from 'react'
import { Modal, View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight } from '../../../../styles/theme'
import { StageDetailHeader } from './StageDetailHeader'
import { StageDetailInfo } from './StageDetailInfo'
import { StageDetailNote } from './StageDetailNote'
import { StagePhotoSection } from './photos/StagePhotoSection'
import { StageDetailActions } from './StageDetailActions'
import type { TripStage } from '../../../../types/trip'

interface TripStageDetailModalProps {
  visible: boolean
  stage: TripStage | null
  previousStage: TripStage | null
  onClose: () => void
}

export function TripStageDetailModal({
  visible,
  stage,
  previousStage,
  onClose,
}: TripStageDetailModalProps) {
  const { t } = useTranslation('trips')

  if (!stage) {
    return null
  }

  const isFirstStage = stage.stage_order === 1

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('stageDetail.title', { number: stage.stage_order })}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Stage Header (city, country, date) */}
          <StageDetailHeader
            stageNumber={stage.stage_order}
            city={stage.city}
            country={stage.country}
            arrivedAt={stage.arrived_at}
          />

          {/* Distance/Duration from previous stage */}
          <StageDetailInfo stage={stage} previousStage={previousStage} />

          {/* Photos section */}
          <StagePhotoSection stageId={stage.id} />

          {/* Note section */}
          <StageDetailNote stageId={stage.id} initialNote={stage.note} />

          {/* Delete button */}
          <StageDetailActions
            stageId={stage.id}
            isFirstStage={isFirstStage}
            onDeleted={onClose}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
})
