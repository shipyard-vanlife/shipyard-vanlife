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
  const { t } = useTranslation(['help', 'common'])
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
          Alert.alert(t('help:requestSentTitle'), t('help:requestSentMessage', { name: friendName }))
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
                <View
                  style={[styles.skillBadge, selectedSkill === item && styles.skillBadgeSelected]}
                >
                  <Text
                    style={[styles.skillText, selectedSkill === item && styles.skillTextSelected]}
                  >
                    {item}
                  </Text>
                </View>
                {selectedSkill === item && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {t('help:noSkills', { name: friendName })}
              </Text>
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
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: 40,
    maxHeight: '80%',
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
  questionContainer: {
    backgroundColor: colors.primary.main,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary.main,
  },
  questionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  divider: {
    height: 2,
    backgroundColor: colors.border.light,
    marginBottom: spacing.sm,
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  skillItemSelected: {
    backgroundColor: colors.secondary.main,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary.main,
  },
  skillBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.secondary.main,
    backgroundColor: colors.white,
  },
  skillBadgeSelected: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.white,
  },
  skillText: {
    fontSize: fontSize.base,
    color: colors.text.primary,
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
  },
  sendButton: {
    backgroundColor: colors.secondary.main,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sendButtonDisabled: {
    backgroundColor: colors.text.tertiary,
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
})
