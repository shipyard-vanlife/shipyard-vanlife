import React, { useState, useMemo, useCallback, useEffect } from 'react'
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
  Image,
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
  const { data: profiles, isLoading, refetch } = useAllVisibleProfiles(
    myProfile?.location?.latitude,
    myProfile?.location?.longitude
  )
  const { mutate: sendRequest } = useSendConnectionRequest()
  const { data: allConnections } = useAllConnections()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedProfile, setSelectedProfile] = useState<NearbyProfile | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<SkillType | null>(null)
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [showDistanceModal, setShowDistanceModal] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(25)

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

  // Paginated profiles - only show first N items
  const paginatedProfiles = useMemo(() => {
    return filteredProfiles.slice(0, displayLimit)
  }, [filteredProfiles, displayLimit])

  // Load more when reaching end of list
  const handleLoadMore = useCallback(() => {
    if (displayLimit < filteredProfiles.length) {
      setDisplayLimit((prev) => prev + 25)
    }
  }, [displayLimit, filteredProfiles.length])

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayLimit(25)
  }, [searchQuery, activeFilter, selectedSkill])

  return (
    <View style={styles.container}>
      {/* Header with large title and avatar */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{t('title')}</Text>
            <View style={styles.subtitleContainer}>
              <Text style={styles.headerSubtitle}>{t('subtitle')}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            {myProfile?.avatar_url ? (
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: myProfile.avatar_url }} style={styles.headerAvatar} />
                <View style={styles.onlineDot} />
              </View>
            ) : (
              <View style={styles.avatarWrapper}>
                <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {myProfile?.username?.charAt(0).toUpperCase() || 'M'}
                  </Text>
                </View>
                <View style={styles.onlineDot} />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Quick filters */}
      <View style={styles.filtersScrollContainer}>
        <TouchableOpacity
          style={styles.filterPill}
          onPress={() => setShowSkillModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="grid" size={16} color={colors.text.secondary} />
          <Text style={styles.filterPillLabel}>{t('filters.skillsFilter')}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterIconButton} activeOpacity={0.7}>
          <Ionicons name="options" size={20} color={colors.text.secondary} />
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
          data={paginatedProfiles}
          renderItem={renderProfileCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={ItemSeparator}
          getItemLayout={getItemLayout}
          showsVerticalScrollIndicator={false}
          windowSize={10}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={25}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            displayLimit < filteredProfiles.length ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={colors.secondary.main} />
              </View>
            ) : null
          }
        />
      )}

      {/* Skill selection modal */}
      <Modal visible={showSkillModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowSkillModal(false)
            setActiveFilter('all')
            setSelectedSkill(null)
          }}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>{t('skillModal.title')}</Text>
            <FlatList
              data={ALL_SKILLS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.skillItem}
                  onPress={() => {
                    setSelectedSkill(item)
                    setActiveFilter('help')
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
              <Text style={styles.modalCloseText}>{t('filters.cancel')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
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
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.primary.main,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitleContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.border.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  headerRight: {
    marginLeft: spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
  },
  headerAvatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.small,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.secondary.light,
  },
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.small,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
  filtersScrollContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    ...shadows.small,
  },
  filterPillLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  filterIconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  separator: {
    height: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreContainer: {
    paddingVertical: spacing.xl,
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    width: '90%',
    maxHeight: '65%',
    ...shadows.large,
  },
  modalTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  modalSubtext: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  skillItem: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    borderRadius: borderRadius.sm,
  },
  skillText: {
    fontSize: fontSize.base,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  modalCloseButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.small,
  },
  modalCloseText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
})
