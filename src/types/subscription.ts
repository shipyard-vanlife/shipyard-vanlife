import type { CustomerInfo, PurchasesOfferings, PurchasesPackage } from 'react-native-purchases'

export const ENTITLEMENT_ID = 'Nomli Pro'

export interface RevenueCatContextType {
  /** Whether the user has an active "Nomli Pro" entitlement */
  isPro: boolean
  /** Full customer info from RevenueCat, null while loading */
  customerInfo: CustomerInfo | null
  /** Available offerings (contains packages/products), null while loading */
  offerings: PurchasesOfferings | null
  /** Whether initial data is still being loaded */
  isLoading: boolean
  /** Purchase a specific package */
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>
  /** Restore previous purchases */
  restorePurchases: () => Promise<boolean>
  /** Present the RevenueCat Paywall (imperative) */
  presentPaywall: () => Promise<boolean>
  /** Present Customer Center for subscription management */
  presentCustomerCenter: () => Promise<void>
  /** Refresh customer info manually */
  refreshCustomerInfo: () => Promise<void>
}
