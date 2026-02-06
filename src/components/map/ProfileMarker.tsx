import React, { memo, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Marker } from 'react-native-maps'
import { colors } from '../../styles/theme'
import { SKILL_COLORS, SKILL_ICONS } from '../../types/user'
import type { NearbyProfile } from '../../types/location'

const MARKER_SIZE = 46
const POINTER_SIZE = 10
const BADGE_SIZE = 18

/** Deterministic color from user ID for initials fallback */
const AVATAR_COLORS = [
  '#E07A5F', '#81B29A', '#F2CC8F', '#D4A373',
  '#F4A261', '#8B4513', '#3B82F6', '#9C27B0',
]

function getAvatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(username: string): string {
  const parts = username.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return username.slice(0, 2).toUpperCase()
}

interface ProfileMarkerProps {
  profile: NearbyProfile
  /** Used internally for the Marker position */
  coordinate: { latitude: number; longitude: number }
  onPress: () => void
}

export const ProfileMarker = memo<ProfileMarkerProps>(function ProfileMarker({
  profile,
  coordinate,
  onPress,
}) {
  const { latitude, longitude } = coordinate
  const [imageLoaded, setImageLoaded] = useState(false)

  const primarySkill = profile.skills?.[0] ?? null
  const skillIcon = primarySkill ? (SKILL_ICONS[primarySkill] as keyof typeof Ionicons.glyphMap) : null
  const skillColor = primarySkill ? SKILL_COLORS[primarySkill] : null

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 1 }}
      onPress={onPress}
      tracksViewChanges={!!profile.avatar_url && !imageLoaded}
    >
      <View style={styles.wrapper}>
        {/* Main bubble */}
        <View style={styles.outerRing}>
          <View style={styles.container}>
            {profile.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatar}
                resizeMode="cover"
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <View style={[styles.initialsContainer, { backgroundColor: getAvatarColor(profile.id) }]}>
                <Text style={styles.initials}>{getInitials(profile.username)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Pointer arrow */}
        <View style={styles.pointer} />

        {/* Skill badge */}
        {skillIcon && skillColor ? (
          <View style={[styles.skillBadge, { backgroundColor: skillColor }]}>
            <Ionicons name={skillIcon} size={10} color={colors.white} />
          </View>
        ) : null}
      </View>
    </Marker>
  )
})

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: MARKER_SIZE + 12,
  },
  outerRing: {
    width: MARKER_SIZE + 4,
    height: MARKER_SIZE + 4,
    borderRadius: (MARKER_SIZE + 4) / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  container: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: POINTER_SIZE / 2,
    borderRightWidth: POINTER_SIZE / 2,
    borderTopWidth: POINTER_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.white,
    marginTop: -1,
  },
  skillBadge: {
    position: 'absolute',
    bottom: POINTER_SIZE + 1,
    right: 0,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
