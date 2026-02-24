import i18next, { type Resource } from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en'
import es from './locales/es'
import { DEFAULT_INTL_SETTINGS } from './types'

export const i18nInstance = i18next.createInstance()
const defaultNamespace = 'translation'
const defaultFallbackLanguage = 'en'
let isInitialized = false

const builtInResources: Resource = {
  en,
  es,
}

const ensureInitialized = (
  fallbackLanguage: string = defaultFallbackLanguage,
  namespace: string = defaultNamespace,
) => {
  if (isInitialized) {
    return
  }

  void i18nInstance
    .use(initReactI18next)
    .init({
      resources: builtInResources,
      lng: DEFAULT_INTL_SETTINGS.language,
      fallbackLng: fallbackLanguage,
      defaultNS: namespace,
      ns: [namespace],
      initImmediate: false,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    })

  isInitialized = true
}

const registerResources = (resources?: Resource) => {
  if (!resources) {
    return
  }

  Object.entries(resources).forEach(([language, namespaces]) => {
    Object.entries(namespaces ?? {}).forEach(([namespace, values]) => {
      i18nInstance.addResourceBundle(language, namespace, values, true, true)
    })
  })
}

type InitI18nOptions = {
  resources?: Resource
  fallbackLanguage?: string
  namespace?: string
}

export const initI18n = (language: string, options: InitI18nOptions = {}) => {
  ensureInitialized(options.fallbackLanguage, options.namespace)
  registerResources(options.resources)

  if (i18nInstance.language !== language) {
    void i18nInstance.changeLanguage(language)
  }

  return i18nInstance
}
