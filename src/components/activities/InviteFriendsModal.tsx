import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius, fontSize } from '../../styles/theme'
import { useSendInvitation } from '../../hooks/useActivities'
import { useMyFriends } from '../../hooks/useConnections'

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

  const { data: friends = [] } = useMyFriends()
  const { mutate: sendInvitation, isPending } = useSendInvitation()

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
        onError: (error: any) => {
          console.error('Invitation error:', error)
          Alert.alert(t('alerts.error'), error?.message || 'Une erreur est survenue')
        },
      }
    )
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('invitations.title')}</Text>
            <View style={{ width: 28 }} />
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              {/* Content */}
              <View style={styles.content}>
                <Text style={styles.sectionTitle}>{t('invitations.selectFriends')}</Text>

                {friends.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>{t('invitations.noFriends')}</Text>
                  </View>
                ) : (
                  <View style={styles.friendsList}>
                    <FlatList
                      data={friends}
                      keyExtractor={item => item.friend_id}
                      renderItem={({ item }) => {
                        const isSelected = selectedFriends.includes(item.friend_id)

                        return (
                          <TouchableOpacity
                            style={[styles.friendItem, isSelected && styles.friendItemSelected]}
                            onPress={() => toggleFriend(item.friend_id)}
                          >
                            {item.friend_avatar_url ? (
                              <Image
                                source={{ uri: item.friend_avatar_url }}
                                style={styles.avatar}
                              />
                            ) : (
                              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={24} color={colors.white} />
                              </View>
                            )}
                            <Text style={styles.friendName}>{item.friend_username}</Text>
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
                      showsVerticalScrollIndicator={true}
                    />
                  </View>
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
            </View>
          </TouchableWithoutFeedback>

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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
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
  friendsList: {
    flex: 1,
    marginBottom: spacing.md,
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
  avatarPlaceholder: {
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
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
