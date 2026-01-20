import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../styles/theme'

interface PhotoSourceModalProps {
  visible: boolean
  onClose: () => void
  onTakePhoto: () => void
  onPickImage: () => void
}

export const PhotoSourceModal: React.FC<PhotoSourceModalProps> = ({
  visible,
  onClose,
  onTakePhoto,
  onPickImage,
}) => {
  const { t } = useTranslation('common')

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.content}>
          <Text style={styles.title}>{t('photo.chooseSource')}</Text>

          <TouchableOpacity style={styles.option} onPress={onTakePhoto}>
            <Text style={styles.optionText}>{t('photo.takePhoto')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={onPickImage}>
            <Text style={styles.optionText}>{t('photo.fromGallery')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>{t('buttons.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.text.primary,
  },
  option: {
    padding: spacing.lg,
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  optionText: {
    fontSize: fontSize.base,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  cancel: {
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelText: {
    fontSize: fontSize.base,
    color: colors.text.tertiary,
    fontWeight: fontWeight.medium,
  },
})
