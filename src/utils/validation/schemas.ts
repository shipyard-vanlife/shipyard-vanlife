import { z } from 'zod'
import { ALL_SKILLS, SkillType } from '../../types/user'

// ============================================
// FIELD SCHEMAS (réutilisables)
// Les messages sont des clés i18n (common:validation.*)
// ============================================

const usernameRegex = /^[a-zA-ZÀ-ÿ0-9\s\-_&]+$/
const vanNameRegex = /^[a-zA-ZÀ-ÿ0-9\s\-_']*$/

export const usernameSchema = z
  .string()
  .trim()
  .min(2, 'validation.usernameMin')
  .max(30, 'validation.usernameMax')
  .regex(usernameRegex, 'validation.usernameChars')

export const vanNameSchema = z
  .string()
  .trim()
  .min(1, 'validation.vanNameRequired')
  .max(50, 'validation.vanNameMax')
  .regex(vanNameRegex, 'validation.vanNameChars')

export const skillSchema = z.enum(ALL_SKILLS as [SkillType, ...SkillType[]])

// ============================================
// PROFILE SCHEMAS
// ============================================

export const createProfileSchema = z.object({
  username: usernameSchema,
  van_name: vanNameSchema,
  skills: z.array(skillSchema).max(3, 'validation.skillsMax').optional().default([]),
})

// Alias for completing profile after verification (same validation)
export const completeProfileSchema = createProfileSchema

export type CreateProfileInput = z.infer<typeof createProfileSchema>

// Optional van name (for updates where it can be empty)
export const vanNameOptionalSchema = z
  .string()
  .trim()
  .max(50, 'validation.vanNameMax')
  .regex(vanNameRegex, 'validation.vanNameChars')
  .optional()
  .or(z.literal(''))
  .transform(v => (v && v.length > 0 ? v : null))

// Bio field
export const bioSchema = z
  .string()
  .trim()
  .max(500, 'validation.bioMax')
  .optional()
  .or(z.literal(''))
  .transform(v => (v && v.length > 0 ? v : null))

// Update profile schema (for edit modal - all fields optional)
export const updateProfileSchema = z.object({
  van_name: vanNameOptionalSchema,
  van_photo_url: z.string().url().nullable().optional(),
  bio: bioSchema,
  skills: z.array(skillSchema).max(3, 'validation.skillsMax').optional(),
  is_visible: z.boolean().optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// ============================================
// LOCATION SCHEMAS (pour plus tard)
// ============================================

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().trim().max(100).optional(),
})

export type UpdateLocationInput = z.infer<typeof updateLocationSchema>

// ============================================
// TRIP SCHEMAS
// ============================================

const tripNameRegex = /^[a-zA-ZÀ-ÿ0-9\s\-_']+$/

export const tripNameSchema = z
  .string()
  .trim()
  .min(2, 'trips:validation.tripNameMin')
  .max(50, 'trips:validation.tripNameMax')
  .regex(tripNameRegex, 'trips:validation.tripNameChars')

// ISO 3166-1 alpha-2 country code (2 uppercase letters)
export const countryCodeSchema = z.string().trim().length(2).toUpperCase().optional().nullable()

export const createTripSchema = z.object({
  name: tripNameSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().trim().max(100).optional().nullable(),
  country: countryCodeSchema,
})

export type CreateTripValidatedInput = z.infer<typeof createTripSchema>

export const addStageSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().trim().max(100).optional().nullable(),
  country: countryCodeSchema,
})

export type AddStageValidatedInput = z.infer<typeof addStageSchema>

// ============================================
// VERIFICATION SCHEMAS
// ============================================

// Name regex: letters, spaces, hyphens, apostrophes (supports accents)
const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/

// Firstname validation
// Error keys are WITHOUT namespace prefix - component uses useTranslation('verification')
export const firstnameSchema = z
  .string()
  .trim()
  .min(2, 'errors.firstnameMin')
  .max(50, 'errors.firstnameMax')
  .regex(nameRegex, 'errors.nameChars')

// Lastname validation
export const lastnameSchema = z
  .string()
  .trim()
  .min(2, 'errors.lastnameMin')
  .max(50, 'errors.lastnameMax')
  .regex(nameRegex, 'errors.nameChars')

// Date of birth validation (21+ years old)
// Uses a union with null to provide custom error message for missing date
export const dateOfBirthSchema = z
  .date({
    required_error: 'errors.dateRequired',
    invalid_type_error: 'errors.dateRequired',
  })
  .refine(
    date => {
      const age = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      return age >= 21
    },
    { message: 'errors.ageMinimum' }
  )
  .refine(
    date => {
      const age = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      return age <= 100
    },
    { message: 'errors.ageMaximum' }
  )

// Photo URI validation (local file URI)
// Uses preprocess to handle null values with proper error message
export const photoUriSchema = z.preprocess(
  val => (val === null || val === undefined ? '' : val),
  z
    .string()
    .min(1, 'errors.photoRequired')
    .refine(
      uri => uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('ph://'),
      { message: 'errors.invalidPhotoUri' }
    )
)

// Complete verification submission schema
export const verificationSchema = z.object({
  firstname: firstnameSchema,
  lastname: lastnameSchema,
  dateOfBirth: dateOfBirthSchema,
  facePhotoUri: photoUriSchema,
  vanWithPersonPhotoUri: photoUriSchema,
  registrationPlatePhotoUri: photoUriSchema,
})

export type VerificationValidatedInput = z.infer<typeof verificationSchema>
