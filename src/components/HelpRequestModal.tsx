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
  const { mutate: createRequest, isPending } = useCreateHelpRequest()
  const [selectedSkill, setSelectedSkill] = useState<SkillType | null>(null)

  const handleSend = () => {
    if (!selectedSkill) {
      Alert.alert('Erreur', 'Sélectionne une compétence')
      return
    }

    createRequest(
      { connectionId, skill: selectedSkill },
      {
        onSuccess: () => {
          Alert.alert('Demande envoyée', `${friendName} a été notifié`)
          onClose()
          setSelectedSkill(null)
        },
        onError: () => {
          Alert.alert('Erreur', 'Impossible d\'envoyer la demande')
        },
      }
    )
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Demander de l'aide</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              Pour quelle compétence as-tu besoin d'aide ?
            </Text>
          </View>

          <View style={styles.divider} />

          <FlatList
            data={friendSkills}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.skillItem,
                  selectedSkill === item && styles.skillItemSelected,
                ]}
                onPress={() => setSelectedSkill(item)}
              >
                <Text
                  style={[
                    styles.skillText,
                    selectedSkill === item && styles.skillTextSelected,
                  ]}
                >
                  {item}
                </Text>
                {selectedSkill === item && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {friendName} n'a pas encore ajouté de compétences
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
              <Text style={styles.sendButtonText}>Envoyer la demande</Text>
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
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: 40,
    maxHeight: '70%',
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
