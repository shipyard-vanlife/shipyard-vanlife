import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { fontSize, fontWeight, spacing } from '../../styles/theme'

const PRO_COLOR = '#F59E0B'

export const ProBadge: React.FC = () => {
  return (
    <View style={styles.badge}>
      <Ionicons name="star" size={10} color="#FFFFFF" />
      <Text style={styles.text}>PRO</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRO_COLOR,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    gap: 3,
  },
  text: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
})
