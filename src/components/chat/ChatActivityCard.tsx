import React, { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { ACTIVITY_TYPE_ICONS, ACTIVITY_TYPE_COLORS } from '../../types/activity'
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../styles/theme'
import type { ActivityChatPreview } from '../../types/activityChat'

interface ChatActivityCardProps {
  chat: ActivityChatPreview
  onPress: () => void
}

export const ChatActivityCard = memo(function ChatActivityCard({
  chat,
  onPress,
}: ChatActivityCardProps) {
  const { t } = useTranslation(['chat'])
  const iconName =
    ACTIVITY_TYPE_ICONS[chat.activity_type as keyof typeof ACTIVITY_TYPE_ICONS] ??
    'ellipsis-horizontal'
  const iconColor =
    ACTIVITY_TYPE_COLORS[chat.activity_type as keyof typeof ACTIVITY_TYPE_COLORS] ?? '#666666'

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <Ionicons name={iconName as any} size={22} color={colors.white} />
      </View>

      <View style={styles.textSection}>
        <Text style={styles.title} numberOfLines={1}>
          {chat.activity_title}
        </Text>
        {chat.last_message ? (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {chat.last_message}
          </Text>
        ) : (
          <Text style={styles.noMessage}>{t('status.noMessage')}</Text>
        )}
      </View>

      {chat.unread_count > 0 ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{chat.unread_count}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
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
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 4,
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
})
