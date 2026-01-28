import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { colors } from '../../styles/theme'

interface ViewOnMapButtonProps {
  onPress: () => void
}

export const ViewOnMapButton: React.FC<ViewOnMapButtonProps> = ({ onPress }) => {
  const { t } = useTranslation('trips')

  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name="map-outline" size={20} color={colors.white} />
      <Text style={styles.text}>{t('map.viewOnMap')}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.main,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  text: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
})
