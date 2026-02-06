import { useCallback } from 'react'
import { Alert } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import {
  useAcceptConnection,
  useCheckConnection,
  useConnectionSlotsUsed,
  useDeleteConnection,
  useRejectConnection,
  useSendConnectionRequest,
  connectionKeys,
} from './useConnections'
import { useMyProfile } from './useProfiles'
import { usePremiumGate } from './usePremiumGate'

interface UseConnectionHandlersOptions {
  /** Target profile ID */
  profileId: string
  /** Target username for alert messages */
  username: string
  /** Callback after successful accept */
  onAcceptSuccess?: () => void
  /** Callback after successful reject */
  onRejectSuccess?: () => void
  /** Callback after successful remove */
  onRemoveSuccess?: () => void
  /** Callback after successful connect */
  onConnectSuccess?: () => void
}

interface ConnectionHandlers {
  /** Send a connection request */
  handleConnect: () => Promise<void>
  /** Accept a pending connection request */
  handleAccept: () => void
  /** Reject a pending connection request (with confirmation) */
  handleReject: () => void
  /** Remove an existing friend (with confirmation) */
  handleRemoveFriend: () => void
  /** Check if user can perform connection actions (verified) */
  checkVerification: () => boolean
}

interface ConnectionState {
  /** Current connection status */
  connectionStatus: ReturnType<typeof useCheckConnection>['data']
  /** Whether current user received a pending request (not sent by them) */
  isReceivedRequest: boolean
  /** Loading states */
  isLoading: {
    sending: boolean
    accepting: boolean
    rejecting: boolean
    removing: boolean
  }
}

