import React, { useState } from 'react'
import {
  Modal,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme'
import { useReportUser } from '../../hooks/useModeration'
import { ReportReason } from '../../types/moderation'

interface ReportModalProps {
  visible: boolean
  onClose: () => void
  userId: string
  username: string
}

const REPORT_REASONS: ReportReason[] = ['inappropriate', 'fake', 'harassment', 'spam', 'other']

export function ReportModal({ visible, onClose, userId, username }: ReportModalProps) {
  const { t } = useTranslation('common')
  const { mutate: reportUser, isPending } = useReportUser()
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')

  const handleClose = () => {
    setSelectedReason(null)
    setDetails('')
    onClose()
  }

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert(t('moderation.error'), t('moderation.selectReason'))
      return
    }

    reportUser(
      {
        userId,
        reason: selectedReason,
        details: details.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert(t('moderation.reportSuccess'), t('moderation.reportSuccessMessage'))
          handleClose()
        },
        onError: () => {
          Alert.alert(t('moderation.error'), t('moderation.reportError'))
        },
      }
    )
  }

  const getReasonLabel = (reason: ReportReason): string => {
    return t(`moderation.reportReasons.${reason}`)
  }

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('moderation.reportProfile')}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>
                {t('moderation.reportQuestion', { username })}
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>{t('moderation.selectReasonTitle')}</Text>

            <View style={styles.reasonsContainer}>
              {REPORT_REASONS.map(reason => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonChip,
                    selectedReason === reason && styles.reasonChipSelected,
                  ]}
                  onPress={() => setSelectedReason(selectedReason === reason ? null : reason)}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      selectedReason === reason && styles.reasonTextSelected,
                    ]}
                  >
                    {getReasonLabel(reason)}
                  </Text>
                  {selectedReason === reason && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={colors.white}
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>{t('moderation.detailsTitle')}</Text>

            <TextInput
              style={styles.detailsInput}
              placeholder={t('moderation.detailsPlaceholder')}
              placeholderTextColor={colors.text.tertiary}
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.disclaimer}>{t('moderation.reportDisclaimer')}</Text>
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedReason || isPending) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!selectedReason || isPending}
          >
            {isPending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>{t('moderation.submitReport')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  questionContainer: {
    backgroundColor: colors.primary.main,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    marginTop: spacing.md,
    borderRadius: borderRadius.sm,
  },
  questionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.white,
  },
  reasonChipSelected: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  reasonText: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
  },
  reasonTextSelected: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  checkIcon: {
    marginLeft: spacing.xs,
  },
  detailsInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
    minHeight: 100,
    marginBottom: spacing.md,
  },
  disclaimer: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  submitButton: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: colors.text.tertiary,
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
})
