import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { useDeleteProfile } from '../hooks/useProfiles'
import { UserProfile } from '../types/user'
import { SkillBadge } from './SkillBadge'

const SCREEN_HEIGHT = Dimensions.get('window').height
const MIN_HEIGHT = 280
const MAX_HEIGHT = SCREEN_HEIGHT * 0.9

interface BottomSheetProps {
  profile: UserProfile
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ profile }) => {
  const { t } = useTranslation(['home', 'common'])
  const { signOut } = useAuth()
  const { mutate: deleteProfile, isPending: isDeleting } = useDeleteProfile()
  const scrollViewRef = useRef<ScrollView>(null)
  const [sheetHeight] = useState(new Animated.Value(MIN_HEIGHT))

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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const newHeight = MIN_HEIGHT - gesture.dy
        if (newHeight >= MIN_HEIGHT && newHeight <= MAX_HEIGHT) {
          sheetHeight.setValue(newHeight)
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -100) {
          // Swipe up - expand
          Animated.spring(sheetHeight, {
            toValue: MAX_HEIGHT,
            useNativeDriver: false,
          }).start()
        } else if (gesture.dy > 100) {
          // Swipe down - minimize
          Animated.spring(sheetHeight, {
            toValue: MIN_HEIGHT,
            useNativeDriver: false,
          }).start()
        } else {
          // Return to closest state
          const currentHeight = MIN_HEIGHT - gesture.dy
          const target = currentHeight > (MIN_HEIGHT + MAX_HEIGHT) / 2 ? MAX_HEIGHT : MIN_HEIGHT
          Animated.spring(sheetHeight, {
            toValue: target,
            useNativeDriver: false,
          }).start()
        }
      },
    })
  ).current

  return (
    <Animated.View style={[styles.container, { height: sheetHeight }]}>
      <View style={styles.handleContainer} {...panResponder.panHandlers}>
        <View style={styles.handle} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
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
              <ActivityIndicator color="#E07A5F" size="small" />
            ) : (
              <Text style={styles.deleteButtonText}>{t('common:buttons.deleteProfile')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  handleContainer: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#D4A373',
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 5,
  },
  contentContainer: {
    paddingHorizontal: 20,
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
  placeholderPhoto: {
    backgroundColor: '#F5F1E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  header: {
    marginBottom: 16,
  },
  username: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  vanName: {
    fontSize: 17,
    color: '#666',
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
    backgroundColor: '#F5F1E8',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  signOutButton: {
    backgroundColor: '#E07A5F',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E07A5F',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonText: {
    color: '#E07A5F',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})
