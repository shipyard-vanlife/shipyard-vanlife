import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { AuthProvider, useAuth } from './src/contexts/AuthContext'
import { useMyProfile } from './src/hooks/useProfiles'
import './src/i18n'
import { HomeScreen } from './src/screens/HomeScreen'
import { LoginScreen } from './src/screens/LoginScreen'
import { ProfileSetupScreen } from './src/screens/ProfileSetupScreen'
import { RegisterScreen } from './src/screens/RegisterScreen'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

type Screen = 'login' | 'register'

// Composant pour les utilisateurs authentifiés
function AuthenticatedApp() {
  const { data: profile, isLoading } = useMyProfile()

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E07A5F" />
      </View>
    )
  }

  // Pas de profil → création
  if (!profile) {
    return <ProfileSetupScreen />
  }

  // Profil existe → home
  return <HomeScreen />
}

function Navigation() {
  const { user, loading } = useAuth()
  const [currentScreen, setCurrentScreen] = useState<Screen>('login')

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Navigation />
        <StatusBar style="auto" />
      </AuthProvider>
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
