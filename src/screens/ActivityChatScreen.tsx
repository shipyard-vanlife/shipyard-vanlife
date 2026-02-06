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
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius, fontSize } from '../styles/theme'
import {
  useActivityMessages,
  useSendActivityMessage,
  useEnsureActivityChat,
  useRealtimeActivityMessages,
  useMarkActivityChatAsRead,
} from '../hooks/useActivityChat'
import { useActivityById, useLeaveActivity } from '../hooks/useActivities'
import { ActivityMessage } from '../types/activityChat'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { VisitorProfileSheet } from '../components/visitor/VisitorProfileSheet'

interface ActivityChatScreenProps {
  route: {
    params: {
      activityId: string
    }
  }
  navigation: {
    goBack: () => void
  }
}

export const ActivityChatScreen: React.FC<ActivityChatScreenProps> = ({ route, navigation }) => {
  const { activityId } = route.params
  const { t, i18n } = useTranslation('activities')
  const locale = i18n.language === 'fr' ? fr : enUS

  const [messageText, setMessageText] = useState('')
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const flatListRef = useRef<FlatList>(null)

  // Ensure chat exists
  const { data: chatId, isLoading: loadingChat } = useEnsureActivityChat(activityId)
  const { data: activity } = useActivityById(activityId)
  const { data: messages, isLoading: loadingMessages } = useActivityMessages(activityId)
  const { mutate: sendMessage, isPending: sending } = useSendActivityMessage()
  const { mutate: leaveActivity, isPending: isLeaving } = useLeaveActivity()
  const { mutate: markAsRead } = useMarkActivityChatAsRead()

  // Subscribe to realtime
  useRealtimeActivityMessages(activityId)

  // Marquer comme lu quand on ouvre le chat
  useEffect(() => {
    markAsRead(activityId)
  }, [activityId, markAsRead])

  // Marquer comme lu quand on reçoit de nouveaux messages
  useEffect(() => {
    if (messages && messages.length > 0) {
      markAsRead(activityId)
    }
  }, [messages?.length, activityId, markAsRead])

  // Marquer comme lu quand on ferme le chat (cleanup)
  useEffect(() => {
    return () => {
      markAsRead(activityId)
    }
  }, [activityId, markAsRead])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages?.length])

  const handleSend = () => {
    const trimmed = messageText.trim()
    if (!trimmed || sending) return

    sendMessage(
      {
        activity_id: activityId,
        content: trimmed,
      },
      {
        onSuccess: () => {
          setMessageText('')
        },
      }
    )
  }

  const handleLeave = () => {
    Alert.alert(t('alerts.leaveConfirm'), '', [
      { text: t('common:buttons.cancel'), style: 'cancel' },
      {
        text: t('actions.leave'),
        style: 'destructive',
        onPress: () => {
          leaveActivity(activityId, {
            onSuccess: () => {
              Alert.alert(t('alerts.leaveSuccess'))
              navigation.goBack()
            },
            onError: (error: any) => {
              console.error('Leave activity error:', error)
              Alert.alert(t('alerts.error'), error?.message || 'Une erreur est survenue')
            },
          })
        },
      },
    ])
  }

  const renderMessage = ({ item }: { item: ActivityMessage }) => {
    const messageDate = new Date(item.created_at)
    const timeStr = format(messageDate, 'HH:mm', { locale })

    return (
      <View style={[styles.messageContainer, item.is_mine && styles.myMessageContainer]}>
        {!item.is_mine && (
          <View style={styles.senderInfo}>
            <TouchableOpacity onPress={() => setSelectedProfileId(item.sender_id)} activeOpacity={0.7}>
              {item.sender_avatar ? (
                <Image source={{ uri: item.sender_avatar }} style={styles.senderAvatar} />
              ) : (
                <View style={[styles.senderAvatar, styles.senderAvatarPlaceholder]}>
                  <Ionicons name="person" size={16} color={colors.text.tertiary} />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.senderName}>{item.sender_username}</Text>
          </View>
        )}
        <View style={[styles.messageBubble, item.is_mine && styles.myMessageBubble]}>
          <Text style={[styles.messageText, item.is_mine && styles.myMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, item.is_mine && styles.myMessageTime]}>{timeStr}</Text>
        </View>
      </View>
    )
  }

  if (loadingChat || loadingMessages) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary.main} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? -90 : 0}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {activity?.title || t('chat.groupTitle')}
            </Text>
            <Text style={styles.headerSubtitle}>{t('chat.subtitle')}</Text>
          </View>
          {!activity?.is_creator && activity?.is_participant && (
            <TouchableOpacity onPress={handleLeave} style={styles.leaveButton} disabled={isLeaving}>
              <Ionicons name="exit-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages || []}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>{t('chat.empty')}</Text>
            </View>
          }
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={colors.text.tertiary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Profil de l'utilisateur sélectionné */}
      {selectedProfileId && (
        <VisitorProfileSheet
          profileId={selectedProfileId}
          onClose={() => setSelectedProfileId(null)}
        />
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    marginRight: spacing.md,
  },
  leaveButton: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  messagesList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.text.tertiary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: '75%',
    alignSelf: 'flex-start',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  senderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  senderAvatarPlaceholder: {
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderName: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  messageBubble: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  myMessageBubble: {
    backgroundColor: colors.secondary.main,
  },
  messageText: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    marginBottom: 4,
  },
  myMessageText: {
    color: colors.white,
  },
  messageTime: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.8)',
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
})
