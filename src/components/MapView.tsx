import { Ionicons } from '@expo/vector-icons'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import ClusteredMapView from 'react-native-map-clustering'
import type { Region } from 'react-native-maps'
import RNMapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps'
import { borderRadius, colors, shadows, spacing } from '../styles/theme'
import type { Activity } from '../types/activity'
import type { MapZone, NearbyProfile, ViewportProfilesParams } from '../types/location'
import type { TripOverlayData, TripOverlayStage } from '../types/map'
import { ActivityMarker } from './map/ActivityMarker'
import { ClusterMarker } from './map/ClusterMarker'
import { MyLocationMarker } from './map/MyLocationMarker'
import { ProfileMarker } from './map/ProfileMarker'
import { TripMapOverlay } from './map/TripMapOverlay'
import { TripStageMarker } from './map/TripStageMarker'
import { ZoneBubble } from './map/ZoneBubble'

/** Convert a map Region to bounding box params with 20% buffer */
function regionToViewport(region: Region): ViewportProfilesParams {
  const latBuffer = region.latitudeDelta * 0.2
  const lngBuffer = region.longitudeDelta * 0.2
  return {
    minLat: region.latitude - region.latitudeDelta / 2 - latBuffer,
    maxLat: region.latitude + region.latitudeDelta / 2 + latBuffer,
    minLng: region.longitude - region.longitudeDelta / 2 - lngBuffer,
    maxLng: region.longitude + region.longitudeDelta / 2 + lngBuffer,
  }
}

interface MapViewProps {
  latitude: number | null
  longitude: number | null
  city: string | null
  myAvatarUrl: string | null
  isProfileVisible?: boolean
  zones: MapZone[]
  individualProfiles: NearbyProfile[]
  onProfileSelect: (profile: NearbyProfile) => void
  onZonePress: (zone: MapZone) => void
  showProfiles: boolean
  onToggleProfiles: () => void
  nearbyActivities?: Activity[]
  onActivitySelect?: (activity: Activity) => void
  showActivities: boolean
  onToggleActivities: () => void
  isDataLoading?: boolean
  tripOverlay?: TripOverlayData | null
  onTripOverlayClose?: () => void
  onStagePress?: (stage: TripOverlayStage) => void
  onBackToProfile?: () => void
  sourceProfileUsername?: string | null
  onViewportChange?: (viewport: ViewportProfilesParams) => void
}

