import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, borderRadius, fontSize, shadows } from '../../styles/theme'
import { Activity, ACTIVITY_TYPE_ICONS, ACTIVITY_TYPE_COLORS } from '../../types/activity'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

interface ActivityCardProps {
  activity: Activity
  onPress: () => void
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onPress }) => {
  const { t, i18n } = useTranslation('activities')
  const locale = i18n.language === 'fr' ? fr : enUS

  // Format date
  const startDate = new Date(activity.start_date)
  const formattedDate = format(startDate, 'EEE d MMM · HH:mm', { locale })

  // Calculate if activity is full
  const isFull =
    activity.max_participants !== null &&
    activity.current_participants !== undefined &&
    activity.current_participants >= activity.max_participants

  // Get status color
  const getStatusColor = () => {
    if (activity.status === 'cancelled') return '#DC2626'
    if (activity.status === 'finished') return '#666666'
    if (isFull) return '#F59E0B'
    return colors.secondary.main
  }

  // Get status text
  const getStatusText = () => {
    if (activity.status === 'cancelled') return t('status.cancelled')
    if (activity.status === 'finished') return t('status.finished')
    if (isFull) return t('status.full')
    return t('status.open')
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Header with type icon and status */}
      <View style={styles.header}>
        <View
          style={[
            styles.typeIcon,
            { backgroundColor: ACTIVITY_TYPE_COLORS[activity.activity_type] },
          ]}
        >
          <Ionicons
            name={ACTIVITY_TYPE_ICONS[activity.activity_type] as any}
            size={20}
            color={colors.white}
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {activity.title}
          </Text>
          <Text style={styles.creator} numberOfLines={1}>
            {t('card.by')} {activity.creator_username}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      {/* Location and date */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="location" size={14} color={colors.text.tertiary} />
          <Text style={styles.infoText} numberOfLines={1}>
            {activity.location_name}
            {activity.distance_km !== null && activity.distance_km !== undefined && (
              <Text style={styles.distance}> · {Math.round(activity.distance_km)}km</Text>
            )}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar" size={14} color={colors.text.tertiary} />
          <Text style={styles.infoText}>{formattedDate}</Text>
        </View>
      </View>

      {/* Participants */}
      <View style={styles.footer}>
        <View style={styles.participants}>
          <Ionicons name="people" size={16} color={colors.text.tertiary} />
          <Text style={styles.participantsText}>
            {activity.current_participants || 0}
            {activity.max_participants && `/${activity.max_participants}`} {t('card.participants')}
          </Text>
        </View>

        {/* Badges */}
        <View style={styles.badges}>
          {activity.is_creator && (
            <View style={[styles.badge, styles.creatorBadge]}>
              <Text style={styles.badgeText}>{t('card.creator')}</Text>
            </View>
          )}
          {activity.is_participant && (
            <View style={[styles.badge, styles.participantBadge]}>
              <Text style={styles.badgeText}>{t('card.participating')}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  creator: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.white,
  },
  infoRow: {
    marginBottom: spacing.xs,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  distance: {
    color: colors.text.tertiary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  participantsText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  creatorBadge: {
    backgroundColor: colors.secondary.light,
  },
  participantBadge: {
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.white,
  },
})
