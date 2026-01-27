import React, { useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, Pressable, View, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ticket, Camera } from 'lucide-react-native'
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../styles/theme'

interface AnimatedCardProps {
  onPress: () => void
  accessibilityLabel: string
  iconContainerStyle: object
  icon: React.ReactNode
  title: string
  description: string
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  onPress,
  accessibilityLabel,
  iconContainerStyle,
  icon,
  title,
  description,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start()
  }, [scaleAnim])

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start()
  }, [scaleAnim])

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.94,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
    ]).start()

    setTimeout(onPress, 150)
  }, [scaleAnim, onPress])

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        style={[
          styles.choiceCard,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={iconContainerStyle}>{icon}</View>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.choiceDescription}>{description}</Text>
      </Animated.View>
    </Pressable>
  )
}

interface VerificationChoiceScreenProps {
  onChooseInvitation: () => void
  onChooseClassic: () => void
}

export const VerificationChoiceScreen: React.FC<VerificationChoiceScreenProps> = ({
  onChooseInvitation,
  onChooseClassic,
}) => {
  const { t } = useTranslation(['invitation'])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('invitation:choice.title')}</Text>
          <Text style={styles.subtitle}>{t('invitation:choice.subtitle')}</Text>
        </View>

        <View style={styles.choices}>
          <AnimatedCard
            onPress={onChooseInvitation}
            accessibilityLabel={t('invitation:choice.withCode.title')}
            iconContainerStyle={[styles.iconContainer, styles.iconInvitation]}
            icon={<Ticket size={48} color={colors.secondary.main} />}
            title={t('invitation:choice.withCode.title')}
            description={t('invitation:choice.withCode.description')}
          />

          <AnimatedCard
            onPress={onChooseClassic}
            accessibilityLabel={t('invitation:choice.classic.title')}
            iconContainerStyle={[styles.iconContainer, styles.iconClassic]}
            icon={<Camera size={48} color={colors.tertiary.main} />}
            title={t('invitation:choice.classic.title')}
            description={t('invitation:choice.classic.description')}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.huge,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  choices: {
    gap: spacing.xl,
  },
  choiceCard: {
    alignItems: 'center',
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    ...shadows.medium,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconInvitation: {
    backgroundColor: `${colors.secondary.main}15`,
  },
  iconClassic: {
    backgroundColor: `${colors.tertiary.main}15`,
  },
  choiceTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  choiceDescription: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
})

export default VerificationChoiceScreen
