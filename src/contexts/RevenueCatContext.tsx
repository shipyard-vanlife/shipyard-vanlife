import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
// ❌ BUILD 11 - NEUTRALISÉ POUR TEST ISOLATION
// import Purchases from 'react-native-purchases'
// import type { CustomerInfo, PurchasesOfferings, PurchasesPackage } from 'react-native-purchases'
// import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui'
import { useAuth } from './AuthContext'
// import { initializeRevenueCat, hasProEntitlement, isExpoGo } from '../services/revenueCat'
import { useMyProfile } from '../hooks/useProfiles'
// import { PaywallModal } from '../components/PaywallModal'
import type { RevenueCatContextType } from '../types/subscription'

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined)

function createDeferred() {
  let resolve: () => void
  const promise = new Promise<void>((r) => {
    resolve = r
  })
  return { promise, resolve: resolve! }
}

export const RevenueCatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const { data: myProfile } = useMyProfile()

  // ❌ BUILD 11 - Mock state
  // const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  // const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null)
  const [isLoading, setIsLoading] = useState(false) // ✅ Mock: toujours prêt

  // const previousUserIdRef = useRef<string | null | undefined>(undefined)
  // const sdkReadyRef = useRef(createDeferred())

  // ❌ BUILD 11 - Mock isPro
  const isPro = myProfile?.is_pro === true

  // ❌ BUILD 11 - TOUT LE CODE REVENUECAT COMMENTÉ
  /*
  useEffect(() => {
    if (isExpoGo) {
      sdkReadyRef.current.resolve()
      setIsLoading(false)
      return
    }

    let isFirstCallback = true
    let cleanup: (() => void) | null = null

    const init = async () => {
      try {
        // 1. Configure FIRST
        await initializeRevenueCat()

        // 2. THEN register listener
        const listener = (info: CustomerInfo) => {
          setCustomerInfo(info)
          if (isFirstCallback) {
            isFirstCallback = false
            sdkReadyRef.current.resolve()
          }
        }

        Purchases.addCustomerInfoUpdateListener(listener)
        cleanup = () => Purchases.removeCustomerInfoUpdateListener(listener)
      } catch (error) {
        console.error('[RevenueCat] Initialization failed:', error)
        sdkReadyRef.current.resolve()
        setIsLoading(false)
      }
    }
    init()

    // Safety: unblock after 5s if listener never fires (network error, etc.)
    const timeout = setTimeout(() => {
      sdkReadyRef.current.resolve()
    }, 5000)

    return () => {
      clearTimeout(timeout)
      cleanup?.()
    }
  }, [])

  // 3. Auth sync — waits for SDK ready before any API calls
  useEffect(() => {
    if (isExpoGo) return

    let cancelled = false

    const syncUser = async () => {
      // Wait for configure()'s internal fetch to complete
      await sdkReadyRef.current.promise

      if (cancelled) return

      const currentUserId = user?.id ?? null
      const previousUserId = previousUserIdRef.current

      // Skip if user hasn't changed
      if (previousUserId !== undefined && currentUserId === previousUserId) {
        setIsLoading(false)
        return
      }
      previousUserIdRef.current = currentUserId

      try {
        if (currentUserId) {
          // logIn returns customerInfo directly — no separate getCustomerInfo needed
          const result = await Purchases.logIn(currentUserId)
          if (!cancelled) setCustomerInfo(result.customerInfo)
        } else if (previousUserId !== undefined && previousUserId !== null) {
          // Sign-out: logOut returns anonymous CustomerInfo
          const info = await Purchases.logOut()
          if (!cancelled) setCustomerInfo(info)
        }
        // First mount with no user: listener already set customerInfo from configure()

        if (!cancelled) {
          const offers = await Purchases.getOfferings()
          if (!cancelled) setOfferings(offers)
        }
      } catch (error) {
        console.error('[RevenueCat] User sync failed:', error)
        if (!cancelled && !currentUserId) setCustomerInfo(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    syncUser()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    if (isExpoGo) {
      console.warn('[RevenueCat] Purchases unavailable in Expo Go')
      return false
    }
    try {
      const { customerInfo: info } = await Purchases.purchasePackage(pkg)
      setCustomerInfo(info)
      return hasProEntitlement(info)
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error('[RevenueCat] Purchase failed:', error)
      }
      return false
    }
  }, [])

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (isExpoGo) return false
    try {
      const info = await Purchases.restorePurchases()
      setCustomerInfo(info)
      return hasProEntitlement(info)
    } catch (error) {
      console.error('[RevenueCat] Restore failed:', error)
      return false
    }
  }, [])

  // Custom paywall modal state
  const [paywallVisible, setPaywallVisible] = useState(false)
  const paywallResolveRef = useRef<((value: boolean) => void) | null>(null)

  // Actual SDK purchase (used inside PaywallModal)
  const purchaseWithSDK = useCallback(async (): Promise<boolean> => {
    if (isExpoGo) return false
    try {
      const result: PAYWALL_RESULT = await RevenueCatUI.presentPaywall()
      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          return true
        default:
          return false
      }
    } catch (error) {
      console.error('[RevenueCat] Purchase failed:', error)
      return false
    }
  }, [])

  // Actual SDK restore (used inside PaywallModal)
  const restoreWithSDK = useCallback(async (): Promise<boolean> => {
    if (isExpoGo) return false
    try {
      const info = await Purchases.restorePurchases()
      setCustomerInfo(info)
      return hasProEntitlement(info)
    } catch (error) {
      console.error('[RevenueCat] Restore failed:', error)
      return false
    }
  }, [])

  // Shows the custom paywall modal
  const presentPaywall = useCallback(async (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      paywallResolveRef.current = resolve
      setPaywallVisible(true)
    })
  }, [])

  const handlePaywallClose = useCallback(() => {
    setPaywallVisible(false)
    paywallResolveRef.current?.(false)
    paywallResolveRef.current = null
  }, [])

  const handlePaywallPurchaseSuccess = useCallback(() => {
    setPaywallVisible(false)
    paywallResolveRef.current?.(true)
    paywallResolveRef.current = null
  }, [])

  const presentCustomerCenter = useCallback(async (): Promise<void> => {
    if (isExpoGo) return
    try {
      await RevenueCatUI.presentCustomerCenter()
    } catch (error) {
      console.error('[RevenueCat] Customer Center failed:', error)
    }
  }, [])

  const refreshCustomerInfo = useCallback(async (): Promise<void> => {
    if (isExpoGo) return
    try {
      const info = await Purchases.getCustomerInfo()
      setCustomerInfo(info)
    } catch (error) {
      console.error('[RevenueCat] Refresh failed:', error)
    }
  }, [])
  */

  // ❌ BUILD 11 - FONCTIONS MOCK
  const purchasePackage = useCallback(async (): Promise<boolean> => {
    console.log('[RevenueCat] DISABLED')
    return false
  }, [])

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    console.log('[RevenueCat] DISABLED')
    return false
  }, [])

  const presentPaywall = useCallback(async (): Promise<boolean> => {
    console.log('[RevenueCat] DISABLED')
    return false
  }, [])

  const presentCustomerCenter = useCallback(async (): Promise<void> => {
    console.log('[RevenueCat] DISABLED')
  }, [])

  const refreshCustomerInfo = useCallback(async (): Promise<void> => {
    console.log('[RevenueCat] DISABLED')
  }, [])

  return (
    <RevenueCatContext.Provider
      value={{
        isPro,
        customerInfo: null,
        offerings: null,
        isLoading,
        purchasePackage,
        restorePurchases,
        presentPaywall,
        presentCustomerCenter,
        refreshCustomerInfo,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  )
}

export const useRevenueCatContext = () => {
  const context = useContext(RevenueCatContext)
  if (context === undefined) {
    throw new Error('useRevenueCatContext must be used within a RevenueCatProvider')
  }
  return context
}
