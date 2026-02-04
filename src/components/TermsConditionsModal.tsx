import React from 'react'
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme'

interface TermsConditionsModalProps {
  visible: boolean
  onClose: () => void
}

export const TermsConditionsModal: React.FC<TermsConditionsModalProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation('terms')

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

            {/* Sections */}
            {Object.keys(t('sections', { returnObjects: true })).map((key) => (
              <View key={key} style={styles.section}>
                <Text style={styles.sectionTitle}>{t(`sections.${key}.title`)}</Text>
                <Text style={styles.sectionContent}>{t(`sections.${key}.content`)}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
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
    borderBottomColor: colors.border,
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
})
