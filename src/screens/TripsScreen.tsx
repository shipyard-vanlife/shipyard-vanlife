import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../styles/theme'

export const TripsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Trips</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
})
