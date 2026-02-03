import React, { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../styles/theme'
import { NomadProfileCard } from '../components/search/NomadProfileCard'
import { VisitorProfileSheet } from '../components/visitor'
import { useAllVisibleProfiles, useMyProfile, profileKeys } from '../hooks/useProfiles'
import { useSendConnectionRequest, useAllConnections } from '../hooks/useConnections'
import { SkillType, ALL_SKILLS } from '../types/user'
import type { NearbyProfile } from '../types/location'

type FilterType = 'all' | 'activities' | 'help'

interface ConnectionStatus {
  isAlreadyFriend: boolean
  isPending: boolean
  isReceived: boolean
  connectionId: string | undefined
}

const DEFAULT_CONNECTION_STATUS: ConnectionStatus = {
  isAlreadyFriend: false,
  isPending: false,
  isReceived: false,
  connectionId: undefined,
}

// Pure function: haversine distance in meters (module-level, no console.log)
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

// Hoisted separator for FlatList (avoids re-creation)
const ItemSeparator = () => <View style={styles.separator} />

// FlatList layout for fixed-height items
const ITEM_HEIGHT = 100 + spacing.md // approximate card height + separator
const getItemLayout = (_data: any, index: number) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
})

interface ProfileWithDistance {
  profile: NearbyProfile
  distance: number
}

