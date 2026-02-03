import { useCallback, useEffect, useMemo } from 'react'
import { Alert } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  useMyFriends,
  useConnectionRequests,
  useAcceptConnection,
  useRejectConnection,
  useDeleteConnection,
} from './useConnections'
import { useMyProfile } from './useProfiles'
import { useRealtimeConnections } from './useRealtimeConnections'
import { useMyActivityChats } from './useActivityChat'
import type { Friend } from '../types/chat'

type ChatTab = 'friends' | 'groups' | 'requests'

export function useChatData(activeTab: ChatTab) {
  const { t } = useTranslation(['common'])

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

  useRealtimeConnections()

  const handleAcceptConnection = useCallback(
    (connectionId: string) => {
      if (myProfile?.verification_status !== 'approved') {
        Alert.alert(t('verification.requiredTitle'), t('verification.requiredMessage'))
        return
      }
      acceptConnection(connectionId)
    },
    [myProfile?.verification_status, t, acceptConnection]
  )

  const friendsByConnectionId = useMemo(
    () => new Map<string, Friend>(friends?.map(f => [f.connection_id, f]) ?? []),
    [friends]
  )

  useEffect(() => {
    if (activeTab === 'friends') {
      refetchFriends()
    } else {
      refetchRequests()
    }
  }, [activeTab])

  return {
    friends,
    requests,
    activityChats,
    myProfile,
    friendsByConnectionId,
    loadingFriends,
    loadingRequests,
    loadingActivityChats,
    handleAcceptConnection,
    rejectConnection,
    deleteConnection,
  }
}
