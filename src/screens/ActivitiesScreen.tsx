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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme'
import { ActivityCard } from '../components/activities/ActivityCard'
import { ActivityDetailModal } from '../components/activities/ActivityDetailModal'
import { CreateActivityModal } from '../components/activities/CreateActivityModal'
import { InvitationCard } from '../components/activities/InvitationCard'
import { useMyActivities, useNearbyActivities, useMyInvitations } from '../hooks/useActivities'
import { useMyProfile } from '../hooks/useProfiles'
import { Activity, ActivityType, ActivityStatus } from '../types/activity'

type TabType = 'nearby' | 'my' | 'invitations'

export const ActivitiesScreen: React.FC = () => {
  const { t } = useTranslation('activities')
  const [activeTab, setActiveTab] = useState<TabType>('nearby')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<ActivityStatus | null>(null)

  const { data: myProfile } = useMyProfile()
  const { data: nearbyActivities, isLoading: loadingNearby } = useNearbyActivities(
    myProfile?.location?.latitude ?? null,
    myProfile?.location?.longitude ?? null
  )
  const { data: myActivities, isLoading: loadingMy } = useMyActivities()
  const { data: invitations, isLoading: loadingInvitations } = useMyInvitations()

  // Filter activities based on active tab
  const getActivitiesForTab = (): Activity[] => {
    switch (activeTab) {
      case 'nearby':
        return nearbyActivities ?? []
      case 'my':
        return myActivities ?? []
      case 'invitations':
        // TODO: Filter activities where user has pending invitation
        return []
      default:
        return []
    }
  }

  // Filter and search activities
  const filteredActivities = useMemo(() => {
    let result = getActivitiesForTab()

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
      result = result.filter(activity => activity.status === selectedStatus)
    }

    return result
  }, [searchQuery, selectedType, selectedStatus, nearbyActivities, myActivities, activeTab])

  const isLoading =
    activeTab === 'nearby' ? loadingNearby : activeTab === 'my' ? loadingMy : loadingInvitations

  const handleActivityPress = (activity: Activity) => {
    setSelectedActivity(activity)
  }

  const handleCreateActivity = () => {
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
        <Ionicons name="calendar-outline" size={64} color={colors.text.tertiary} />
        <Text style={styles.emptyText}>{t(emptyKey)}</Text>
        {activeTab === 'my' && (
          <TouchableOpacity style={styles.createButton} onPress={handleCreateActivity}>
            <Text style={styles.createButtonText}>{t('empty.create')}</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('title')}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nearby' && styles.tabActive]}
          onPress={() => setActiveTab('nearby')}
        >
          <Text style={[styles.tabText, activeTab === 'nearby' && styles.tabTextActive]}>
            {t('tabs.nearby')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && styles.tabActive]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
            {t('tabs.my')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'invitations' && styles.tabActive]}
          onPress={() => setActiveTab('invitations')}
        >
          <View style={{ position: 'relative' }}>
            <Text style={[styles.tabText, activeTab === 'invitations' && styles.tabTextActive]}>
              {t('tabs.invitations')}
            </Text>
            {invitations?.filter(inv => inv.status === 'pending').length > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: -15,
                  right: -10,
                  backgroundColor: colors.secondary.main,
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 5,
                }}
              >
                <Text style={{ color: colors.white, fontSize: 11, fontWeight: 'bold' }}>
                  {invitations?.filter(inv => inv.status === 'pending').length}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
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
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>{t('filters.type')}:</Text>
          <View style={styles.filterChips}>
            {(
              ['outdoor', 'food', 'skills', 'social', 'sport', 'culture', 'other'] as ActivityType[]
            ).map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, selectedType === type && styles.chipActive]}
                onPress={() => setSelectedType(selectedType === type ? null : type)}
              >
                <Text style={[styles.chipText, selectedType === type && styles.chipTextActive]}>
                  {t(`types.${type}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>{t('filters.status')}:</Text>
          <View style={styles.filterChips}>
            {(['open', 'full', 'cancelled', 'finished'] as ActivityStatus[]).map(status => (
              <TouchableOpacity
                key={status}
                style={[styles.chip, selectedStatus === status && styles.chipActive]}
                onPress={() => setSelectedStatus(selectedStatus === status ? null : status)}
              >
                <Text style={[styles.chipText, selectedStatus === status && styles.chipTextActive]}>
                  {t(`status.${status}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

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
          renderItem={({ item }) => (
            <ActivityCard activity={item} onPress={() => handleActivityPress(item)} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleCreateActivity}>
        <Ionicons name="add" size={32} color={colors.white} />
      </TouchableOpacity>

      <CreateActivityModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} />

      <ActivityDetailModal
        activityId={selectedActivity?.id ?? null}
        onClose={() => setSelectedActivity(null)}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.primary.light,
  },
  tabActive: {
    backgroundColor: colors.secondary.main,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: 100, // Space for FAB
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
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  createButton: {
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  createButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterRow: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.light,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  chipActive: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.secondary.main,
  },
  chipText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.white,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary.main,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
})
