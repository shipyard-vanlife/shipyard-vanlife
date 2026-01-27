import * as Clipboard from 'expo-clipboard'
import { CheckCircle, Copy, Share2, X } from 'lucide-react-native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Platform, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { borderRadius, colors, fontSize, fontWeight, shadows, spacing } from '../../styles/theme'

//TODO: check types across all the app
//TODO: check user object in DB after inscription flow, maybe some fields are missing or NULL

interface InvitationCodeModalProps {
  visible: boolean
  code: string | null
  onClose: () => void
}

export const InvitationCodeModal: React.FC<InvitationCodeModalProps> = ({
  visible,
  code,
  onClose,
}) => {
  const { t } = useTranslation(['invitation', 'common'])
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!code) return

    await Clipboard.setStringAsync(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (!code) return

    try {
      await Share.share({
        message: t('invitation:generate.shareMessage', { code }),
      })
    } catch {
      // User cancelled or error
    }
  }

  const handleClose = () => {
    setCopied(false)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel={t('common:close')}
          >
            <X size={24} color={colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>{t('invitation:generate.title')}</Text>
            <Text style={styles.subtitle}>{t('invitation:generate.subtitle')}</Text>

            <View style={styles.codeContainer}>
              <Text style={styles.code}>{code}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.copyButton]}
                onPress={handleCopy}
                accessibilityRole="button"
                accessibilityLabel={t('invitation:generate.copy')}
              >
                {copied ? (
                  <>
                    <CheckCircle size={20} color={colors.success} />
                    <Text style={[styles.actionButtonText, styles.copiedText]}>
                      {t('invitation:generate.copied')}
                    </Text>
                  </>
                ) : (
                  <>
                    <Copy size={20} color={colors.text.primary} />
                    <Text style={styles.actionButtonText}>{t('invitation:generate.copy')}</Text>
                  </>
                )}
              </TouchableOpacity>

              {Platform.OS !== 'web' ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.shareButton]}
                  onPress={handleShare}
                  accessibilityRole="button"
                  accessibilityLabel={t('invitation:generate.share')}
                >
                  <Share2 size={20} color={colors.white} />
                  <Text style={[styles.actionButtonText, styles.shareButtonText]}>
                    {t('invitation:generate.share')}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <Text style={styles.hint}>{t('invitation:generate.hint')}</Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    ...shadows.large,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.xxxl,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  codeContainer: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xl,
    ...shadows.small,
  },
  code: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.secondary.main,
    letterSpacing: 3,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  copyButton: {
    backgroundColor: colors.primary.light,
    borderWidth: 1,
    borderColor: colors.text.muted,
  },
  shareButton: {
    backgroundColor: colors.secondary.main,
  },
  actionButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  shareButtonText: {
    color: colors.white,
  },
  copiedText: {
    color: colors.success,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    textAlign: 'center',
  },
})

export default InvitationCodeModal
