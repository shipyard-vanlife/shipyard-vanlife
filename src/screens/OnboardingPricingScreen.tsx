import React from 'react'
import { View, StyleSheet } from 'react-native'
import RevenueCatUI from 'react-native-purchases-ui'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ONBOARDING_STORAGE_KEY = '@nomli_onboarding_completed'

interface OnboardingPricingScreenProps {
  onComplete?: () => void
}

export const OnboardingPricingScreen: React.FC<OnboardingPricingScreenProps> = ({ onComplete }) => {
  const handleComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    onComplete?.()
  }

  return (
    <View style={styles.container}>
      <RevenueCatUI.Paywall
        onDismiss={handleComplete}
        onPurchaseCompleted={handleComplete}
        onRestoreCompleted={handleComplete}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
