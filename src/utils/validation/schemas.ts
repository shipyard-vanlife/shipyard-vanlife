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
