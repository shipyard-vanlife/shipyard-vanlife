import React, { useMemo } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../../styles/theme'
import { formatDateLong } from '../../../utils/formatDate'
import type { PublicTrip, PublicTripStage } from '../../../types/trip'
import { VisitorTripStageItem } from './VisitorTripStageItem'
import { TripStats } from '../../trips/TripStats'
import { TripStatusBadge } from '../../trips/TripStatusBadge'
import { TripCountryFlags } from '../../trips/TripCountryFlags'

interface VisitorTripDetailModalProps {
  visible: boolean
  trip: PublicTrip | null
  isLoading?: boolean
  onClose: () => void
  onViewStageOnMap?: (stage: PublicTripStage, trip: PublicTrip) => void
  onViewAllOnMap?: (trip: PublicTrip) => void
}

export function VisitorTripDetailModal({
  visible,
  trip,
  isLoading = false,
  onClose,
  onViewStageOnMap,
  onViewAllOnMap,
}: VisitorTripDetailModalProps) {
  const { t } = useTranslation('trips')

  // Format dates
  const { startDate, endDate } = useMemo(() => {
    if (!trip) return { startDate: '', endDate: null }
    return {
      startDate: formatDateLong(trip.start_date),
      endDate: trip.end_date ? formatDateLong(trip.end_date) : null,
    }
  }, [trip])

  // Determine when to show country flag (first stage or country changed)
  const shouldShowFlag = (index: number): boolean => {
    if (!trip?.stages) return false
    const stage = trip.stages[index]
    if (!stage.country) return false
    if (index === 0) return true
    const prevStage = trip.stages[index - 1]
    return stage.country !== prevStage?.country
  }

  if (!visible) return null

  if (isLoading) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.secondary.main} />
          </View>
        </SafeAreaView>
      </Modal>
    )
  }

  if (!trip) return null

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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {trip.name}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Trip Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons
                name={trip.is_active ? 'navigate' : 'flag'}
                size={24}
                color={trip.is_active ? colors.secondary.main : colors.text.muted}
              />
              <View style={styles.statusContainer}>
                <TripStatusBadge isActive={trip.is_active} />
                <TripCountryFlags stages={trip.stages} />
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <TripStats
                daysCount={trip.days_count}
                stagesCount={trip.stages_count}
                distanceKm={trip.total_distance_km}
              />
            </View>

            {/* Dates */}
            <View style={styles.datesContainer}>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.text.tertiary} />
                <Text style={styles.dateLabel}>{t('visitor.startDate')}:</Text>
                <Text style={styles.dateValue}>{startDate}</Text>
              </View>
              {endDate ? (
                <View style={styles.dateRow}>
                  <Ionicons name="calendar" size={16} color={colors.text.tertiary} />
                  <Text style={styles.dateLabel}>{t('visitor.endDate')}:</Text>
                  <Text style={styles.dateValue}>{endDate}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* View All on Map Button */}
          {onViewAllOnMap && trip.stages.length > 0 ? (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => onViewAllOnMap(trip)}
              activeOpacity={0.8}
            >
              <Ionicons name="map-outline" size={20} color={colors.white} />
              <Text style={styles.viewAllButtonText}>{t('visitor.viewAllOnMap')}</Text>
            </TouchableOpacity>
          ) : null}

          {/* Stages List */}
          {trip.stages.length > 0 ? (
            <View style={styles.stagesSection}>
              <Text style={styles.stagesTitle}>{t('detail.stagesTitle')}</Text>
              <View style={styles.stagesList}>
                {trip.stages.map((stage, index) => (
                  <VisitorTripStageItem
                    key={stage.id}
                    stage={stage}
                    index={index}
                    isFirst={index === 0}
                    isLast={index === trip.stages.length - 1}
                    showCountryFlag={shouldShowFlag(index)}
                    onViewOnMap={
                      onViewStageOnMap && trip ? () => onViewStageOnMap(stage, trip) : undefined
                    }
                  />
                ))}
              </View>
            </View>
          ) : null}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.small,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  statsContainer: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  datesContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateLabel: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  dateValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.main,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  viewAllButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  stagesSection: {
    marginTop: spacing.xl,
  },
  stagesTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  stagesList: {
    paddingLeft: spacing.xs,
  },
})
