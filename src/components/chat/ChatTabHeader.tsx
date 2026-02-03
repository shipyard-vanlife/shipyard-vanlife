import React, { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, fontSize, fontWeight } from '../../styles/theme'

type ChatTab = 'friends' | 'groups' | 'requests'

interface ChatTabHeaderProps {
  activeTab: ChatTab
  onTabChange: (tab: ChatTab) => void
  friendsCount: number
  groupsCount: number
  requestsCount: number
}

const TABS: ChatTab[] = ['friends', 'groups', 'requests']

export const ChatTabHeader = memo(function ChatTabHeader({
  activeTab,
  onTabChange,
  friendsCount,
  groupsCount,
  requestsCount,
}: ChatTabHeaderProps) {
  const { t } = useTranslation(['chat'])

  const counts: Record<ChatTab, number> = {
    friends: friendsCount,
    groups: groupsCount,
    requests: requestsCount,
  }

  return (
    <View style={styles.header}>
      {TABS.map(tab => {
        const isActive = activeTab === tab
        const count = counts[tab]
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabChange(tab)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {t(`tabs.${tab}`)}
              {count > 0 ? <Text style={styles.tabBadge}> ({count})</Text> : null}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
})

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 0,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.secondary.main,
  },
  tabText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.secondary.main,
  },
  tabBadge: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
  },
})
