import React from 'react'
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme'

interface ProfilePhotoGalleryProps {
  photos: string[]
}

const PHOTO_SIZE = 100

export const ProfilePhotoGallery: React.FC<ProfilePhotoGalleryProps> = ({ photos }) => {
  const { t } = useTranslation('profile')

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('sections.photos')}</Text>

      {photos.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {photos.map((photoUrl, index) => (
            <Image key={index} source={{ uri: photoUrl }} style={styles.photo} />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="images-outline" size={32} color={colors.text.muted} />
          <Text style={styles.placeholderText}>{t('placeholders.noPhotos')}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.dark,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    marginHorizontal: spacing.xl,
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text.muted,
  },
})
