import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import frCommon from './locales/fr/common.json'
import frLogin from './locales/fr/login.json'
import frRegister from './locales/fr/register.json'
import frHome from './locales/fr/home.json'
import frSkills from './locales/fr/skills.json'
import frProfile from './locales/fr/profile.json'
import frTrips from './locales/fr/trips.json'
import frVerification from './locales/fr/verification.json'
import frInvitation from './locales/fr/invitation.json'
import frChat from './locales/fr/chat.json'
import frSearch from './locales/fr/search.json'
import frActivities from './locales/fr/activities.json'
import frHelp from './locales/fr/help.json'
import frOnboarding from './locales/fr/onboarding.json'
import frLegal from './locales/fr/legal.json'
import frSettings from './locales/fr/settings.json'
import frTerms from './locales/fr/terms.json'
import frPrivacy from './locales/fr/privacy.json'
import frNotifications from './locales/fr/notifications.json'

import enCommon from './locales/en/common.json'
import enLogin from './locales/en/login.json'
import enRegister from './locales/en/register.json'
import enHome from './locales/en/home.json'
import enSkills from './locales/en/skills.json'
import enProfile from './locales/en/profile.json'
import enTrips from './locales/en/trips.json'
import enVerification from './locales/en/verification.json'
import enInvitation from './locales/en/invitation.json'
import enChat from './locales/en/chat.json'
import enSearch from './locales/en/search.json'
import enActivities from './locales/en/activities.json'
import enHelp from './locales/en/help.json'
import enOnboarding from './locales/en/onboarding.json'
import enLegal from './locales/en/legal.json'
import enSettings from './locales/en/settings.json'
import enTerms from './locales/en/terms.json'
import enPrivacy from './locales/en/privacy.json'
import enNotifications from './locales/en/notifications.json'

export const defaultNS = 'common'

export const resources = {
  fr: {
    common: frCommon,
    login: frLogin,
    register: frRegister,
    home: frHome,
    skills: frSkills,
    profile: frProfile,
    trips: frTrips,
    verification: frVerification,
    invitation: frInvitation,
    chat: frChat,
    search: frSearch,
    activities: frActivities,
    help: frHelp,
    onboarding: frOnboarding,
    legal: frLegal,
    settings: frSettings,
    terms: frTerms,
    privacy: frPrivacy,
    notifications: frNotifications,
  },
  en: {
    common: enCommon,
    login: enLogin,
    register: enRegister,
    home: enHome,
    skills: enSkills,
    profile: enProfile,
    trips: enTrips,
    verification: enVerification,
    invitation: enInvitation,
    chat: enChat,
    search: enSearch,
    activities: enActivities,
    help: enHelp,
    onboarding: enOnboarding,
    legal: enLegal,
    settings: enSettings,
    terms: enTerms,
    privacy: enPrivacy,
    notifications: enNotifications,
  },
} as const

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'fr'
const supportedLanguages = ['fr', 'en']
const initialLanguage = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'fr'

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources,
  lng: initialLanguage,
  fallbackLng: 'fr',
  defaultNS,
  ns: [
    'common',
    'login',
    'register',
    'home',
    'skills',
    'profile',
    'trips',
    'verification',
    'invitation',
    'chat',
    'search',
    'activities',
    'help',
    'onboarding',
    'legal',
    'settings',
    'terms',
    'privacy',
    'notifications',
  ],
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
