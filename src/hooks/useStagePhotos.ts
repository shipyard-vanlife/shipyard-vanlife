import { useState, useCallback, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../services/supabase'
import { compressImageWithPreset } from '../utils/imageCompression'
import { tripKeys } from './useTrips'
import type { StagePhoto } from '../types/trip'

// Query keys for stage photos
export const stagePhotoKeys = {
  all: ['stagePhotos'] as const,
  byStage: (stageId: string) => [...stagePhotoKeys.all, stageId] as const,
}

// ============================================
// GET STAGE PHOTOS
// ============================================

export function useStagePhotos(stageId: string | null) {
  return useQuery({
    queryKey: stageId ? stagePhotoKeys.byStage(stageId) : ['disabled'],
    queryFn: async (): Promise<StagePhoto[]> => {
      if (!stageId) return []

      const { data, error } = await supabase.rpc('get_stage_photos', {
        p_stage_id: stageId,
      })

      if (error) throw error
      return (data as StagePhoto[]) ?? []
    },
    enabled: !!stageId,
  })
}

// ============================================
// ADD STAGE PHOTO
// ============================================

interface AddStagePhotoInput {
  stageId: string
  photoUrl: string
}

export function useAddStagePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AddStagePhotoInput): Promise<string> => {
      const { data, error } = await supabase.rpc('add_stage_photo', {
        p_stage_id: input.stageId,
        p_photo_url: input.photoUrl,
      })

      if (error) throw error
      return data as string
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: stagePhotoKeys.byStage(variables.stageId) })
      queryClient.invalidateQueries({ queryKey: tripKeys.all })
    },
  })
}

// ============================================
// DELETE STAGE PHOTO
// ============================================

interface DeleteStagePhotoInput {
  photoId: string
  stageId: string
  photoUrl: string
}

export function useDeleteStagePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: DeleteStagePhotoInput): Promise<boolean> => {
      // Delete from database
      const { data, error } = await supabase.rpc('delete_stage_photo', {
        p_photo_id: input.photoId,
      })

      if (error) throw error

      // Also delete from storage
      try {
        // Extract file path from URL
        const url = new URL(input.photoUrl)
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/stage-photos\/(.+)/)
        if (pathMatch) {
          const filePath = pathMatch[1].split('?')[0] // Remove query params
          await supabase.storage.from('stage-photos').remove([filePath])
        }
      } catch {
        // Ignore storage deletion errors
      }

      return data as boolean
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: stagePhotoKeys.byStage(variables.stageId) })
      queryClient.invalidateQueries({ queryKey: tripKeys.all })
    },
  })
}

// ============================================
// STAGE PHOTO PICKER HOOK
// ============================================

export type StagePhotoErrorCode = 'PERMISSION_DENIED' | 'UPLOAD_FAILED' | 'MAX_PHOTOS' | 'UNKNOWN'

export interface StagePhotoError {
  code: StagePhotoErrorCode
  message: string
}

export interface UseStagePhotoPickerResult {
  isLoading: boolean
  error: StagePhotoError | null
  pickAndUploadPhoto: (userId: string, stageId: string) => Promise<string | null>
  takeAndUploadPhoto: (userId: string, stageId: string) => Promise<string | null>
  clearError: () => void
}

export function useStagePhotoPicker(): UseStagePhotoPickerResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<StagePhotoError | null>(null)
  const isPickingRef = useRef(false)

  const uploadPhotoToStorage = useCallback(
    async (imageUri: string, userId: string, stageId: string): Promise<string | null> => {
      try {
        // Compress image (landscape preset for stage photos)
        const compressed = await compressImageWithPreset(imageUri, 'vanPhoto')

        // Generate unique filename
        const timestamp = Date.now()
        const fileName = `${userId}/${stageId}/${timestamp}.jpg`

        // Fetch the compressed image as blob
        const response = await fetch(compressed.uri)
        const blob = await response.blob()

        // Convert blob to base64
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

        // Decode base64 to Uint8Array
        const binaryString = atob(base64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('stage-photos')
          .upload(fileName, bytes, {
            contentType: 'image/jpeg',
            upsert: false,
          })

        if (uploadError) throw uploadError

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('stage-photos').getPublicUrl(fileName)

        return publicUrl
      } catch (err) {
        throw err
      }
    },
    []
  )

  const pickAndUploadPhoto = useCallback(
    async (userId: string, stageId: string): Promise<string | null> => {
      if (isPickingRef.current) return null

      isPickingRef.current = true
      setError(null)
      setIsLoading(true)

      const safetyTimeout = setTimeout(() => {
        if (isPickingRef.current) {
          isPickingRef.current = false
          setIsLoading(false)
        }
      }, 60000)

      try {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (!permissionResult.granted) {
          setError({ code: 'PERMISSION_DENIED', message: 'Media library permission denied' })
          return null
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        })

        if (result.canceled || !result.assets[0]?.uri) {
          return null
        }

        const photoUrl = await uploadPhotoToStorage(result.assets[0].uri, userId, stageId)
        return photoUrl
      } catch (err) {
        setError({
          code: 'UPLOAD_FAILED',
          message: err instanceof Error ? err.message : 'Failed to upload photo',
        })
        return null
      } finally {
        clearTimeout(safetyTimeout)
        isPickingRef.current = false
        setIsLoading(false)
      }
    },
    [uploadPhotoToStorage]
  )

  const takeAndUploadPhoto = useCallback(
    async (userId: string, stageId: string): Promise<string | null> => {
      if (isPickingRef.current) return null

      isPickingRef.current = true
      setError(null)
      setIsLoading(true)

      const safetyTimeout = setTimeout(() => {
        if (isPickingRef.current) {
          isPickingRef.current = false
          setIsLoading(false)
        }
      }, 60000)

      try {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync()

        if (!granted) {
          setError({ code: 'PERMISSION_DENIED', message: 'Camera permission denied' })
          return null
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        })

        if (result.canceled || !result.assets[0]?.uri) {
          return null
        }

        const photoUrl = await uploadPhotoToStorage(result.assets[0].uri, userId, stageId)
        return photoUrl
      } catch (err) {
        setError({
          code: 'UPLOAD_FAILED',
          message: err instanceof Error ? err.message : 'Failed to upload photo',
        })
        return null
      } finally {
        clearTimeout(safetyTimeout)
        isPickingRef.current = false
        setIsLoading(false)
      }
    },
    [uploadPhotoToStorage]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    pickAndUploadPhoto,
    takeAndUploadPhoto,
    clearError,
  }
}
