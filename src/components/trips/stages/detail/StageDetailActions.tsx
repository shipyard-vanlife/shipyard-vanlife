import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../../../styles/theme'
import { useDeleteStage } from '../../../../hooks/useTrips'

interface StageDetailActionsProps {
  stageId: string
  isFirstStage: boolean
  onDeleted: () => void
}

export function StageDetailActions({ stageId, isFirstStage, onDeleted }: StageDetailActionsProps) {
  const { t } = useTranslation('trips')
  const { mutate: deleteStage, isPending } = useDeleteStage()

  const handleDelete = () => {
    if (isFirstStage) {
      Alert.alert(t('stageDetail.cannotDeleteFirst'))
      return
    }

    Alert.alert(
      t('stageDetail.confirmDeleteTitle'),
      t('stageDetail.confirmDeleteMessage'),
      [
        { text: t('confirmations.cancel'), style: 'cancel' },
        {
          text: t('confirmations.deleteTripConfirm'),
          style: 'destructive',
          onPress: () => {
            deleteStage(stageId, {
              onSuccess: () => {
                onDeleted()
              },
              onError: () => {
                Alert.alert(t('stageDetail.deleteFailed'))
              },
            })
          },
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.deleteButton, isFirstStage && styles.deleteButtonDisabled]}
        onPress={handleDelete}
        disabled={isPending || isFirstStage}
      >
        {isPending ? (
          <ActivityIndicator size="small" color={colors.error} />
        ) : (
          <Ionicons
            name="trash-outline"
            size={20}
            color={isFirstStage ? colors.text.muted : colors.error}
          />
        )}
        <Text style={[styles.deleteButtonText, isFirstStage && styles.deleteButtonTextDisabled]}>
          {t('stageDetail.deleteStage')}
        </Text>
      </TouchableOpacity>
      {isFirstStage ? (
        <Text style={styles.disabledHint}>{t('stageDetail.cannotDeleteFirst')}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    borderWidth: 1,
    backgroundColor: colors.error + '10',
    borderColor: colors.error + '30',
  },
  deleteButtonDisabled: {
    backgroundColor: colors.border.light,
    borderColor: colors.border.main,
  },
  deleteButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.error,
  },
  deleteButtonTextDisabled: {
    color: colors.text.muted,
  },
  disabledHint: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
})
