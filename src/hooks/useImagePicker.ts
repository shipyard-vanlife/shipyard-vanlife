import { useState, useCallback } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../services/supabase'

export type ImagePickerErrorCode = 'PERMISSION_DENIED' | 'UPLOAD_FAILED' | 'UNKNOWN'

export interface ImagePickerError {
  code: ImagePickerErrorCode
  message: string
}

export interface UseImagePickerResult {
  imageUri: string | null
  uploadedUrl: string | null
  isLoading: boolean
  error: ImagePickerError | null
  pickImage: () => Promise<void>
  takePhoto: () => Promise<void>
  uploadImage: (userId: string) => Promise<string | null>
  clearImage: () => void
}

export function useImagePicker(): UseImagePickerResult {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ImagePickerError | null>(null)

  const pickImage = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        setError({ code: 'PERMISSION_DENIED', message: 'Media library permission denied' })
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]?.uri) {
        setImageUri(result.assets[0].uri)
        setUploadedUrl(null)
      }
    } catch (err) {
      setError({
        code: 'UNKNOWN',
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const takePhoto = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync()
      if (!granted) {
        setError({ code: 'PERMISSION_DENIED', message: 'Camera permission denied' })
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]?.uri) {
        setImageUri(result.assets[0].uri)
        setUploadedUrl(null)
      }
    } catch (err) {
      setError({
        code: 'UNKNOWN',
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const uploadImage = useCallback(
    async (userId: string): Promise<string | null> => {
      if (!imageUri) {
        return null
      }

      setError(null)
      setIsLoading(true)

      try {
        const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg'
        const fileName = `${userId}/avatar.${ext}`

        // Fetch the image as blob
        const response = await fetch(imageUri)
        const blob = await response.blob()

        // Convert blob to base64 using FileReader (React Native compatible)
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              const base64Data = reader.result.split(',')[1]
              resolve(base64Data)
            } else {
              reject(new Error('Failed to read file as base64'))
            }
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })

        // Decode base64 to Uint8Array for Supabase
        const binaryString = atob(base64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, bytes, {
            contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
            upsert: true,
          })

        if (uploadError) {
          throw uploadError
        }

        // Get public URL with cache buster
        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(fileName)

        const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`
        setUploadedUrl(urlWithCacheBuster)

        return urlWithCacheBuster
      } catch (err) {
        setError({
          code: 'UPLOAD_FAILED',
          message: err instanceof Error ? err.message : 'Failed to upload image',
        })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [imageUri]
  )

  const clearImage = useCallback(() => {
    setImageUri(null)
    setUploadedUrl(null)
    setError(null)
  }, [])

  return {
    imageUri,
    uploadedUrl,
    isLoading,
    error,
    pickImage,
    takePhoto,
    uploadImage,
    clearImage,
  }
}
