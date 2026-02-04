import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PhotoSourceModal } from '../components/PhotoSourceModal'
import { InvitationSection } from '../components/invitation'
import {
  ProfileAboutSection,
  ProfileEditModal,
  ProfileHeader,
  ProfilePhotoGrid,
  ProfileSkillBadges,
  ProfileStats,
  ProfileVanSection,
  VerificationPendingBanner,
} from '../components/profile'
import { UsernameEditModal } from '../components/profile/UsernameEditModal'
import { useAuth } from '../contexts/AuthContext'
import { useSignOut } from '../hooks'
import { useImagePicker } from '../hooks/useImagePicker'
import { useProfilePhotosUpload } from '../hooks/useProfilePhotos'
import {
  useMyProfile,
  useUpdateProfile,
} from '../hooks/useProfiles'
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../styles/theme'
import { SettingsScreen } from './SettingsScreen'

type PickerMode = 'avatar' | 'profile-photo' | null

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation(['profile', 'common'])
  const { user } = useAuth()
  const { mutateAsync: signOut } = useSignOut()
  const { data: profile, isLoading } = useMyProfile()
  const { mutate: updateProfile } = useUpdateProfile()

  const [showSettingsScreen, setShowSettingsScreen] = useState(false)

  // Single image picker instance for both avatar and profile photos
  const {
    pickImage,
    takePhoto,
    uploadImage,
    imageUri,
    error: imageError,
    clearImage,
  } = useImagePicker()

  // Track what we're uploading
  const [pickerMode, setPickerMode] = useState<PickerMode>(null)
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const isProcessingRef = useRef(false)

  // Profile photos upload utilities
  const {
    uploadPhoto: uploadProfilePhoto,
    deletePhoto,
    isUploading: isUploadingPhoto,
    isDeleting: isDeletingPhoto,
  } = useProfilePhotosUpload()

  // Handle image picker errors
  useEffect(() => {
    if (imageError) {
      Alert.alert(t('common:errors.generic'), imageError.message)
    }
  }, [imageError, t])

  // Handle image upload after picker returns
  useEffect(() => {
    // Guard against race conditions - don't process if already processing
    if (!imageUri || !pickerMode || !user || isProcessingRef.current) {
      return
    }

    isProcessingRef.current = true

    const handleUpload = async () => {
      try {
        if (pickerMode === 'avatar') {
          setIsUploadingAvatar(true)
          try {
            const uploadedUrl = await uploadImage(user.id)
            if (uploadedUrl) {
              updateProfile(
                { avatar_url: uploadedUrl },
                {
                  onError: (error: Error) => {
                    Alert.alert(t('common:errors.generic'), error.message)
                  },
                }
              )
            }
          } finally {
            setIsUploadingAvatar(false)
          }
        } else if (pickerMode === 'profile-photo') {
          await uploadProfilePhoto(imageUri, profile?.photos ?? [])
        }
      } finally {
        clearImage()
        setPickerMode(null)
        isProcessingRef.current = false
      }
    }

    handleUpload()
  }, [
    imageUri,
    pickerMode,
    user,
    uploadImage,
    updateProfile,
    uploadProfilePhoto,
    profile?.photos,
    clearImage,
    t,
  ])

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
    } catch {
      // Error during sign out is handled silently
    }
  }, [signOut])


  // Open edit modal
  const handleEditPress = useCallback(() => {
    setShowEditModal(true)
  }, [])

  // Close edit modal
  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false)
  }, [])

  // Open modal for avatar
  const handleAvatarPress = useCallback(() => {
    setPickerMode('avatar')
    setShowModal(true)
  }, [])

  // Open modal for profile photos
  const handleAddPhoto = useCallback(() => {
    if (isProcessingRef.current) return
    setPickerMode('profile-photo')
    setShowModal(true)
  }, [])

  // Close modal
  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setPickerMode(null)
  }, [])

  // Handle gallery pick
  const handlePickImage = useCallback(() => {
    setShowModal(false)
    setTimeout(() => {
      if (isProcessingRef.current) return
      pickImage()
    }, 600)
  }, [pickImage])

  // Handle camera
  const handleTakePhoto = useCallback(() => {
    setShowModal(false)
    setTimeout(() => {
      if (isProcessingRef.current) return
      takePhoto()
    }, 600)
  }, [takePhoto])

  // Handle photo deletion
  const handleDeletePhoto = useCallback(
    async (photoUrl: string) => {
      await deletePhoto(photoUrl, profile?.photos ?? [])
    },
    [deletePhoto, profile?.photos]
  )

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color={colors.secondary.main} />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </SafeAreaView>
    )
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <Text style={styles.errorText}>{t('error.notFound')}</Text>
      </SafeAreaView>
    )
  }

  // Show settings screen if active
  if (showSettingsScreen) {
    return <SettingsScreen onClose={() => setShowSettingsScreen(false)} />
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Settings Icon - Top Left */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setShowSettingsScreen(true)}
      >
        <Ionicons name="settings-outline" size={28} color={colors.text.primary} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with avatar, name, location, van */}
        <ProfileHeader
          avatarUrl={profile.avatar_url}
          firstname={profile.firstname}
          lastname={profile.lastname}
          username={profile.username}
          vanName={profile.van_name}
          city={profile.city}
          daysOnRoad={profile.days_on_road}
          isOwnProfile={true}
          onAvatarPress={handleAvatarPress}
          onEditPress={handleEditPress}
          onUsernamePress={() => setShowUsernameModal(true)}
          isUploadingAvatar={isUploadingAvatar}
        />

        {/* Verification pending banner */}
        <VerificationPendingBanner verificationStatus={profile.verification_status} />

        {/* Stats grid */}
        <ProfileStats
          daysOnRoad={profile.days_on_road}
          distanceKm={profile.total_distance_km}
          connectionsCount={profile.connections_count}
          city={profile.city}
        />

        {/* Skill badges */}
        <ProfileSkillBadges skills={profile.skills} />

        {/* Van section */}
        <ProfileVanSection
          vanName={profile.van_name}
          vanPhotoUrl={profile.van_photo_url}
          isOwnProfile={true}
          onEditPress={handleEditPress}
        />

        {/* About section */}
        <ProfileAboutSection bio={profile.bio} />

        {/* Photos gallery */}
        <ProfilePhotoGrid
          photos={profile.photos ?? []}
          isOwnProfile={true}
          onAddPhoto={handleAddPhoto}
          onDeletePhoto={handleDeletePhoto}
          isUploading={isUploadingPhoto}
          isDeleting={isDeletingPhoto}
        />

        {/* Invitation section - only for verified users */}
        <View style={styles.invitationContainer}>
          <InvitationSection
            isVerified={profile.verification_status === 'approved'}
            isSuspended={
              Boolean(profile.invitation_suspended_until) &&
              new Date(profile.invitation_suspended_until!) > new Date()
            }
            suspendedUntil={profile.invitation_suspended_until}
          />
        </View>

        {/* Sign out button */}
        <View style={styles.adminActions}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>{t('actions.signOut')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Single modal for both avatar and profile photos */}
      <PhotoSourceModal
        visible={showModal}
        onClose={handleCloseModal}
        onTakePhoto={handleTakePhoto}
        onPickImage={handlePickImage}
      />

      {/* Profile edit modal */}
      <ProfileEditModal
        visible={showEditModal}
        onClose={handleCloseEditModal}
        initialData={{
          van_name: profile.van_name,
          van_photo_url: profile.van_photo_url,
          bio: profile.bio,
          skills: profile.skills,
          is_visible: profile.is_visible,
          trips_visible: profile.trips_visible,
          verification_status: profile.verification_status,
        }}
      />

      {/* Username edit modal */}
      <UsernameEditModal
        visible={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        currentUsername={profile.username}
        lastUpdated={profile.username_last_updated_at || null}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    left: spacing.xl,
    zIndex: 10,
    padding: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  invitationContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  adminActions: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
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
})
