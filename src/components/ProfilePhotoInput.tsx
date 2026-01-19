import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { ImagePickerError } from '../hooks/useImagePicker'

interface ProfilePhotoInputProps {
  imageUri: string | null
  isLoading: boolean
  error: ImagePickerError | null
  onPickImage: () => void
  onTakePhoto: () => void
  disabled?: boolean
}

// Map error codes to i18n keys
const errorKeys: Record<string, string> = {
  PERMISSION_DENIED: 'photo.errors.permissionDenied',
  CANCELLED: 'photo.errors.cancelled',
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

  const errorMessage = error ? errorKeys[error.code] : null

  const handlePress = () => {
    setShowModal(true)
  }

  const handlePickImage = () => {
    setShowModal(false)
    onPickImage()
  }

  const handleTakePhoto = () => {
    setShowModal(false)
    onTakePhoto()
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

      {errorMessage && error?.code !== 'CANCELLED' ? (
        <Text style={styles.error}>{t(errorMessage)}</Text>
      ) : null}

      {/* Photo Source Selection Modal */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('photo.chooseSource')}</Text>

            <TouchableOpacity style={styles.modalOption} onPress={handleTakePhoto}>
              <Text style={styles.modalOptionIcon}>📷</Text>
              <Text style={styles.modalOptionText}>{t('photo.takePhoto')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={handlePickImage}>
              <Text style={styles.modalOptionIcon}>🖼️</Text>
              <Text style={styles.modalOptionText}>{t('photo.fromGallery')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancelText}>{t('buttons.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  modalOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalCancel: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
})
