import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme'
import { useDeleteAccount, useDeleteProfile } from '../hooks/useProfiles'
import { useSignOut } from '../hooks'
import { LegalModal } from '../components/LegalModal'
import { OnboardingPricingScreen } from './OnboardingPricingScreen'

interface SettingsScreenProps {
  onClose: () => void
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const { t } = useTranslation(['settings', 'common'])
  const { mutateAsync: signOut } = useSignOut()
  const { mutate: deleteProfile, isPending: isDeletingProfile } = useDeleteProfile()
  const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteAccount()

  const [showLegalModal, setShowLegalModal] = useState(false)
  const [showPremiumScreen, setShowPremiumScreen] = useState(false)

  const isDeleting = isDeletingProfile || isDeletingAccount

  const handleDeleteProfile = useCallback(() => {
    Alert.alert(
      t('common:profile.deleteTitle'),
      t('common:profile.deleteConfirmation'),
      [
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
      ]
    )
  }, [deleteProfile, t])

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      t('common:profile.deleteAccountTitle'),
      t('common:profile.deleteAccountConfirmation'),
      [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        {
          text: t('common:buttons.delete'),
          style: 'destructive',
          onPress: () => {
            deleteAccount(undefined, {
              onSuccess: async () => {
                await signOut()
              },
              onError: (error: Error) => {
                Alert.alert(t('common:errors.generic'), error.message)
              },
            })
          },
        },
      ]
    )
  }, [deleteAccount, signOut, t])

  const handlePremiumPress = () => {
    setShowPremiumScreen(true)
  }

  const handleClosePremium = () => {
    setShowPremiumScreen(false)
  }

  if (showPremiumScreen) {
    return <OnboardingPricingScreen onComplete={handleClosePremium} />
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('sections.premium.title')}</Text>
          <TouchableOpacity
            style={styles.premiumCard}
            onPress={handlePremiumPress}
          >
            <View style={styles.premiumIconContainer}>
              <Ionicons name="star" size={28} color="#E07856" />
            </View>
            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>{t('sections.premium.button')}</Text>
              <Text style={styles.premiumDescription}>{t('sections.premium.description')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('sections.legal.title')}</Text>
          <TouchableOpacity
            style={styles.legalCard}
            onPress={() => setShowLegalModal(true)}
          >
            <View style={styles.legalIconContainer}>
              <Ionicons name="document-text" size={24} color={colors.text.secondary} />
            </View>
            <View style={styles.legalContent}>
              <Text style={styles.legalTitle}>{t('sections.legal.view')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('sections.account.title')}</Text>

          <TouchableOpacity
            style={[styles.deleteProfileButton, isDeleting && styles.buttonDisabled]}
            onPress={handleDeleteProfile}
            disabled={isDeleting}
          >
            {isDeletingProfile ? (
              <ActivityIndicator color={colors.text.tertiary} size="small" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color={colors.text.tertiary} />
                <Text style={styles.deleteProfileButtonText}>
                  {t('sections.account.deleteProfile')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteAccountButton, isDeleting && styles.buttonDisabled]}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeletingAccount ? (
              <ActivityIndicator color={colors.error} size="small" />
            ) : (
              <>
                <Ionicons name="warning-outline" size={20} color={colors.error} />
                <Text style={styles.deleteAccountButtonText}>
                  {t('sections.account.deleteAccount')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Legal Modal */}
      <LegalModal
        visible={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        showAcceptButton={false}
      />
    </SafeAreaView>
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E8',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
  },
  premiumIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  premiumDescription: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  legalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalContent: {
    flex: 1,
  },
  legalTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  deleteProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.text.tertiary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  deleteProfileButtonText: {
    color: colors.text.tertiary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  deleteAccountButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})
