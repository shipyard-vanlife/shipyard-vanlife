import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../styles/theme'

interface ProfileEditVanPhotoInputProps {
  label: string
  hint?: string
  photoUrl: string | null
  onPress: () => void
  isLoading?: boolean
  disabled?: boolean
}

export const ProfileEditVanPhotoInput: React.FC<ProfileEditVanPhotoInputProps> = ({
  label,
  hint,
  photoUrl,
  onPress,
  isLoading = false,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      <TouchableOpacity
        style={[styles.photoContainer, disabled && styles.photoContainerDisabled]}
        onPress={onPress}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.secondary.main} />
          </View>
        ) : photoUrl ? (
          <>
            <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="cover" />
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color={colors.white} />
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="car-sport-outline" size={48} color={colors.text.muted} />
            <Text style={styles.placeholderText}>+</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}

const VAN_PHOTO_HEIGHT = 160

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
    marginBottom: spacing.md,
  },
  photoContainer: {
    height: VAN_PHOTO_HEIGHT,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.primary.dark,
    borderWidth: 2,
    borderColor: colors.border.main,
    borderStyle: 'dashed',
  },
  photoContainerDisabled: {
    opacity: 0.6,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: fontSize.xxl,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  editBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.full,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
})
