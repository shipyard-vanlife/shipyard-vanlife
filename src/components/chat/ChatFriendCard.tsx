import React, { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { UserAvatar } from '../shared/UserAvatar'
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../styles/theme'
import type { Friend } from '../../types/chat'

interface ChatFriendCardProps {
  friend: Friend
  onAvatarPress: () => void
  onConversationPress: () => void
  onCancelPress: () => void
}

export const ChatFriendCard = memo(function ChatFriendCard({
  friend,
  onAvatarPress,
  onConversationPress,
  onCancelPress,
}: ChatFriendCardProps) {
  const { t } = useTranslation(['chat'])

  return (
    <View style={styles.card}>
      <UserAvatar
        uri={friend.friend_avatar_url}
        size={50}
        onPress={friend.status === 'accepted' ? onAvatarPress : undefined}
      />

      <TouchableOpacity
        style={styles.textSection}
        onPress={friend.status === 'accepted' ? onConversationPress : undefined}
      >
        <View style={styles.nameRow}>
          <Text style={styles.name}>{friend.friend_username}</Text>
          {friend.status === 'pending' ? (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>{t('status.pending')}</Text>
            </View>
          ) : null}
        </View>
        {friend.last_message ? (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {friend.last_message}
          </Text>
        ) : (
          <Text style={styles.noMessage}>
            {friend.status === 'pending' ? t('status.requestSent') : t('status.noMessage')}
          </Text>
        )}
      </TouchableOpacity>

      {friend.status === 'pending' ? (
        <TouchableOpacity style={styles.cancelButton} onPress={onCancelPress}>
          <Ionicons name="close" size={18} color={colors.text.tertiary} />
        </TouchableOpacity>
      ) : friend.unread_count > 0 ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{friend.unread_count}</Text>
        </View>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary.main,
    gap: spacing.md,
  },
  textSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  pendingBadge: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    color: colors.secondary.main,
  },
  lastMessage: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  noMessage: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  unreadBadge: {
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.lg,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  unreadText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
  },
})
