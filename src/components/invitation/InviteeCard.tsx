import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { UserCheck, Clock, Sparkles } from 'lucide-react-native'
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../styles/theme'

interface InviteeCardProps {
  code: string
  usedByUsername: string | null
  usedAt: string | null
  createdAt: string
  isUsed: boolean
}

export const InviteeCard: React.FC<InviteeCardProps> = ({
  code,
  usedByUsername,
  usedAt,
  createdAt,
  isUsed,
}) => {
  const { t } = useTranslation(['invitation'])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    })
  }

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  if (isUsed && usedByUsername) {
    return (
      <View style={styles.cardUsed}>
        {/* Avatar with initials */}
        <View style={styles.avatarUsed}>
          <Text style={styles.avatarText}>{getInitials(usedByUsername)}</Text>
          <View style={styles.checkBadge}>
            <UserCheck size={10} color={colors.white} />
          </View>
        </View>

        {/* User info */}
        <View style={styles.userInfo}>
          <View style={styles.usernameRow}>
            <Text style={styles.username}>@{usedByUsername}</Text>
            <Sparkles size={14} color={colors.secondary.main} />
          </View>
          <Text style={styles.joinedText}>
            {t('invitation:history.joinedOn', { date: formatDate(usedAt ?? createdAt) })}
          </Text>
        </View>

        {/* Code badge */}
        <View style={styles.codeBadgeUsed}>
          <Text style={styles.codeBadgeText}>{code}</Text>
        </View>
      </View>
    )
  }

  // Pending code - waiting to be used
  return (
    <View style={styles.cardPending}>
      {/* Pending avatar */}
      <View style={styles.avatarPending}>
        <Clock size={20} color={colors.text.muted} />
      </View>

      {/* Pending info */}
      <View style={styles.pendingInfo}>
        <Text style={styles.pendingTitle}>{t('invitation:history.waitingTitle')}</Text>
        <Text style={styles.pendingSubtitle}>
          {t('invitation:history.createdAt', { date: formatDate(createdAt) })}
        </Text>
      </View>

      {/* Code badge */}
      <View style={styles.codeBadgePending}>
        <Text style={styles.codeBadgePendingText}>{code}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  // Used card - celebratory style
  cardUsed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
    ...shadows.small,
  },
  avatarUsed: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary.main,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  username: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  joinedText: {
    fontSize: fontSize.xs,
    color: colors.success,
  },
  codeBadgeUsed: {
    backgroundColor: `${colors.success}15`,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  codeBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.success,
    letterSpacing: 0.5,
  },

  // Pending card - subtle style
  cardPending: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  avatarPending: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.text.muted}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingInfo: {
    flex: 1,
    gap: 2,
  },
  pendingTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  pendingSubtitle: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  codeBadgePending: {
    backgroundColor: `${colors.text.muted}15`,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  codeBadgePendingText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
})

export default InviteeCard
