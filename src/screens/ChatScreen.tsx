import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import {
  useMyFriends,
  useConnectionRequests,
  useConnectionSlotsUsed,
  useAcceptConnection,
  useRejectConnection,
  useDeleteConnection,
} from '../hooks/useConnections'
import { useMyProfile, profileKeys } from '../hooks/useProfiles'
import { Friend, ConnectionRequest } from '../types/chat'
import { VisitorProfileSheet } from '../components/visitor'
import { ConversationScreen } from './ConversationScreen'
import { ActivityChatScreen } from './ActivityChatScreen'
import { useMyActivityChats } from '../hooks/useActivityChat'
import { ACTIVITY_TYPE_ICONS, ACTIVITY_TYPE_COLORS } from '../types/activity'
import type { ActivityChatPreview } from '../types/activityChat'
import { usePremiumGate } from '../hooks/usePremiumGate'
import { colors } from '../styles/theme'
import type { NotificationNavigationData } from '../types/notification'

type ChatTab = 'friends' | 'groups' | 'requests'

interface ChatScreenProps {
  notificationIntent?: NotificationNavigationData | null
  onClearNotificationIntent?: () => void
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  notificationIntent,
  onClearNotificationIntent,
}) => {
const { t } = useTranslation(['common', 'chat'])
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<ChatTab>('friends')
  const [selectedFriend, setSelectedFriend] = useState<{
    friendId: string
    connectionId: string
  } | null>(null)

  const handleFriendSelect = useCallback(
    async (friendId: string, connectionId: string) => {
      await queryClient.invalidateQueries({ queryKey: profileKeys.byId(friendId) })
      setSelectedFriend({ friendId, connectionId })
    },
    [queryClient]
  )
  const [openConversation, setOpenConversation] = useState<{
    connectionId: string
    friendName: string
    friendAvatar: string | null
    friendId: string
  } | null>(null)
  const [openActivityChat, setOpenActivityChat] = useState<string | null>(null)

  const { data: friends, isLoading: loadingFriends, refetch: refetchFriends } = useMyFriends()
  const {
    data: requests,
    isLoading: loadingRequests,
    refetch: refetchRequests,
  } = useConnectionRequests()
  const { data: activityChats, isLoading: loadingActivityChats } = useMyActivityChats()
  const { mutate: acceptConnection } = useAcceptConnection()
  const { mutate: rejectConnection } = useRejectConnection()
  const { mutate: deleteConnection } = useDeleteConnection()
  const { data: myProfile } = useMyProfile()
  const { canAddFriend, showPaywall } = usePremiumGate()
  const slotsUsed = useConnectionSlotsUsed()

  const handleAcceptConnection = useCallback(
    async (connectionId: string) => {
      if (myProfile?.verification_status !== 'approved') {
        Alert.alert(t('verification.requiredTitle'), t('verification.requiredMessage'))
        return
      }
      // Check friend limit for free users (accepted + pending sent)
      if (!canAddFriend(slotsUsed)) {
        Alert.alert(t('premium.upgradeTitle'), t('premium.friendsLimit'))
        await showPaywall()
        return
      }
      acceptConnection(connectionId)
    },
    [myProfile?.verification_status, t, acceptConnection, slotsUsed, canAddFriend, showPaywall]
  )

  // Build lookup map for O(1) friend access by connectionId
  const friendsByConnectionId = useMemo(
    () => new Map(friends?.map(f => [f.connection_id, f]) ?? []),
    [friends]
  )

  // Refetch data when switching tabs
  useEffect(() => {
    if (activeTab === 'friends') {
      refetchFriends()
    } else {
      refetchRequests()
    }
  }, [activeTab])

  // Handle notification deep link
  useEffect(() => {
    if (!notificationIntent) return

    if (notificationIntent.screen === 'chat' && notificationIntent.connectionId) {
      const friend = friends?.find((f) => f.connection_id === notificationIntent.connectionId)
      if (friend) {
        setOpenConversation({
          connectionId: friend.connection_id,
          friendName: friend.friend_username,
          friendAvatar: friend.friend_avatar_url,
          friendId: friend.friend_id,
        })
      }
      onClearNotificationIntent?.()
    } else if (notificationIntent.screen === 'activityChat' && notificationIntent.activityId) {
      setActiveTab('groups')
      setOpenActivityChat(notificationIntent.activityId)
      onClearNotificationIntent?.()
    } else if (notificationIntent.screen === 'connections') {
      setActiveTab('requests')
      onClearNotificationIntent?.()
    }
  }, [notificationIntent, friends, onClearNotificationIntent])

  const renderFriendItem = useCallback(
    ({ item }: { item: Friend }) => (
      <View style={styles.friendCard}>
        <TouchableOpacity
          onPress={() => {
            if (item.status === 'accepted') {
              handleFriendSelect(item.friend_id, item.connection_id)
            }
          }}
        >
          {item.friend_avatar_url ? (
            <Image source={{ uri: item.friend_avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={24} color={colors.text.tertiary} />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.friendText}
          onPress={() => {
            if (item.status === 'accepted') {
              setOpenConversation({
                connectionId: item.connection_id,
                friendName: item.friend_username,
                friendAvatar: item.friend_avatar_url,
                friendId: item.friend_id,
              })
            }
          }}
        >
          <View style={styles.friendNameRow}>
            <Text style={styles.friendName}>{item.friend_username}</Text>
            {item.status === 'pending' ? (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>{t('chat:status.pending')}</Text>
              </View>
            ) : null}
          </View>
          {item.last_message ? (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.last_message}
            </Text>
          ) : (
            <Text style={styles.noMessage}>
              {item.status === 'pending'
                ? t('chat:status.requestSent')
                : t('chat:status.noMessage')}
            </Text>
          )}
        </TouchableOpacity>

        {item.status === 'pending' ? (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => deleteConnection(item.connection_id)}
          >
            <Ionicons name="close" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
        ) : item.unread_count > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread_count}</Text>
          </View>
        ) : null}
      </View>
    ),
    [t, handleFriendSelect, deleteConnection]
  )

  const renderRequestItem = useCallback(
    ({ item }: { item: ConnectionRequest }) => (
      <View style={styles.requestCard}>
        <View style={styles.requestTopRow}>
          <TouchableOpacity
            onPress={() => {
              handleFriendSelect(item.sender_id, item.connection_id)
            }}
          >
            {item.sender_avatar_url ? (
              <Image source={{ uri: item.sender_avatar_url }} style={styles.requestAvatar} />
            ) : (
              <View style={[styles.requestAvatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={28} color={colors.text.tertiary} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.requestTextContainer}>
            <View style={styles.requestHeader}>
              <Text style={styles.requestName}>{item.sender_username}</Text>
              <Ionicons name="person-add" size={18} color={colors.secondary.main} />
            </View>
            <Text style={styles.requestMessage}>{t('chat:request.title')}</Text>
            <Text style={styles.requestDate}>
              {new Date(item.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.requestActions}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAcceptConnection(item.connection_id)}
          >
            <Ionicons name="checkmark" size={22} color={colors.white} />
            <Text style={styles.actionButtonText}>{t('chat:request.accept')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => rejectConnection(item.connection_id)}
          >
            <Ionicons name="close" size={22} color={colors.white} />
            <Text style={styles.actionButtonText}>{t('chat:request.reject')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [t, handleFriendSelect, handleAcceptConnection, rejectConnection]
  )

  const renderActivityChatItem = useCallback(
    ({ item }: { item: ActivityChatPreview }) => {
      const iconName =
        ACTIVITY_TYPE_ICONS[item.activity_type as keyof typeof ACTIVITY_TYPE_ICONS] ??
        'ellipsis-horizontal'
      const iconColor =
        ACTIVITY_TYPE_COLORS[item.activity_type as keyof typeof ACTIVITY_TYPE_COLORS] ?? '#666666'

      return (
        <TouchableOpacity
          style={styles.friendCard}
          onPress={() => setOpenActivityChat(item.activity_id)}
          activeOpacity={0.7}
        >
          <View style={[styles.activityIconContainer, { backgroundColor: iconColor }]}>
            <Ionicons name={iconName as any} size={22} color={colors.white} />
          </View>

          <View style={styles.friendText}>
            <Text style={styles.friendName} numberOfLines={1}>
              {item.activity_title}
            </Text>
            {item.last_message ? (
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.last_message}
              </Text>
            ) : (
              <Text style={styles.noMessage}>{t('chat:status.noMessage')}</Text>
            )}
          </View>

          {item.unread_count > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread_count}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      )
    },
    [t]
  )

  const friendKeyExtractor = useCallback((item: Friend) => item.connection_id, [])
  const requestKeyExtractor = useCallback((item: ConnectionRequest) => item.connection_id, [])
  const activityChatKeyExtractor = useCallback((item: ActivityChatPreview) => item.activity_id, [])

  const renderContent = () => {
    if (activeTab === 'friends') {
      if (loadingFriends) {
        return (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.secondary.main} />
          </View>
        )
      }

      if (!friends || friends.length === 0) {
        return (
          <View style={styles.centerContainer}>
            <Ionicons name="people-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>{t('chat:empty.friends.title')}</Text>
            <Text style={styles.emptyText}>{t('chat:empty.friends.message')}</Text>
          </View>
        )
      }

      return (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={friendKeyExtractor}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={15}
        />
      )
    } else if (activeTab === 'groups') {
      if (loadingActivityChats) {
        return (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.secondary.main} />
          </View>
        )
      }

      if (!activityChats || activityChats.length === 0) {
        return (
          <View style={styles.centerContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>{t('chat:empty.groups.title')}</Text>
            <Text style={styles.emptyText}>{t('chat:empty.groups.message')}</Text>
          </View>
        )
      }

      return (
        <FlatList
          data={activityChats}
          renderItem={renderActivityChatItem}
          keyExtractor={activityChatKeyExtractor}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={15}
        />
      )
    } else {
      if (loadingRequests) {
        return (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.secondary.main} />
          </View>
        )
      }

      if (!requests || requests.length === 0) {
        return (
          <View style={styles.centerContainer}>
            <Ionicons name="mail-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>{t('chat:empty.requests.title')}</Text>
            <Text style={styles.emptyText}>{t('chat:empty.requests.message')}</Text>
          </View>
        )
      }

      return (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={requestKeyExtractor}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={15}
        />
      )
    }
  }

  if (openConversation) {
    return (
      <ConversationScreen
        route={{
          params: {
            connectionId: openConversation.connectionId,
            friendName: openConversation.friendName,
            friendAvatar: openConversation.friendAvatar,
            friendId: openConversation.friendId,
          },
        }}
        navigation={{
          goBack: () => setOpenConversation(null),
        }}
      />
    )
  }

  if (openActivityChat) {
    return (
      <ActivityChatScreen
        route={{
          params: {
            activityId: openActivityChat,
          },
        }}
        navigation={{
          goBack: () => setOpenActivityChat(null),
        }}
      />
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
            {t('chat:tabs.friends')}
            {friends && friends.length > 0 ? (
              <Text style={styles.tabBadge}> ({friends.length})</Text>
            ) : null}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.tabActive]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.tabTextActive]}>
            {t('chat:tabs.groups')}
            {activityChats && activityChats.length > 0 ? (
              <Text style={styles.tabBadge}> ({activityChats.length})</Text>
            ) : null}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            {t('chat:tabs.requests')}
            {requests && requests.length > 0 ? (
              <Text style={styles.tabBadge}> ({requests.length})</Text>
            ) : null}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>{renderContent()}</View>

      {selectedFriend ? (
        <VisitorProfileSheet
          profileId={selectedFriend.friendId}
          onClose={() => setSelectedFriend(null)}
          onMessage={(connectionId) => {
            const friend = friendsByConnectionId.get(connectionId)
            setSelectedFriend(null)
            setOpenConversation({
              connectionId,
              friendName: friend?.friend_username || '',
              friendAvatar: friend?.friend_avatar_url || null,
              friendId: friend?.friend_id || selectedFriend.friendId,
            })
          }}
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
    backgroundColor: colors.white,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 0,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.secondary.main,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.secondary.main,
  },
  tabBadge: {
    fontSize: 14,
    fontWeight: '400',
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    padding: 16,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary.main,
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendText: {
    flex: 1,
  },
  friendNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  pendingBadge: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary.main,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  noMessage: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  unreadBadge: {
    backgroundColor: colors.secondary.main,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestCard: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.secondary.main + '20',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  requestTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  requestAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.secondary.main,
  },
  requestTextContainer: {
    flex: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  requestName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  requestMessage: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.secondary.main,
    marginBottom: 6,
  },
  requestDate: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  acceptButton: {
    backgroundColor: colors.secondary.main,
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.secondary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  rejectButton: {
    backgroundColor: colors.border.medium,
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
  },
})
