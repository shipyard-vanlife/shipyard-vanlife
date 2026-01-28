import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../styles/theme'

export const SearchScreen: React.FC = () => {
  const { t } = useTranslation('common')

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('search.title')}</Text>
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
