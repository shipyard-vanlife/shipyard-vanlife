import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme'
import { formatDate } from '../../utils/formatDate'

interface VerificationConfirmationProps {
  firstname: string
  lastname: string
  dateOfBirth: Date | null
  facePhotoUri: string | null
  vanWithPersonPhotoUri: string | null
  registrationPlatePhotoUri: string | null
}

export const VerificationConfirmation: React.FC<VerificationConfirmationProps> = ({
  firstname,
  lastname,
  dateOfBirth,
  facePhotoUri,
  vanWithPersonPhotoUri,
  registrationPlatePhotoUri,
}) => {
  const { t } = useTranslation('verification')

  // Count provided photos
  const photos = [
    { uri: facePhotoUri, label: t('form.facePhoto') },
    { uri: vanWithPersonPhotoUri, label: t('form.vanPhoto') },
    { uri: registrationPlatePhotoUri, label: t('form.platePhoto') },
  ]

  return (
    <View style={styles.container}>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>{t('confirm.identityTitle')}</Text>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>{t('form.firstname')}</Text>
          <Text style={styles.fieldValue}>{firstname || '-'}</Text>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>{t('form.lastname')}</Text>
          <Text style={styles.fieldValue}>{lastname || '-'}</Text>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>{t('form.dateOfBirth')}</Text>
          <Text style={styles.fieldValue}>{formatDate(dateOfBirth)}</Text>
        </View>
      </View>

      {/* Photos Preview */}
      <View style={styles.photosCard}>
        <Text style={styles.sectionTitle}>{t('confirm.photosTitle')}</Text>
        <View style={styles.photosGrid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoItem}>
              {photo.uri ? (
                <Image
                  source={{ uri: photo.uri }}
                  style={styles.photoThumbnail}
                  accessibilityLabel={photo.label}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="image-outline" size={24} color={colors.text.muted} />
                </View>
              )}
              <Text style={styles.photoLabel} numberOfLines={1}>
                {photo.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Privacy Notice */}
      <View style={styles.privacyCard}>
        <View style={styles.privacyIconContainer}>
          <Ionicons name="shield-checkmark" size={24} color={colors.info} />
        </View>
        <View style={styles.privacyContent}>
          <Text style={styles.privacyTitle}>{t('privacy.title')}</Text>
          <Text style={styles.privacyMessage}>{t('privacy.message')}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  // Section cards
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  photosCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  // Identity fields
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  fieldLabel: {
    fontSize: fontSize.base,
    color: colors.text.tertiary,
  },
  fieldValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  // Photos grid - fixed 3-column layout
  photosGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoItem: {
    flex: 1,
    alignItems: 'center',
  },
  photoThumbnail: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.light,
  },
  photoPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  photoLabel: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  // Privacy card - blue theme for trust/security
  privacyCard: {
    backgroundColor: '#EFF6FF', // Light blue background
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE', // Light blue border
  },
  privacyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE', // Slightly darker blue
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  privacyMessage: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
})
