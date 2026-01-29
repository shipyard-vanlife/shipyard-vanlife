import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius, fontSize } from '../../styles/theme'
import { useSendInvitation } from '../../hooks/useActivities'
import { useMyConnections } from '../../hooks/useConnections'

interface InviteFriendsModalProps {
  visible: boolean
  activityId: string | null
  onClose: () => void
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  visible,
  activityId,
  onClose,
}) => {
  const { t } = useTranslation('activities')
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [message, setMessage] = useState('')

  const { data: connections } = useMyConnections()
  const { mutate: sendInvitation, isPending } = useSendInvitation()

  const friends = connections?.filter(c => c.status === 'accepted') ?? []

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
    )
  }

  const handleSend = () => {
    if (!activityId || selectedFriends.length === 0) return

    sendInvitation(
      {
        activityId,
        inviteeIds: selectedFriends,
        message: message || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert(t('alerts.invitationSent'))
          setSelectedFriends([])
          setMessage('')
          onClose()
        },
        onError: () => {
          Alert.alert(t('alerts.error'))
        },
      }
    )
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('invitations.title')}</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>{t('invitations.selectFriends')}</Text>

          {friends.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('invitations.noFriends')}</Text>
            </View>
          ) : (
            <FlatList
              data={friends}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const friend =
                  item.sender_id !== item.user_id ? item.sender_profile : item.receiver_profile
                const isSelected = selectedFriends.includes(friend.id)

                return (
                  <TouchableOpacity
                    style={[styles.friendItem, isSelected && styles.friendItemSelected]}
                    onPress={() => toggleFriend(friend.id)}
                  >
                    <Image
                      source={
                        friend.avatar_url
                          ? { uri: friend.avatar_url }
                          : require('../../assets/default-avatar.png')
                      }
                      style={styles.avatar}
                    />
                    <Text style={styles.friendName}>{friend.username}</Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={colors.secondary.main}
                      />
                    )}
                  </TouchableOpacity>
                )
              }}
              contentContainerStyle={styles.listContent}
            />
          )}

          {/* Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.label}>{t('invitations.message')}</Text>
            <TextInput
              style={styles.messageInput}
              placeholder={t('invitations.messagePlaceholder')}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={200}
              placeholderTextColor={colors.text.tertiary}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              (isPending || selectedFriends.length === 0) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={isPending || selectedFriends.length === 0}
          >
            <Text style={styles.sendButtonText}>
              {isPending ? t('invitations.sending') : t('invitations.send')}
              {selectedFriends.length > 0 && ` (${selectedFriends.length})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.text.tertiary,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  friendItemSelected: {
    borderWidth: 2,
    borderColor: colors.secondary.main,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  friendName: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text.primary,
  },
  messageContainer: {
    marginTop: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  messageInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text.primary,
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  sendButton: {
    backgroundColor: colors.secondary.main,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
})
