import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme'
import { useDeleteAccount } from '../hooks/useProfiles'
import { useSignOut } from '../hooks'
import { useRevenueCat } from '../hooks/useRevenueCat'
import { LegalModal } from '../components/LegalModal'
import { PremiumActiveCard } from '../components/settings/PremiumActiveCard'
import { PremiumUpgradeCard } from '../components/settings/PremiumUpgradeCard'
import { ManageSubscriptionCard } from '../components/settings/ManageSubscriptionCard'
import { DeleteAccountModal } from '../components/settings/DeleteAccountModal'

interface SettingsScreenProps {
  onClose: () => void
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const { t } = useTranslation(['settings', 'common'])
  const { mutateAsync: signOut } = useSignOut()
  const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteAccount()
  const { isPro, presentPaywall, presentCustomerCenter } = useRevenueCat()

  const [showLegalModal, setShowLegalModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      t('common:profile.deleteAccountTitle'),
      t('common:profile.deleteAccountConfirmation'),
      [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        {
          text: t('common:buttons.continue'),
          style: 'destructive',
          onPress: () => setShowDeleteModal(true),
        },
      ]
    )
  }, [t])

  const handlePremiumPress = async () => {
    await presentPaywall()
  }

  const handleManageSubscription = async () => {
    await presentCustomerCenter()
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
          {isPro ? (
            <>
              <PremiumActiveCard />
              <ManageSubscriptionCard onPress={handleManageSubscription} />
            </>
          ) : (
            <PremiumUpgradeCard onPress={handlePremiumPress} />
          )}
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
            style={[styles.deleteAccountButton, isDeletingAccount && styles.buttonDisabled]}
            onPress={handleDeleteAccount}
            disabled={isDeletingAccount}
          >
            <Ionicons name="warning-outline" size={20} color={colors.error} />
            <Text style={styles.deleteAccountButtonText}>
              {t('sections.account.deleteAccount')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Legal Modal */}
      <LegalModal
        visible={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        showAcceptButton={false}
      />

      {/* Delete Account Modal (step 2) */}
      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        isDeleting={isDeletingAccount}
        onConfirm={() => {
          deleteAccount(undefined, {
            onSuccess: async () => {
              setShowDeleteModal(false)
              await signOut()
            },
            onError: (error: Error) => {
              Alert.alert(t('common:errors.generic'), error.message)
            },
          })
        }}
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
    borderBottomColor: colors.border.light,
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
  legalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
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
