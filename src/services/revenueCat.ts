import Purchases, { LOG_LEVEL } from 'react-native-purchases'
import type { CustomerInfo } from 'react-native-purchases'
import { ENTITLEMENT_ID } from '../types/subscription'

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || ''

/** Initialize RevenueCat SDK. Call once at app startup. */
export async function initializeRevenueCat(): Promise<void> {
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE)
  }

  Purchases.configure({ apiKey: API_KEY })
}

/** Identify a user with RevenueCat after Supabase auth */
export async function identifyUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId)
  } catch (error) {
    console.error('[RevenueCat] Failed to identify user:', error)
  }
}

/** Reset to anonymous user on sign out */
export async function resetUser(): Promise<void> {
  try {
    await Purchases.logOut()
  } catch (error) {
    console.error('[RevenueCat] Failed to reset user:', error)
  }
}

/** Check if a CustomerInfo object has the pro entitlement */
export function hasProEntitlement(customerInfo: CustomerInfo | null): boolean {
  if (!customerInfo) return false
  return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined'
}
