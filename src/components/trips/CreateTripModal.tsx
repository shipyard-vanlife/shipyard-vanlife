import React, { useState, useCallback, useEffect } from 'react'
import {
  Modal,
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme'
import { useLocation } from '../../hooks/useLocation'
import { useCreateTrip } from '../../hooks/useTrips'
import { createTripSchema, getFieldErrors } from '../../utils/validation'

interface CreateTripModalProps {
  visible: boolean
  onClose: () => void
  onSuccess?: () => void
}

type FieldErrors = {
  name?: string
}

export function CreateTripModal({ visible, onClose, onSuccess }: CreateTripModalProps) {
  const { t } = useTranslation(['trips', 'common'])
  const { requestLocation, isLoading: locationLoading } = useLocation()
  const { mutate: createTrip, isPending: isCreating } = useCreateTrip()

  // Form state
  const [tripName, setTripName] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [locationCity, setLocationCity] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setTripName('')
      setFieldErrors({})
      setLocationCity(null)
      // Get location when modal opens
      getLocation()
    }
  }, [visible])

  const getLocation = async () => {
    setIsGettingLocation(true)
    try {
      const location = await requestLocation()
      if (location?.city) {
        setLocationCity(location.city)
      }
    } finally {
      setIsGettingLocation(false)
    }
  }

  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleCreate = useCallback(async () => {
    setFieldErrors({})

    // Get fresh location
    const location = await requestLocation()
    if (!location) {
      Alert.alert(t('errors.locationRequired'))
      return
    }

    // Validate form
    const result = createTripSchema.safeParse({
      name: tripName.trim(),
      latitude: location.latitude,
      longitude: location.longitude,
      city: location.city,
    })

    if (!result.success) {
      const errors = getFieldErrors<FieldErrors>(result.error)
      // Translate error messages
      const translatedErrors: FieldErrors = {}
      if (errors.name) {
        translatedErrors.name = t(errors.name)
      }
      setFieldErrors(translatedErrors)
      return
    }

    createTrip(result.data, {
      onSuccess: () => {
        onSuccess?.()
        onClose()
      },
      onError: (error) => {
        const message = error.message.includes('active trip')
          ? t('errors.activeTripExists')
          : t('errors.createFailed')
        Alert.alert(message)
      },
    })
  }, [tripName, requestLocation, createTrip, onSuccess, onClose, t])

  const isProcessing = isCreating || locationLoading || isGettingLocation

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} disabled={isProcessing}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('createModal.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Trip Name Input */}
            <View style={styles.field}>
              <Text style={styles.label}>{t('createModal.nameLabel')}</Text>
              <TextInput
                style={[styles.input, fieldErrors.name && styles.inputError]}
                value={tripName}
                onChangeText={(text) => {
                  setTripName(text)
                  clearFieldError('name')
                }}
                placeholder={t('createModal.namePlaceholder')}
                placeholderTextColor={colors.text.muted}
                editable={!isProcessing}
                maxLength={50}
                autoCapitalize="sentences"
                autoFocus
              />
              {fieldErrors.name ? <Text style={styles.errorText}>{fieldErrors.name}</Text> : null}
            </View>

            {/* Location Info */}
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={16} color={colors.text.tertiary} />
              <Text style={styles.locationText}>
                {t('createModal.locationNote')}
                {locationCity ? ` (${locationCity})` : ''}
              </Text>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.createButton, isProcessing && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={isProcessing}
              activeOpacity={0.7}
            >
              {isProcessing ? (
                <>
                  <ActivityIndicator color={colors.white} size="small" />
                  <Text style={styles.createButtonText}>{t('createModal.creating')}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color={colors.white} />
                  <Text style={styles.createButtonText}>{t('createModal.createButton')}</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 32,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  field: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.primary.light,
    borderWidth: 1,
    borderColor: colors.border.main,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary.dark,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  locationText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.main,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
})
