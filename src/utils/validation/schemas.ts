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
  main_specialty: skillSchema.nullable().optional(),
  skills: z.array(skillSchema).optional().default([]),
})

export type CreateProfileInput = z.infer<typeof createProfileSchema>

// Optional van name (for updates where it can be empty)
export const vanNameOptionalSchema = z
  .string()
  .trim()
  .max(50, 'validation.vanNameMax')
  .regex(vanNameRegex, 'validation.vanNameChars')
  .optional()
  .or(z.literal(''))
  .transform((v) => (v && v.length > 0 ? v : null))

// Bio field
export const bioSchema = z
  .string()
  .trim()
  .max(500, 'validation.bioMax')
  .optional()
  .or(z.literal(''))
  .transform((v) => (v && v.length > 0 ? v : null))

// Update profile schema (for edit modal - all fields optional)
export const updateProfileSchema = z.object({
  van_name: vanNameOptionalSchema,
  van_photo_url: z.string().url().nullable().optional(),
  bio: bioSchema,
  main_specialty: skillSchema.nullable().optional(),
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

export const createTripSchema = z.object({
  name: tripNameSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().trim().max(100).optional().nullable(),
})

export type CreateTripValidatedInput = z.infer<typeof createTripSchema>