export const MapView: React.FC<MapViewProps> = ({
  latitude,
  longitude,
  myAvatarUrl,
  isProfileVisible = true,
  zones,
  individualProfiles,
  onProfileSelect,
  onZonePress,
  showProfiles,
  onToggleProfiles,
  nearbyActivities = [],
  onActivitySelect,
  showActivities,
  onToggleActivities,
  isDataLoading = false,
  tripOverlay,
  onTripOverlayClose,
  onStagePress,
  onBackToProfile,
  sourceProfileUsername,
  onViewportChange,
}) => {
  const { t } = useTranslation('home')
  const mapRef = useRef<RNMapView>(null)

  // Report initial viewport on mount
  useEffect(() => {
    if (latitude !== null && longitude !== null && onViewportChange) {
      onViewportChange(
        regionToViewport({ latitude, longitude, latitudeDelta: 0.2, longitudeDelta: 0.2 })
      )
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Track viewport changes as user pans/zooms
  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      onViewportChange?.(regionToViewport(region))
    },
    [onViewportChange]
  )

  // Zoom to fit trip stages when tripOverlay is set
  useEffect(() => {
    if (tripOverlay && mapRef.current && tripOverlay.stages.length > 0) {
      const coordinates = tripOverlay.stages.map(s => ({
        latitude: s.latitude,
        longitude: s.longitude,
      }))
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 150, right: 50, bottom: 100, left: 50 },
        animated: true,
      })
    }
  }, [tripOverlay])

  // Recenter on user position
  const handleRecenter = useCallback(() => {
    if (latitude === null || longitude === null || !mapRef.current) return
    mapRef.current.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      },
      300
    )
  }, [latitude, longitude])

  // Animate to a specific stage and open its detail
  const handleStageSelect = useCallback(
    (stage: TripOverlayStage) => {
      mapRef.current?.animateToRegion(
        {
          latitude: stage.latitude,
          longitude: stage.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        300
      )
      onStagePress?.(stage)
    },
    [onStagePress]
  )

  // Activity markers data
  const validActivities = useMemo(
    () => nearbyActivities.filter(a => a.location?.latitude && a.location?.longitude),
    [nearbyActivities]
  )

  const isTripMode = !!tripOverlay

  // Custom cluster renderer (for individual markers that still get pixel-clustered)
  const renderCluster = useCallback(
    (cluster: any) => (
      <ClusterMarker
        key={`cluster-${cluster.id}`}
        id={cluster.id}
        geometry={cluster.geometry}
        properties={cluster.properties}
        onPress={cluster.onPress}
      />
    ),
    []
  )

  if (latitude === null || longitude === null) {
    return (
      <View style={[styles.container, styles.noLocation]}>
        <Text style={styles.noLocationText}>{t('map.noLocation')}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ClusteredMapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
        minZoomLevel={2}
        maxZoomLevel={20}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        // Clustering config
        clusteringEnabled={!isTripMode}
        radius={50}
        maxZoom={14}
        minPoints={3}
        clusterColor={colors.secondary.main}
        renderCluster={renderCluster}
        animationEnabled={false}
        preserveClusterPressBehavior={false}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {/* My marker (hidden in trip mode) */}
        {!isTripMode ? (
          <MyLocationMarker
            latitude={latitude}
            longitude={longitude}
            avatarUrl={myAvatarUrl}
            isVisible={isProfileVisible}
          />
        ) : null}

        {/* Zone bubbles (10+ users in ~11km) */}
        {!isTripMode && showProfiles
          ? zones.map(zone => (
              <ZoneBubble
                key={`zone-${zone.center.latitude}-${zone.center.longitude}`}
                zone={zone}
                onPress={() => onZonePress(zone)}
              />
            ))
          : null}

        {/* Individual profile markers (sparse areas) */}
        {!isTripMode && showProfiles
          ? individualProfiles.map(p =>
              p.zone_center ? (
                <ProfileMarker
                  key={p.id}
                  profile={p}
                  latitude={p.zone_center.latitude}
                  longitude={p.zone_center.longitude}
                  onPress={() => onProfileSelect(p)}
                />
              ) : null
            )
          : null}

        {/* Activity markers */}
        {!isTripMode && showActivities
          ? validActivities.map(a => (
              <ActivityMarker key={a.id} activity={a} onPress={() => onActivitySelect?.(a)} />
            ))
          : null}

        {/* Trip Polyline */}
        {tripOverlay && tripOverlay.stages.length > 1 ? (
          <Polyline
            coordinates={tripOverlay.stages.map(s => ({
              latitude: s.latitude,
              longitude: s.longitude,
            }))}
            strokeColor={colors.secondary.main}
            strokeWidth={3}
          />
        ) : null}

        {/* Trip Stage Markers */}
        {tripOverlay?.stages.map((stage, index) => (
          <TripStageMarker
            key={stage.id}
            coordinate={{ latitude: stage.latitude, longitude: stage.longitude }}
            stageNumber={stage.stageOrder}
            isFirst={index === 0}
            isLast={index === tripOverlay.stages.length - 1}
            onPress={() => onStagePress?.(stage)}
          />
        ))}
      </ClusteredMapView>

      {/* Loading indicator */}
      {isDataLoading ? (
        <View style={styles.loadingPill}>
          <ActivityIndicator size="small" color={colors.secondary.main} />
          <Text style={styles.loadingText}>{t('map.loading')}</Text>
        </View>
      ) : null}

      {/* Map controls column (hidden in trip mode) */}
      {!isTripMode ? (
        <View style={styles.controlsColumn}>
          <TouchableOpacity
            style={[styles.controlButton, showProfiles ? styles.controlButtonActive : null]}
            onPress={onToggleProfiles}
            activeOpacity={0.8}
          >
            <Ionicons
              name="people"
              size={20}
              color={showProfiles ? colors.white : colors.text.tertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, showActivities ? styles.controlButtonActive : null]}
            onPress={onToggleActivities}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar"
              size={20}
              color={showActivities ? colors.white : colors.text.tertiary}
            />
          </TouchableOpacity>

          <View style={styles.controlSeparator} />

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleRecenter}
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Trip Map Overlay */}
      {tripOverlay ? (
        <TripMapOverlay
          tripName={tripOverlay.tripName}
          stagesCount={tripOverlay.stagesCount}
          totalDistanceKm={tripOverlay.totalDistanceKm}
          stages={tripOverlay.stages}
          onStageSelect={handleStageSelect}
          onClose={onTripOverlayClose}
          onBackToProfile={onBackToProfile}
          sourceUsername={sourceProfileUsername}
        />
      ) : null}
    </View>
  )
}

const CONTROL_SIZE = 44

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  map: {
    flex: 1,
  },
  noLocation: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLocationText: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingPill: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
    ...shadows.medium,
  },
  loadingText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  controlsColumn: {
    position: 'absolute',
    bottom: 100,
    right: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  controlButton: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
    borderRadius: CONTROL_SIZE / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  controlButtonActive: {
    backgroundColor: colors.secondary.main,
  },
  controlSeparator: {
    width: 24,
    height: 1,
    backgroundColor: colors.border.light,
  },
})
