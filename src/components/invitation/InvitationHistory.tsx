import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { Gift, Users } from 'lucide-react-native'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme'
import { useMyInvitationCodes } from '../../hooks/useInvitations'
import { InviteeCard } from './InviteeCard'
import type { InvitationCode } from '../../types/invitation'

export const InvitationHistory: React.FC = () => {
  const { t } = useTranslation(['invitation', 'common'])
  const { data: codes = [], isLoading } = useMyInvitationCodes()

  // Separate used and unused codes
  const usedCodes = codes.filter(c => c.used_by_id !== null)
  const pendingCodes = codes.filter(c => c.used_by_id === null)

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common:loading')}</Text>
        </View>
      </View>
    )
  }

  // No codes at all - show encouraging empty state
  if (codes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Gift size={32} color={colors.text.muted} />
          </View>
          <Text style={styles.emptyTitle}>{t('invitation:history.emptyTitle')}</Text>
          <Text style={styles.emptySubtitle}>{t('invitation:history.emptySubtitle')}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Used codes section - Invitees who joined */}
      {usedCodes.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={16} color={colors.success} />
            <Text style={styles.sectionTitle}>{t('invitation:history.inviteesTitle')}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{usedCodes.length}</Text>
            </View>
          </View>
          <View style={styles.cardList}>
            {usedCodes.map((code: InvitationCode) => (
              <InviteeCard
                key={code.id}
                code={code.code}
                usedByUsername={code.used_by_username}
                usedAt={code.used_at}
                createdAt={code.created_at}
                isUsed={true}
              />
            ))}
          </View>
        </View>
      ) : null}

      {/* Pending codes section */}
      {pendingCodes.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleMuted}>{t('invitation:history.pendingTitle')}</Text>
          </View>
          <View style={styles.cardList}>
            {pendingCodes.map((code: InvitationCode) => (
              <InviteeCard
                key={code.id}
                code={code.code}
                usedByUsername={null}
                usedAt={null}
                createdAt={code.created_at}
                isUsed={false}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.text.muted}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    textAlign: 'center',
    maxWidth: 250,
  },

  // Sections
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.success,
    flex: 1,
  },
  sectionTitleMuted: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.muted,
  },
  countBadge: {
    backgroundColor: colors.success,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  countText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  cardList: {
    gap: spacing.sm,
  },
})

export default InvitationHistory
