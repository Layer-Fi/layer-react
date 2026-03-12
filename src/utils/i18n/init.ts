import i18next from 'i18next'
import Pseudo from 'i18next-pseudo'
import { initReactI18next } from 'react-i18next'

import { pseudoOptions } from '@utils/i18n/pseudoConfig'
import enUSTranslation from '@assets/locales/en-US/translation.json'
import frCATranslation from '@assets/locales/fr-CA/translation.json'

const enUSResources = enUSTranslation as Record<string, unknown>
const frCAResources = frCATranslation as Record<string, unknown>

let initPromise: Promise<void> | undefined

const isPseudoEnabled = () => {
  if (typeof window === 'undefined') return false

  const params = new URLSearchParams(window.location.search)
  return params.get('locale') === 'pseudo'
}

const initI18n = async () => {
  if (i18next.isInitialized) {
    return i18next
  }

  if (!initPromise) {
    const usePseudo = isPseudoEnabled()

    initPromise = i18next
      .use(initReactI18next)
      .use(new Pseudo(pseudoOptions({ enabled: usePseudo })))
      .init({
        returnEmptyString: false,
        initImmediate: false,
        fallbackLng: 'en-US',
        defaultNS: 'translation',
        resources: {
          'en-US': { translation: enUSResources },
          'fr-CA': { translation: frCAResources },
        },
        ...(usePseudo && { lng: 'en-US', postProcess: ['pseudo'] }),
      })
      .then(() => undefined)
  }

  await initPromise
  return i18next
}

export default i18next

void initI18n()
