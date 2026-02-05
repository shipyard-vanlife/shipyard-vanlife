import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { colors, spacing, borderRadius, fontSize, shadows } from '../../styles/theme'
import {
  useActivityById,
  useActivityParticipants,
  useJoinActivity,
  useLeaveActivity,
  useCancelActivity,
} from '../../hooks/useActivities'
import { useMyProfile } from '../../hooks/useProfiles'
import { ACTIVITY_TYPE_ICONS, ACTIVITY_TYPE_COLORS } from '../../types/activity'
import { InviteFriendsModal } from './InviteFriendsModal'

interface ActivityDetailModalProps {
  activityId: string | null
  onClose: () => void
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activityId,
  onClose,
}) => {
  const { t, i18n } = useTranslation('activities')
  const locale = i18n.language === 'fr' ? fr : enUS
  const [showInviteModal, setShowInviteModal] = useState(false)

  const { data: activity, isLoading } = useActivityById(activityId)
  const { data: participants } = useActivityParticipants(activityId)
  const { data: myProfile } = useMyProfile()
  const { mutate: joinActivity, isPending: isJoining } = useJoinActivity()
  const { mutate: leaveActivity, isPending: isLeaving } = useLeaveActivity()
  const { mutate: cancelActivity, isPending: isCancelling } = useCancelActivity()

  if (!activityId) return null

  const handleJoin = () => {
    joinActivity(activityId, {
      onSuccess: (data) => {
        if (data.success) {
          Alert.alert(t('alerts.joinSuccess'))
        } else if (data.error === 'Activity is full') {
          Alert.alert(t('alerts.activityFull'))
        } else if (data.error === 'Already a participant') {
          Alert.alert(t('alerts.error'), 'Tu participes déjà à cette activité')
        } else {
          Alert.alert(t('alerts.error'), data.error)
        }
      },
      onError: (error: any) => {
        console.error('Join activity error:', error)
        Alert.alert(t('alerts.error'), error?.message || 'Une erreur est survenue')
      },
    })
  }

  const handleLeave = () => {
    Alert.alert(t('alerts.leaveConfirm'), '', [
      { text: t('common:buttons.cancel'), style: 'cancel' },
      {
        text: t('actions.leave'),
        style: 'destructive',
        onPress: () => {
          leaveActivity(activityId, {
            onSuccess: () => {
              Alert.alert(t('alerts.leaveSuccess'))
              onClose()
            },
            onError: (error: any) => {
              console.error('Leave activity error:', error)
              Alert.alert(t('alerts.error'), error?.message || 'Une erreur est survenue')
            },
          })
        },
      },
    ])
  }

  const handleCancel = () => {
    Alert.alert(t('alerts.cancelConfirm'), '', [
      { text: t('common:buttons.cancel'), style: 'cancel' },
      {
        text: t('actions.cancel'),
        style: 'destructive',
        onPress: () => {
          cancelActivity(activityId, {
            onSuccess: () => {
              Alert.alert(t('alerts.cancelSuccess'))
              onClose()
            },
            onError: () => {
              Alert.alert(t('alerts.error'))
            },
          })
        },
      },
    ])
  }

  if (isLoading || !activity) {
    return (
      <Modal visible={!!activityId} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary.main} />
        </View>
      </Modal>
    )
  }

  const startDate = new Date(activity.start_date)
  const formattedDate = format(startDate, 'EEEE d MMMM yyyy · HH:mm', { locale })

  const isFull =
    activity.max_participants !== null &&
    participants !== undefined &&
    participants.length >= activity.max_participants

  const isCreator = activity.creator_id === myProfile?.id
  const isParticipant = activity.is_participant

  return (
    <Modal visible={!!activityId} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <View
            style={[
              styles.typeIconHeader,
              { backgroundColor: ACTIVITY_TYPE_COLORS[activity.activity_type] },
            ]}
          >
            <Ionicons
              name={ACTIVITY_TYPE_ICONS[activity.activity_type] as any}
              size={24}
              color={colors.white}
            />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Text style={styles.title}>{activity.title}</Text>

          {/* Type */}
          <Text style={styles.type}>{t(`types.${activity.activity_type}`)}</Text>

          {/* Organizer */}
          <View style={styles.organizerSection}>
            <Text style={styles.sectionTitle}>{t('detail.organizer')}</Text>
            <View style={styles.organizer}>
              {activity.creator_avatar ? (
                <Image source={{ uri: activity.creator_avatar }} style={styles.organizerAvatar} />
              ) : (
                <View style={[styles.organizerAvatar, styles.organizerAvatarPlaceholder]}>
                  <Ionicons name="person" size={20} color={colors.text.tertiary} />
                </View>
              )}
              <Text style={styles.organizerName}>{activity.creator_username}</Text>
            </View>
          </View>

          {/* When */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('detail.when')}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={colors.secondary.main} />
              <Text style={styles.infoText}>{formattedDate}</Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('detail.location')}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={colors.secondary.main} />
              <Text style={styles.infoText}>{activity.location_name}</Text>
            </View>
            {activity.location && (
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: activity.location.latitude,
                  longitude: activity.location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: activity.location.latitude,
                    longitude: activity.location.longitude,
                  }}
                />
              </MapView>
            )}
          </View>

          {/* Description */}
          {activity.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('detail.description')}</Text>
              <Text style={styles.description}>{activity.description}</Text>
            </View>
          )}

          {/* Participants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('detail.participants')} ({participants?.length || 0}
              {activity.max_participants ? `/${activity.max_participants}` : ''})
            </Text>
            {!activity.max_participants && (
              <Text style={styles.unlimitedText}>{t('detail.unlimitedParticipants')}</Text>
            )}
            <View style={styles.participantsList}>
              {participants?.map(participant => (
                <View key={participant.id} style={styles.participantItem}>
                  {participant.avatar_url ? (
                    <Image
                      source={{ uri: participant.avatar_url }}
                      style={styles.participantAvatar}
                    />
                  ) : (
                    <View style={[styles.participantAvatar, styles.participantAvatarPlaceholder]}>
                      <Ionicons name="person" size={16} color={colors.text.tertiary} />
                    </View>
                  )}
                  <Text style={styles.participantName} numberOfLines={1}>
                    {participant.username}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          {/* Invite button for creator and participants */}
          {(isCreator || isParticipant) && activity.status === 'open' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.inviteButton]}
              onPress={() => setShowInviteModal(true)}
            >
              <Ionicons name="person-add" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>{t('actions.invite')}</Text>
            </TouchableOpacity>
          )}

          {isCreator ? (
            // Creator actions
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
                disabled={isCancelling}
              >
                <Text style={styles.actionButtonText}>
                  {isCancelling ? 'Annulation...' : t('actions.cancel')}
                </Text>
              </TouchableOpacity>
            </>
          ) : isParticipant ? (
            // Participant actions
            <TouchableOpacity
              style={[styles.actionButton, styles.leaveButton]}
              onPress={handleLeave}
              disabled={isLeaving}
            >
              <Text style={styles.actionButtonText}>
                {isLeaving ? 'Désinscription...' : t('actions.leave')}
              </Text>
            </TouchableOpacity>
          ) : (
            // Non-participant actions
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.joinButton,
                (isFull || activity.status !== 'open') && styles.actionButtonDisabled,
              ]}
              onPress={handleJoin}
              disabled={isJoining || isFull || activity.status !== 'open'}
            >
              <Text style={styles.actionButtonText}>
                {isJoining
                  ? 'Inscription...'
                  : isFull
                    ? t('status.full')
                    : activity.status === 'cancelled'
                      ? t('status.cancelled')
                      : t('actions.join')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Invite Friends Modal */}
      <InviteFriendsModal
        visible={showInviteModal}
        activityId={activityId}
        onClose={() => setShowInviteModal(false)}
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  typeIconHeader: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  type: {
    fontSize: fontSize.md,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  organizerSection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  organizer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  organizerAvatarPlaceholder: {
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizerName: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text.primary,
  },
  section: {
    marginTop: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    flex: 1,
  },
  map: {
    height: 200,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  description: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  unlimitedText: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.xs,
  },
  participantAvatarPlaceholder: {
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantName: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    fontWeight: '500',
    maxWidth: 120,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  actionButton: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  inviteButton: {
    backgroundColor: colors.tertiary.main,
  },
  joinButton: {
    backgroundColor: colors.secondary.main,
  },
  leaveButton: {
    backgroundColor: '#6B7280',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
})
