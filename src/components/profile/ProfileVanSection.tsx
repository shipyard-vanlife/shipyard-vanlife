import React from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../styles/theme'

interface ProfileVanSectionProps {
  vanName: string | null
  vanPhotoUrl: string | null
  isOwnProfile?: boolean
  onEditPress?: () => void
}

export const ProfileVanSection: React.FC<ProfileVanSectionProps> = ({
  vanName,
  vanPhotoUrl,
  isOwnProfile = false,
  onEditPress,
}) => {
  const { t } = useTranslation('profile')

  const hasVanInfo = vanName || vanPhotoUrl

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('sections.van')}</Text>

      {hasVanInfo ? (
        <View style={styles.card}>
          {vanPhotoUrl ? (
            <Image source={{ uri: vanPhotoUrl }} style={styles.vanPhoto} />
          ) : (
            <View style={styles.vanPhotoPlaceholder}>
              <Ionicons name="car-sport" size={48} color={colors.text.muted} />
            </View>
          )}
          <View style={styles.vanInfo}>
            <Text style={styles.vanName}>{vanName ?? t('placeholders.noVan')}</Text>
            {isOwnProfile && onEditPress ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={onEditPress}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil" size={16} color={colors.secondary.main} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="car-sport-outline" size={32} color={colors.text.muted} />
          <Text style={styles.emptyText}>{t('placeholders.noVan')}</Text>
          {isOwnProfile && onEditPress ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={onEditPress}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>{t('actions.addVan')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.small,
  },
  vanPhoto: {
    width: '100%',
    height: 160,
    backgroundColor: colors.primary.dark,
  },
  vanPhotoPlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vanInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  vanName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadows.small,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.text.muted,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  addButton: {
    backgroundColor: colors.secondary.main,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
})
