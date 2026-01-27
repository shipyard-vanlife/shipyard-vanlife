import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme'

interface VerificationStepIndicatorProps {
  currentStep: number
  totalSteps: number
  stepNames: string[]
}

export const VerificationStepIndicator: React.FC<VerificationStepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepNames,
}) => {
  const { t } = useTranslation('verification')
  const progressPercent = (currentStep / totalSteps) * 100

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 1,
        max: totalSteps,
        now: currentStep,
        text: t('stepIndicator', { current: currentStep, total: totalSteps }),
      }}
    >
      <Text style={styles.stepText}>
        {t('stepIndicator', { current: currentStep, total: totalSteps })}
      </Text>

      <View style={styles.stepsContainer}>
        {stepNames.map((name, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = stepNumber < currentStep

          return (
            <View
              key={name}
              style={styles.stepItem}
              accessible
              accessibilityLabel={
                isCompleted
                  ? t('accessibility.stepCompleted', { name })
                  : isActive
                    ? t('accessibility.stepCurrent', { name })
                    : t('accessibility.stepPending', { name })
              }
            >
              <View
                style={[
                  styles.stepDot,
                  isActive && styles.stepDotActive,
                  isCompleted && styles.stepDotCompleted,
                ]}
              >
                {isCompleted ? (
                  <Text style={styles.checkmark} accessibilityLabel={t('accessibility.completed')}>
                    ✓
                  </Text>
                ) : (
                  <Text
                    style={[styles.stepNumber, isActive && styles.stepNumberActive]}
                    accessibilityLabel={`${stepNumber}`}
                  >
                    {stepNumber}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepName, isActive && styles.stepNameActive]} numberOfLines={1}>
                {name}
              </Text>
            </View>
          )
        })}
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  stepText: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stepDotActive: {
    backgroundColor: colors.secondary.main,
  },
  stepDotCompleted: {
    backgroundColor: colors.success,
  },
  stepNumber: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.tertiary,
  },
  stepNumberActive: {
    color: colors.white,
  },
  checkmark: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  stepName: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    textAlign: 'center',
    maxWidth: 80,
  },
  stepNameActive: {
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border.main,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.sm,
  },
})
