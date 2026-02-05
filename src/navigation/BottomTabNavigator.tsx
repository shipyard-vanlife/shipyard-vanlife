import React, { useMemo } from 'react'
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, shadows } from '../styles/theme'
import { useMyFriends } from '../hooks/useConnections'
import { useRealtimeConnections } from '../hooks/useRealtimeConnections'
import { useMyInvitations } from '../hooks/useActivities'
import { useMyActivityChats } from '../hooks/useActivityChat'

type TabName = 'trips' | 'home' | 'activities' | 'chat' | 'search' | 'profile'

interface BottomTabNavigatorProps {
  activeTab: TabName
  onTabChange: (tab: TabName) => void
}

interface TabConfig {
  name: TabName
  icon: keyof typeof Ionicons.glyphMap
  iconActive: keyof typeof Ionicons.glyphMap
}

const tabs: TabConfig[] = [
  { name: 'trips', icon: 'map-outline', iconActive: 'map' },
  { name: 'home', icon: 'home-outline', iconActive: 'home' },
  { name: 'activities', icon: 'calendar-outline', iconActive: 'calendar' },
  { name: 'chat', icon: 'chatbubbles-outline', iconActive: 'chatbubbles' },
  { name: 'search', icon: 'search-outline', iconActive: 'search' },
  { name: 'profile', icon: 'person-outline', iconActive: 'person' },
]

export const BottomTabNavigator: React.FC<BottomTabNavigatorProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { data: friends } = useMyFriends()
  const { data: invitations } = useMyInvitations()
  const { data: activityChats } = useMyActivityChats()

  // Active le realtime pour mettre à jour le badge en temps réel
  useRealtimeConnections()

  const totalUnreadCount = useMemo(() => {
    const friendsUnread = friends?.reduce((total, friend) => total + (friend.unread_count || 0), 0) || 0
    const activityUnread = activityChats?.reduce((total, chat) => total + (chat.unread_count || 0), 0) || 0
    return friendsUnread + activityUnread
  }, [friends, activityChats])

  const pendingInvitationsCount = useMemo(
    () => invitations?.filter(inv => inv.status === 'pending').length || 0,
    [invitations]
  )

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.name
          const showChatBadge = tab.name === 'chat' && totalUnreadCount > 0
          const showActivitiesBadge = tab.name === 'activities' && pendingInvitationsCount > 0

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => onTabChange(tab.name)}
              activeOpacity={0.7}
            >
              <View>
                <Ionicons
                  name={isActive ? tab.iconActive : tab.icon}
                  size={26}
                  color={isActive ? colors.secondary.main : colors.text.tertiary}
                />
                {showChatBadge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </Text>
                  </View>
                )}
                {showActivitiesBadge && (
                  <View key={`activities-badge-${pendingInvitationsCount}`} style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {pendingInvitationsCount > 99 ? '99+' : pendingInvitationsCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...shadows.medium,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: colors.secondary.main,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
})
