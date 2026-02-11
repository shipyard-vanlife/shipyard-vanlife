import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { ActivitiesScreen } from '../screens/ActivitiesScreen'
import { ChatScreen } from '../screens/ChatScreen'
import { HomeScreen } from '../screens/HomeScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { SearchScreen } from '../screens/SearchScreen'
import { TripsScreen } from '../screens/TripsScreen'
import type { Trip } from '../types/trip'
import type { NotificationNavigationData } from '../types/notification'
import { useNotificationContext } from '../contexts/NotificationContext'
import { BottomTabNavigator } from './BottomTabNavigator'

type TabName = 'trips' | 'home' | 'activities' | 'chat' | 'search' | 'profile'

export const MainNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('home')
  const [tripToShow, setTripToShow] = useState<Trip | null>(null)
  const [notificationIntent, setNotificationIntent] = useState<NotificationNavigationData | null>(
    null
  )
  const { notificationNavigateRef } = useNotificationContext()

  // Track which tabs have been visited for lazy mounting
  const [mountedTabs, setMountedTabs] = useState<Set<TabName>>(() => new Set(['home']))

  const handleTabChange = useCallback((tab: TabName) => {
    setMountedTabs(prev => {
      if (prev.has(tab)) return prev
      const next = new Set(prev)
      next.add(tab)
      return next
    })
    setActiveTab(tab)
  }, [])

  const handleViewTripOnMap = useCallback(
    (trip: Trip) => {
      setTripToShow(trip)
      handleTabChange('home')
    },
    [handleTabChange]
  )

  const handleClearTripToShow = useCallback(() => {
    setTripToShow(null)
  }, [])

  const handleNavigateToChat = useCallback(() => {
    handleTabChange('chat')
  }, [handleTabChange])

  // Register the notification navigation callback
  useEffect(() => {
    notificationNavigateRef.current = (data: NotificationNavigationData) => {
      setNotificationIntent(data)

      switch (data.screen) {
        case 'chat':
        case 'activityChat':
        case 'connections':
          handleTabChange('chat')
          break
        case 'activities':
          handleTabChange('activities')
          break
        case 'profile':
          handleTabChange('profile')
          break
      }
    }

    return () => {
      notificationNavigateRef.current = null
    }
  }, [handleTabChange, notificationNavigateRef])

  const handleClearNotificationIntent = useCallback(() => {
    setNotificationIntent(null)
  }, [])

  return (
    <View style={styles.container}>
      {/* All screens rendered simultaneously, hidden via display style.
          Screens are lazy-mounted: only rendered after first visit. */}

      <View style={activeTab === 'trips' ? styles.activeScreen : styles.hiddenScreen}>
        {mountedTabs.has('trips') ? <TripsScreen onViewTripOnMap={handleViewTripOnMap} /> : null}
      </View>

      <View style={activeTab === 'home' ? styles.activeScreen : styles.hiddenScreen}>
        {mountedTabs.has('home') ? (
          <HomeScreen
            tripToShow={tripToShow}
            onClearTripToShow={handleClearTripToShow}
            onNavigateToChat={handleNavigateToChat}
          />
        ) : null}
      </View>

      <View style={activeTab === 'activities' ? styles.activeScreen : styles.hiddenScreen}>
        {mountedTabs.has('activities') ? (
          <ActivitiesScreen
            notificationIntent={notificationIntent}
            onClearNotificationIntent={handleClearNotificationIntent}
          />
        ) : null}
      </View>

      <View style={activeTab === 'chat' ? styles.activeScreen : styles.hiddenScreen}>
        {mountedTabs.has('chat') ? (
          <ChatScreen
            notificationIntent={notificationIntent}
            onClearNotificationIntent={handleClearNotificationIntent}
          />
        ) : null}
      </View>

      <View style={activeTab === 'search' ? styles.activeScreen : styles.hiddenScreen}>
        {mountedTabs.has('search') ? <SearchScreen /> : null}
      </View>

      <View style={activeTab === 'profile' ? styles.activeScreen : styles.hiddenScreen}>
        {mountedTabs.has('profile') ? <ProfileScreen /> : null}
      </View>

      <BottomTabNavigator activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  activeScreen: {
    flex: 1,
  },
  hiddenScreen: {
    flex: 0,
    height: 0,
    overflow: 'hidden',
  },
})
