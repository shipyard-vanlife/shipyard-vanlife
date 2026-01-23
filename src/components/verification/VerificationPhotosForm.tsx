import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { VerificationPhotoInput, PhotoAspectRatio } from './VerificationPhotoInput'
import { spacing } from '../../styles/theme'

interface VerificationPhotosFormProps {
  facePhotoUri: string | null
  vanWithPersonPhotoUri: string | null
  registrationPlatePhotoUri: string | null
  onFacePhotoChange: (uri: string) => void
  onVanWithPersonPhotoChange: (uri: string) => void
  onRegistrationPlatePhotoChange: (uri: string) => void
  errors: {
    facePhoto?: string
    vanWithPersonPhoto?: string
    registrationPlatePhoto?: string
  }
  disabled?: boolean
}

type PhotoType = 'face' | 'vanWithPerson' | 'registrationPlate'

// Configuration per photo type
const PHOTO_CONFIG: Record<
  PhotoType,
  {
    aspectRatio: PhotoAspectRatio
    imagePickerAspect: [number, number]
  }
> = {
  face: {
    aspectRatio: 'portrait', // 3:4 - better for face photos
    imagePickerAspect: [3, 4],
  },
  vanWithPerson: {
    aspectRatio: 'landscape', // 16:9 - better for van + person composition
    imagePickerAspect: [16, 9],
  },
  registrationPlate: {
    aspectRatio: 'wide', // 3:1 - better for license plates
    imagePickerAspect: [3, 1],
  },
}

export const VerificationPhotosForm: React.FC<VerificationPhotosFormProps> = ({
  facePhotoUri,
  vanWithPersonPhotoUri,
  registrationPlatePhotoUri,
  onFacePhotoChange,
  onVanWithPersonPhotoChange,
  onRegistrationPlatePhotoChange,
  errors,
  disabled = false,
}) => {
  const { t } = useTranslation(['verification', 'common'])
  // Track loading state per photo to allow parallel selection
  const [loadingPhotos, setLoadingPhotos] = useState<Set<PhotoType>>(new Set())

  const setPhotoLoading = (type: PhotoType, loading: boolean) => {
    setLoadingPhotos(prev => {
      const next = new Set(prev)
      if (loading) {
        next.add(type)
      } else {
        next.delete(type)
      }
      return next
    })
  }

  const showPermissionAlert = useCallback(
    (permissionType: 'camera' | 'gallery') => {
      const title =
        permissionType === 'camera'
          ? t('common:permissions.cameraTitle')
          : t('common:permissions.galleryTitle')
      const message =
        permissionType === 'camera'
          ? t('common:permissions.cameraMessage')
          : t('common:permissions.galleryMessage')

      Alert.alert(title, message, [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        {
          text: t('common:permissions.openSettings'),
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:')
            } else {
              Linking.openSettings()
            }
          },
        },
      ])
    },
    [t]
  )

  const handlePickImage = useCallback(
    async (type: PhotoType, onChange: (uri: string) => void) => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          showPermissionAlert('gallery')
          return
        }

        setPhotoLoading(type, true)
        const config = PHOTO_CONFIG[type]

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: config.imagePickerAspect,
          quality: 0.8,
        })

        if (!result.canceled && result.assets[0]) {
          onChange(result.assets[0].uri)
        }
      } catch (error) {
        console.error('Error picking image:', error)
        Alert.alert(t('common:errors.generic'), t('common:photo.errors.unknown'))
      } finally {
        setPhotoLoading(type, false)
      }
    },
    [showPermissionAlert, t]
  )

  const handleTakePhoto = useCallback(
    async (type: PhotoType, onChange: (uri: string) => void) => {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
          showPermissionAlert('camera')
          return
        }

        setPhotoLoading(type, true)
        const config = PHOTO_CONFIG[type]

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: config.imagePickerAspect,
          quality: 0.8,
        })

        if (!result.canceled && result.assets[0]) {
          onChange(result.assets[0].uri)
        }
      } catch (error) {
        console.error('Error taking photo:', error)
        Alert.alert(t('common:errors.generic'), t('common:photo.errors.unknown'))
      } finally {
        setPhotoLoading(type, false)
      }
    },
    [showPermissionAlert, t]
  )

  // Only disable a photo input if globally disabled OR if that specific photo is loading
  const isPhotoDisabled = (type: PhotoType) => disabled || loadingPhotos.has(type)

  return (
    <View style={styles.container}>
      {/* Face photo - portrait orientation */}
      <VerificationPhotoInput
        imageUri={facePhotoUri}
        label={t('form.facePhoto')}
        hint={t('form.facePhotoHint')}
        isLoading={loadingPhotos.has('face')}
        error={errors.facePhoto ? t(errors.facePhoto) : null}
        onPickImage={() => handlePickImage('face', onFacePhotoChange)}
        onTakePhoto={() => handleTakePhoto('face', onFacePhotoChange)}
        disabled={isPhotoDisabled('face')}
        photoType="face"
        aspectRatio={PHOTO_CONFIG.face.aspectRatio}
      />

      {/* Van with person photo - landscape orientation */}
      <VerificationPhotoInput
        imageUri={vanWithPersonPhotoUri}
        label={t('form.vanPhoto')}
        hint={t('form.vanPhotoHint')}
        isLoading={loadingPhotos.has('vanWithPerson')}
        error={errors.vanWithPersonPhoto ? t(errors.vanWithPersonPhoto) : null}
        onPickImage={() => handlePickImage('vanWithPerson', onVanWithPersonPhotoChange)}
        onTakePhoto={() => handleTakePhoto('vanWithPerson', onVanWithPersonPhotoChange)}
        disabled={isPhotoDisabled('vanWithPerson')}
        photoType="vanWithPerson"
        aspectRatio={PHOTO_CONFIG.vanWithPerson.aspectRatio}
      />

      {/* Registration plate photo - wide orientation */}
      <VerificationPhotoInput
        imageUri={registrationPlatePhotoUri}
        label={t('form.platePhoto')}
        hint={t('form.platePhotoHint')}
        isLoading={loadingPhotos.has('registrationPlate')}
        error={errors.registrationPlatePhoto ? t(errors.registrationPlatePhoto) : null}
        onPickImage={() => handlePickImage('registrationPlate', onRegistrationPlatePhotoChange)}
        onTakePhoto={() => handleTakePhoto('registrationPlate', onRegistrationPlatePhotoChange)}
        disabled={isPhotoDisabled('registrationPlate')}
        photoType="registrationPlate"
        aspectRatio={PHOTO_CONFIG.registrationPlate.aspectRatio}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
})
