import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { UserPlus, Trophy, Sparkles, AlertCircle, Lock } from 'lucide-react-native'
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../styles/theme'
import { useInvitationCount, useGenerateInvitationCode } from '../../hooks/useInvitations'
import { InvitationCodeModal } from './InvitationCodeModal'
import { InvitationHistory } from './InvitationHistory'

interface InvitationSectionProps {
  isVerified: boolean
  isSuspended: boolean
  suspendedUntil?: string | null
}

export const InvitationSection: React.FC<InvitationSectionProps> = ({
  isVerified,
  isSuspended,
  suspendedUntil,
}) => {
  const { t } = useTranslation(['invitation', 'common'])
  const [showModal, setShowModal] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  const { data: invitationCount = 0 } = useInvitationCount()
  const generateCodeMutation = useGenerateInvitationCode()

  const handleGenerateCode = () => {
    generateCodeMutation.mutate(undefined, {
      onSuccess: code => {
        setGeneratedCode(code)
        setShowModal(true)
      },
    })
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setGeneratedCode(null)
  }

  const canGenerate = isVerified && !isSuspended

  const formatSuspensionDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Get milestone message based on count
  const getMilestoneMessage = () => {
    if (invitationCount === 0) return t('invitation:milestones.start')
    if (invitationCount < 3) return t('invitation:milestones.beginner')
    if (invitationCount < 5) return t('invitation:milestones.growing')
    if (invitationCount < 10) return t('invitation:milestones.ambassador')
    return t('invitation:milestones.legend')
  }

  return (
    <View style={styles.container}>
      {/* Header with trophy and count */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.trophyContainer}>
            <Trophy size={24} color={colors.secondary.main} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t('invitation:section.title')}</Text>
            <Text style={styles.milestone}>{getMilestoneMessage()}</Text>
          </View>
        </View>

        {/* Count badge */}
        <View style={styles.countContainer}>
          <Text style={styles.countNumber}>{invitationCount}</Text>
          <Text style={styles.countLabel}>
            {invitationCount === 1
              ? t('invitation:section.invitee')
              : t('invitation:section.invitees')}
          </Text>
        </View>
      </View>

      {/* Status message or generate button */}
      {isSuspended && suspendedUntil ? (
        <View style={styles.alertContainer}>
          <AlertCircle size={18} color={colors.error} />
          <Text style={styles.alertText}>
            {t('invitation:section.suspended', { date: formatSuspensionDate(suspendedUntil) })}
          </Text>
        </View>
      ) : !isVerified ? (
        <View style={styles.lockedContainer}>
          <Lock size={18} color={colors.text.muted} />
          <Text style={styles.lockedText}>{t('invitation:section.notVerified')}</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.generateButton, generateCodeMutation.isPending && styles.buttonDisabled]}
          onPress={handleGenerateCode}
          disabled={!canGenerate || generateCodeMutation.isPending}
          accessibilityRole="button"
          accessibilityLabel={t('invitation:section.generateButton')}
          activeOpacity={0.8}
        >
          <View style={styles.buttonIconContainer}>
            <UserPlus size={20} color={colors.white} />
          </View>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.generateButtonText}>{t('invitation:section.generateButton')}</Text>
            <Text style={styles.generateButtonHint}>{t('invitation:section.generateHint')}</Text>
          </View>
          <Sparkles size={16} color={colors.white} style={styles.sparkle} />
        </TouchableOpacity>
      )}

      {/* Invitation history */}
      <InvitationHistory />

      {/* Code modal */}
      <InvitationCodeModal visible={showModal} code={generatedCode} onClose={handleCloseModal} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.medium,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  trophyContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.secondary.main}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  milestone: {
    fontSize: fontSize.xs,
    color: colors.secondary.main,
    fontWeight: fontWeight.medium,
  },

  // Count badge
  countContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    minWidth: 60,
    ...shadows.small,
  },
  countNumber: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.secondary.main,
  },
  countLabel: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },

  // Generate button
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.small,
  },
  buttonDisabled: {
    backgroundColor: colors.text.muted,
    opacity: 0.7,
  },
  buttonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextContainer: {
    flex: 1,
    gap: 2,
  },
  generateButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  generateButtonHint: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  sparkle: {
    opacity: 0.8,
  },

  // Alert states
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.error}10`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.error}30`,
  },
  alertText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.error,
  },
  lockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.text.muted}10`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  lockedText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
})

export default InvitationSection
