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

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.typeIcon, { backgroundColor: typeColor }]}>
            <Ionicons name={iconName} size={20} color={colors.white} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={2}>
              {activity.title}
            </Text>
            <Text style={styles.location}>{activity.location_name}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Details */}
        <View style={styles.details}>
          {/* Date */}
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color={colors.text.tertiary} />
            <Text style={styles.detailText}>{formatDateCompact(activity.start_date)}</Text>
          </View>

          {/* Creator */}
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={18} color={colors.text.tertiary} />
            <Text style={styles.detailText}>
              {t('card.by')} {activity.creator_username}
            </Text>
          </View>

          {/* Participants */}
          {activity.max_participants ? (
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={18} color={colors.text.tertiary} />
              <Text style={styles.detailText}>
                {activity.current_participants ?? 0}/{activity.max_participants}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Description */}
        {activity.description ? (
          <Text style={styles.description} numberOfLines={3}>
            {activity.description}
          </Text>
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
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
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
    marginBottom: spacing.lg,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  location: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
  },
  description: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
})
