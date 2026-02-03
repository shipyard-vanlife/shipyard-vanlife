import { useState, useEffect, useRef, useMemo } from 'react'
import { Alert, FlatList } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useInfiniteMessages, useSendMessage, useMarkMessagesAsRead } from './useMessages'
import { useMyProfile, useProfileById } from './useProfiles'
import { useRealtimeMessages } from './useRealtimeMessages'
import {
  useHelpRequests,
  useRespondToHelpRequest,
  useCancelHelpRequest,
} from './useHelpRequests'
import type { Message, HelpRequest } from '../types/chat'

export type ChatItem =
  | { type: 'message'; data: Message; timestamp: string }
  | { type: 'help_request'; data: HelpRequest; timestamp: string }

export function useConversation(connectionId: string, friendId?: string) {
  const { t } = useTranslation(['common'])
  const { data: myProfile } = useMyProfile()
  const { data: friendProfile } = useProfileById(friendId || null)

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

  const chatItems: ChatItem[] = useMemo(
    () =>
      [
        ...messages.map(m => ({ type: 'message' as const, data: m, timestamp: m.created_at })),
        ...(helpRequests || []).map(r => ({
          type: 'help_request' as const,
          data: r,
          timestamp: r.created_at,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [messages, helpRequests]
  )

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

  return {
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
    helpRequests,
    respondToRequest,
    cancelRequest,
    isResponding,
    isCanceling,
  }
}
