import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { ActivitiesScreen } from '../screens/ActivitiesScreen'
import { ChatScreen } from '../screens/ChatScreen'
import { HomeScreen } from '../screens/HomeScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { SearchScreen } from '../screens/SearchScreen'
import { TripsScreen } from '../screens/TripsScreen'
import type { Trip } from '../types/trip'
import { BottomTabNavigator } from './BottomTabNavigator'

type TabName = 'trips' | 'home' | 'activities' | 'chat' | 'search' | 'profile'

export const MainNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('home')
  const [tripToShow, setTripToShow] = useState<Trip | null>(null)

  const handleViewTripOnMap = (trip: Trip) => {
    setTripToShow(trip)
    setActiveTab('home')
  }

  const handleClearTripToShow = () => {
    setTripToShow(null)
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'trips':
        return <TripsScreen onViewTripOnMap={handleViewTripOnMap} />
      case 'home':
        return <HomeScreen tripToShow={tripToShow} onClearTripToShow={handleClearTripToShow} />
      case 'activities':
        return <ActivitiesScreen />
      case 'chat':
        return <ChatScreen />
      case 'search':
        return <SearchScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <HomeScreen tripToShow={tripToShow} onClearTripToShow={handleClearTripToShow} />
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
