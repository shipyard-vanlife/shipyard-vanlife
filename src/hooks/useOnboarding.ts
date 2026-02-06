import { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ONBOARDING_STORAGE_KEY = '@nomli_onboarding_completed'

export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY)
      setHasCompletedOnboarding(value === 'true')
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setHasCompletedOnboarding(false)
    } finally {
      setIsLoading(false)
    }
  }

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
      setHasCompletedOnboarding(true)
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }, [])

  const resetOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY)
      setHasCompletedOnboarding(false)
    } catch (error) {
      console.error('Error resetting onboarding:', error)
    }
  }, [])

  return {
    hasCompletedOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  }
}
