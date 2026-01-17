import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useCreateProfile } from '../hooks/useProfiles'
import { ALL_SKILLS, SKILL_COLORS, SkillType } from '../types/user'
import { createProfileSchema, getFieldErrors, parseSupabaseError } from '../utils/validation'

type ProfileFields = { username?: string; van_name?: string }

// TODO: ajouter l'histoire de la localissation GPS, avec long, lat, ...

export const ProfileSetupScreen: React.FC = () => {
  const { t } = useTranslation(['common', 'skills'])
  const { mutate: createProfile, isPending } = useCreateProfile()

  const [username, setUsername] = useState('')
  const [vanName, setVanName] = useState('')
  const [mainSpecialty, setMainSpecialty] = useState<SkillType | null>(null)
  const [fieldErrors, setFieldErrors] = useState<ProfileFields>({})
  const [globalError, setGlobalError] = useState<string | null>(null)

  const clearFieldError = (field: keyof ProfileFields) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const isFormValid = createProfileSchema.safeParse({
    username: username.trim(),
    van_name: vanName.trim(),
    main_specialty: mainSpecialty,
    skills: mainSpecialty ? [mainSpecialty] : [],
  }).success

  const handleSubmit = () => {
    setFieldErrors({})
    setGlobalError(null)

    const result = createProfileSchema.safeParse({
      username: username.trim(),
      van_name: vanName.trim(),
      main_specialty: mainSpecialty,
      skills: mainSpecialty ? [mainSpecialty] : [],
    })

    if (!result.success) {
      setFieldErrors(getFieldErrors<ProfileFields>(result.error))
      return
    }

    createProfile(
      {
        username: result.data.username,
        van_name: result.data.van_name,
        main_specialty: result.data.main_specialty ?? null,
        skills: result.data.skills,
      },
      {
        onError: (err: Error) => setGlobalError(parseSupabaseError(err)),
      }
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>{t('profile.setupTitle')}</Text>
          <Text style={styles.subtitle}>{t('profile.setupSubtitle')}</Text>

          {globalError ? <Text style={styles.errorBanner}>{t(globalError)}</Text> : null}

          <Text style={styles.label}>{t('profile.usernameLabel')}</Text>
          <TextInput
            style={[styles.input, fieldErrors.username && styles.inputError]}
            placeholder={t('profile.usernamePlaceholder')}
            value={username}
            onChangeText={text => {
              setUsername(text)
              clearFieldError('username')
            }}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={30}
            editable={!isPending}
          />
          {fieldErrors.username ? (
            <Text style={styles.fieldError}>{t(fieldErrors.username)}</Text>
          ) : null}

          <Text style={styles.label}>{t('profile.vanNameLabel')}</Text>
          <TextInput
            style={[styles.input, fieldErrors.van_name && styles.inputError]}
            placeholder={t('profile.vanNamePlaceholder')}
            value={vanName}
            onChangeText={text => {
              setVanName(text)
              clearFieldError('van_name')
            }}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={50}
            editable={!isPending}
          />
          {fieldErrors.van_name ? (
            <Text style={styles.fieldError}>{t(fieldErrors.van_name)}</Text>
          ) : null}

          <Text style={styles.label}>{t('profile.mainSpecialtyLabel')}</Text>
          <View style={styles.skillsGrid}>
            {ALL_SKILLS.map(skill => {
              const isSelected = mainSpecialty === skill
              return (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.skillButton,
                    { backgroundColor: isSelected ? SKILL_COLORS[skill] : '#f0f0f0' },
                  ]}
                  onPress={() => setMainSpecialty(isSelected ? null : skill)}
                  disabled={isPending}
                >
                  <Text style={[styles.skillButtonText, { color: isSelected ? '#fff' : '#333' }]}>
                    {t(`skills:${skill}`)}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <TouchableOpacity
            style={[styles.button, (!isFormValid || isPending) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid || isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('buttons.createProfile')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#DC2626',
    borderWidth: 2,
  },
  fieldError: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 4,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  skillButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#E07A5F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
