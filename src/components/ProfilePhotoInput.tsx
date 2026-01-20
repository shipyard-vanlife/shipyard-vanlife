import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ImagePickerError } from '../hooks/useImagePicker'
import { PhotoSourceModal } from './PhotoSourceModal'

interface ProfilePhotoInputProps {
  imageUri: string | null
  isLoading: boolean
  error: ImagePickerError | null
  onPickImage: () => Promise<void>
  onTakePhoto: () => Promise<void>
  disabled?: boolean
}

const ERROR_KEYS: Record<string, string> = {
  PERMISSION_DENIED: 'photo.errors.permissionDenied',
  UPLOAD_FAILED: 'photo.errors.uploadFailed',
  UNKNOWN: 'photo.errors.unknown',
}

export const ProfilePhotoInput: React.FC<ProfilePhotoInputProps> = ({
  imageUri,
  isLoading,
  error,
  onPickImage,
  onTakePhoto,
  disabled = false,
}) => {
  const { t } = useTranslation('common')
  const [showModal, setShowModal] = useState(false)

  const errorMessage = error ? ERROR_KEYS[error.code] : null

  const handlePress = () => {
    setShowModal(true)
  }

  const handlePickImage = async () => {
    setShowModal(false)
    // Wait for modal to close before launching picker (iOS timing issue)
    setTimeout(() => {
      onPickImage()
    }, 500)
  }

  const handleTakePhoto = async () => {
    setShowModal(false)
    // Wait for modal to close before launching camera (iOS timing issue)
    setTimeout(() => {
      onTakePhoto()
    }, 500)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.photoButton, disabled && styles.photoButtonDisabled]}
        onPress={handlePress}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color="#E07A5F" size="large" />
        ) : imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.photo} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>+</Text>
            <Text style={styles.placeholderText}>{t('photo.addPhoto')}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.hint}>{t('photo.optional')}</Text>

      {errorMessage ? <Text style={styles.error}>{t(errorMessage)}</Text> : null}

      <PhotoSourceModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onTakePhoto={handleTakePhoto}
        onPickImage={handlePickImage}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  photoButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  photoButtonDisabled: {
    opacity: 0.6,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  placeholderText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  error: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
    textAlign: 'center',
  },
})
