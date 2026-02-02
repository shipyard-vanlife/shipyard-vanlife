import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { colors, spacing, borderRadius, fontSize, shadows } from '../../styles/theme'
import { useRespondToInvitation } from '../../hooks/useActivities'
import type { ActivityInvitation } from '../../types/activity'
import { ACTIVITY_TYPE_ICONS, ACTIVITY_TYPE_COLORS } from '../../types/activity'

interface InvitationCardProps {
  invitation: ActivityInvitation
  onPress?: () => void
}

export const InvitationCard: React.FC<InvitationCardProps> = ({ invitation, onPress }) => {
  const { t, i18n } = useTranslation('activities')
  const locale = i18n.language === 'fr' ? fr : enUS
  const { mutate: respond, isPending } = useRespondToInvitation()

  const startDate = invitation.activity_start_date ? new Date(invitation.activity_start_date) : null
  const formattedDate = startDate ? format(startDate, 'EEE d MMM · HH:mm', { locale }) : ''

  const handleAccept = () => {
    respond(
      { invitationId: invitation.id, response: 'accepted' },
      {
        onSuccess: data => {
          if (data.success) {
            Alert.alert(t('alerts.invitationAccepted'))
          } else if (data.error === 'Activity is full') {
            Alert.alert(t('alerts.activityFull'))
          } else {
            Alert.alert(t('alerts.error'), data.error)
          }
        },
        onError: () => {
          Alert.alert(t('alerts.error'))
        },
      }
    )
  }

  const handleDecline = () => {
    Alert.alert(t('invitations.declineConfirm'), '', [
      { text: t('common:buttons.cancel'), style: 'cancel' },
      {
        text: t('invitations.decline'),
        style: 'destructive',
        onPress: () => {
          respond(
            { invitationId: invitation.id, response: 'declined' },
            {
              onSuccess: () => {
                Alert.alert(t('alerts.invitationDeclined'))
              },
              onError: () => {
                Alert.alert(t('alerts.error'))
              },
            }
          )
        },
      },
    ])
  }

  const iconName = invitation.activity_type
    ? ACTIVITY_TYPE_ICONS[invitation.activity_type]
    : 'calendar'
  const iconColor = invitation.activity_type
    ? ACTIVITY_TYPE_COLORS[invitation.activity_type]
    : colors.secondary.main

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={invitation.status !== 'pending'}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <Ionicons name={iconName as any} size={24} color={colors.white} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {invitation.activity_title}
          </Text>
          <Text style={styles.subtitle}>
            {t('invitations.from')} {invitation.inviter_username}
          </Text>
        </View>
      </View>

      {invitation.message && (
        <Text style={styles.message} numberOfLines={2}>
          "{invitation.message}"
        </Text>
      )}

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={16} color={colors.text.tertiary} />
        <Text style={styles.infoText}>{formattedDate}</Text>
      </View>

      {invitation.activity_location_name && (
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.infoText} numberOfLines={1}>
            {invitation.activity_location_name}
          </Text>
        </View>
      )}

      {invitation.status === 'pending' ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.declineButton]}
            onPress={handleDecline}
            disabled={isPending}
          >
            <Text style={styles.declineButtonText}>{t('invitations.decline')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAccept}
            disabled={isPending}
          >
            <Text style={styles.acceptButtonText}>
              {isPending ? t('invitations.accepting') : t('invitations.accept')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {invitation.status === 'accepted'
              ? t('invitations.accepted')
              : t('invitations.declined')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  declineButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  acceptButton: {
    backgroundColor: colors.secondary.main,
  },
  acceptButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.white,
  },
  statusBadge: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
  },
})
