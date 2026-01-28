import { Ionicons } from '@expo/vector-icons'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CreateTripModal, TripCard, TripDetailModal, TripEmptyState } from '../components/trips'
import { useActiveTrip, useMyTrips } from '../hooks/useTrips'
import { colors, fontSize, fontWeight, spacing } from '../styles/theme'
import type { Trip } from '../types/trip'

interface TripsScreenProps {
  onViewTripOnMap?: (trip: Trip) => void
}

export const TripsScreen: React.FC<TripsScreenProps> = ({ onViewTripOnMap }) => {
  const { t } = useTranslation('trips')
  const { data: trips, isLoading, refetch, isRefetching } = useMyTrips()
  const { data: activeTrip } = useActiveTrip()

  // Modal states
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)

  // Check if user has an active trip (cannot create new one if so)
  const hasActiveTrip = !!activeTrip

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const handleCreatePress = useCallback(() => {
    setCreateModalVisible(true)
  }, [])

  const handleTripPress = useCallback((trip: Trip) => {
    setSelectedTripId(trip.id)
    setDetailModalVisible(true)
  }, [])

  const handleDetailClose = useCallback(() => {
    setDetailModalVisible(false)
    setSelectedTripId(null)
  }, [])

  const handleViewTripOnMap = useCallback(
    (trip: Trip) => {
      // Close the modal first
      setDetailModalVisible(false)
      setSelectedTripId(null)
      // Then navigate to map with the trip
      onViewTripOnMap?.(trip)
    },
    [onViewTripOnMap]
  )

  const handleCreateClose = useCallback(() => {
    setCreateModalVisible(false)
    // Refetch to get the new trip
    refetch()
  }, [refetch])

  const renderTripItem = useCallback(
    ({ item }: { item: Trip }) => <TripCard trip={item} onPress={() => handleTripPress(item)} />,
    [handleTripPress]
  )

  const keyExtractor = useCallback((item: Trip) => item.id, [])

  // Render header with title and create button
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>{t('screen.title')}</Text>
      <TouchableOpacity
        style={[styles.addButton, hasActiveTrip && styles.addButtonDisabled]}
        onPress={handleCreatePress}
        disabled={hasActiveTrip}
      >
        <Ionicons
          name="add"
          size={24}
          color={hasActiveTrip ? colors.text.disabled : colors.white}
        />
      </TouchableOpacity>
    </View>
  )

  // Render content based on state
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary.main} />
        </View>
      )
    }

    if (!trips || trips.length === 0) {
      return <TripEmptyState onCreatePress={handleCreatePress} disabled={hasActiveTrip} />
    }

    return (
      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.secondary.main}
            colors={[colors.secondary.main]}
          />
        }
      />
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      {renderContent()}

      {/* Create Trip Modal */}
      <CreateTripModal
        visible={createModalVisible}
        onClose={handleCreateClose}
        onSuccess={handleCreateClose}
      />

      {/* Trip Detail Modal */}
      <TripDetailModal
        visible={detailModalVisible}
        tripId={selectedTripId}
        onClose={handleDetailClose}
        onViewOnMap={handleViewTripOnMap}
      />
    </SafeAreaView>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.card,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.border.main,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
  },
})
