import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import type { ImageResult } from 'expo-image-manipulator'
import { Image } from 'react-native'

export interface CompressionOptions {
  maxWidth: number
  maxHeight: number
  quality: number
  targetSizeKB?: number
}

export interface CompressedImage {
  uri: string
  width: number
  height: number
}

/**
 * Presets for different image types
 * Target: 100-150 KB per image
 */
export const COMPRESSION_PRESETS = {
  avatar: {
    maxWidth: 600,
    maxHeight: 600,
    quality: 0.7,
    targetSizeKB: 100,
  },
  vanPhoto: {
    maxWidth: 1280,
    maxHeight: 720,
    quality: 0.7,
    targetSizeKB: 150,
  },
  gallery: {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.7,
    targetSizeKB: 150,
  },
} as const

export type CompressionPreset = keyof typeof COMPRESSION_PRESETS

/**
 * Get file size from URI (approximation for React Native)
 * Returns size in bytes
 */
async function getFileSizeFromUri(uri: string): Promise<number> {
  try {
    const response = await fetch(uri)
    const blob = await response.blob()
    return blob.size
  } catch {
    return 0
  }
}

/**
 * Get image dimensions from URI
 */
function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject)
  })
}

/**
 * Compress an image using expo-image-manipulator
 * Uses progressive compression to reach target size
 * Preserves aspect ratio by using only one dimension for resize
 *
 * @param uri - Local file URI of the image
 * @param options - Compression options (use COMPRESSION_PRESETS)
 * @returns Compressed image with new URI and dimensions
 */
export async function compressImage(
  uri: string,
  options: CompressionOptions
): Promise<CompressedImage> {
  const { maxWidth, maxHeight, quality, targetSizeKB } = options
  const targetSizeBytes = (targetSizeKB ?? 150) * 1024

  // Get original image dimensions to preserve aspect ratio
  const { width: originalWidth, height: originalHeight } = await getImageSize(uri)

  let currentQuality = quality
  let currentMaxWidth = maxWidth
  let currentMaxHeight = maxHeight
  let result: ImageResult | null = null
  let attempts = 0
  const maxAttempts = 4

  while (attempts < maxAttempts) {
    attempts++

    // Use the new expo-image-manipulator API
    const context = ImageManipulator.manipulate(uri)

    // Calculate scale factor to fit within max dimensions while preserving aspect ratio
    const widthRatio = currentMaxWidth / originalWidth
    const heightRatio = currentMaxHeight / originalHeight
    const scaleFactor = Math.min(widthRatio, heightRatio, 1) // Don't upscale

    if (scaleFactor < 1) {
      // Resize using only ONE dimension to preserve aspect ratio
      // expo-image-manipulator will calculate the other dimension automatically
      if (widthRatio < heightRatio) {
        // Width is more constraining
        context.resize({ width: Math.round(originalWidth * scaleFactor) })
      } else {
        // Height is more constraining
        context.resize({ height: Math.round(originalHeight * scaleFactor) })
      }
    }
    // If scaleFactor >= 1, no resize needed (image already fits)

    // Render and save with compression
    const imageRef = await context.renderAsync()
    result = await imageRef.saveAsync({
      format: SaveFormat.JPEG,
      compress: currentQuality,
    })

    // Check file size
    const fileSize = await getFileSizeFromUri(result.uri)

    // If within target or at minimum settings, we're done
    if (
      fileSize <= targetSizeBytes ||
      (currentQuality <= 0.5 && currentMaxWidth <= maxWidth * 0.5)
    ) {
      break
    }

    // Progressive compression: first reduce quality, then dimensions
    if (currentQuality > 0.5) {
      currentQuality = Math.max(0.5, currentQuality - 0.1)
    } else {
      // Reduce max dimensions by 20%
      currentMaxWidth = Math.round(currentMaxWidth * 0.8)
      currentMaxHeight = Math.round(currentMaxHeight * 0.8)
    }
  }

  if (!result) {
    throw new Error('Failed to compress image')
  }

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
  }
}

/**
 * Compress image using a preset
 * Convenience wrapper around compressImage
 */
export async function compressImageWithPreset(
  uri: string,
  preset: CompressionPreset
): Promise<CompressedImage> {
  return compressImage(uri, COMPRESSION_PRESETS[preset])
}
