import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../../styles/theme'
import { TripOverlayStage } from '../../types/map'
import { formatDistance } from '../../utils/distance'
import { formatDateCompact } from '../../utils/formatDate'

interface TripMapOverlayProps {
  tripName: string
  stagesCount: number
  totalDistanceKm: number
  stages: TripOverlayStage[]
  onStageSelect?: (stage: TripOverlayStage) => void
  onClose?: () => void
  /** Callback to go back to the source profile (when viewing a trip from visitor profile) */
  onBackToProfile?: () => void
  /** Username of the source profile (displayed on the back button) */
  sourceUsername?: string | null
}

export const TripMapOverlay: React.FC<TripMapOverlayProps> = ({
  tripName,
  stagesCount,
  totalDistanceKm,
  stages,
  onStageSelect,
  onClose,
  onBackToProfile,
  sourceUsername,
}) => {
  const { t } = useTranslation(['trips', 'home'])
  const insets = useSafeAreaInsets()
  const [isExpanded, setIsExpanded] = useState(false)

  const distanceDisplay = formatDistance(totalDistanceKm, true)
  const showBackButton = onBackToProfile && sourceUsername

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleStagePress = (stage: TripOverlayStage) => {
    onStageSelect?.(stage)
    setIsExpanded(false)
  }

  return (
    <View style={[styles.container, { top: insets.top + 12 }]}>
      <View style={styles.headerRow}>
        {/* Back to profile button - shows when viewing a trip from visitor profile */}
        {showBackButton ? (
          <TouchableOpacity
            style={styles.backToProfileButton}
            onPress={onBackToProfile}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </TouchableOpacity>
        ) : null}

        <View style={[styles.content, isExpanded && styles.contentExpanded]}>
          {/* Header cliquable */}
          <TouchableOpacity style={styles.header} onPress={toggleExpand} activeOpacity={0.7}>
            <View style={styles.textContainer}>
              <Text style={styles.tripName} numberOfLines={1}>
                {tripName}
              </Text>
              <Text style={styles.stats}>
                {t('trips:map.overlay.stages', { count: stagesCount })} • {distanceDisplay}
              </Text>
            </View>
            <View style={styles.expandButton}>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.text.secondary}
              />
            </View>
          </TouchableOpacity>

          {/* Liste des étapes (visible quand expanded) */}
          {isExpanded && (
            <ScrollView
              style={styles.stagesList}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {stages.map((stage, index) => (
                <TouchableOpacity
                  key={stage.id}
                  style={[styles.stageItem, index === stages.length - 1 && styles.stageItemLast]}
                  onPress={() => handleStagePress(stage)}
                  activeOpacity={0.7}
                >
                  <View style={styles.stageNumber}>
                    <Text style={styles.stageNumberText}>{stage.stageOrder}</Text>
                  </View>
                  <View style={styles.stageInfo}>
                    <Text style={styles.stageCity} numberOfLines={1}>
                      {stage.city ?? t('trips:card.noCity')}
                    </Text>
                    <Text style={styles.stageDate}>{formatDateCompact(stage.arrivedAt)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Close button - outside the dropdown on the right */}
        {onClose ? (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color={colors.white} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  backToProfileButton: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.secondary.main,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  contentExpanded: {
    maxHeight: 320,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  tripName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 2,
  },
  stats: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  expandButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.text.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  stagesList: {
    maxHeight: 240,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  stageItemLast: {
    borderBottomWidth: 0,
  },
  stageNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stageNumberText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.white,
  },
  stageInfo: {
    flex: 1,
  },
  stageCity: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  stageDate: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 1,
  },
})
