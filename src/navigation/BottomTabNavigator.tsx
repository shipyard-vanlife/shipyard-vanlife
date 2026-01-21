import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, shadows } from '../styles/theme'

type TabName = 'trips' | 'home' | 'chat' | 'search' | 'profile'

interface BottomTabNavigatorProps {
  activeTab: TabName
  onTabChange: (tab: TabName) => void
}

interface TabConfig {
  name: TabName
  icon: keyof typeof Ionicons.glyphMap
  iconActive: keyof typeof Ionicons.glyphMap
}

const tabs: TabConfig[] = [
  { name: 'trips', icon: 'map-outline', iconActive: 'map' },
  { name: 'home', icon: 'home-outline', iconActive: 'home' },
  { name: 'chat', icon: 'chatbubbles-outline', iconActive: 'chatbubbles' },
  { name: 'search', icon: 'search-outline', iconActive: 'search' },
  { name: 'profile', icon: 'person-outline', iconActive: 'person' },
]

export const BottomTabNavigator: React.FC<BottomTabNavigatorProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.name
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => onTabChange(tab.name)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={26}
                color={isActive ? colors.secondary.main : colors.text.tertiary}
              />
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...shadows.medium,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
})
