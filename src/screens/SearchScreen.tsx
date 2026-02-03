import React, { useState, useMemo } from 'react'
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
import { BottomSheet } from '../components/BottomSheet'
import { useAllVisibleProfiles, useMyProfile, profileKeys } from '../hooks/useProfiles'
import { useSendConnectionRequest, useMyFriends, useAllConnections } from '../hooks/useConnections'
import { UserProfile, SkillType, ALL_SKILLS } from '../types/user'

type FilterType = 'all' | 'activities' | 'help'

export const SearchScreen: React.FC = () => {
  const { t } = useTranslation(['search', 'common'])
  const queryClient = useQueryClient()
  const { data: myProfile } = useMyProfile()
  const { data: profiles, isLoading, refetch } = useAllVisibleProfiles()
  const { mutate: sendRequest } = useSendConnectionRequest()
  const { data: myFriends } = useMyFriends()
  const { data: allConnections } = useAllConnections()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<SkillType | null>(null)
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [showDistanceModal, setShowDistanceModal] = useState(false)

  const calculateDistance = (from: UserProfile | undefined, to: UserProfile): number => {
    if (!from?.location?.latitude || !to?.location?.latitude) {
      return 0
    }

    const R = 6371e3
    const φ1 = (from.location.latitude * Math.PI) / 180
    const φ2 = (to.location.latitude * Math.PI) / 180
    const Δφ = ((to.location.latitude - from.location.latitude) * Math.PI) / 180
    const Δλ = ((to.location.longitude! - from.location.longitude!) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    const distance = R * c
    return distance
  }

  const filteredProfiles = useMemo(() => {
    if (!profiles) return []

    let result = profiles.filter(p => p.id !== myProfile?.id)

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        p => p.username.toLowerCase().includes(query) || p.van_name?.toLowerCase().includes(query)
      )
    }

    if (activeFilter === 'help' && selectedSkill) {
      result = result.filter(p => p.skills.includes(selectedSkill))
    }

    result.sort((a, b) => {
      const distA = calculateDistance(myProfile || undefined, a)
      const distB = calculateDistance(myProfile || undefined, b)
      return distA - distB
    })

    return result
  }, [profiles, searchQuery, myProfile, activeFilter, selectedSkill])

  const handleAddFriend = async (profileId: string, username: string) => {
    if (myProfile?.verification_status !== 'approved') {
      Alert.alert(t('common:verification.requiredTitle'), t('common:verification.requiredMessage'))
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
  }

  const getConnectionStatus = (profileId: string) => {
    if (!myProfile || !allConnections) {
      return {
        isAlreadyFriend: false,
        isPending: false,
        isReceived: false,
        connectionId: undefined,
      }
    }

    const connection = allConnections.find(
      conn =>
        (conn.sender_id === myProfile.id && conn.receiver_id === profileId) ||
        (conn.receiver_id === myProfile.id && conn.sender_id === profileId)
    )

    if (!connection) {
      return {
        isAlreadyFriend: false,
        isPending: false,
        isReceived: false,
        connectionId: undefined,
      }
    }

    const isPending = connection.status === 'pending'
    const isSentByMe = connection.sender_id === myProfile.id

    return {
      isAlreadyFriend: connection.status === 'accepted',
      isPending: isPending && isSentByMe,
      isReceived: isPending && !isSentByMe,
      connectionId: connection.id,
    }
  }

  const handleProfileSelect = async (profile: UserProfile) => {
    await queryClient.invalidateQueries({ queryKey: profileKeys.byId(profile.id) })
    setSelectedProfile(profile)
  }

  const renderProfileCard = ({ item }: { item: UserProfile }) => {
    const distance = calculateDistance(myProfile || undefined, item)
    const { isAlreadyFriend, isPending, isReceived, connectionId } = getConnectionStatus(item.id)

    return (
      <NomadProfileCard
        profile={item}
        distance={distance}
        onAddFriend={() => handleAddFriend(item.id, item.username)}
        onPress={() => handleProfileSelect(item)}
        isPending={isPending}
        isAlreadyFriend={isAlreadyFriend}
        isReceived={isReceived}
        connectionId={connectionId}
      />
    )
  }

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

      {/* Filter row with pills */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterPillDropdown}
          onPress={() => setShowDistanceModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="location" size={16} color={colors.text.secondary} />
          <Text style={styles.filterPillLabel}>{t('filters.distance')}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterPillDropdown}
          onPress={() => setShowSkillModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="grid" size={16} color={colors.text.secondary} />
          <Text style={styles.filterPillLabel}>{t('filters.activityType')}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterIconButton} activeOpacity={0.7}>
          <Ionicons name="options" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* List of profiles */}
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
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          windowSize={10}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={8}
        />
      )}

      {/* Modal for skill selection */}
      <Modal visible={showSkillModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
              <Text style={styles.modalCloseText}>{t('common:cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Distance modal (placeholder) */}
      <Modal visible={showDistanceModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('filters.selectDistance')}</Text>
            <Text style={styles.modalSubtext}>{t('filters.featureComingSoon')}</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDistanceModal(false)}
            >
              <Text style={styles.modalCloseText}>{t('common:cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BottomSheet for selected profile */}
      {selectedProfile && (
        <BottomSheet profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterPillDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    ...shadows.small,
    minHeight: 44,
  },
  filterPillLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
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
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    width: '85%',
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
  modalSubtext: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
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
