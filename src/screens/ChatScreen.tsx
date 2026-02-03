import React, { useCallback } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native'
import { useChatData } from '../hooks/useChatData'
import { useChatNavigation } from '../hooks/useChatNavigation'
import {
  ChatFriendCard,
  ChatRequestCard,
  ChatActivityCard,
  ChatEmptyState,
  ChatTabHeader,
} from '../components/chat'
import { VisitorProfileSheet } from '../components/visitor'
import { ConversationScreen } from './ConversationScreen'
import { ActivityChatScreen } from './ActivityChatScreen'
import { colors, spacing } from '../styles/theme'
import type { Friend, ConnectionRequest } from '../types/chat'
import type { ActivityChatPreview } from '../types/activityChat'

export const ChatScreen: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedFriend,
    clearSelectedFriend,
    openConversation,
    clearConversation,
    openActivityChat,
    setOpenActivityChat,
    clearActivityChat,
    handleFriendSelect,
    handleOpenConversation,
    handleOpenConversationFromProfile,
  } = useChatNavigation()

  const {
    friends,
    requests,
    activityChats,
    friendsByConnectionId,
    loadingFriends,
    loadingRequests,
    loadingActivityChats,
    handleAcceptConnection,
    rejectConnection,
    deleteConnection,
  } = useChatData(activeTab)

  const renderFriendItem = useCallback(
    ({ item }: { item: Friend }) => (
      <ChatFriendCard
        friend={item}
        onAvatarPress={() => {
          if (item.status === 'accepted') {
            handleFriendSelect(item.friend_id, item.connection_id)
          }
        }}
        onConversationPress={() => {
          if (item.status === 'accepted') {
            handleOpenConversation(
              item.connection_id,
              item.friend_username,
              item.friend_avatar_url,
              item.friend_id
            )
          }
        }}
        onCancelPress={() => deleteConnection(item.connection_id)}
      />
    ),
    [handleFriendSelect, handleOpenConversation, deleteConnection]
  )

  const renderRequestItem = useCallback(
    ({ item }: { item: ConnectionRequest }) => (
      <ChatRequestCard
        request={item}
        onAvatarPress={() => handleFriendSelect(item.sender_id, item.connection_id)}
        onAccept={() => handleAcceptConnection(item.connection_id)}
        onReject={() => rejectConnection(item.connection_id)}
      />
    ),
    [handleFriendSelect, handleAcceptConnection, rejectConnection]
  )

  const renderActivityItem = useCallback(
    ({ item }: { item: ActivityChatPreview }) => (
      <ChatActivityCard chat={item} onPress={() => setOpenActivityChat(item.activity_id)} />
    ),
    [setOpenActivityChat]
  )

  const friendKeyExtractor = useCallback((item: Friend) => item.connection_id, [])
  const requestKeyExtractor = useCallback((item: ConnectionRequest) => item.connection_id, [])
  const activityKeyExtractor = useCallback((item: ActivityChatPreview) => item.activity_id, [])

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
        navigation={{ goBack: clearConversation }}
      />
    )
  }

  if (openActivityChat) {
    return (
      <ActivityChatScreen
        route={{ params: { activityId: openActivityChat } }}
        navigation={{ goBack: clearActivityChat }}
      />
    )
  }

  const renderContent = () => {
    if (activeTab === 'friends') {
      if (loadingFriends) {
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.secondary.main} />
          </View>
        )
      }
      if (!friends || friends.length === 0) return <ChatEmptyState variant="friends" />
      return (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={friendKeyExtractor}
          contentContainerStyle={styles.list}
          removeClippedSubviews
          maxToRenderPerBatch={15}
        />
      )
    }

    if (activeTab === 'groups') {
      if (loadingActivityChats) {
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.secondary.main} />
          </View>
        )
      }
      if (!activityChats || activityChats.length === 0) return <ChatEmptyState variant="groups" />
      return (
        <FlatList
          data={activityChats}
          renderItem={renderActivityItem}
          keyExtractor={activityKeyExtractor}
          contentContainerStyle={styles.list}
          removeClippedSubviews
          maxToRenderPerBatch={15}
        />
      )
    }

    if (loadingRequests) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.secondary.main} />
        </View>
      )
    }
    if (!requests || requests.length === 0) return <ChatEmptyState variant="requests" />
    return (
      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={requestKeyExtractor}
        contentContainerStyle={styles.list}
        removeClippedSubviews
        maxToRenderPerBatch={15}
      />
    )
  }

  return (
    <View style={styles.container}>
      <ChatTabHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        friendsCount={friends?.length ?? 0}
        groupsCount={activityChats?.length ?? 0}
        requestsCount={requests?.length ?? 0}
      />

      <View style={styles.content}>{renderContent()}</View>

      {selectedFriend ? (
        <VisitorProfileSheet
          profileId={selectedFriend.friendId}
          onClose={clearSelectedFriend}
          onMessage={(connectionId) =>
            handleOpenConversationFromProfile(connectionId, friendsByConnectionId)
          }
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
  content: {
    flex: 1,
    backgroundColor: colors.white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  list: {
    padding: spacing.lg,
  },
})
