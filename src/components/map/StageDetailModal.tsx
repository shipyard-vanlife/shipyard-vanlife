import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../../styles/theme'
import { TripOverlayStage } from '../../types/map'
import { formatDateLong } from '../../utils/formatDate'

interface StageDetailModalProps {
  stage: TripOverlayStage | null
  tripName: string
  onClose: () => void
}

export const StageDetailModal: React.FC<StageDetailModalProps> = ({ stage, tripName, onClose }) => {
  const { t } = useTranslation('trips')
  const insets = useSafeAreaInsets()

  if (!stage) return null

  const locationText = [stage.city, stage.country].filter(Boolean).join(', ')

  return (
    <Modal visible={!!stage} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.stageTitle}>
                {t('map.stageDetail.title', { number: stage.stageOrder })}
              </Text>
              <Text style={styles.tripName} numberOfLines={1}>
                {tripName}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Location */}
            {locationText ? (
              <View style={styles.section}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="location-outline" size={20} color={colors.secondary.main} />
                </View>
                <Text style={styles.sectionText}>{locationText}</Text>
              </View>
            ) : null}

            {/* Date */}
            <View style={styles.section}>
              <View style={styles.sectionIcon}>
                <Ionicons name="calendar-outline" size={20} color={colors.secondary.main} />
              </View>
              <View>
                <Text style={styles.sectionLabel}>{t('map.stageDetail.arrivedAt')}</Text>
                <Text style={styles.sectionText}>{formatDateLong(stage.arrivedAt)}</Text>
              </View>
            </View>

            {/* Note */}
            <View style={styles.noteSection}>
              <View style={styles.noteLabelRow}>
                <Ionicons name="document-text-outline" size={20} color={colors.secondary.main} />
                <Text style={styles.noteLabel}>{t('map.stageDetail.note')}</Text>
              </View>
              <Text style={[styles.noteText, !stage.note && styles.noNote]}>
                {stage.note ?? t('map.stageDetail.noNote')}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.main,
  },
  headerTextContainer: {
    flex: 1,
  },
  stageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  tripName: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  content: {
    padding: 20,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  sectionText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  noteSection: {
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  noteLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  noteText: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  noNote: {
    fontStyle: 'italic',
    color: colors.text.tertiary,
  },
})
