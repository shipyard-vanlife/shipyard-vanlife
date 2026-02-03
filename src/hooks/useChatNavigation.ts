import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { profileKeys } from './useProfiles'
import type { Friend } from '../types/chat'

type ChatTab = 'friends' | 'groups' | 'requests'

interface OpenConversation {
  connectionId: string
  friendName: string
  friendAvatar: string | null
  friendId: string
}

interface SelectedFriend {
  friendId: string
  connectionId: string
}

export function useChatNavigation() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<ChatTab>('friends')
  const [selectedFriend, setSelectedFriend] = useState<SelectedFriend | null>(null)
  const [openConversation, setOpenConversation] = useState<OpenConversation | null>(null)
  const [openActivityChat, setOpenActivityChat] = useState<string | null>(null)

  const handleFriendSelect = useCallback(
    async (friendId: string, connectionId: string) => {
      await queryClient.invalidateQueries({ queryKey: profileKeys.byId(friendId) })
      setSelectedFriend({ friendId, connectionId })
    },
    [queryClient]
  )

  const handleOpenConversation = useCallback(
    (connectionId: string, friendName: string, friendAvatar: string | null, friendId: string) => {
      setOpenConversation({ connectionId, friendName, friendAvatar, friendId })
    },
    []
  )

  const handleOpenConversationFromProfile = useCallback(
    (connectionId: string, friendsByConnectionId: Map<string, Friend>) => {
      const friend = friendsByConnectionId.get(connectionId)
      const friendId = selectedFriend?.friendId ?? ''
      setSelectedFriend(null)
      setOpenConversation({
        connectionId,
        friendName: friend?.friend_username || '',
        friendAvatar: friend?.friend_avatar_url || null,
        friendId: friend?.friend_id || friendId,
      })
    },
    [selectedFriend?.friendId]
  )

  const clearSelectedFriend = useCallback(() => setSelectedFriend(null), [])
  const clearConversation = useCallback(() => setOpenConversation(null), [])
  const clearActivityChat = useCallback(() => setOpenActivityChat(null), [])

  return {
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
  }
}
