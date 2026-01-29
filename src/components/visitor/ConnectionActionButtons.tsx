import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { Connection } from '../../types/chat'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme'

interface ConnectionActionButtonsProps {
  connectionStatus: Connection | null
  myProfileId: string | null
  targetUsername: string
  isVerified: boolean
  onConnect: () => void
  onAccept: () => void
  onReject: () => void
  onRemoveFriend: () => void
  onMessage: () => void
  isSending?: boolean
  isAccepting?: boolean
  isRejecting?: boolean
  isRemoving?: boolean
}

export const ConnectionActionButtons: React.FC<ConnectionActionButtonsProps> = ({
  connectionStatus,
  myProfileId,
  targetUsername,
  isVerified,
  onConnect,
  onAccept,
  onReject,
  onRemoveFriend,
  onMessage,
  isSending = false,
  isAccepting = false,
  isRejecting = false,
  isRemoving = false,
}) => {
  const { t } = useTranslation('common')

  // Check if I received the request (not sent by me)
  const isReceivedRequest =
    connectionStatus?.status === 'pending' &&
    connectionStatus?.sender_id &&
    myProfileId &&
    connectionStatus.sender_id !== myProfileId

  // Already friends
  const isFriend = connectionStatus?.status === 'accepted'

  // Request pending (I sent it)
  const isPendingSent =
    connectionStatus?.status === 'pending' &&
    connectionStatus?.sender_id &&
    myProfileId &&
    connectionStatus.sender_id === myProfileId

  // Received request - show Accept/Reject
  if (isReceivedRequest) {
    return (
      <View style={styles.container}>
        <View style={styles.receivedRequestRow}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={onAccept}
            disabled={isAccepting || isRejecting}
            activeOpacity={0.7}
          >
            {isAccepting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                <Text style={styles.buttonText}>{t('connection.accept')}</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={onReject}
            disabled={isAccepting || isRejecting}
            activeOpacity={0.7}
          >
            {isRejecting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="close-circle" size={20} color={colors.white} />
                <Text style={styles.buttonText}>{t('connection.reject')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Already friends - show Message + Remove friend
  if (isFriend) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.messageButton} onPress={onMessage} activeOpacity={0.7}>
          <Ionicons name="chatbubble" size={20} color={colors.secondary.main} />
          <Text style={styles.messageButtonText}>{t('connection.message')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemoveFriend}
          disabled={isRemoving}
          activeOpacity={0.7}
        >
          {isRemoving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="person-remove" size={20} color={colors.white} />
              <Text style={styles.buttonText}>{t('connection.removeFriendButton')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    )
  }

  // Pending sent - show waiting state
  if (isPendingSent) {
    return (
      <View style={styles.container}>
        <View style={[styles.connectButton, styles.pendingButton]}>
          <Ionicons name="time" size={20} color={colors.white} />
          <Text style={styles.buttonText}>{t('connection.pendingSent')}</Text>
        </View>
      </View>
    )
  }

  // No connection - show Connect button
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.connectButton, !isVerified && styles.disabledButton]}
        onPress={onConnect}
        disabled={isSending || !isVerified}
        activeOpacity={0.7}
      >
        {isSending ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <>
            <Ionicons name="person-add" size={20} color={colors.white} />
            <Text style={styles.buttonText}>
              {isVerified ? t('connection.connect') : t('connection.verificationRequired')}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  receivedRequestRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  connectButton: {
    backgroundColor: colors.secondary.main,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pendingButton: {
    backgroundColor: colors.text.tertiary,
    opacity: 0.7,
  },
  disabledButton: {
    backgroundColor: colors.text.muted,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.secondary.main,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  messageButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.secondary.main,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  messageButtonText: {
    color: colors.secondary.main,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  removeButton: {
    backgroundColor: colors.text.tertiary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
})
