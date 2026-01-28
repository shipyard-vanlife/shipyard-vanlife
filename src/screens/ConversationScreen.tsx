import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import { colors, spacing, borderRadius, fontSize } from '../styles/theme'
import { useInfiniteMessages, useSendMessage, useMarkMessagesAsRead } from '../hooks/useMessages'
import { useMyProfile, useProfileById, profileKeys } from '../hooks/useProfiles'
import { useRealtimeMessages } from '../hooks/useRealtimeMessages'
import { FriendProfileModal } from '../components/FriendProfileModal'
import { HelpRequestModal } from '../components/HelpRequestModal'
import { HelpRequestCard } from '../components/HelpRequestCard'
import {
  useHelpRequests,
  useRespondToHelpRequest,
  useCancelHelpRequest,
} from '../hooks/useHelpRequests'
import { Message, HelpRequest } from '../types/chat'

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
  const { t } = useTranslation(['common', 'chat'])
  const queryClient = useQueryClient()
  const { data: myProfile } = useMyProfile()
  const { data: friendProfile } = useProfileById(friendId || null)

  const [selectedFriend, setSelectedFriend] = useState<string | null>(null)
  const [showHelpModal, setShowHelpModal] = useState(false)

  const [messageText, setMessageText] = useState('')
  const flatListRef = useRef<FlatList>(null)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteMessages(connectionId)
  const { mutate: sendMessage, isPending: isSending } = useSendMessage()
  const { mutate: markAsRead } = useMarkMessagesAsRead()

  const { data: helpRequests } = useHelpRequests(connectionId)
  const { mutate: respondToRequest, isPending: isResponding } = useRespondToHelpRequest()
  const { mutate: cancelRequest, isPending: isCanceling } = useCancelHelpRequest()

  useRealtimeMessages(connectionId)

  const messages = data?.pages.flatMap(page => page) ?? []

  const chatItems = [
    ...messages.map(m => ({ type: 'message' as const, data: m, timestamp: m.created_at })),
    ...(helpRequests || []).map(r => ({
      type: 'help_request' as const,
      data: r,
      timestamp: r.created_at,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  useEffect(() => {
    if (connectionId) {
      markAsRead(connectionId)
    }
  }, [connectionId, markAsRead])

  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false })
      }, 100)
    }
  }, [messages.length, isLoading])

  const handleSend = () => {
    if (!messageText.trim() || isSending) return

    // Block if user is not verified
    if (myProfile?.verification_status !== 'approved') {
      Alert.alert(t('verification.requiredTitle'), t('verification.requiredMessage'))
      return
    }

    sendMessage(
      { connection_id: connectionId, content: messageText.trim() },
      {
        onSuccess: () => {
          setMessageText('')
          refetch()
        },
      }
    )
  }

  const renderItem = ({ item }: { item: (typeof chatItems)[0] }) => {
    if (item.type === 'help_request') {
      const request = item.data as HelpRequest
      const isMyRequest = request.requester_id === myProfile?.id

      console.log('Help request:', {
        requesterId: request.requester_id,
        myProfileId: myProfile?.id,
        isMyRequest,
        status: request.status,
      })

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
    const isMyMessage = message.is_mine

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {message.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.theirMessageTime,
            ]}
          >
            {new Date(message.created_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? -90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <TouchableOpacity
            onPress={async () => {
              if (friendId) {
                await queryClient.invalidateQueries({ queryKey: profileKeys.byId(friendId) })
                setSelectedFriend(friendId)
              }
            }}
            disabled={!friendId}
          >
            {friendAvatar ? (
              <Image source={{ uri: friendAvatar }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={20} color={colors.text.tertiary} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{friendName}</Text>
        </View>

        <TouchableOpacity style={styles.helpButton} onPress={() => setShowHelpModal(true)}>
          <Ionicons name="help-circle-outline" size={28} color={colors.secondary.main} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary.main} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={chatItems}
          renderItem={renderItem}
          keyExtractor={item => (item.type === 'message' ? item.data.id : item.data.id)}
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
                <Text style={styles.loadMoreText}>{t('chat:conversation.loading')}</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>{t('chat:empty.messages.title')}</Text>
              <Text style={styles.emptySubtext}>{t('chat:empty.messages.subtitle')}</Text>
            </View>
          }
        />
      )}

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('chat:conversation.inputPlaceholder')}
          placeholderTextColor={colors.text.muted}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          textContentType="none"
          autoComplete="off"
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!messageText.trim() || isSending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!messageText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="send" size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>

      {friendId && (
        <FriendProfileModal
          friendId={selectedFriend}
          connectionId={connectionId}
          onClose={() => setSelectedFriend(null)}
        />
      )}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.secondary.main,
  },
  helpButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
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
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: fontSize.base,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  myMessageBubble: {
    backgroundColor: colors.secondary.main,
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: fontSize.base,
    lineHeight: 20,
  },
  myMessageText: {
    color: colors.white,
  },
  theirMessageText: {
    color: colors.text.primary,
  },
  messageTime: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  myMessageTime: {
    color: colors.white,
    opacity: 0.8,
    textAlign: 'right',
  },
  theirMessageTime: {
    color: colors.text.tertiary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.text.tertiary,
    opacity: 0.5,
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
