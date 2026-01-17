export type SkillBadge =
  | 'mechanic'
  | 'plumbing'
  | 'decoration'
  | 'construction'
  | 'electricity'
  | 'carpentry';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  vanName: string;
  vanPhoto?: string;
  city: string;
  latitude: number;
  longitude: number;
  mainSpecialty: SkillBadge;
  skills: SkillBadge[];
  daysOnRoad: number;
  connectionsCount: number;
}

export const SKILL_BADGES: Record<SkillBadge, { label: string; color: string }> = {
  mechanic: { label: 'Mécanique',  color: '#E07A5F' },
  plumbing: { label: 'Plomberie',  color: '#81B29A' },
  decoration: { label: 'Décor/Aménagement',  color: '#F2CC8F' },
  construction: { label: 'Travaux/Construction', color: '#D4A373' },
  electricity: { label: 'Électricité',  color: '#F4A261' },
  carpentry: { label: 'Menuiserie',  color: '#8B4513' },
};
