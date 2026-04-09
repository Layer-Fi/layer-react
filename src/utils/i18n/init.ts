import i18next from 'i18next'
import Pseudo from 'i18next-pseudo'
import { initReactI18next } from 'react-i18next'

import { pseudoOptions } from '@utils/i18n/pseudoConfig'
import { DEFAULT_LOCALE, type SupportedLocale } from '@utils/i18n/supportedLocale'
import * as enUS from '@assets/locales/en-US'
import * as frCA from '@assets/locales/fr-CA'

export const LAYER_TEST_LOCALE_URL_PARAM = 'layer_test_locale'
const isPseudoEnabled = () => {
  if (typeof window === 'undefined') return false

  const params = new URLSearchParams(window.location.search)
  return params.get(LAYER_TEST_LOCALE_URL_PARAM) === 'pseudo'
}

export const initI18n = (locale: SupportedLocale) => {
  if (i18next.isInitialized) return

  const usePseudo = isPseudoEnabled()

  return void i18next
    .use(initReactI18next)
    .use(new Pseudo(pseudoOptions({ enabled: usePseudo })))
    .init({
      returnEmptyString: false,
      initAsync: false,
      lng: locale,
      fallbackLng: DEFAULT_LOCALE,
      defaultNS: 'common',
      resources: {
        'en-US': enUS,
        'fr-CA': frCA,
      },
      ...(usePseudo && { lng: DEFAULT_LOCALE, postProcess: ['pseudo'] }),
    })
}

export default i18next
