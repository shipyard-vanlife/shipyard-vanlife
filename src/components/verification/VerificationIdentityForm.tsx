import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme'
import { VERIFICATION_MIN_AGE, VERIFICATION_MAX_AGE } from '../../types/verification'
import { formatDate } from '../../utils/formatDate'

interface VerificationIdentityFormProps {
  firstname: string
  lastname: string
  dateOfBirth: Date | null
  onFirstnameChange: (value: string) => void
  onLastnameChange: (value: string) => void
  onDateOfBirthChange: (value: Date) => void
  errors: {
    firstname?: string
    lastname?: string
    dateOfBirth?: string
  }
  disabled?: boolean
}

export const VerificationIdentityForm: React.FC<VerificationIdentityFormProps> = ({
  firstname,
  lastname,
  dateOfBirth,
  onFirstnameChange,
  onLastnameChange,
  onDateOfBirthChange,
  errors,
  disabled = false,
}) => {
  const { t } = useTranslation('verification')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const lastnameRef = useRef<TextInput>(null)

  // Calculate max date (must be at least 21 years old)
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - VERIFICATION_MIN_AGE)

  // Calculate min date (can't be more than 100 years old)
  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - VERIFICATION_MAX_AGE)

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }
    if (selectedDate) {
      onDateOfBirthChange(selectedDate)
    }
  }

  const openDatePicker = () => {
    // Dismiss keyboard before showing date picker to avoid layout conflicts
    Keyboard.dismiss()
    setShowDatePicker(true)
  }

  const closeDatePicker = () => {
    setShowDatePicker(false)
  }

  return (
    <View style={styles.container}>
      {/* Firstname */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('form.firstname')}</Text>
        <TextInput
          style={[styles.input, errors.firstname && styles.inputError]}
          placeholder={t('form.firstnamePlaceholder')}
          placeholderTextColor={colors.text.muted}
          value={firstname}
          onChangeText={onFirstnameChange}
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={50}
          editable={!disabled}
          returnKeyType="next"
          onSubmitEditing={() => lastnameRef.current?.focus()}
          blurOnSubmit={false}
          accessibilityLabel={t('form.firstname')}
          accessibilityHint={t('form.firstnamePlaceholder')}
        />
        {errors.firstname ? <Text style={styles.error}>{t(errors.firstname)}</Text> : null}
      </View>

      {/* Lastname */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('form.lastname')}</Text>
        <TextInput
          ref={lastnameRef}
          style={[styles.input, errors.lastname && styles.inputError]}
          placeholder={t('form.lastnamePlaceholder')}
          placeholderTextColor={colors.text.muted}
          value={lastname}
          onChangeText={onLastnameChange}
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={50}
          editable={!disabled}
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
          accessibilityLabel={t('form.lastname')}
          accessibilityHint={t('form.lastnamePlaceholder')}
        />
        {errors.lastname ? <Text style={styles.error}>{t(errors.lastname)}</Text> : null}
      </View>

      {/* Date of Birth */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('form.dateOfBirth')}</Text>
        <TouchableOpacity
          style={[styles.dateButton, errors.dateOfBirth && styles.inputError]}
          onPress={openDatePicker}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t('form.dateOfBirth')}
          accessibilityHint={t('form.dateOfBirthPlaceholder')}
          accessibilityValue={{ text: dateOfBirth ? formatDate(dateOfBirth) : t('form.dateOfBirthPlaceholder') }}
        >
          <Text style={[styles.dateText, !dateOfBirth && styles.datePlaceholder]}>
            {dateOfBirth ? formatDate(dateOfBirth) : t('form.dateOfBirthPlaceholder')}
          </Text>
        </TouchableOpacity>
        {errors.dateOfBirth ? <Text style={styles.error}>{t(errors.dateOfBirth)}</Text> : null}
      </View>

      {/* iOS Date Picker with dismissable backdrop */}
      {showDatePicker && Platform.OS === 'ios' ? (
        <View style={styles.datePickerOverlay}>
          {/* Tappable backdrop to dismiss */}
          <Pressable style={styles.datePickerBackdrop} onPress={closeDatePicker} />

          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={closeDatePicker} style={styles.datePickerCancel}>
                <Text style={styles.datePickerCancelText}>{t('common:buttons.cancel')}</Text>
              </TouchableOpacity>
              <Text style={styles.datePickerTitle}>{t('form.dateOfBirth')}</Text>
              <TouchableOpacity onPress={closeDatePicker} style={styles.datePickerDone}>
                <Text style={styles.datePickerDoneText}>{t('common:buttons.done')}</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={dateOfBirth || maxDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={maxDate}
              minimumDate={minDate}
              style={styles.datePicker}
            />
          </View>
        </View>
      ) : null}

      {/* Android Date Picker (modal by default) */}
      {showDatePicker && Platform.OS === 'android' ? (
        <DateTimePicker
          value={dateOfBirth || maxDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={maxDate}
          minimumDate={minDate}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  field: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.lg,
    color: colors.text.primary,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  dateText: {
    fontSize: fontSize.lg,
    color: colors.text.primary,
  },
  datePlaceholder: {
    color: colors.text.muted,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  // iOS Date Picker styles
  datePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'flex-end',
  },
  datePickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  datePickerContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.primary.light,
  },
  datePickerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  datePickerCancel: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  datePickerCancelText: {
    fontSize: fontSize.base,
    color: colors.text.tertiary,
  },
  datePickerDone: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  datePickerDoneText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.secondary.main,
  },
  datePicker: {
    height: 200,
  },
})
