import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CreateTripModal, TripCard, TripDetailModal } from '../components/trips'
import { EmptyState } from '../components/ui'
import { usePremiumGate } from '../hooks/usePremiumGate'
import { useMyProfile } from '../hooks/useProfiles'
import { useActiveTrip, useMyTrips } from '../hooks/useTrips'
import { colors, fontSize, fontWeight, spacing } from '../styles/theme'
import type { Trip } from '../types/trip'

interface TripsScreenProps {
  onViewTripOnMap?: (trip: Trip) => void
}

export const TripsScreen: React.FC<TripsScreenProps> = ({ onViewTripOnMap }) => {
  const { t } = useTranslation(['trips', 'common'])
  const { data: trips, isLoading, refetch, isRefetching } = useMyTrips()
  const { data: activeTrip } = useActiveTrip()
  const { data: myProfile } = useMyProfile()
  const { canCreateTrip, showPaywall } = usePremiumGate()
  const isVerified = myProfile?.verification_status === 'approved'

  // Modal states
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)

  // Check if user has an active trip (cannot create new one if so)
  const hasActiveTrip = !!activeTrip

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const handleCreatePress = useCallback(async () => {
    // Check trip limit for free users
    const tripsCount = trips?.length ?? 0
    if (!canCreateTrip(tripsCount)) {
      Alert.alert(t('common:premium.upgradeTitle'), t('common:premium.tripsLimit'))
      await showPaywall()
      return
    }

    // Check location permission before opening modal
    const { status } = await Location.getForegroundPermissionsAsync()
    if (status === 'denied') {
      Alert.alert(
        t('common:location.tripRequiresLocation.title'),
        t('common:location.tripRequiresLocation.message'),
        [
          { text: t('common:location.tripRequiresLocation.cancel'), style: 'cancel' },
          {
            text: t('common:location.tripRequiresLocation.openSettings'),
            onPress: () => Linking.openSettings(),
          },
        ]
      )
      return
    }

    setCreateModalVisible(true)
  }, [trips, canCreateTrip, showPaywall, t])

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
      if (!isVerified) {
        Alert.alert(
          t('common:verification.mapBlockedTitle'),
          t('common:verification.mapBlockedMessage') + '\n' + t('common:verification.mapBlockedNote')
        )
        return
      }
      // Close the modal first
      setDetailModalVisible(false)
      setSelectedTripId(null)
      // Then navigate to map with the trip
      onViewTripOnMap?.(trip)
    },
    [isVerified, onViewTripOnMap, t]
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
      return (
        <EmptyState
          icon="map-outline"
          title={t('emptyState.title')}
          description={t('emptyState.description')}
          actionLabel={t('emptyState.createButton')}
          onAction={handleCreatePress}
          actionDisabled={hasActiveTrip}
        />
      )
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
