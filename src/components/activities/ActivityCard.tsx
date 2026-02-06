import React, { memo, useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, borderRadius, fontSize, shadows } from '../../styles/theme'
import { Activity, ACTIVITY_TYPE_ICONS, ACTIVITY_TYPE_COLORS } from '../../types/activity'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { LinearGradient } from 'expo-linear-gradient'

interface ActivityCardProps {
  activity: Activity
  onPress: () => void
  isRestricted?: boolean
}

export const ActivityCard: React.FC<ActivityCardProps> = memo(function ActivityCard({
  activity,
  onPress,
  isRestricted = false,
}) {
  const { t, i18n } = useTranslation('activities')
  const locale = i18n.language === 'fr' ? fr : enUS

  const formattedDate = useMemo(
    () => format(new Date(activity.start_date), 'EEE d MMM · HH:mm', { locale }),
    [activity.start_date, locale]
  )

  const isFull =
    activity.max_participants !== null &&
    activity.current_participants !== undefined &&
    activity.current_participants >= activity.max_participants

  const { statusColor, statusText } = useMemo(() => {
    if (activity.status === 'cancelled')
      return { statusColor: '#DC2626', statusText: t('status.cancelled') }
    if (activity.status === 'finished')
      return { statusColor: '#666666', statusText: t('status.finished') }
    if (isFull) return { statusColor: '#F59E0B', statusText: t('status.full') }
    return { statusColor: '#10B981', statusText: t('status.open') }
  }, [activity.status, isFull, t])

  const typeColor = ACTIVITY_TYPE_COLORS[activity.activity_type]

  return (
    <TouchableOpacity style={styles.cardWrapper} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.card}>
        {/* Gradient Header Background */}
        <View style={styles.headerGradient}>
          <View style={[styles.gradientOverlay, { backgroundColor: typeColor + '10' }]} />

          <View style={styles.headerContent}>
            {/* Type Icon with Glow */}
            <View style={[styles.iconGlowWrapper, { backgroundColor: typeColor + '20' }]}>
              <View style={[styles.iconContainer, { backgroundColor: typeColor }]}>
                <Ionicons
                  name={ACTIVITY_TYPE_ICONS[activity.activity_type] as any}
                  size={28}
                  color={colors.white}
                />
              </View>
            </View>

            <View style={styles.headerText}>
              <Text style={styles.title} numberOfLines={1}>
                {activity.title}
              </Text>
              <View style={styles.creatorRow}>
                <View style={styles.creatorAvatar}>
                  <Ionicons name="person" size={10} color={colors.white} />
                </View>
                <Text style={styles.creator} numberOfLines={1}>
                  {isRestricted ? t('card.restrictedCreator') : activity.creator_username}
                </Text>
              </View>
            </View>

            {/* Status Dot */}
            <View style={styles.statusContainer}>
              <View style={[styles.statusPulse, { backgroundColor: statusColor + '30' }]} />
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            </View>
          </View>
        </View>

        {/* Body Content */}
        <View style={styles.body}>
          {/* Location & Distance */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons
                name={isRestricted ? 'lock-closed' : 'location'}
                size={18}
                color={isRestricted ? colors.secondary.main : typeColor}
              />
            </View>
            <Text
              style={[styles.infoText, isRestricted && { color: colors.secondary.main }]}
              numberOfLines={1}
            >
              {isRestricted ? (
                t('card.restrictedLocation')
              ) : (
                <>
                  {activity.location_name}
                  {activity.distance_km !== null && activity.distance_km !== undefined && (
                    <Text style={styles.distance}>
                      {' '}• {Math.round(activity.distance_km * 10) / 10}km
                    </Text>
                  )}
                </>
              )}
            </Text>
          </View>

          {/* Date & Time */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="time" size={18} color={typeColor} />
            </View>
            <Text style={styles.infoText}>{formattedDate}</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {/* Participants with Progress */}
            <View style={styles.participantsSection}>
              <View style={styles.participantsAvatars}>
                {[...Array(Math.min(activity.current_participants || 0, 3))].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.participantAvatar,
                      { marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i },
                    ]}
                  >
                    <Ionicons name="person" size={10} color={colors.white} />
                  </View>
                ))}
                {(activity.current_participants || 0) > 3 && (
                  <View style={[styles.participantAvatar, styles.participantMore, { marginLeft: -8 }]}>
                    <Text style={styles.participantMoreText}>+{(activity.current_participants || 0) - 3}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.participantsText}>
                {isRestricted ? (
                  `? ${t('card.participants')}`
                ) : (
                  <>
                    <Text style={styles.participantsCount}>{activity.current_participants || 0}</Text>
                    {activity.max_participants && (
                      <>
                        <Text style={styles.participantsSeparator}>/</Text>
                        <Text style={styles.participantsMax}>{activity.max_participants}</Text>
                      </>
                    )}
                  </>
                )}
              </Text>
            </View>

            {/* Badges */}
            {!isRestricted && (activity.is_creator || activity.is_participant) && (
              <View style={styles.badgeContainer}>
                {activity.is_creator && (
                  <View style={[styles.badge, { backgroundColor: typeColor }]}>
                    <Ionicons name="star" size={12} color={colors.white} />
                  </View>
                )}
                {activity.is_participant && !activity.is_creator && (
                  <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
                    <Ionicons name="checkmark-circle" size={12} color={colors.white} />
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
})

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
  headerGradient: {
    position: 'relative',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    position: 'relative',
    zIndex: 1,
  },
  iconGlowWrapper: {
    padding: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  creatorAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.secondary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creator: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  statusContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: colors.white,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  distance: {
    color: colors.text.tertiary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    marginTop: spacing.xs,
  },
  participantsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  participantsAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.secondary.main,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.white,
  },
  participantMore: {
    backgroundColor: colors.text.tertiary,
  },
  participantMoreText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
  },
  participantsText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  participantsCount: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text.primary,
  },
  participantsSeparator: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  participantsMax: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
