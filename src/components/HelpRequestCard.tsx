import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme'
import { HelpRequest } from '../types/chat'

interface HelpRequestCardProps {
  request: HelpRequest
  isMyRequest: boolean
  requesterName: string
  onAccept?: () => void
  onDecline?: () => void
  onCancel?: () => void
  isResponding?: boolean
}

export const HelpRequestCard: React.FC<HelpRequestCardProps> = ({
  request,
  isMyRequest,
  requesterName,
  onAccept,
  onDecline,
  onCancel,
  isResponding = false,
}) => {
  const { t } = useTranslation(['help', 'skills'])

  if (request.status === 'accepted') {
    return (
      <View style={[styles.card, styles.cardAccepted]}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isMyRequest ? t('help:requestAccepted') : t('help:requestAcceptedByMe', { name: requesterName })}
          </Text>
          <Text style={styles.skill}>{t(`skills:${request.skill_requested}`)}</Text>
        </View>
      </View>
    )
  }

  if (request.status === 'declined') {
    return (
      <View style={[styles.card, styles.cardDeclined]}>
        <View style={styles.iconContainer}>
          <Ionicons name="close-circle" size={24} color={colors.text.tertiary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isMyRequest ? t('help:requestDeclined') : t('help:requestDeclinedByMe', { name: requesterName })}
          </Text>
          <Text style={styles.skill}>{t(`skills:${request.skill_requested}`)}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.card, styles.cardPending]}>
      <View style={styles.iconContainer}>
        <Ionicons name="help-circle" size={24} color={colors.secondary.main} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isMyRequest ? t('help:requestedHelp') : t('help:needsHelp', { name: requesterName })}
        </Text>
        <Text style={styles.skill}>{t(`skills:${request.skill_requested}`)}</Text>

        {isMyRequest ? (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={isResponding}>
            {isResponding ? (
              <ActivityIndicator size="small" color={colors.text.tertiary} />
            ) : (
              <Text style={styles.cancelText}>{t('help:cancel')}</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={onAccept}
              disabled={isResponding}
            >
              {isResponding ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color={colors.white} />
                  <Text style={styles.buttonText}>{t('help:accept')}</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={onDecline}
              disabled={isResponding}
            >
              <Ionicons name="close" size={18} color={colors.text.secondary} />
              <Text style={styles.declineText}>{t('help:decline')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginVertical: spacing.md,
    marginHorizontal: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPending: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.secondary.main,
  },
  cardAccepted: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.success,
    borderLeftWidth: 6,
  },
  cardDeclined: {
    backgroundColor: colors.primary.main,
    borderWidth: 2,
    borderColor: colors.border.medium,
    opacity: 0.7,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  skill: {
    fontSize: fontSize.lg,
    color: colors.secondary.main,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.secondary.main + '15',
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  acceptButton: {
    backgroundColor: colors.secondary.main,
    shadowColor: colors.secondary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  declineButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border.medium,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  declineText: {
    color: colors.text.secondary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.main,
  },
  cancelText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
})
