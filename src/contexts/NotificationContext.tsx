import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import * as Notifications from 'expo-notifications'
import { useAuth } from './AuthContext'
import { useMyProfile } from '../hooks/useProfiles'
import {
  registerForPushNotificationsAsync,
  setupAndroidChannels,
  useRegisterPushToken,
  useUnregisterPushToken,
} from '../hooks/useNotificationSetup'
import { useRealtimeNotifications, useUnreadNotificationCount } from '../hooks/useNotifications'
import type { NotificationNavigationData } from '../types/notification'

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

interface NotificationContextType {
  expoPushToken: string | null
  unreadCount: number
  notificationNavigateRef: React.MutableRefObject<
    ((data: NotificationNavigationData) => void) | null
  >
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const { data: myProfile } = useMyProfile()
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const previousUserIdRef = useRef<string | null | undefined>(undefined)

  const { mutate: registerToken } = useRegisterPushToken()
  const { mutate: unregisterToken } = useUnregisterPushToken()

  // Ref for navigation — set by MainNavigator
  const notificationNavigateRef = useRef<
    ((data: NotificationNavigationData) => void) | null
  >(null)

  // Realtime subscription for unread badge
  useRealtimeNotifications()
  const { data: unreadCount = 0 } = useUnreadNotificationCount()

  // Update badge count
  useEffect(() => {
    Notifications.setBadgeCountAsync(unreadCount).catch(() => {})
  }, [unreadCount])

  // Register push token when user is authenticated and has a profile
  useEffect(() => {
    if (!user?.id || !myProfile?.username) return

    const currentUserId = user.id
    const previousUserId = previousUserIdRef.current

    // Skip if same user
    if (previousUserId === currentUserId) return
    previousUserIdRef.current = currentUserId

    let cancelled = false

    const setup = async () => {
      await setupAndroidChannels()
      const token = await registerForPushNotificationsAsync()
      if (cancelled || !token) return

      setExpoPushToken(token)
      registerToken(token)
    }

    setup()
    return () => {
      cancelled = true
    }
  }, [user?.id, myProfile?.username, registerToken])

  // Cleanup on logout
  useEffect(() => {
    if (user === null && previousUserIdRef.current) {
      previousUserIdRef.current = null
      if (expoPushToken) {
        unregisterToken(expoPushToken)
        setExpoPushToken(null)
      }
      Notifications.setBadgeCountAsync(0).catch(() => {})
    }
  }, [user, expoPushToken, unregisterToken])

  // Foreground notification listener
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data as NotificationNavigationData | undefined
      // Could suppress banner if user is on the relevant screen
      // For now, always show (handled by Notifications.setNotificationHandler above)
      void data
    })

    return () => subscription.remove()
  }, [])

  // Notification tap handler (background/killed)
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as
        | NotificationNavigationData
        | undefined

      if (data && notificationNavigateRef.current) {
        notificationNavigateRef.current(data)
      }
    })

    return () => subscription.remove()
  }, [])

  // Cold start: check if app was opened via notification
  const handleColdStart = useCallback(async () => {
    const response = await Notifications.getLastNotificationResponseAsync()
    if (!response) return

    const data = response.notification.request.content.data as
      | NotificationNavigationData
      | undefined

    if (data) {
      // Delay to ensure navigation is mounted
      setTimeout(() => {
        notificationNavigateRef.current?.(data)
      }, 500)
    }
  }, [])

  useEffect(() => {
    if (user?.id && myProfile?.username) {
      handleColdStart()
    }
  }, [user?.id, myProfile?.username, handleColdStart])

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        unreadCount,
        notificationNavigateRef,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotificationContext = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}
