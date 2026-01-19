import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { useDeleteProfile, useMyProfile } from '../hooks/useProfiles'
import { colors } from '../styles/theme'
import { SkillBadge } from '../components/SkillBadge'

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation(['home', 'common'])
  const { signOut } = useAuth()
  const { data: profile, isLoading } = useMyProfile()
  const { mutate: deleteProfile, isPending: isDeleting } = useDeleteProfile()
  const scrollViewRef = useRef<ScrollView>(null)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const handleDeleteProfile = () => {
    Alert.alert(t('common:profile.deleteTitle'), t('common:profile.deleteConfirmation'), [
      { text: t('common:buttons.cancel'), style: 'cancel' },
      {
        text: t('common:buttons.delete'),
        style: 'destructive',
        onPress: () => {
          deleteProfile(undefined, {
            onError: (error: Error) => {
              Alert.alert(t('common:errors.generic'), error.message)
            },
          })
        },
      },
    ])
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary.main} />
      </View>
    )
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{t('common:errors.profileNotFound')}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Photo du van */}
          <View style={styles.vanPhotoContainer}>
            <Image
              source={require('../../assets/van-life.jpg')}
              style={styles.vanPhoto}
              resizeMode="cover"
            />
          </View>

          {/* Nom utilisateur + van */}
          <View style={styles.header}>
            <Text style={styles.username}>{profile.username}</Text>
            {profile.van_name ? <Text style={styles.vanName}>{profile.van_name}</Text> : null}
          </View>

          {/* Badge principal */}
          {profile.main_specialty ? (
            <View style={styles.mainBadgeContainer}>
              <SkillBadge skill={profile.main_specialty} isMain />
            </View>
          ) : null}

          {/* Autres badges */}
          <View style={styles.skillsContainer}>
            {profile.skills
              .filter(skill => skill !== profile.main_specialty)
              .map(skill => (
                <SkillBadge key={skill} skill={skill} />
              ))}
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{t('profile.currentCity')}</Text>
              <Text style={styles.statValue}>{profile.city ?? '-'}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{t('profile.daysOnRoad')}</Text>
              <Text style={styles.statValue}>{profile.days_on_road}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{t('profile.connections')}</Text>
              <Text style={styles.statValue}>{profile.connections_count}</Text>
            </View>
          </View>

          {/* Bouton déconnexion */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={isDeleting}
          >
            <Text style={styles.signOutText}>{t('common:buttons.logout')}</Text>
          </TouchableOpacity>

          {/* Bouton supprimer profil (dev/test) */}
          <TouchableOpacity
            style={[styles.deleteButton, isDeleting && styles.buttonDisabled]}
            onPress={handleDeleteProfile}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color={colors.secondary.main} size="small" />
            ) : (
              <Text style={styles.deleteButtonText}>{t('common:buttons.deleteProfile')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  vanPhotoContainer: {
    width: '100%',
    height: 280,
    marginBottom: 20,
  },
  vanPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  header: {
    marginBottom: 16,
  },
  username: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  vanName: {
    fontSize: 17,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  mainBadgeContainer: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  signOutButton: {
    backgroundColor: colors.secondary.main,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.secondary.main,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonText: {
    color: colors.secondary.main,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})
