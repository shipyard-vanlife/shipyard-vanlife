import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider, useAuth } from './src/contexts/AuthContext'
import { RevenueCatProvider } from './src/contexts/RevenueCatContext'
import { useMyProfile } from './src/hooks/useProfiles'
import { useOnboarding } from './src/hooks/useOnboarding'
import './src/i18n'
import { MainNavigator } from './src/navigation/MainNavigator'
import { LoginScreen } from './src/screens/LoginScreen'
import { ProfileSetupScreen } from './src/screens/ProfileSetupScreen'
import { RegisterScreen } from './src/screens/RegisterScreen'
import { VerificationScreen } from './src/screens/VerificationScreen'
import { VerificationChoiceScreen } from './src/screens/VerificationChoiceScreen'
import { InvitationCodeScreen } from './src/screens/InvitationCodeScreen'
import { OnboardingScreen } from './src/screens/OnboardingScreen'
import { OnboardingPricingScreen } from './src/screens/OnboardingPricingScreen'
import { SplashScreen } from './src/components/SplashScreen'
import { colors } from './src/styles/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

type Screen = 'login' | 'register'
type VerificationFlow = 'choice' | 'invitation' | 'verification'

// Composant pour les utilisateurs authentifiés
function AuthenticatedApp() {
  const { data: profile, isLoading } = useMyProfile()
  const { hasCompletedOnboarding, isLoading: isOnboardingLoading, resetOnboarding } = useOnboarding()
  const [verificationFlow, setVerificationFlow] = useState<VerificationFlow>('choice')
  const [verificationSubmitted, setVerificationSubmitted] = useState(false)
  const [onboardingScreen, setOnboardingScreen] = useState<'slides' | 'pricing'>('slides')
  const [skipOnboarding, setSkipOnboarding] = useState(false)

  // Reset onboarding pour les nouveaux utilisateurs
  // AsyncStorage persiste entre comptes sur le même device
  useEffect(() => {
    if (!isLoading && profile && !profile.username && hasCompletedOnboarding) {
      resetOnboarding()
    }
  }, [isLoading, profile?.username, hasCompletedOnboarding, resetOnboarding])

  if (isLoading || isOnboardingLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.secondary.main} />
      </View>
    )
  }

  // Déterminer si l'utilisateur a besoin de vérification
  // Un profil peut exister (créé par use_invitation_code) mais sans vérification
  // verificationSubmitted bypasse le check quand l'utilisateur vient de soumettre
  const needsVerification =
    !verificationSubmitted && (!profile || !profile.verification_status)

  // Cas 1: Pas de profil OU profil sans vérification → Flow de vérification
  if (needsVerification) {
    // Étape 1: Choix entre code d'invitation ou vérification classique
    // On affiche le choix seulement si l'utilisateur n'a pas encore de parrain (invited_by)
    // Si invited_by est déjà défini, c'est qu'il a déjà utilisé un code, on passe direct à la vérification
    const hasUsedInvitationCode = profile?.invited_by != null

    if (verificationFlow === 'choice' && !hasUsedInvitationCode) {
      return (
        <VerificationChoiceScreen
          onChooseInvitation={() => setVerificationFlow('invitation')}
          onChooseClassic={() => setVerificationFlow('verification')}
        />
      )
    }

    // Étape 2a: Saisie du code d'invitation
    if (verificationFlow === 'invitation' && !hasUsedInvitationCode) {
      return (
        <InvitationCodeScreen
          onSuccess={() => setVerificationFlow('verification')}
          onBack={() => setVerificationFlow('choice')}
        />
      )
    }

    // Étape 2b/3: Vérification d'identité (même flow pour les deux chemins)
    return <VerificationScreen onVerificationComplete={() => setVerificationSubmitted(true)} />
  }

  // Cas 2: Profil vérifié mais pas de username → Profile Setup
  if (!profile?.username) {
    return <ProfileSetupScreen />
  }

  // Cas 3: Profil complet mais onboarding pas fait → Onboarding
  // skipOnboarding permet de sauter temporairement sans sauvegarder
  if (!hasCompletedOnboarding && !skipOnboarding) {
    if (onboardingScreen === 'slides') {
      return <OnboardingScreen onComplete={() => setOnboardingScreen('pricing')} />
    }
    return <OnboardingPricingScreen onComplete={() => setSkipOnboarding(true)} />
  }

  // Cas 4: Profil complet et onboarding fait → Navigation principale
  return <MainNavigator />
}

function Navigation() {
  const { user, loading } = useAuth()
  const [currentScreen, setCurrentScreen] = useState<Screen>('login')

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.secondary.main} />
      </View>
    )
  }

  if (user) {
    return <AuthenticatedApp />
  }

  if (currentScreen === 'register') {
    return <RegisterScreen onNavigateToLogin={() => setCurrentScreen('login')} />
  }

  return <LoginScreen onNavigateToRegister={() => setCurrentScreen('register')} />
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RevenueCatProvider>
            <Navigation />
          </RevenueCatProvider>
          <StatusBar style="auto" />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