export function useConnectionHandlers(
  options: UseConnectionHandlersOptions
): ConnectionHandlers & ConnectionState {
  const {
    profileId,
    username,
    onAcceptSuccess,
    onRejectSuccess,
    onRemoveSuccess,
    onConnectSuccess,
  } = options

  const { t } = useTranslation('common')
  const queryClient = useQueryClient()
  const { canAddFriend, showPaywall } = usePremiumGate()

  // Data hooks
  const { data: myProfile } = useMyProfile()
  const slotsUsed = useConnectionSlotsUsed()
  const { data: connectionStatus, refetch: refetchConnection } = useCheckConnection(profileId)

  // Mutation hooks
  const { mutate: sendRequest, isPending: isSending } = useSendConnectionRequest()
  const { mutate: acceptConnection, isPending: isAccepting } = useAcceptConnection()
  const { mutate: rejectConnection, isPending: isRejecting } = useRejectConnection()
  const { mutate: deleteConnection, isPending: isRemoving } = useDeleteConnection()

  // Computed state
  const isReceivedRequest =
    connectionStatus?.status === 'pending' &&
    connectionStatus?.sender_id !== undefined &&
    myProfile?.id !== undefined &&
    connectionStatus.sender_id !== myProfile.id

  const isVerified = myProfile?.verification_status === 'approved'

  // Helper to invalidate queries and refetch
  const invalidateAndRefetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: connectionKeys.all })
    await refetchConnection()
  }, [queryClient, refetchConnection])

  // Check verification before actions
  const checkVerification = useCallback((): boolean => {
    if (!isVerified) {
      Alert.alert(t('verification.requiredTitle'), t('verification.requiredMessage'))
      return false
    }
    return true
  }, [isVerified, t])

  // Send connection request
  const handleConnect = useCallback(async () => {
    if (!checkVerification()) return

    // Check friend limit for free users (accepted + pending sent)
    if (!canAddFriend(slotsUsed)) {
      Alert.alert(t('premium.upgradeTitle'), t('premium.friendsLimit'))
      await showPaywall()
      return
    }

    try {
      const { data: freshStatus } = await refetchConnection()
      const hasConnection =
        freshStatus && (Array.isArray(freshStatus) ? freshStatus.length > 0 : freshStatus?.status)

      if (hasConnection) {
        const status = Array.isArray(freshStatus) ? freshStatus[0]?.status : freshStatus?.status

        if (status === 'pending') {
          Alert.alert(t('connection.pendingAlertTitle'), t('connection.pendingAlertMessage'))
        } else if (status === 'accepted') {
          Alert.alert(
            t('connection.alreadyConnectedTitle'),
            t('connection.alreadyConnectedMessage', { username })
          )
        } else if (status === 'rejected') {
          Alert.alert(t('connection.rejectedAlertTitle'), t('connection.rejectedAlertMessage'))
        }
        return
      }

      sendRequest(profileId, {
        onSuccess: async () => {
          await invalidateAndRefetch()
          Alert.alert(
            t('connection.requestSentTitle'),
            t('connection.requestSentMessage', { username })
          )
          onConnectSuccess?.()
        },
        onError: async (error: any) => {
          await refetchConnection()
          if (error?.message?.includes('Connection already exists')) {
            Alert.alert(
              t('connection.existingConnectionTitle'),
              t('connection.existingConnectionMessage')
            )
          } else {
            Alert.alert(t('errors.error'), t('connection.sendError'))
          }
        },
      })
    } catch {
      Alert.alert(t('errors.error'), t('connection.unknownError'))
    }
  }, [
    checkVerification,
    refetchConnection,
    sendRequest,
    profileId,
    username,
    invalidateAndRefetch,
    onConnectSuccess,
    slotsUsed,
    canAddFriend,
    showPaywall,
    t,
  ])

  // Accept connection request
  const handleAccept = useCallback(async () => {
    if (!connectionStatus?.id) return

    // Check friend limit for free users (accepted + pending sent)
    if (!canAddFriend(slotsUsed)) {
      Alert.alert(t('premium.upgradeTitle'), t('premium.friendsLimit'))
      await showPaywall()
      return
    }

    acceptConnection(connectionStatus.id, {
      onSuccess: async () => {
        await invalidateAndRefetch()
        Alert.alert(t('connection.acceptedTitle'), t('connection.acceptedMessage', { username }))
        onAcceptSuccess?.()
      },
      onError: () => {
        Alert.alert(t('errors.error'), t('connection.acceptError'))
      },
    })
  }, [connectionStatus?.id, acceptConnection, invalidateAndRefetch, username, onAcceptSuccess, slotsUsed, canAddFriend, showPaywall, t])

  // Reject connection request (with confirmation)
  const handleReject = useCallback(() => {
    if (!connectionStatus?.id) return

    Alert.alert(t('connection.rejectTitle'), t('connection.rejectMessage', { username }), [
      { text: t('buttons.cancel'), style: 'cancel' },
      {
        text: t('connection.reject'),
        style: 'destructive',
        onPress: () => {
          rejectConnection(connectionStatus.id, {
            onSuccess: async () => {
              await invalidateAndRefetch()
              Alert.alert(t('connection.rejectConfirmed'))
              onRejectSuccess?.()
            },
            onError: () => {
              Alert.alert(t('errors.error'), t('connection.rejectError'))
            },
          })
        },
      },
    ])
  }, [connectionStatus?.id, rejectConnection, invalidateAndRefetch, username, onRejectSuccess, t])

  // Remove friend (with confirmation)
  const handleRemoveFriend = useCallback(() => {
    if (!connectionStatus?.id) return

    Alert.alert(
      t('connection.removeFriendTitle'),
      t('connection.removeFriendMessage', { username }),
      [
        { text: t('buttons.cancel'), style: 'cancel' },
        {
          text: t('connection.removeFriendButton'),
          style: 'destructive',
          onPress: () => {
            deleteConnection(connectionStatus.id, {
              onSuccess: async () => {
                await invalidateAndRefetch()
                Alert.alert(
                  t('connection.removedSuccess'),
                  t('connection.removedMessage', { username })
                )
                onRemoveSuccess?.()
              },
              onError: () => {
                Alert.alert(t('errors.generic'), t('connection.removedError'))
              },
            })
          },
        },
      ]
    )
  }, [connectionStatus?.id, deleteConnection, invalidateAndRefetch, username, onRemoveSuccess, t])

  return {
    // Handlers
    handleConnect,
    handleAccept,
    handleReject,
    handleRemoveFriend,
    checkVerification,
    // State
    connectionStatus,
    isReceivedRequest,
    isLoading: {
      sending: isSending,
      accepting: isAccepting,
      rejecting: isRejecting,
      removing: isRemoving,
    },
  }
}
