import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors } from '../../styles/theme'

interface BottomSheetStatsProps {
  city: string | null
  daysOnRoad: number
  connectionsCount: number
}

export const BottomSheetStats: React.FC<BottomSheetStatsProps> = ({
  city,
  daysOnRoad,
  connectionsCount,
}) => {
  const { t } = useTranslation('home')

  return (
    <View style={styles.statsContainer}>
      <View style={styles.stat}>
        <Text style={styles.statLabel}>{t('profile.currentCity')}</Text>
        <Text style={styles.statValue}>{city ?? '-'}</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statLabel}>{t('profile.daysOnRoad')}</Text>
        <Text style={styles.statValue}>{daysOnRoad}</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statLabel}>{t('profile.connections')}</Text>
        <Text style={styles.statValue}>{connectionsCount}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
})
