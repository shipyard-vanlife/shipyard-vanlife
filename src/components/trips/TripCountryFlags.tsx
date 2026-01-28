import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { spacing } from '../../styles/theme'
import type { TripStage } from '../../types/trip'
import { getUniqueCountryFlags } from '../../utils/countryFlags'

interface TripCountryFlagsProps {
  stages: TripStage[]
}

export const TripCountryFlags: React.FC<TripCountryFlagsProps> = ({ stages }) => {
  const flags = getUniqueCountryFlags(stages.map(s => s.country))

  if (flags.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      {flags.map((flag, index) => (
        <Text key={index} style={styles.flag}>
          {flag}
        </Text>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flag: {
    fontSize: 18,
  },
})
