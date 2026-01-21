import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../../../styles/theme'
import { useUpdateStageNote } from '../../../../hooks/useTrips'

interface StageDetailNoteProps {
  stageId: string
  initialNote: string | null
}

export function StageDetailNote({ stageId, initialNote }: StageDetailNoteProps) {
  const { t } = useTranslation('trips')
  const [note, setNote] = useState(initialNote ?? '')
  const [hasChanges, setHasChanges] = useState(false)
  const { mutate: updateNote, isPending } = useUpdateStageNote()

  useEffect(() => {
    setNote(initialNote ?? '')
    setHasChanges(false)
  }, [initialNote])

  const handleChangeText = (text: string) => {
    setNote(text)
    setHasChanges(text !== (initialNote ?? ''))
  }

  const handleSave = () => {
    updateNote(
      { stageId, note },
      {
        onSuccess: () => {
          setHasChanges(false)
        },
      }
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="document-text-outline" size={18} color={colors.text.tertiary} />
          <Text style={styles.title}>{t('stageDetail.note')}</Text>
        </View>
        {hasChanges ? (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>{t('stageDetail.saveNote')}</Text>
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      <TextInput
        style={styles.input}
        placeholder={t('stageDetail.notePlaceholder')}
        placeholderTextColor={colors.text.muted}
        value={note}
        onChangeText={handleChangeText}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        editable={!isPending}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.tertiary,
  },
  saveButton: {
    backgroundColor: colors.secondary.main,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  input: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
})
