import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, fontSize, fontWeight, spacing } from '../../../styles/theme'
import { useUserTrips } from '../../../hooks/useTrips'
import type { PublicTrip, PublicTripStage } from '../../../types/trip'
import { VisitorTripCard } from './VisitorTripCard'
import { VisitorTripDetailModal } from './VisitorTripDetailModal'

const CARD_GAP = spacing.md

interface ProfileTripsSectionProps {
  userId: string
  onViewStageOnMap?: (stage: PublicTripStage) => void
  onViewAllTripsOnMap?: (trip: PublicTrip) => void
}

export function ProfileTripsSection({
  userId,
  onViewStageOnMap,
  onViewAllTripsOnMap,
}: ProfileTripsSectionProps) {
  const { t } = useTranslation('trips')
  const { data: trips, isLoading } = useUserTrips(userId)

  // Modal state
  const [selectedTrip, setSelectedTrip] = useState<PublicTrip | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const handleTripPress = useCallback((trip: PublicTrip) => {
    setSelectedTrip(trip)
    setModalVisible(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalVisible(false)
    setSelectedTrip(null)
  }, [])

  const handleViewStageOnMap = useCallback(
    (stage: PublicTripStage) => {
      handleCloseModal()
      onViewStageOnMap?.(stage)
    },
    [onViewStageOnMap, handleCloseModal]
  )

  const handleViewAllOnMap = useCallback(
    (trip: PublicTrip) => {
      handleCloseModal()
      onViewAllTripsOnMap?.(trip)
    },
    [onViewAllTripsOnMap, handleCloseModal]
  )

  // Don't render if loading
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('visitor.tripsTitle')}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.secondary.main} />
        </View>
      </View>
    )
  }

  // Don't render if no trips
  if (!trips || trips.length === 0) {
    return null
  }

  const renderTripCard = ({ item }: { item: PublicTrip }) => (
    <VisitorTripCard trip={item} onPress={() => handleTripPress(item)} />
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('visitor.tripsTitle')}</Text>

      <FlatList
        data={trips}
        renderItem={renderTripCard}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
      />

      {/* Trip Detail Modal */}
      <VisitorTripDetailModal
        visible={modalVisible}
        trip={selectedTrip}
        onClose={handleCloseModal}
        onViewStageOnMap={handleViewStageOnMap}
        onViewAllOnMap={handleViewAllOnMap}
      />
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
    paddingHorizontal: spacing.xl,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
