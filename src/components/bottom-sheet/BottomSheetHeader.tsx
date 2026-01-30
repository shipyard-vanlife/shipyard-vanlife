import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../styles/theme'

interface BottomSheetHeaderProps {
  avatarUrl: string | null
  username: string
  vanName: string | null
  vanPhotoUrl: string | null
  onVanPhotoPress?: (imageUrl: string) => void
}

export const BottomSheetHeader: React.FC<BottomSheetHeaderProps> = ({
  avatarUrl,
  username,
  vanName,
  vanPhotoUrl,
  onVanPhotoPress,
}) => {
  return (
    <>
      {/* Van photo */}
      {vanPhotoUrl && (
        <TouchableOpacity
          style={styles.vanPhotoContainer}
          onPress={() => onVanPhotoPress?.(vanPhotoUrl)}
          activeOpacity={0.9}
        >
          <Image source={{ uri: vanPhotoUrl }} style={styles.vanPhoto} resizeMode="cover" />
        </TouchableOpacity>
      )}

      {/* Avatar + Username + Van name */}
      <View style={styles.headerContainer}>
        {avatarUrl && (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
        )}
        <View style={styles.header}>
          <Text style={styles.username}>{username}</Text>
          {vanName ? <Text style={styles.vanName}>{vanName}</Text> : null}
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  vanPhotoContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    marginTop: 28,
  },
  vanPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.secondary.main,
  },
  header: {
    flex: 1,
  },
  username: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  vanName: {
    fontSize: 17,
    color: colors.text.tertiary,
    marginTop: 4,
  },
})
