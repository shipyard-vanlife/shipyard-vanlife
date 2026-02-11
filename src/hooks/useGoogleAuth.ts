import { supabase } from '../services/supabase'
// ❌ BUILD 11 - NEUTRALISÉ POUR TEST ISOLATION
// import { GoogleSignin } from '@react-native-google-signin/google-signin'

/*
// Lazy initialization flag
let isConfigured = false

const ensureConfigured = () => {
  if (!isConfigured) {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    })
    isConfigured = true
  }
}
*/

export const useGoogleAuth = () => {
  const signInWithGoogle = async () => {
    // ❌ BUILD 11 - DISABLED
    console.log('[GoogleSignin] DISABLED - Build 11')
    throw new Error('Google Sign-In disabled for testing')

    /*
    try {
      // Configure only when actually needed (lazy init)
      ensureConfigured()

      console.log('🔐 Starting Google Sign In...')

      // Check if device supports Google Play Services (iOS always does)
      await GoogleSignin.hasPlayServices()

      // Sign in with Google
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
    */
  }

  return { signInWithGoogle }
}