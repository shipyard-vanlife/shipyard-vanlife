import React, { memo, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { Marker } from 'react-native-maps'
import { colors, shadows } from '../../styles/theme'
import type { NearbyProfile } from '../../types/location'

interface ProfileMarkerProps {
  profile: NearbyProfile
  latitude: number
  longitude: number
  onPress: () => void
}

export const ProfileMarker = memo<ProfileMarkerProps>(function ProfileMarker({
  profile,
  latitude,
  longitude,
  onPress,
}) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={onPress}
      tracksViewChanges={!!profile.avatar_url && !imageLoaded}
    >
      <View style={styles.container}>
        {profile.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={styles.avatar}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <View style={styles.dot} />
        )}
      </View>
    </Marker>
  )
})

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tertiary.main,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.large,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
  },
})
