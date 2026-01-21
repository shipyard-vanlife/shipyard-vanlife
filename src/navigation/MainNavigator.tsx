import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { HomeScreen } from '../screens/HomeScreen'
import { TripsScreen } from '../screens/TripsScreen'
import { ChatScreen } from '../screens/ChatScreen'
import { SearchScreen } from '../screens/SearchScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { BottomTabNavigator } from './BottomTabNavigator'

type TabName = 'trips' | 'home' | 'chat' | 'search' | 'profile'

export const MainNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('home')

  const renderScreen = () => {
    switch (activeTab) {
      case 'trips':
        return <TripsScreen />
      case 'home':
        return <HomeScreen />
      case 'chat':
        return <ChatScreen />
      case 'search':
        return <SearchScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <HomeScreen />
    }
  }

  return (
    <View style={styles.container}>
      {renderScreen()}
      <BottomTabNavigator activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
