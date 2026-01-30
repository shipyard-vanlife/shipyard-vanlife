import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../styles/theme'
import { Connection } from '../../types/chat'

interface BottomSheetActionsProps {
  connectionStatus: Connection | null | undefined
  isReceivedRequest: boolean
  isLoading: {
    sending: boolean
    accepting: boolean
    rejecting: boolean
    removing: boolean
  }
  onConnect: () => void
  onAccept: () => void
  onReject: () => void
  onRemoveFriend: () => void
}

export const BottomSheetActions: React.FC<BottomSheetActionsProps> = ({
  connectionStatus,
  isReceivedRequest,
  isLoading,
  onConnect,
  onAccept,
  onReject,
  onRemoveFriend,
}) => {
  const { t } = useTranslation('common')

  if (isReceivedRequest) {
    return (
      <View style={styles.receivedRequestContainer}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={onAccept}
          disabled={isLoading.accepting}
        >
          <Ionicons name="checkmark-circle" size={20} color={colors.white} />
          <Text style={styles.acceptText}>
            {isLoading.accepting ? t('connection.accepting') : t('connection.accept')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={onReject}
          disabled={isLoading.rejecting}
        >
          <Ionicons name="close-circle" size={20} color={colors.white} />
          <Text style={styles.rejectText}>
            {isLoading.rejecting ? t('connection.rejecting') : t('connection.reject')}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <>
      <TouchableOpacity
        style={[
          styles.connectButton,
          connectionStatus?.status === 'pending' && styles.connectButtonPending,
          connectionStatus?.status === 'accepted' && styles.connectButtonAccepted,
        ]}
        onPress={onConnect}
        disabled={
          isLoading.sending ||
          connectionStatus?.status === 'accepted' ||
          connectionStatus?.status === 'pending'
        }
      >
        <Ionicons
          name={
            connectionStatus?.status === 'accepted'
              ? 'checkmark-circle'
              : connectionStatus?.status === 'pending'
                ? 'time'
                : 'person-add'
          }
          size={20}
          color={colors.white}
        />
        <Text style={styles.connectText}>
          {connectionStatus?.status === 'accepted'
            ? t('connection.friend')
            : connectionStatus?.status === 'pending'
              ? t('connection.pendingSent')
              : isLoading.sending
                ? t('connection.sending')
                : t('connection.connect')}
        </Text>
      </TouchableOpacity>

      {connectionStatus?.status === 'accepted' && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemoveFriend}
          disabled={isLoading.removing}
        >
          <Ionicons name="person-remove" size={20} color={colors.white} />
          <Text style={styles.removeText}>
            {isLoading.removing ? t('connection.removing') : t('connection.removeFriendTitle')}
          </Text>
        </TouchableOpacity>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  receivedRequestContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.secondary.main,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  acceptText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  rejectText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  connectButton: {
    backgroundColor: colors.secondary.main,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  connectButtonPending: {
    backgroundColor: colors.text.tertiary,
    opacity: 0.7,
  },
  connectButtonAccepted: {
    backgroundColor: '#4A90E2',
  },
  connectText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: colors.secondary.main,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  removeText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
})