export const SearchScreen: React.FC = () => {
  const { t } = useTranslation(['search', 'common'])
  const queryClient = useQueryClient()
  const { data: myProfile } = useMyProfile()
  const { data: profiles, isLoading, refetch } = useAllVisibleProfiles()
  const { mutate: sendRequest } = useSendConnectionRequest()
  const { data: allConnections } = useAllConnections()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedProfile, setSelectedProfile] = useState<NearbyProfile | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<SkillType | null>(null)
  const [showSkillModal, setShowSkillModal] = useState(false)

  // Build O(1) connection status map
  const connectionStatusMap = useMemo(() => {
    const map = new Map<string, ConnectionStatus>()
    if (!myProfile || !allConnections) return map

    const myId = myProfile.id
    for (const conn of allConnections) {
      const otherId =
        conn.sender_id === myId
          ? conn.receiver_id
          : conn.receiver_id === myId
            ? conn.sender_id
            : null
      if (!otherId) continue

      const isPending = conn.status === 'pending'
      const isSentByMe = conn.sender_id === myId

      map.set(otherId, {
        isAlreadyFriend: conn.status === 'accepted',
        isPending: isPending && isSentByMe,
        isReceived: isPending && !isSentByMe,
        connectionId: conn.id,
      })
    }

    return map
  }, [myProfile?.id, allConnections])

  // Filter + sort profiles, pre-compute distances in single pass
  const filteredProfiles = useMemo((): ProfileWithDistance[] => {
    if (!profiles) return []

    const myId = myProfile?.id
    const myLat = myProfile?.location?.latitude
    const myLng = myProfile?.location?.longitude
    const hasMyLocation = myLat !== undefined && myLng !== undefined

    let result = profiles.filter(p => p.id !== myId)

    // Search by name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        p => p.username.toLowerCase().includes(query) || p.van_name?.toLowerCase().includes(query)
      )
    }

    // Filter by skill
    if (activeFilter === 'help' && selectedSkill) {
      result = result.filter(p => p.skills.includes(selectedSkill))
    }

    // Compute distances once & sort
    const withDistance: ProfileWithDistance[] = result.map(p => {
      const pLat = p.zone_center?.latitude
      const pLng = p.zone_center?.longitude
      const distance =
        hasMyLocation && pLat !== undefined && pLng !== undefined
          ? haversineDistance(myLat!, myLng!, pLat, pLng)
          : 0
      return { profile: p, distance }
    })

    withDistance.sort((a, b) => a.distance - b.distance)

    return withDistance
  }, [
    profiles,
    searchQuery,
    myProfile?.id,
    myProfile?.location?.latitude,
    myProfile?.location?.longitude,
    activeFilter,
    selectedSkill,
  ])

  const handleAddFriend = useCallback(
    (profileId: string, username: string) => {
      if (myProfile?.verification_status !== 'approved') {
        Alert.alert(
          t('common:verification.requiredTitle'),
          t('common:verification.requiredMessage')
        )
        return
      }

      sendRequest(profileId, {
        onSuccess: () => {
          Alert.alert(t('requestSent'), t('requestSentMessage', { name: username }))
          refetch()
        },
        onError: (error: any) => {
          if (error?.message?.includes('Connection already exists')) {
            Alert.alert(t('connectionExists'), t('connectionExistsMessage'))
          } else {
            Alert.alert(t('common:errors.generic'), t('requestError'))
          }
        },
      })
    },
    [myProfile?.verification_status, t, sendRequest, refetch]
  )

  const handleProfileSelect = useCallback(
    async (profile: NearbyProfile) => {
      await queryClient.invalidateQueries({ queryKey: profileKeys.byId(profile.id) })
      setSelectedProfile(profile)
    },
    [queryClient]
  )

  const keyExtractor = useCallback((item: ProfileWithDistance) => item.profile.id, [])

  const renderProfileCard = useCallback(
    ({ item }: { item: ProfileWithDistance }) => {
      const { profile, distance } = item
      const status = connectionStatusMap.get(profile.id) ?? DEFAULT_CONNECTION_STATUS

      return (
        <NomadProfileCard
          profile={profile}
          distance={distance}
          onAddFriend={() => handleAddFriend(profile.id, profile.username)}
          onPress={() => handleProfileSelect(profile)}
          isPending={status.isPending}
          isAlreadyFriend={status.isAlreadyFriend}
          isReceived={status.isReceived}
          connectionId={status.connectionId}
        />
      )
    },
    [connectionStatusMap, handleAddFriend, handleProfileSelect]
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="person-outline" size={20} color={colors.secondary.main} />
          <Text style={styles.headerTitle}>{t('title')}</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="funnel" size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.text.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.text.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Quick filters */}
      <View style={styles.filtersScrollContainer}>
        <TouchableOpacity
          style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
          onPress={() => setActiveFilter('all')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="people"
            size={16}
            color={activeFilter === 'all' ? colors.white : colors.text.primary}
          />
          <Text
            style={[styles.filterPillText, activeFilter === 'all' && styles.filterPillTextActive]}
          >
            {t('filters.all')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, activeFilter === 'activities' && styles.filterPillActive]}
          onPress={() => setActiveFilter('activities')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="fitness"
            size={16}
            color={activeFilter === 'activities' ? colors.white : colors.text.primary}
          />
          <Text
            style={[
              styles.filterPillText,
              activeFilter === 'activities' && styles.filterPillTextActive,
            ]}
          >
            {t('filters.activities')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, activeFilter === 'help' && styles.filterPillActive]}
          onPress={() => {
            setActiveFilter('help')
            setShowSkillModal(true)
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="hand-left"
            size={16}
            color={activeFilter === 'help' ? colors.white : colors.text.primary}
          />
          <Text
            style={[styles.filterPillText, activeFilter === 'help' && styles.filterPillTextActive]}
          >
            {t('filters.help')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary.main} />
        </View>
      ) : filteredProfiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>{t('empty.title')}</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? t('empty.tryDifferentSearch') : t('empty.expandRadius')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProfiles}
          renderItem={renderProfileCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={ItemSeparator}
          getItemLayout={getItemLayout}
          showsVerticalScrollIndicator={false}
          windowSize={10}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={8}
        />
      )}

      {/* Skill selection modal */}
      <Modal visible={showSkillModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('skillModal.title', { defaultValue: 'Choisir une compétence' })}
            </Text>
            <FlatList
              data={ALL_SKILLS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.skillItem}
                  onPress={() => {
                    setSelectedSkill(item)
                    setShowSkillModal(false)
                  }}
                >
                  <Text style={styles.skillText}>{t(`skills:${item}`)}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowSkillModal(false)
                setActiveFilter('all')
                setSelectedSkill(null)
              }}
            >
              <Text style={styles.modalCloseText}>
                {t('common:cancel', { defaultValue: 'Annuler' })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Selected profile bottom sheet */}
      {selectedProfile ? (
        <VisitorProfileSheet
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      ) : null}
    </View>
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
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.primary.main,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    gap: spacing.sm,
    ...shadows.small,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.primary,
    padding: 0,
  },
  filtersScrollContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.main,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.secondary.main,
  },
  filterPillText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  filterPillTextActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
  separator: {
    height: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: fontSize.base,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '80%',
    maxHeight: '70%',
    ...shadows.large,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  skillItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  skillText: {
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  modalCloseButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.text.tertiary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalCloseText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
})
