import React from 'react'
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../styles/theme'

interface ProfileEditTextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  error?: string
  multiline?: boolean
  maxLength?: number
  disabled?: boolean
  charCount?: number
  charMax?: number
}

export const ProfileEditTextField: React.FC<ProfileEditTextFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline = false,
  maxLength,
  disabled = false,
  charCount,
  charMax,
  ...rest
}) => {
  const showCharCount = charCount !== undefined && charMax !== undefined

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {showCharCount ? (
          <Text style={[styles.charCount, charCount > charMax && styles.charCountError]}>
            {charCount}/{charMax}
          </Text>
        ) : null}
      </View>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        multiline={multiline}
        maxLength={maxLength}
        editable={!disabled}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  charCount: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
  },
  charCountError: {
    color: colors.error,
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
  inputMultiline: {
    minHeight: 120,
    paddingTop: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: colors.primary.dark,
    opacity: 0.7,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
})
