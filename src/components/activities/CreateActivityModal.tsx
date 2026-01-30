import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { colors, spacing, borderRadius, fontSize, shadows } from '../../styles/theme'
import { useCreateActivity } from '../../hooks/useActivities'
import { useMyProfile } from '../../hooks/useProfiles'
import { ActivityType, ACTIVITY_TYPE_ICONS, ACTIVITY_TYPE_COLORS } from '../../types/activity'
import { LocationSearchInput } from './LocationSearchInput'

interface CreateActivityModalProps {
  visible: boolean
  onClose: () => void
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ visible, onClose }) => {
  const { t, i18n } = useTranslation('activities')
  const { mutate: createActivity, isPending } = useCreateActivity()
  const { data: myProfile } = useMyProfile()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [activityType, setActivityType] = useState<ActivityType>('outdoor')
  const [locationName, setLocationName] = useState('')
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [startDate, setStartDate] = useState(new Date())
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [maxParticipants, setMaxParticipants] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('friends')

  const activityTypes: ActivityType[] = ['outdoor', 'food', 'skills', 'social', 'sport', 'culture', 'other']

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert(t('common:errors.generic'), t('create.titleRequired'))
      return
    }
    if (!locationName.trim() || !locationCoords) {
      Alert.alert(t('common:errors.generic'), t('create.locationRequired'))
      return
    }

    createActivity(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        activity_type: activityType,
        latitude: locationCoords.latitude,
        longitude: locationCoords.longitude,
        location_name: locationName.trim(),
        start_date: startDate.toISOString(),
        end_date: endDate?.toISOString(),
        max_participants: maxParticipants ? parseInt(maxParticipants) : undefined,
        visibility,
      },
      {
        onSuccess: () => {
          Alert.alert(t('alerts.createSuccess'))
          resetForm()
          onClose()
        },
        onError: () => {
          Alert.alert(t('alerts.error'))
        },
      }
    )
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setActivityType('outdoor')
    setLocationName('')
    setLocationCoords(null)
    setStartDate(new Date())
    setEndDate(null)
    setMaxParticipants('')
    setVisibility('friends')
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('create.title')}</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>{t('create.titleField')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('create.titlePlaceholder')}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>{t('create.description')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('create.descriptionPlaceholder')}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* Type */}
          <View style={styles.field}>
            <Text style={styles.label}>{t('create.type')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesList}>
              {activityTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    activityType === type && {
                      backgroundColor: ACTIVITY_TYPE_COLORS[type],
                      borderColor: ACTIVITY_TYPE_COLORS[type],
                    },
                  ]}
                  onPress={() => setActivityType(type)}
                >
                  <Ionicons
                    name={ACTIVITY_TYPE_ICONS[type] as any}
                    size={20}
                    color={activityType === type ? colors.white : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      activityType === type && { color: colors.white },
                    ]}
                  >
                    {t(`types.${type}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Location */}
          <View style={styles.field}>
            <Text style={styles.label}>{t('create.location')}</Text>
            <LocationSearchInput
              placeholder={t('create.locationPlaceholder')}
              initialValue={locationName}
              onLocationSelect={(location) => {
                setLocationName(location.name)
                setLocationCoords({ latitude: location.latitude, longitude: location.longitude })
              }}
            />
          </View>

          {/* Start Date */}
          <View style={styles.field}>
            <Text style={styles.label}>{t('create.startDate')}</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Ionicons name="calendar" size={20} color={colors.secondary.main} />
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowStartPicker(Platform.OS === 'ios')
                  if (date) setStartDate(date)
                }}
              />
            )}
          </View>

          {/* End Date (optional) */}
          <View style={styles.field}>
            <Text style={styles.label}>{t('create.endDate')}</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Ionicons name="calendar" size={20} color={colors.secondary.main} />
              <Text style={styles.dateText}>
                {endDate
                  ? endDate.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : t('create.endDateOptional')}
              </Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowEndPicker(Platform.OS === 'ios')
                  if (date) setEndDate(date)
                }}
              />
            )}
          </View>

          {/* Max Participants */}
          <View style={styles.field}>
            <Text style={styles.label}>{t('create.maxParticipants')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('create.maxParticipantsPlaceholder')}
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>

          {/* Visibility */}
          <View style={styles.field}>
            <Text style={styles.label}>{t('create.visibility')}</Text>
            <View style={styles.visibilityButtons}>
              {(['public', 'friends', 'private'] as const).map(vis => (
                <TouchableOpacity
                  key={vis}
                  style={[
                    styles.visibilityButton,
                    visibility === vis && styles.visibilityButtonActive,
                  ]}
                  onPress={() => setVisibility(vis)}
                >
                  <Text
                    style={[
                      styles.visibilityText,
                      visibility === vis && styles.visibilityTextActive,
                    ]}
                  >
                    {t(`visibility.${vis}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isPending}
          >
            <Text style={styles.submitText}>
              {isPending ? t('create.creating') : t('create.submit')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  field: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typesList: {
    flexDirection: 'row',
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.main,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  typeText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    gap: spacing.sm,
  },
  dateText: {
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  visibilityButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  visibilityButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.main,
    alignItems: 'center',
  },
  visibilityButtonActive: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.secondary.main,
  },
  visibilityText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  visibilityTextActive: {
    color: colors.white,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  submitButton: {
    backgroundColor: colors.secondary.main,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
})
