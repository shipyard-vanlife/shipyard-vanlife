import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { AuthProvider, useAuth } from './src/contexts/AuthContext'
import './src/i18n'
import { HomeScreen } from './src/screens/HomeScreen'
import { LoginScreen } from './src/screens/LoginScreen'
import { RegisterScreen } from './src/screens/RegisterScreen'

type Screen = 'login' | 'register'

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
    return <HomeScreen />
  }

  if (currentScreen === 'register') {
    return <RegisterScreen onNavigateToLogin={() => setCurrentScreen('login')} />
  }

  return <LoginScreen onNavigateToRegister={() => setCurrentScreen('register')} />
}

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
      <StatusBar style="auto" />
    </AuthProvider>
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
