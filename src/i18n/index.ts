import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import frCommon from './locales/fr/common.json'
import frLogin from './locales/fr/login.json'
import frRegister from './locales/fr/register.json'
import frHome from './locales/fr/home.json'
import frSkills from './locales/fr/skills.json'

import enCommon from './locales/en/common.json'
import enLogin from './locales/en/login.json'
import enRegister from './locales/en/register.json'
import enHome from './locales/en/home.json'
import enSkills from './locales/en/skills.json'

export const defaultNS = 'common'

export const resources = {
  fr: {
    common: frCommon,
    login: frLogin,
    register: frRegister,
    home: frHome,
    skills: frSkills,
  },
  en: {
    common: enCommon,
    login: enLogin,
    register: enRegister,
    home: enHome,
    skills: enSkills,
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
  ns: ['common', 'login', 'register', 'home', 'skills'],
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
