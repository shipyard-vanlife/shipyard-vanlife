import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PhotoSourceModal } from '../components/PhotoSourceModal'
import {
  ProfileAboutSection,
  ProfileActionButton,
  ProfileHeader,
  ProfilePhotoGallery,
  ProfileSkillBadges,
  ProfileStats,
} from '../components/profile'
import { useAuth } from '../contexts/AuthContext'
import { useAvatarUpload } from '../hooks/useAvatarUpload'
import { useDeleteProfile, useMyProfile } from '../hooks/useProfiles'
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../styles/theme'

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation(['profile', 'common'])
  const { signOut, user } = useAuth()
  const { data: profile, isLoading } = useMyProfile()
  const { mutate: deleteProfile, isPending: isDeleting } = useDeleteProfile()

  const {
    isUploading: isUploadingAvatar,
    showModal: showAvatarModal,
    openModal: handleAvatarPress,
    closeModal: closeAvatarModal,
    handlePickImage,
    handleTakePhoto,
  } = useAvatarUpload({ userId: user?.id })

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
    } catch {
      // Error during sign out is handled silently
    }
  }, [signOut])

  const handleDeleteProfile = useCallback(() => {
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
  }, [deleteProfile, t])

  const handleViewTrip = useCallback(() => {
    // TODO: Navigate to trip screen when implemented
  }, [])

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={colors.secondary.main} />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </SafeAreaView>
    )
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <Text style={styles.errorText}>{t('error.notFound')}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          avatarUrl={profile.avatar_url}
          firstname={profile.firstname}
          lastname={profile.lastname}
          username={profile.username}
          vanName={profile.van_name}
          daysOnRoad={profile.days_on_road}
          onAvatarPress={handleAvatarPress}
          isUploadingAvatar={isUploadingAvatar}
        />

        <ProfileStats
          distanceKm={profile.total_distance_km}
          connectionsCount={profile.connections_count}
          city={profile.city}
        />

        <ProfileSkillBadges skills={profile.skills} mainSpecialty={profile.main_specialty} />

        <ProfileActionButton onPress={handleViewTrip} />

        <ProfilePhotoGallery photos={profile.photos ?? []} />

        <ProfileAboutSection bio={profile.bio} />

        {/* Admin actions */}
        <View style={styles.adminActions}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={isDeleting}
          >
            <Text style={styles.signOutText}>{t('actions.signOut')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, isDeleting && styles.buttonDisabled]}
            onPress={handleDeleteProfile}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color={colors.error} size="small" />
            ) : (
              <Text style={styles.deleteButtonText}>{t('actions.deleteAccount')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PhotoSourceModal
        visible={showAvatarModal}
        onClose={closeAvatarModal}
        onTakePhoto={handleTakePhoto}
        onPickImage={handlePickImage}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.tertiary,
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.huge + spacing.xxxl,
  },
  adminActions: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
  signOutButton: {
    backgroundColor: colors.secondary.main,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})
