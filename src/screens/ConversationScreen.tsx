import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import { useConversation } from '../hooks/useConversation'
import { profileKeys } from '../hooks/useProfiles'
import { ConversationHeader, MessageBubble, MessageInput } from '../components/conversation'
import { VisitorProfileSheet } from '../components/visitor'
import { HelpRequestModal } from '../components/HelpRequestModal'
import { HelpRequestCard } from '../components/HelpRequestCard'
import { colors, spacing, fontSize, fontWeight } from '../styles/theme'
import type { ChatItem } from '../hooks/useConversation'
import type { Message, HelpRequest } from '../types/chat'

interface ConversationScreenProps {
  route: {
    params: {
      connectionId: string
      friendName: string
      friendAvatar: string | null
      friendId?: string
    }
  }
  navigation: {
    goBack: () => void
  }
}

export const ConversationScreen: React.FC<ConversationScreenProps> = ({ route, navigation }) => {
  const { connectionId, friendName, friendAvatar, friendId } = route.params
  const { t } = useTranslation(['chat'])
  const queryClient = useQueryClient()

  const [selectedFriend, setSelectedFriend] = useState<string | null>(null)
  const [showHelpModal, setShowHelpModal] = useState(false)

  const {
    myProfile,
    friendProfile,
    chatItems,
    isLoading,
    flatListRef,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    messageText,
    setMessageText,
    handleSend,
    isSending,
    respondToRequest,
    cancelRequest,
    isResponding,
    isCanceling,
  } = useConversation(connectionId, friendId)

  const handleAvatarPress = useCallback(async () => {
    if (friendId) {
      await queryClient.invalidateQueries({ queryKey: profileKeys.byId(friendId) })
      setSelectedFriend(friendId)
    }
  }, [friendId, queryClient])

  const renderItem = useCallback(
    ({ item }: { item: ChatItem }) => {
      if (item.type === 'help_request') {
        const request = item.data as HelpRequest
        const isMyRequest = request.requester_id === myProfile?.id

        return (
          <HelpRequestCard
            request={request}
            isMyRequest={isMyRequest}
            requesterName={isMyRequest ? 'Tu' : friendName}
            onAccept={() =>
              respondToRequest({
                requestId: request.id,
                status: 'accepted',
                connectionId,
              })
            }
            onDecline={() =>
              respondToRequest({
                requestId: request.id,
                status: 'declined',
                connectionId,
              })
            }
            onCancel={() => cancelRequest({ requestId: request.id, connectionId })}
            isResponding={isResponding || isCanceling}
          />
        )
      }

      const message = item.data as Message
      return <MessageBubble message={message} isMyMessage={message.is_mine} />
    },
    [myProfile?.id, friendName, connectionId, respondToRequest, cancelRequest, isResponding, isCanceling]
  )

  const keyExtractor = useCallback((item: ChatItem) => item.data.id, [])

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? -90 : 0}
    >
      <ConversationHeader
        friendName={friendName}
        friendAvatar={friendAvatar}
        onBack={navigation.goBack}
        onAvatarPress={handleAvatarPress}
        onHelpPress={() => setShowHelpModal(true)}
        avatarDisabled={!friendId}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary.main} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={chatItems}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.messagesList}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage()
            }
          }}
          onEndReachedThreshold={0.5}
          inverted
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={colors.secondary.main} />
                <Text style={styles.loadMoreText}>{t('conversation.loading')}</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>{t('empty.messages.title')}</Text>
              <Text style={styles.emptySubtext}>{t('empty.messages.subtitle')}</Text>
            </View>
          }
        />
      )}

      <MessageInput
        value={messageText}
        onChange={setMessageText}
        onSend={handleSend}
        isSending={isSending}
        placeholder={t('conversation.inputPlaceholder')}
      />

      {selectedFriend ? (
        <VisitorProfileSheet
          profileId={selectedFriend}
          onClose={() => setSelectedFriend(null)}
        />
      ) : null}

      <HelpRequestModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        connectionId={connectionId}
        friendName={friendName}
        friendSkills={friendProfile?.skills || []}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
  },
  loadMoreContainer: {
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadMoreText: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
})
