import { supabase } from '../services/supabase'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

// Lazy initialization flag
let isConfigured = false

const ensureConfigured = () => {
  if (!isConfigured) {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
    if (!webClientId) {
      throw new Error('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID manquant')
    }
    GoogleSignin.configure({
      webClientId,
      offlineAccess: true,
    })
    isConfigured = true
  }
}

export const useGoogleAuth = () => {
  const signInWithGoogle = async () => {
    try {
      ensureConfigured()

      // Sign in with Google (hasPlayServices() crash sur iOS, on skip)
      const userInfo = await GoogleSignin.signIn()
      console.log('✅ Google Sign In successful:', userInfo)

      // Get the ID token - structure changed in v16
      const idToken = userInfo.data?.idToken

      if (!idToken) {
        throw new Error('No ID token received from Google')
      }

      console.log('🎟️ ID Token received')

      // Sign in to Supabase with the Google ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      })

      if (error) {
        console.error('❌ Supabase Auth Error:', error)
        throw error
      }

      console.log('✅ Supabase session created:', data.user?.email)
    } catch (error: any) {
      console.error('❌ Google Sign In Error:', error)

      if (error.code === 'SIGN_IN_CANCELLED') {
        throw new Error('Connexion annulée')
      } else if (error.code === 'IN_PROGRESS') {
        throw new Error('Connexion déjà en cours')
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        throw new Error('Google Play Services non disponible')
      }

      throw error
    }
  }

  return { signInWithGoogle }
}