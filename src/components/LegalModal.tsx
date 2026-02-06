import React from 'react'
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme'

interface LegalModalProps {
  visible: boolean
  onClose: () => void
  onAccept?: () => void
  showAcceptButton?: boolean
}

export const LegalModal: React.FC<LegalModalProps> = ({
  visible,
  onClose,
  onAccept,
  showAcceptButton = false,
}) => {
  const { t } = useTranslation('legal')

  const handleAccept = () => {
    if (onAccept) {
      onAccept()
    }
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('title')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.lastUpdated}>{t('lastUpdated', { date: new Date().toLocaleDateString() })}</Text>

            {/* Section 1: Editor */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('sections.editor.title')}</Text>
              <Text style={styles.sectionContent}>{t('sections.editor.content')}</Text>
            </View>

            {/* Section 2: Purpose */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('sections.purpose.title')}</Text>
              <Text style={styles.sectionContent}>{t('sections.purpose.content')}</Text>
            </View>

            {/* Section 3: Personal Data */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('sections.data.title')}</Text>
              <Text style={styles.sectionContent}>{t('sections.data.content')}</Text>
            </View>

            {/* Section 4: Liability */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('sections.liability.title')}</Text>
              <Text style={styles.sectionContent}>{t('sections.liability.content')}</Text>
            </View>

            {/* Section 5: Third Party (Apple/Google) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('sections.thirdParty.title')}</Text>
              <Text style={styles.sectionContent}>{t('sections.thirdParty.content')}</Text>
            </View>

            {/* Section 6: Intellectual Property */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('sections.intellectualProperty.title')}</Text>
              <Text style={styles.sectionContent}>{t('sections.intellectualProperty.content')}</Text>
            </View>

            {/* Section 7: Modifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('sections.modifications.title')}</Text>
              <Text style={styles.sectionContent}>{t('sections.modifications.content')}</Text>
            </View>

            {/* Section 8: Applicable Law */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('sections.law.title')}</Text>
              <Text style={styles.sectionContent}>{t('sections.law.content')}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer with Accept button */}
        {showAcceptButton && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Text style={styles.acceptButtonText}>{t('accept')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  lastUpdated: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xl,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionContent: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  acceptButton: {
    backgroundColor: colors.secondary.main,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
})
