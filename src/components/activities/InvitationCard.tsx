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
        onError: (error: any) => {
          console.error('Accept invitation error:', error)
          Alert.alert(t('alerts.error'), error?.message || 'Une erreur est survenue')
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
      style={styles.cardWrapper}
      onPress={onPress}
      disabled={invitation.status !== 'pending'}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        {/* Glowing Header */}
        <View style={[styles.header, { backgroundColor: iconColor + '08' }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconGlowWrapper, { backgroundColor: iconColor + '20' }]}>
              <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
                <Ionicons name={iconName as any} size={26} color={colors.white} />
              </View>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title} numberOfLines={1}>
                {invitation.activity_title}
              </Text>
              <View style={styles.inviterRow}>
                <View style={styles.inviterAvatar}>
                  <Ionicons name="person" size={10} color={colors.white} />
                </View>
                <Text style={styles.subtitle}>{invitation.inviter_username}</Text>
              </View>
            </View>
          </View>
          {invitation.status === 'pending' && (
            <View style={styles.pulsingBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.newBadgeText}>NOUVEAU</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Message Bubble */}
          {invitation.message && (
            <View style={[styles.messageBubble, { borderLeftColor: iconColor }]}>
              <View style={[styles.quoteIcon, { backgroundColor: iconColor + '15' }]}>
                <Ionicons name="chatbubble" size={16} color={iconColor} />
              </View>
              <Text style={styles.message} numberOfLines={3}>
                {invitation.message}
              </Text>
            </View>
          )}

          {/* Info Cards with Icons */}
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <View style={[styles.infoIconCircle, { backgroundColor: iconColor + '15' }]}>
                <Ionicons name="time" size={18} color={iconColor} />
              </View>
              <Text style={styles.infoText} numberOfLines={1}>
                {formattedDate}
              </Text>
            </View>
            {invitation.activity_location_name && (
              <View style={styles.infoCard}>
                <View style={[styles.infoIconCircle, { backgroundColor: iconColor + '15' }]}>
                  <Ionicons name="location" size={18} color={iconColor} />
                </View>
                <Text style={styles.infoText} numberOfLines={1}>
                  {invitation.activity_location_name}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons or Status */}
          {invitation.status === 'pending' ? (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.declineButton]}
                onPress={handleDecline}
                disabled={isPending}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                <Text style={styles.declineButtonText}>{t('invitations.decline')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.acceptButton, { backgroundColor: iconColor }]}
                onPress={handleAccept}
                disabled={isPending}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                <Text style={styles.acceptButtonText}>
                  {isPending ? t('invitations.accepting') : t('invitations.accept')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    invitation.status === 'accepted' ? '#10B981' + '15' : '#DC2626' + '15',
                },
              ]}
            >
              <Ionicons
                name={invitation.status === 'accepted' ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={invitation.status === 'accepted' ? '#10B981' : '#DC2626'}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: invitation.status === 'accepted' ? '#10B981' : '#DC2626' },
                ]}
              >
                {invitation.status === 'accepted'
                  ? t('invitations.accepted')
                  : t('invitations.declined')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: spacing.xl,
    marginVertical: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...shadows.medium,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  iconGlowWrapper: {
    padding: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  inviterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  inviterAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.secondary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  pulsingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 1,
  },
  body: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  messageBubble: {
    flexDirection: 'row',
    backgroundColor: colors.primary.light,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    borderLeftWidth: 4,
  },
  quoteIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  message: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: 20,
    fontWeight: '500',
  },
  infoCards: {
    gap: spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.light,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
  },
  infoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  declineButton: {
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.border.main,
  },
  declineButtonText: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text.secondary,
  },
  acceptButton: {},
  acceptButtonText: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.white,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: fontSize.md,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
