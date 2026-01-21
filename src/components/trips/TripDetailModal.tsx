import React from 'react'
import {
  Modal,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme'
import { useEndTrip, useDeleteTrip } from '../../hooks/useTrips'
import type { Trip } from '../../types/trip'
import { TripStatusBadge } from './TripStatusBadge'
import { TripStats } from './TripStats'
import { TripStagesList } from './TripStagesList'
import { AddStageButton } from './AddStageButton'

interface TripDetailModalProps {
  visible: boolean
  trip: Trip | null
  onClose: () => void
}

export function TripDetailModal({ visible, trip, onClose }: TripDetailModalProps) {
  const { t } = useTranslation('trips')
  const { mutate: endTrip, isPending: isEnding } = useEndTrip()
  const { mutate: deleteTrip, isPending: isDeleting } = useDeleteTrip()

  if (!trip) return null

  const startDate = new Date(trip.start_date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const endDate = trip.end_date
    ? new Date(trip.end_date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const handleEndTrip = () => {
    Alert.alert(t('confirmations.endTripTitle'), t('confirmations.endTripMessage'), [
      { text: t('confirmations.cancel'), style: 'cancel' },
      {
        text: t('confirmations.endTripConfirm'),
        onPress: () => {
          endTrip(trip.id, {
            onSuccess: () => {
              onClose()
            },
            onError: () => {
              Alert.alert(t('errors.endFailed'))
            },
          })
        },
      },
    ])
  }

  const handleDeleteTrip = () => {
    Alert.alert(t('confirmations.deleteTripTitle'), t('confirmations.deleteTripMessage'), [
      { text: t('confirmations.cancel'), style: 'cancel' },
      {
        text: t('confirmations.deleteTripConfirm'),
        style: 'destructive',
        onPress: () => {
          deleteTrip(trip.id, {
            onSuccess: () => {
              onClose()
            },
            onError: () => {
              Alert.alert(t('errors.deleteFailed'))
            },
          })
        },
      },
    ])
  }

  const isProcessing = isEnding || isDeleting

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} disabled={isProcessing}>
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
              <TripStatusBadge isActive={trip.is_active} />
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
                <Text style={styles.dateLabel}>Début:</Text>
                <Text style={styles.dateValue}>{startDate}</Text>
              </View>
              {endDate ? (
                <View style={styles.dateRow}>
                  <Ionicons name="calendar" size={16} color={colors.text.tertiary} />
                  <Text style={styles.dateLabel}>Fin:</Text>
                  <Text style={styles.dateValue}>{endDate}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Stages List */}
          <TripStagesList stages={trip.stages} />

          {/* Actions */}
          <View style={styles.actions}>
            {/* Add Stage Button (only for active trips) */}
            {trip.is_active ? (
              <AddStageButton onSuccess={() => {}} />
            ) : null}

            {/* End Trip Button (only for active trips) */}
            {trip.is_active ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.endButton]}
                onPress={handleEndTrip}
                disabled={isProcessing}
              >
                {isEnding ? (
                  <ActivityIndicator size="small" color={colors.warning} />
                ) : (
                  <Ionicons name="stop-circle-outline" size={20} color={colors.warning} />
                )}
                <Text style={[styles.actionButtonText, styles.endButtonText]}>
                  {t('detail.endTrip')}
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Delete Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeleteTrip}
              disabled={isProcessing}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              )}
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                {t('detail.deleteTrip')}
              </Text>
            </TouchableOpacity>
          </View>
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
  infoCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
  actions: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  endButton: {
    backgroundColor: colors.warning + '10',
    borderColor: colors.warning + '30',
  },
  endButtonText: {
    color: colors.warning,
  },
  deleteButton: {
    backgroundColor: colors.error + '10',
    borderColor: colors.error + '30',
  },
  deleteButtonText: {
    color: colors.error,
  },
})
