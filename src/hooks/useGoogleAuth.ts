import { supabase } from '../services/supabase'
// import { GoogleSignin } from '@react-native-google-signin/google-signin'

// // Configuration - le Client ID est lu depuis Info.plist via la config Expo
// GoogleSignin.configure({
//   offlineAccess: true,
// })

export const useGoogleAuth = () => {
  const signInWithGoogle = async () => {
    throw new Error('Google Sign-In nécessite un development build. Utilisez: eas build --platform ios --profile development')

    // try {
    //   console.log('🔐 Starting Google Sign In...')

    //   // Check if device supports Google Play Services (iOS always does)
    //   await GoogleSignin.hasPlayServices()

    //   // Sign in with Google
    //   const userInfo = await GoogleSignin.signIn()
    //   console.log('✅ Google Sign In successful:', userInfo.user.email)

    //   // Get the ID token
    //   const { idToken } = userInfo.data

    //   if (!idToken) {
    //     throw new Error('No ID token received from Google')
    //   }

    //   console.log('🎟️ ID Token received')

    //   // Sign in to Supabase with the Google ID token
    //   const { data, error } = await supabase.auth.signInWithIdToken({
    //     provider: 'google',
    //     token: idToken,
    //   })

    //   if (error) {
    //     console.error('❌ Supabase Auth Error:', error)
    //     throw error
    //   }

    //   console.log('✅ Supabase session created:', data.user?.email)
    // } catch (error: any) {
    //   console.error('❌ Google Sign In Error:', error)

    //   if (error.code === 'SIGN_IN_CANCELLED') {
    //     throw new Error('Connexion annulée')
    //   } else if (error.code === 'IN_PROGRESS') {
    //     throw new Error('Connexion déjà en cours')
    //   } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
    //     throw new Error('Google Play Services non disponible')
    //   }

    //   throw error
    // }
  }

  return { signInWithGoogle }
}