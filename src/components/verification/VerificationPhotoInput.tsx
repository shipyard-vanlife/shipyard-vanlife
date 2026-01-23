import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme'

export type PhotoAspectRatio = 'portrait' | 'landscape' | 'wide'

interface VerificationPhotoInputProps {
  imageUri: string | null
  label: string
  hint: string
  isLoading: boolean
  error?: string | null
  onPickImage: () => Promise<void>
  onTakePhoto: () => Promise<void>
  disabled?: boolean
  /** Photo type for accessibility and aspect ratio */
  photoType?: 'face' | 'vanWithPerson' | 'registrationPlate'
  /** Aspect ratio: portrait (3:4), landscape (16:9), wide (3:1) */
  aspectRatio?: PhotoAspectRatio
}

// Map aspect ratio names to numeric values
const ASPECT_RATIOS: Record<PhotoAspectRatio, number> = {
  portrait: 3 / 4, // Good for face photos
  landscape: 16 / 9, // Good for van photos
  wide: 3 / 1, // Good for registration plate
}

export const VerificationPhotoInput: React.FC<VerificationPhotoInputProps> = ({
  imageUri,
  label,
  hint,
  isLoading,
  error,
  onPickImage,
  onTakePhoto,
  disabled = false,
  photoType = 'face',
  aspectRatio = 'landscape',
}) => {
  const { t } = useTranslation(['verification', 'common'])
  const numericAspectRatio = ASPECT_RATIOS[aspectRatio]

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      // Use native iOS ActionSheet - no Modal conflict
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            t('common:buttons.cancel'),
            t('common:photo.takePhoto'),
            t('common:photo.fromGallery'),
          ],
          cancelButtonIndex: 0,
          title: t('common:photo.chooseSource'),
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            onTakePhoto()
          } else if (buttonIndex === 2) {
            onPickImage()
          }
        }
      )
    } else {
      // Android: use Alert with buttons
      Alert.alert(t('common:photo.chooseSource'), undefined, [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        { text: t('common:photo.takePhoto'), onPress: onTakePhoto },
        { text: t('common:photo.fromGallery'), onPress: onPickImage },
      ])
    }
  }

  // Accessibility label based on state
  const getAccessibilityLabel = () => {
    if (isLoading) {
      return t('verification:accessibility.photoLoading', { type: label })
    }
    if (imageUri) {
      return t('verification:accessibility.photoSelected', { type: label })
    }
    return t('verification:accessibility.photoAdd', { type: label })
  }

  const getAccessibilityHint = () => {
    if (isLoading) return undefined
    if (imageUri) {
      return t('verification:accessibility.photoChangeHint')
    }
    return t('verification:accessibility.photoAddHint')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.hint}>{hint}</Text>

      <TouchableOpacity
        style={[
          styles.photoButton,
          { aspectRatio: numericAspectRatio },
          // Order matters: disabled state should visually override error
          error && !disabled ? styles.photoButtonError : null,
          disabled && styles.photoButtonDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={getAccessibilityLabel()}
        accessibilityHint={getAccessibilityHint()}
        accessibilityState={{
          disabled: disabled || isLoading,
          busy: isLoading,
        }}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.secondary.main} size="large" />
            <Text style={styles.loadingText}>{t('verification:buttons.loadingPhoto')}</Text>
          </View>
        ) : imageUri ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.photo}
              accessibilityLabel={t('verification:accessibility.photoPreview', { type: label })}
            />
            <View style={styles.changeOverlay}>
              <Ionicons
                name="camera"
                size={20}
                color={colors.white}
                accessibilityElementsHidden
              />
              <Text style={styles.changeText}>{t('verification:buttons.changePhoto')}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="camera-outline"
                size={32}
                color={colors.text.muted}
                accessibilityElementsHidden
              />
            </View>
            <Text style={styles.placeholderText}>{t('verification:buttons.addPhoto')}</Text>
          </View>
        )}
      </TouchableOpacity>

      {error && !disabled ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  photoButton: {
    width: '100%',
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border.main,
    borderStyle: 'dashed',
  },
  photoButtonError: {
    borderColor: colors.error,
    borderStyle: 'solid',
  },
  photoButtonDisabled: {
    opacity: 0.5,
    borderStyle: 'solid',
    borderColor: colors.border.light,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  changeText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  placeholderText: {
    fontSize: fontSize.base,
    color: colors.text.muted,
    fontWeight: fontWeight.medium,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
})
