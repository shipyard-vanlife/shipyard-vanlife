import React, { memo } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, borderRadius } from '../../styles/theme'

interface UserAvatarProps {
  uri: string | null
  size?: number
  onPress?: () => void
  borderColor?: string
  borderWidth?: number
}

export const UserAvatar = memo(function UserAvatar({
  uri,
  size = 50,
  onPress,
  borderColor = colors.white,
  borderWidth: bw = 0,
}: UserAvatarProps) {
  const imageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: bw,
    borderColor,
  }

  const iconSize = Math.round(size * 0.48)

  const content = uri ? (
    <Image source={{ uri }} style={imageStyle} />
  ) : (
    <View style={[imageStyle, styles.placeholder]}>
      <Ionicons name="person" size={iconSize} color={colors.text.tertiary} />
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
})

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
