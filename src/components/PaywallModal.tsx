import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ImageBackground,
  Alert,
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight } from '../styles/theme'
import { TermsConditionsModal } from './TermsConditionsModal'
import { PrivacyPolicyModal } from './PrivacyPolicyModal'
import { isExpoGo } from '../services/revenueCat'

const { height } = Dimensions.get('window')

interface PaywallModalProps {
  visible: boolean
  onClose: () => void
  onPurchaseSuccess: () => void
  purchaseWithSDK: () => Promise<boolean>
  restoreWithSDK: () => Promise<boolean>
}

interface Feature {
  icon: keyof typeof Ionicons.glyphMap
  iconBg: string
  key: 'map' | 'trips' | 'search' | 'friends' | 'helpRequest'
}

const features: Feature[] = [
  { icon: 'map', iconBg: '#FFEEE8', key: 'map' },
  { icon: 'infinite', iconBg: '#E8FFF3', key: 'trips' },
  { icon: 'search', iconBg: '#E8F4FF', key: 'search' },
  { icon: 'people', iconBg: '#F3E8FF', key: 'friends' },
  { icon: 'chatbubble-ellipses', iconBg: '#FFF4E8', key: 'helpRequest' },
]

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  onClose,
  onPurchaseSuccess,
  purchaseWithSDK,
  restoreWithSDK,
}) => {
  const { t } = useTranslation('onboarding')
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')

  const handlePurchase = async () => {
    if (isExpoGo) {
      Alert.alert(t('paywall.devTitle'), t('paywall.devMessage'))
      return
    }
    const success = await purchaseWithSDK()
    if (success) onPurchaseSuccess()
  }

  const handleRestore = async () => {
    if (isExpoGo) {
      Alert.alert(t('paywall.devTitle'), t('paywall.devMessage'))
      return
    }
    const success = await restoreWithSDK()
    if (success) onPurchaseSuccess()
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
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
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.white} />
            </TouchableOpacity>

            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>{t('paywall.heroTitle')}</Text>
              <Text style={styles.heroSubtitle}>{t('paywall.heroSubtitle')}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>

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

          <View style={styles.footerContainer}>
            <View style={styles.planSelector}>
              <TouchableOpacity
                style={[styles.planOption, selectedPlan === 'yearly' && styles.planOptionSelected]}
                onPress={() => setSelectedPlan('yearly')}
              >
                <View style={styles.planHeader}>
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{t('paywall.yearlyBadge')}</Text>
                  </View>
                  <View style={[styles.radioButton, selectedPlan === 'yearly' && styles.radioButtonSelected]}>
                    {selectedPlan === 'yearly' && <View style={styles.radioButtonInner} />}
                  </View>
                </View>
                <Text style={styles.planTitle}>{t('paywall.yearlyTitle')}</Text>
                <Text style={styles.planPrice}>{t('paywall.priceYearly')}</Text>
                <Text style={styles.planSavings}>{t('paywall.yearlySavings')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.planOption, selectedPlan === 'monthly' && styles.planOptionSelected]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <View style={styles.planHeader}>
                  <View style={styles.planHeaderSpacer} />
                  <View style={[styles.radioButton, selectedPlan === 'monthly' && styles.radioButtonSelected]}>
                    {selectedPlan === 'monthly' && <View style={styles.radioButtonInner} />}
                  </View>
                </View>
                <Text style={styles.planTitle}>{t('paywall.monthlyTitle')}</Text>
                <Text style={styles.planPrice}>{t('paywall.priceMonthly')}</Text>
                <View style={styles.planSpacer} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.premiumButton} onPress={handlePurchase}>
              <Text style={styles.premiumButtonText}>
                {t('paywall.premiumButton')}
              </Text>
            </TouchableOpacity>

            <Text style={styles.cancelText}>{t('paywall.cancelText')}</Text>

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

        <TermsConditionsModal visible={showTermsModal} onClose={() => setShowTermsModal(false)} />
        <PrivacyPolicyModal visible={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      </View>
    </Modal>
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
  footerContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  planSelector: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  planOption: {
    backgroundColor: colors.white,
    padding: spacing.lg + 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  planOptionSelected: {
    borderColor: '#E07856',
    backgroundColor: '#FFF9F7',
    shadowColor: '#E07856',
    shadowOpacity: 0.15,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planHeaderSpacer: {
    flex: 1,
  },
  planBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs - 2,
    borderRadius: 8,
  },
  planBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#E07856',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E07856',
  },
  planTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#1F2937',
    marginBottom: spacing.xs - 2,
  },
  planPrice: {
    fontSize: fontSize.xl + 4,
    fontWeight: fontWeight.bold,
    color: '#E07856',
    marginBottom: spacing.xs - 2,
  },
  planSavings: {
    fontSize: fontSize.sm,
    color: '#10B981',
    fontWeight: fontWeight.semibold,
  },
  planSpacer: {
    height: 20,
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
