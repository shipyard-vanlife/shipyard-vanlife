import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, shadows, borderRadius, fontSize, fontWeight, spacing } from '../../styles/theme'
import type { Activity } from '../../types/activity'
import { ACTIVITY_TYPE_COLORS, ACTIVITY_TYPE_ICONS } from '../../types/activity'
import { formatDateCompact } from '../../utils/formatDate'

interface ActivityDetailSheetProps {
  activity: Activity
  onClose: () => void
}

export const ActivityDetailSheet: React.FC<ActivityDetailSheetProps> = ({ activity, onClose }) => {
  const { t } = useTranslation('activities')
  const insets = useSafeAreaInsets()
  const iconName = ACTIVITY_TYPE_ICONS[activity.activity_type] as keyof typeof Ionicons.glyphMap
  const typeColor = ACTIVITY_TYPE_COLORS[activity.activity_type]

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Header with gradient effect */}
        <View style={[styles.header, { backgroundColor: typeColor + '08' }]}>
          <View style={[styles.typeIconContainer, { backgroundColor: typeColor + '15' }]}>
            <View style={[styles.typeIcon, { backgroundColor: typeColor }]}>
              <Ionicons name={iconName} size={24} color={colors.white} />
            </View>
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.title} numberOfLines={2}>
              {activity.title}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={14} color={colors.text.tertiary} />
              <Text style={styles.location} numberOfLines={1}>{activity.location_name}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Details Cards */}
        <View style={styles.detailsGrid}>
          {/* Date Card */}
          <View style={styles.detailCard}>
            <View style={styles.detailIconCircle}>
              <Ionicons name="time" size={20} color={colors.secondary.main} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {formatDateCompact(activity.start_date)}
              </Text>
            </View>
          </View>

          {/* Creator Card */}
          <View style={styles.detailCard}>
            <View style={styles.detailIconCircle}>
              <Ionicons name="person" size={20} color={colors.secondary.main} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Créateur</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {activity.creator_username}
              </Text>
            </View>
          </View>
        </View>

        {/* Participants Banner */}
        {activity.max_participants ? (
          <View style={styles.participantsBanner}>
            <View style={styles.participantsIconGroup}>
              <View style={styles.participantIconSmall}>
                <Ionicons name="person" size={12} color={colors.white} />
              </View>
              {(activity.current_participants ?? 0) > 1 && (
                <View style={[styles.participantIconSmall, { marginLeft: -10 }]}>
                  <Ionicons name="person" size={12} color={colors.white} />
                </View>
              )}
            </View>
            <Text style={styles.participantsText}>
              <Text style={styles.participantsNumber}>{activity.current_participants ?? 0}</Text>
              <Text style={styles.participantsSeparator}> / </Text>
              <Text style={styles.participantsMax}>{activity.max_participants}</Text>
              <Text style={styles.participantsLabel}> {t('card.participants')}</Text>
            </Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(((activity.current_participants ?? 0) / activity.max_participants) * 100, 100)}%`,
                    backgroundColor: ((activity.current_participants ?? 0) / activity.max_participants) >= 1 ? '#F59E0B' : colors.secondary.main
                  }
                ]}
              />
            </View>
          </View>
        ) : null}

        {/* Description */}
        {activity.description ? (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <Text style={styles.description} numberOfLines={4}>
              {activity.description}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    zIndex: 20,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingTop: spacing.sm,
    ...shadows.large,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.main,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.md,
  },
  typeIconContainer: {
    padding: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: '500',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  detailCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.light,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  detailIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    fontWeight: '700',
  },
  participantsBanner: {
    backgroundColor: colors.secondary.light + '15',
    marginHorizontal: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.secondary.light + '30',
    marginBottom: spacing.lg,
  },
  participantsIconGroup: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  participantIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary.main,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  participantsText: {
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  participantsNumber: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.secondary.main,
  },
  participantsSeparator: {
    fontSize: fontSize.md,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  participantsMax: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  participantsLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.border.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  descriptionContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  descriptionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    lineHeight: 22,
    fontWeight: '500',
  },
})
