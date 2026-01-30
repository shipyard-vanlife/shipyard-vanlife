import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../styles/theme'
import { NomadProfileCard } from '../components/search/NomadProfileCard'
import { BottomSheet } from '../components/BottomSheet'
import { useAllVisibleProfiles, useMyProfile, profileKeys } from '../hooks/useProfiles'
import { useSendConnectionRequest, useMyFriends, useAllConnections } from '../hooks/useConnections'
import { UserProfile, SkillType, ALL_SKILLS } from '../types/user'

type FilterType = 'all' | 'activities' | 'help'

export const SearchScreen: React.FC = () => {
  const { t } = useTranslation(['search', 'common'])
  const queryClient = useQueryClient()
  const { data: myProfile } = useMyProfile()
  const { data: profiles, isLoading, refetch } = useAllVisibleProfiles()
  const { mutate: sendRequest } = useSendConnectionRequest()
  const { data: myFriends } = useMyFriends()
  const { data: allConnections } = useAllConnections()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<SkillType | null>(null)
  const [showSkillModal, setShowSkillModal] = useState(false)

  const calculateDistance = (from: UserProfile | undefined, to: UserProfile): number => {
    console.log('🔍 calculateDistance - from:', from?.username, from?.location)
    console.log('🔍 calculateDistance - to:', to.username, to.location)

    if (!from?.location?.latitude || !to?.location?.latitude) {
      console.log('⚠️ Missing location data')
      return 0
    }

    const R = 6371e3 // Rayon de la Terre en mètres
    const φ1 = (from.location.latitude * Math.PI) / 180
    const φ2 = (to.location.latitude * Math.PI) / 180
    const Δφ = ((to.location.latitude - from.location.latitude) * Math.PI) / 180
    const Δλ = ((to.location.longitude! - from.location.longitude!) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    const distance = R * c
    console.log('📏 Distance calculated:', distance, 'meters')
    return distance
  }

  // Filtrer les profils par recherche de nom
  const filteredProfiles = useMemo(() => {
    if (!profiles) return []

    let result = profiles.filter(p => p.id !== myProfile?.id)

    // Recherche par nom
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        p => p.username.toLowerCase().includes(query) || p.van_name?.toLowerCase().includes(query)
      )
    }

    // Filtre par skill (si filtre "Aide" actif)
    if (activeFilter === 'help' && selectedSkill) {
      result = result.filter(p => p.skills.includes(selectedSkill))
    }

    // Tri par distance (les plus proches en premier)
    result.sort((a, b) => {
      const distA = calculateDistance(myProfile || undefined, a)
      const distB = calculateDistance(myProfile || undefined, b)
      return distA - distB
    })

    return result
  }, [profiles, searchQuery, myProfile, calculateDistance, activeFilter, selectedSkill])

  const handleAddFriend = async (profileId: string, username: string) => {
    if (myProfile?.verification_status !== 'approved') {
      Alert.alert(t('common:verification.requiredTitle'), t('common:verification.requiredMessage'))
      return
    }

    sendRequest(profileId, {
      onSuccess: () => {
        Alert.alert(t('requestSent'), t('requestSentMessage', { name: username }))
        refetch()
      },
      onError: (error: any) => {
        if (error?.message?.includes('Connection already exists')) {
          Alert.alert(t('connectionExists'), t('connectionExistsMessage'))
        } else {
          Alert.alert(t('common:errors.generic'), t('requestError'))
        }
      },
    })
  }

  const getConnectionStatus = (profileId: string) => {
    console.log('🔍 getConnectionStatus - profileId:', profileId)
    console.log('🔍 myProfile:', myProfile?.id)
    console.log('🔍 allConnections:', allConnections?.length)

    if (!myProfile || !allConnections) {
      console.log('❌ Pas de myProfile ou allConnections')
      return {
        isAlreadyFriend: false,
        isPending: false,
        isReceived: false,
        connectionId: undefined,
      }
    }

    // Trouver la connexion avec ce profil
    const connection = allConnections.find(
      conn =>
        (conn.sender_id === myProfile.id && conn.receiver_id === profileId) ||
        (conn.receiver_id === myProfile.id && conn.sender_id === profileId)
    )

    console.log('🔍 connection trouvée:', connection)

    if (!connection) {
      console.log('❌ Aucune connexion trouvée')
      return {
        isAlreadyFriend: false,
        isPending: false,
        isReceived: false,
        connectionId: undefined,
      }
    }

    // Si status = 'accepted' → Ami
    // Si status = 'pending' → Différencier envoyé vs reçu
    const isPending = connection.status === 'pending'
    const isSentByMe = connection.sender_id === myProfile.id

    const result = {
      isAlreadyFriend: connection.status === 'accepted',
      isPending: isPending && isSentByMe, // En attente seulement si J'AI envoyé
      isReceived: isPending && !isSentByMe, // Demande reçue si L'AUTRE a envoyé
      connectionId: connection.id,
    }

    console.log('✅ Résultat:', result)
    return result
  }

  const handleProfileSelect = async (profile: UserProfile) => {
    await queryClient.invalidateQueries({ queryKey: profileKeys.byId(profile.id) })
    setSelectedProfile(profile)
  }

  const renderProfileCard = ({ item }: { item: UserProfile }) => {
    const distance = calculateDistance(myProfile || undefined, item)
    const { isAlreadyFriend, isPending, isReceived, connectionId } = getConnectionStatus(item.id)

    return (
      <NomadProfileCard
        profile={item}
        distance={distance}
        onAddFriend={() => handleAddFriend(item.id, item.username)}
        onPress={() => handleProfileSelect(item)}
        isPending={isPending}
        isAlreadyFriend={isAlreadyFriend}
        isReceived={isReceived}
        connectionId={connectionId}
      />
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="person-outline" size={20} color={colors.secondary.main} />
          <Text style={styles.headerTitle}>{t('title')}</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="funnel" size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.text.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres rapides */}
      <View style={styles.filtersScrollContainer}>
        <TouchableOpacity
          style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
          onPress={() => setActiveFilter('all')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="people"
            size={16}
            color={activeFilter === 'all' ? colors.white : colors.text.primary}
          />
          <Text
            style={[styles.filterPillText, activeFilter === 'all' && styles.filterPillTextActive]}
          >
            {t('filters.all')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, activeFilter === 'activities' && styles.filterPillActive]}
          onPress={() => setActiveFilter('activities')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="fitness"
            size={16}
            color={activeFilter === 'activities' ? colors.white : colors.text.primary}
          />
          <Text
            style={[
              styles.filterPillText,
              activeFilter === 'activities' && styles.filterPillTextActive,
            ]}
          >
            {t('filters.activities')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, activeFilter === 'help' && styles.filterPillActive]}
          onPress={() => {
            setActiveFilter('help')
            setShowSkillModal(true)
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="hand-left"
            size={16}
            color={activeFilter === 'help' ? colors.white : colors.text.primary}
          />
          <Text
            style={[styles.filterPillText, activeFilter === 'help' && styles.filterPillTextActive]}
          >
            {t('filters.help')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste des profils */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary.main} />
        </View>
      ) : filteredProfiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>{t('empty.title')}</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? t('empty.tryDifferentSearch') : t('empty.expandRadius')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProfiles}
          renderItem={renderProfileCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          windowSize={10}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={8}
        />
      )}

      {/* Modal de sélection de skill */}
      <Modal visible={showSkillModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('skillModal.title', { defaultValue: 'Choisir une compétence' })}
            </Text>
            <FlatList
              data={ALL_SKILLS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.skillItem}
                  onPress={() => {
                    setSelectedSkill(item)
                    setShowSkillModal(false)
                  }}
                >
                  <Text style={styles.skillText}>{t(`skills:${item}`)}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowSkillModal(false)
                setActiveFilter('all')
                setSelectedSkill(null)
              }}
            >
              <Text style={styles.modalCloseText}>
                {t('common:cancel', { defaultValue: 'Annuler' })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BottomSheet pour profil sélectionné */}
      {selectedProfile && (
        <BottomSheet profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.primary.main,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    gap: spacing.sm,
    ...shadows.small,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.primary,
    padding: 0,
  },
  filtersScrollContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.main,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.secondary.main,
  },
  filterPillText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  filterPillTextActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
  separator: {
    height: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: fontSize.base,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '80%',
    maxHeight: '70%',
    ...shadows.large,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  skillItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  skillText: {
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  modalCloseButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.text.tertiary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalCloseText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
})
