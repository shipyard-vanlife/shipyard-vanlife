import React, { useState } from 'react'
import {
  Modal,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme'
import { useCreateHelpRequest } from '../hooks/useHelpRequests'
import { SkillType } from '../types/user'

interface HelpRequestModalProps {
  visible: boolean
  onClose: () => void
  connectionId: string
  friendName: string
  friendSkills: SkillType[]
}

export const HelpRequestModal: React.FC<HelpRequestModalProps> = ({
  visible,
  onClose,
  connectionId,
  friendName,
  friendSkills,
}) => {
  const { t } = useTranslation(['help', 'common', 'skills'])
  const { mutate: createRequest, isPending } = useCreateHelpRequest()
  const [selectedSkill, setSelectedSkill] = useState<SkillType | null>(null)

  const handleSend = () => {
    if (!selectedSkill) {
      Alert.alert(t('common:errors.error'), t('help:selectSkillError'))
      return
    }

    createRequest(
      { connectionId, skill: selectedSkill },
      {
        onSuccess: () => {
          Alert.alert(
            t('help:requestSentTitle'),
            t('help:requestSentMessage', { name: friendName })
          )
          onClose()
          setSelectedSkill(null)
        },
        onError: () => {
          Alert.alert(t('common:errors.error'), t('help:sendError'))
        },
      }
    )
  }

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('help:requestTitle')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{t('help:questionText')}</Text>
          </View>

          <View style={styles.divider} />

          <FlatList
            data={friendSkills}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.skillItem, selectedSkill === item && styles.skillItemSelected]}
                onPress={() => setSelectedSkill(selectedSkill === item ? null : item)}
              >
                <Text
                  style={[styles.skillText, selectedSkill === item && styles.skillTextSelected]}
                >
                  {t(`skills:${item}`)}
                </Text>
                {selectedSkill === item && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.white} />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>{t('help:noSkills', { name: friendName })}</Text>
            }
          />

          <TouchableOpacity
            style={[styles.sendButton, (!selectedSkill || isPending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!selectedSkill || isPending}
          >
            {isPending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.sendButtonText}>{t('help:sendButton')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary.main,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.sm,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.full,
  },
  questionContainer: {
    backgroundColor: colors.secondary.main + '10',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 5,
    borderLeftColor: colors.secondary.main,
  },
  questionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  skillItemSelected: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.secondary.main,
    shadowColor: colors.secondary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  skillText: {
    fontSize: fontSize.lg,
    color: colors.text.primary,
    fontWeight: fontWeight.bold,
    flex: 1,
  },
  skillTextSelected: {
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
    padding: spacing.xl,
    fontStyle: 'italic',
  },
  sendButton: {
    backgroundColor: colors.secondary.main,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    shadowColor: colors.secondary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: colors.text.tertiary,
    opacity: 0.5,
    shadowOpacity: 0,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
})
