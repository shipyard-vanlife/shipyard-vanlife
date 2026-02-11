import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { supabase } from '../services/supabase'
import { useQueryMutation } from './useQueryMutation'

export function useRegisterPushToken() {
  return useQueryMutation({
    mutationFn: async (token: string): Promise<void> => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('push_tokens')
        .upsert(
          {
            user_id: user.user.id,
            expo_token: token,
            platform: Platform.OS as 'ios' | 'android',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,expo_token' }
        )

      if (error) throw error
    },
  })
}

export function useUnregisterPushToken() {
  return useQueryMutation({
    mutationFn: async (token: string): Promise<void> => {
      const { error } = await supabase.from('push_tokens').delete().eq('expo_token', token)

      if (error) throw error
    },
  })
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[Notifications] Push notifications require a physical device')
    return null
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Permission not granted')
    return null
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  const token = await Notifications.getExpoPushTokenAsync({
    projectId,
  })

  return token.data
}

export async function setupAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return

  await Notifications.setNotificationChannelAsync('messages', {
    name: 'Messages',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  })

  await Notifications.setNotificationChannelAsync('connections', {
    name: 'Connexions',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  })

  await Notifications.setNotificationChannelAsync('activities', {
    name: 'Activités',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  })
}
