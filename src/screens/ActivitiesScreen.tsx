import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme'
import { ActivityCard } from '../components/activities/ActivityCard'
import { ActivityDetailModal } from '../components/activities/ActivityDetailModal'
import { CreateActivityModal } from '../components/activities/CreateActivityModal'
import { InvitationCard } from '../components/activities/InvitationCard'
import { useMyActivities, useNearbyActivities, useMyInvitations } from '../hooks/useActivities'
import { useMyFriends } from '../hooks/useConnections'
import { usePremiumGate } from '../hooks/usePremiumGate'
import { useMyProfile } from '../hooks/useProfiles'
import { Activity, ActivityType, ActivityStatus } from '../types/activity'

type TabType = 'nearby' | 'my' | 'invitations'

export const ActivitiesScreen: React.FC = () => {
  const { t } = useTranslation(['activities', 'common'])
  const [activeTab, setActiveTab] = useState<TabType>('nearby')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<'open' | 'full' | 'cancelled' | 'finished' | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showStatusHelp, setShowStatusHelp] = useState(false)

  const { data: myProfile } = useMyProfile()
  const { data: friends } = useMyFriends()
  const { canCreateActivity, canViewNonFriendActivity, showPaywall } = usePremiumGate()
  const { data: nearbyActivities, isLoading: loadingNearby } = useNearbyActivities(
    myProfile?.location?.latitude ?? null,
    myProfile?.location?.longitude ?? null
  )
  const { data: myActivities, isLoading: loadingMy } = useMyActivities()
  const { data: invitations, isLoading: loadingInvitations } = useMyInvitations()

  // Build friend ID set for O(1) lookup
  const friendIds = useMemo(
    () => new Set(friends?.filter(f => f.status === 'accepted').map(f => f.friend_id) ?? []),
    [friends]
  )

  // Filter activities based on active tab
  const getActivitiesForTab = (): Activity[] => {
    switch (activeTab) {
      case 'nearby':
        return nearbyActivities ?? []
      case 'my':
        return myActivities ?? []
      case 'invitations':
        return []
      default:
        return []
    }
  }

  // Filter and search activities
  const filteredActivities = useMemo(() => {
    let result = getActivitiesForTab()

    // Hide finished/cancelled activities from "nearby" tab
    if (activeTab === 'nearby') {
      result = result.filter(activity => activity.status !== 'finished' && activity.status !== 'cancelled')
    }

    // Search by title or location
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        activity =>
          activity.title.toLowerCase().includes(query) ||
          activity.location_name.toLowerCase().includes(query)
      )
    }

    // Filter by type
    if (selectedType) {
      result = result.filter(activity => activity.activity_type === selectedType)
    }

    // Filter by status
    if (selectedStatus) {
      if (selectedStatus === 'full') {
        // Filter for full activities (calculated)
        result = result.filter(activity =>
          activity.max_participants !== null &&
          (activity.current_participants ?? 0) >= activity.max_participants
        )
      } else {
        // Filter by actual DB status
        result = result.filter(activity => activity.status === selectedStatus)
      }
    }

    return result
  }, [searchQuery, selectedType, selectedStatus, nearbyActivities, myActivities, activeTab])

  const isLoading =
    activeTab === 'nearby' ? loadingNearby : activeTab === 'my' ? loadingMy : loadingInvitations

  const handleActivityPress = (activity: Activity) => {
    setSelectedActivity(activity)
  }

  const handleCreateActivity = async () => {
    if (!canCreateActivity) {
      Alert.alert(t('common:premium.upgradeTitle'), t('common:premium.activitiesCreate'))
      await showPaywall()
      return
    }
    setShowCreateModal(true)
  }

  const renderEmptyState = () => {
    let emptyKey: string
    switch (activeTab) {
      case 'nearby':
        emptyKey = 'empty.nearby'
        break
      case 'my':
        emptyKey = 'empty.my'
        break
      case 'invitations':
        emptyKey = 'empty.invitations'
        break
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="calendar-outline" size={56} color={colors.secondary.main} />
        </View>
        <Text style={styles.emptyText}>{t(emptyKey)}</Text>
        {activeTab === 'my' && (
          <TouchableOpacity style={styles.emptyButton} onPress={handleCreateActivity}>
            <Ionicons name="add-circle" size={20} color={colors.white} />
            <Text style={styles.emptyButtonText}>{t('empty.create')}</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  const hasActiveFilters = selectedType !== null || selectedStatus !== null
  const isApproved = myProfile?.verification_status === 'approved'

  if (!isApproved) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('title')}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="shield-checkmark-outline" size={64} color={colors.text.tertiary} />
          <Text style={[styles.title, { fontSize: fontSize.xl, marginTop: spacing.lg }]}>
            {t('verificationPending.title')}
          </Text>
          <Text style={{ fontSize: fontSize.base, color: colors.text.tertiary, marginTop: spacing.sm, textAlign: 'center', paddingHorizontal: spacing.xxxl }}>
            {t('verificationPending.message')}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('title')}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => setShowStatusHelp(true)}
          >
            <Ionicons name="help-circle-outline" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name={showFilters ? 'close' : 'options'}
              size={24}
              color={hasActiveFilters ? colors.white : colors.text.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs - Fixed 3 pills */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsContent}>
          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'nearby' && styles.tabPillActive]}
            onPress={() => setActiveTab('nearby')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="compass"
              size={18}
              color={activeTab === 'nearby' ? colors.white : colors.text.secondary}
            />
            <Text style={[styles.tabPillText, activeTab === 'nearby' && styles.tabPillTextActive]}>
              {t('tabs.nearby')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'my' && styles.tabPillActive]}
            onPress={() => setActiveTab('my')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="person"
              size={18}
              color={activeTab === 'my' ? colors.white : colors.text.secondary}
            />
            <Text style={[styles.tabPillText, activeTab === 'my' && styles.tabPillTextActive]}>
              {t('tabs.my')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'invitations' && styles.tabPillActive]}
            onPress={() => setActiveTab('invitations')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="mail"
              size={18}
              color={activeTab === 'invitations' ? colors.white : colors.text.secondary}
            />
            <Text
              style={[styles.tabPillText, activeTab === 'invitations' && styles.tabPillTextActive]}
            >
              {t('tabs.invitations')}
            </Text>
            {invitations?.filter(inv => inv.status === 'pending').length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {invitations?.filter(inv => inv.status === 'pending').length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar - Minimalist */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.text.tertiary}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters - Collapsible horizontal scroll */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Type Filters */}
          <Text style={styles.filterSectionTitle}>{t('filters.type')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {(
              ['outdoor', 'food', 'skills', 'social', 'sport', 'culture', 'other'] as ActivityType[]
            ).map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
                onPress={() => setSelectedType(selectedType === type ? null : type)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedType === type && styles.filterChipTextActive,
                  ]}
                >
                  {t(`types.${type}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Status Filters */}
          <Text style={styles.filterSectionTitle}>{t('filters.status')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {(['open', 'full', 'cancelled', 'finished'] as ActivityStatus[]).map(status => (
              <TouchableOpacity
                key={status}
                style={[styles.filterChip, selectedStatus === status && styles.filterChipActive]}
                onPress={() => setSelectedStatus(selectedStatus === status ? null : status)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedStatus === status && styles.filterChipTextActive,
                  ]}
                >
                  {t(`status.${status}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {hasActiveFilters && (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setSelectedType(null)
                setSelectedStatus(null)
              }}
            >
              <Ionicons name="refresh" size={16} color={colors.secondary.main} />
              <Text style={styles.clearFiltersText}>Réinitialiser</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary.main} />
        </View>
      ) : activeTab === 'invitations' ? (
        <FlatList
          data={invitations ?? []}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <InvitationCard
              invitation={item}
              onPress={() => {
                // Find the activity and open detail modal
                const activity = nearbyActivities?.find(a => a.id === item.activity_id)
                if (activity) {
                  handleActivityPress(activity)
                }
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const isOwnerOrFriend =
              item.creator_id === myProfile?.id || friendIds.has(item.creator_id)
            const isRestricted =
              activeTab === 'nearby' && !isOwnerOrFriend && !canViewNonFriendActivity
            return (
              <ActivityCard
                activity={item}
                onPress={() => handleActivityPress(item)}
                isRestricted={isRestricted}
              />
            )
          }}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB - Floating action button with pulse animation */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateActivity}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      <CreateActivityModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} />

      <ActivityDetailModal
        activityId={selectedActivity?.id ?? null}
        onClose={() => setSelectedActivity(null)}
        isRestricted={
          selectedActivity
            ? activeTab === 'nearby' &&
              selectedActivity.creator_id !== myProfile?.id &&
              !friendIds.has(selectedActivity.creator_id) &&
              !canViewNonFriendActivity
            : false
        }
      />

      {/* Status Help Modal */}
      {showStatusHelp && (
        <View style={styles.helpModal}>
          <TouchableOpacity
            style={styles.helpBackdrop}
            onPress={() => setShowStatusHelp(false)}
            activeOpacity={1}
          />
          <View style={styles.helpContent}>
            <View style={styles.helpHeader}>
              <Text style={styles.helpTitle}>{t('help.title')}</Text>
              <TouchableOpacity onPress={() => setShowStatusHelp(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.helpItems}>
              <View style={styles.helpItem}>
                <View style={[styles.helpDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.helpItemText}>
                  <Text style={styles.helpItemBold}>{t('help.open')}</Text> - {t('help.openDesc')}
                </Text>
              </View>
              <View style={styles.helpItem}>
                <View style={[styles.helpDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.helpItemText}>
                  <Text style={styles.helpItemBold}>{t('help.full')}</Text> - {t('help.fullDesc')}
                </Text>
              </View>
              <View style={styles.helpItem}>
                <View style={[styles.helpDot, { backgroundColor: '#DC2626' }]} />
                <Text style={styles.helpItemText}>
                  <Text style={styles.helpItemBold}>{t('help.cancelled')}</Text> - {t('help.cancelledDesc')}
                </Text>
              </View>
              <View style={styles.helpItem}>
                <View style={[styles.helpDot, { backgroundColor: '#666666' }]} />
                <Text style={styles.helpItemText}>
                  <Text style={styles.helpItemBold}>{t('help.finished')}</Text> - {t('help.finishedDesc')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  helpButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  filterButtonActive: {
    backgroundColor: colors.secondary.main,
  },
  tabsContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  tabsContent: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  tabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    gap: spacing.xs,
    ...shadows.medium,
  },
  tabPillActive: {
    backgroundColor: colors.secondary.main,
    ...shadows.large,
  },
  tabPillText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tabPillTextActive: {
    color: colors.white,
  },
  badge: {
    backgroundColor: colors.white,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary.main,
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.medium,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  filtersContainer: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  filterSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterScroll: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.light,
    borderWidth: 1.5,
    borderColor: colors.border.light,
  },
  filterChipActive: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.secondary.main,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  clearFiltersText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.secondary.main,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: 120,
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl * 2,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary.light + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    fontWeight: '500',
    lineHeight: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    ...shadows.medium,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl + 60,
    right: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary.main,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  helpModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  helpBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  helpContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    maxWidth: 400,
    width: '90%',
    ...shadows.large,
    elevation: 10,
  },
  helpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  helpTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  helpItems: {
    gap: spacing.md,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  helpDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  helpItemText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    flex: 1,
  },
  helpItemBold: {
    fontWeight: '700',
    color: colors.text.primary,
  },
})
