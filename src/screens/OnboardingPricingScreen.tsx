import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Switch,
  ScrollView,
  ImageBackground,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useTranslation } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, spacing, fontSize, fontWeight } from '../styles/theme'
import { TermsConditionsModal } from '../components/TermsConditionsModal'
import { PrivacyPolicyModal } from '../components/PrivacyPolicyModal'
import { isExpoGo } from '../services/revenueCat'
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui'
import Purchases from 'react-native-purchases'

const ONBOARDING_STORAGE_KEY = '@nomli_onboarding_completed'
const { height } = Dimensions.get('window')

interface OnboardingPricingScreenProps {
  onComplete?: () => void
}

interface Feature {
  icon: keyof typeof Ionicons.glyphMap
  iconBg: string
  key: 'map' | 'trips' | 'search' | 'friends' | 'helpRequest'
}

export const OnboardingPricingScreen: React.FC<OnboardingPricingScreenProps> = ({ onComplete }) => {
  const { t } = useTranslation('onboarding')
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const features: Feature[] = [
    {
      icon: 'map',
      iconBg: '#FFEEE8',
      key: 'map',
    },
    {
      icon: 'infinite',
      iconBg: '#E8FFF3',
      key: 'trips',
    },
    {
      icon: 'search',
      iconBg: '#E8F4FF',
      key: 'search',
    },
    {
      icon: 'people',
      iconBg: '#F3E8FF',
      key: 'friends',
    },
    {
      icon: 'chatbubble-ellipses',
      iconBg: '#FFF4E8',
      key: 'helpRequest',
    },
  ]

  const handleClose = async () => {
    if (dontShowAgain) {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    }
    if (onComplete) onComplete()
  }

  const handlePurchase = async () => {
    if (isExpoGo) {
      Alert.alert(t('paywall.devTitle'), t('paywall.devMessage'))
      return
    }
    try {
      const result: PAYWALL_RESULT = await RevenueCatUI.presentPaywall()
      if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
        handleClose()
      }
    } catch (error) {
      console.error('[RevenueCat] Purchase failed:', error)
    }
  }

  const handleRestore = async () => {
    if (isExpoGo) {
      Alert.alert(t('paywall.devTitle'), t('paywall.devMessage'))
      return
    }
    try {
      await Purchases.restorePurchases()
      handleClose()
    } catch (error) {
      console.error('[RevenueCat] Restore failed:', error)
    }
  }

  return (
    <View style={styles.container}>
      {/* Hero Section avec vraie image du van EN FOND */}
      <ImageBackground
        source={require('../../assets/image-onboarding/5e85bd6f-ac97-4b60-b8f9-15ed484de247.png')}
        style={styles.heroSection}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)', 'rgba(250,249,247,1)']}
          locations={[0, 0.4, 0.95]}
          style={styles.heroGradient}
        >
          {/* Bouton fermer */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color={colors.white} />
          </TouchableOpacity>

          {/* Titre + Description AU DESSUS de l'image */}
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>{t('paywall.heroTitle')}</Text>
            <Text style={styles.heroSubtitle}>{t('paywall.heroSubtitle')}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      {/* Cards features AU DESSOUS sur fond beige */}
      <ScrollView style={styles.contentSection} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: feature.iconBg }]}>
                <Ionicons name={feature.icon} size={28} color="#E07856" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t(`paywall.features.${feature.key}.title`)}</Text>
                <Text style={styles.featureDescription}>{t(`paywall.features.${feature.key}.description`)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Toggle "Ne plus afficher" */}
        <View style={styles.toggleContainer}>
          <Switch
            value={dontShowAgain}
            onValueChange={setDontShowAgain}
            trackColor={{ false: '#E5E7EB', true: '#E07856' }}
            thumbColor={colors.white}
          />
          <Text style={styles.toggleText}>{t('paywall.dontShowAgain')}</Text>
        </View>

        {/* Bouton Premium + texte annulable */}
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.premiumButton} onPress={handlePurchase}>
            <Text style={styles.premiumButtonText}>
              {t('paywall.premiumButton')}     {t('paywall.price')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.cancelText}>{t('paywall.cancelText')}</Text>

          {/* Liens legaux */}
          <View style={styles.legalLinksContainer}>
            <TouchableOpacity onPress={() => setShowTermsModal(true)}>
              <Text style={styles.legalLinkText}>{t('paywall.terms')}</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}>•</Text>
            <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
              <Text style={styles.legalLinkText}>{t('paywall.privacy')}</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}>•</Text>
            <TouchableOpacity onPress={handleRestore}>
              <Text style={styles.legalLinkText}>{t('paywall.restore')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <TermsConditionsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      <PrivacyPolicyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F7',
  },
  heroSection: {
    height: height * 0.35,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: spacing.xl,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextContainer: {
    paddingHorizontal: spacing.xl * 1.5,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: fontSize.lg,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
  },
  contentSection: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xl * 2,
  },
  featuresContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.lg + 2,
    borderRadius: 20,
    gap: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: fontSize.lg + 1,
    fontWeight: fontWeight.bold,
    color: '#1F2937',
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: fontSize.sm + 1,
    color: '#6B7280',
    lineHeight: 21,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  toggleText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: '#6B7280',
    fontWeight: fontWeight.medium,
    lineHeight: 20,
  },
  footerContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  premiumButton: {
    backgroundColor: '#E07856',
    paddingVertical: spacing.lg + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#E07856',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumButtonText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  cancelText: {
    fontSize: fontSize.sm,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  legalLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  legalLinkText: {
    fontSize: fontSize.sm,
    color: '#E07856',
    fontWeight: fontWeight.semibold,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontSize: fontSize.sm,
    color: '#E07856',
    fontWeight: fontWeight.semibold,
  },
})
