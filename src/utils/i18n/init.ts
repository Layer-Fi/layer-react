import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import enUSTranslation from '@assets/locales/en-US/translation.json'
import frCATranslation from '@assets/locales/fr-CA/translation.json'

const enUSResources = enUSTranslation as Record<string, unknown>
const frCAResources = frCATranslation as Record<string, unknown>

let initPromise: Promise<void> | undefined

export const initI18n = async () => {
  if (i18next.isInitialized) {
    return i18next
  }

  if (!initPromise) {
    initPromise = i18next
      .use(initReactI18next)
      .init({
        returnEmptyString: false,
        fallbackLng: 'en-US',
        defaultNS: 'translation',
        resources: {
          'en-US': { translation: enUSResources },
          'fr-CA': { translation: frCAResources },
        },
      })
      .then(() => undefined)
  }

  await initPromise
  return i18next
}

export default i18next
