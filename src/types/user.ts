export type SkillBadge =
  | 'mechanic'
  | 'plumbing'
  | 'decoration'
  | 'construction'
  | 'electricity'
  | 'carpentry'

export interface UserProfile {
  id: string
  username: string
  email: string
  vanName: string
  vanPhoto?: string
  city: string
  latitude: number
  longitude: number
  mainSpecialty: SkillBadge
  skills: SkillBadge[]
  daysOnRoad: number
  connectionsCount: number
}

export const SKILL_COLORS: Record<SkillBadge, string> = {
  mechanic: '#E07A5F',
  plumbing: '#81B29A',
  decoration: '#F2CC8F',
  construction: '#D4A373',
  electricity: '#F4A261',
  carpentry: '#8B4513',
}
