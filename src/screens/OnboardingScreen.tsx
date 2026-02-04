import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  ViewToken,
  ImageBackground,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight } from '../styles/theme'
import { useOnboarding } from '../hooks/useOnboarding'

const { width, height } = Dimensions.get('window')

interface OnboardingScreenProps {
  onComplete: () => void
}

interface OnboardingSlide {
  id: string
  slideKey: 'map' | 'trips' | 'community' | 'help' | 'events' | 'start'
  image: any
  hasOverlay?: boolean
  hasBadge?: boolean
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { t } = useTranslation('onboarding')
  const { completeOnboarding } = useOnboarding()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  const slides: OnboardingSlide[] = [
    {
      id: '1',
      slideKey: 'map',
      image: require('../../assets/image-onboarding/6447bdb2-19bf-4985-ab0b-ab06d8daa096.png'),
      hasBadge: true,
    },
    {
      id: '2',
      slideKey: 'trips',
      image: require('../../assets/image-onboarding/e1ead755-8b0b-46bb-bff2-8c79244ce92b.png'),
      hasOverlay: true,
    },
    {
      id: '3',
      slideKey: 'community',
      image: require('../../assets/image-onboarding/dc8482b6-bf65-4232-b9fe-1f8d0cf50cca.png'),
    },
    {
      id: '4',
      slideKey: 'help',
      image: require('../../assets/image-onboarding/2fc13c72-4def-4504-8be8-585a0c2d84aa.png'),
      hasOverlay: true,
    },
    {
      id: '5',
      slideKey: 'events',
      image: require('../../assets/image-onboarding/8f2c7b53-a1a3-4b93-9a76-1449ffc8d69d.png'),
    },
    {
      id: '6',
      slideKey: 'start',
      image: require('../../assets/image-onboarding/15a7a124-2b32-490c-b9c1-cccc7931cd00.png'),
    },
  ]

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0)
      }
    }
  ).current

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })
    } else {
      // Si on est sur la dernière slide et checkbox cochée, sauvegarder
      if (dontShowAgain) {
        await completeOnboarding()
      }
      onComplete()
    }
  }

  const handleSkip = async () => {
    if (dontShowAgain) {
      await completeOnboarding()
    }
    onComplete()
  }

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    // Slide 6 (START) = plein écran avec image background + gradient + texte
    if (item.slideKey === 'start') {
      return (
        <ImageBackground
          source={item.image}
          style={styles.fullScreenSlide}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(250,249,247,0)', 'rgba(250,249,247,0.7)', 'rgba(250,249,247,1)']}
            locations={[0, 0.4, 0.95]}
            style={styles.fullScreenGradient}
          >
            <View style={styles.fullScreenTextContainer}>
              <Text style={styles.fullScreenTitle}>{t('slides.start.title')}</Text>
              <Text style={styles.fullScreenDescription}>{t('slides.start.description')}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      )
    }

    // Slides 1-5 = format normal
    return (
      <View style={styles.slide}>
        {/* Image avec overlay */}
        <View style={styles.imageContainer}>
          <ImageBackground
            source={item.image}
            style={styles.backgroundImage}
            imageStyle={styles.backgroundImageStyle}
          >
            {/* Badge pour slide MAP (12 Nomades proches) */}
            {item.hasBadge && item.slideKey === 'map' && (
              <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                  <Ionicons name="location" size={18} color="#E07856" />
                  <Text style={styles.badgeText}>{t('slides.map.badge')}</Text>
                </View>
              </View>
            )}

            {/* Overlay pour slide TRIPS (Voyage en cours) */}
            {item.hasOverlay && item.slideKey === 'trips' && (
              <View style={styles.overlayTopRight}>
                <View style={styles.overlayCard}>
                  <View style={styles.overlayHeader}>
                    <View style={styles.greenDot} />
                    <Text style={styles.overlayTitle}>{t('slides.trips.status')}</Text>
                  </View>
                  <Text style={styles.overlaySubtitle}>{t('slides.trips.day')}</Text>
                </View>
              </View>
            )}

            {/* Overlay pour slide HELP (Message Alex) */}
            {item.hasOverlay && item.slideKey === 'help' && (
              <View style={styles.helpOverlayContainer}>
                <View style={styles.helpOverlay}>
                  <View style={styles.helpAvatarRow}>
                    <View style={styles.helpAvatar}>
                      <Ionicons name="person" size={20} color={colors.white} />
                    </View>
                    <Text style={styles.helpName}>{t('slides.help.avatar')}</Text>
                  </View>
                  <Text style={styles.helpMessage}>{t('slides.help.message')}</Text>
                </View>
              </View>
            )}
          </ImageBackground>
        </View>

        {/* Texte en bas */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t(`slides.${item.slideKey}.title`)}</Text>
          <Text style={styles.description}>{t(`slides.${item.slideKey}.description`)}</Text>
        </View>
      </View>
    )
  }

  const renderDot = (index: number) => (
    <View
      key={index}
      style={[styles.dot, currentIndex === index && styles.dotActive]}
    />
  )

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Bouton Passer en haut à droite */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>{t('skip')}</Text>
      </TouchableOpacity>

      {/* Carousel de slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Footer avec pagination et boutons */}
      <View style={[styles.footer, currentIndex === slides.length - 1 && styles.footerTransparent]}>
        <View style={styles.pagination}>
          {slides.map((_, index) => renderDot(index))}
        </View>

        {/* Checkbox "Ne plus afficher" */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkboxTouchable}
            onPress={() => setDontShowAgain(!dontShowAgain)}
          >
            <View style={[styles.checkbox, dontShowAgain && styles.checkboxChecked]}>
              {dontShowAgain && <Ionicons name="checkmark" size={16} color={colors.white} />}
            </View>
          </TouchableOpacity>
          <Text style={styles.checkboxText}>{t('dontShow')}</Text>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>{t('next')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F7',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: spacing.xl,
    zIndex: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  skipText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: '#E07856',
  },
  slide: {
    width,
    paddingTop: 80,
    alignItems: 'center',
  },
  imageContainer: {
    width: width * 0.85,
    height: height * 0.48,
    marginBottom: spacing.lg,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  backgroundImageStyle: {
    borderRadius: 32,
  },
  // Badge "12 Nomades proches" (slide 1)
  badgeContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 24,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  badgeText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  // Overlay "Voyage en cours" (slide 2)
  overlayTopRight: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  overlayCard: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 200,
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  overlayTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  overlaySubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  // Overlay message Alex (slide 4)
  helpOverlayContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  helpOverlay: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  helpAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  helpAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  helpMessage: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  // Texte en bas de chaque slide
  textContainer: {
    paddingHorizontal: spacing.xl * 1.5,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: '#1F2937',
    marginBottom: spacing.md,
    textAlign: 'center',
    lineHeight: 34,
  },
  description: {
    fontSize: fontSize.base,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
  },
  // Footer
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    // gap: spacing.lg,
    backgroundColor: '#FAF9F7',
  },
  footerTransparent: {
    position: 'absolute',
    bottom: 34,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
     paddingBottom: spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    width: 28,
    backgroundColor: '#E07856',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  checkboxTouchable: {
    marginRight: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#E07856',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#E07856',
  },
  checkboxText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: '#E07856',
    paddingVertical: spacing.lg + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E07856',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  // Styles pour la slide 6 (START) - plein écran
  fullScreenSlide: {
    width,
    height,
  },
  fullScreenGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl * 1.5,
    paddingBottom: height * 0.3,
  },
  fullScreenTextContainer: {
    alignItems: 'center',
  },
  fullScreenTitle: {
    fontSize: 34,
    fontWeight: fontWeight.bold,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 42,
  },
  fullScreenDescription: {
    fontSize: fontSize.base,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
  },
})
