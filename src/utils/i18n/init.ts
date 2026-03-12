import i18next from 'i18next'
import Pseudo from 'i18next-pseudo'
import { initReactI18next } from 'react-i18next'

import { isPseudoEnabled, pseudoOptions } from '@utils/i18n/pseudoConfig'
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
    const usePseudo = isPseudoEnabled()
    const chain = usePseudo
      ? i18next.use(new Pseudo(pseudoOptions())).use(initReactI18next)
      : i18next.use(initReactI18next)
    initPromise = chain
      .init({
        returnEmptyString: false,
        initImmediate: false,
        fallbackLng: 'en-US',
        defaultNS: 'translation',
        ...(usePseudo && { lng: 'en-US', postProcess: ['pseudo'] }),
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

void initI18n()
