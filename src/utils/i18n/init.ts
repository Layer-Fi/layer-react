import i18next from 'i18next'
import Pseudo from 'i18next-pseudo'
import { initReactI18next } from 'react-i18next'

import { pseudoOptions } from '@utils/i18n/pseudoConfig'
import { DEFAULT_LOCALE, isSupportedLocale } from '@utils/i18n/supportedLocale'
import * as enUS from '@assets/locales/en-US'
import * as frCA from '@assets/locales/fr-CA'

let initPromise: Promise<void> | undefined

export const LAYER_TEST_LOCALE_URL_PARAM = 'layer_test_locale'
const isPseudoEnabled = () => {
  if (typeof window === 'undefined') return false

  const params = new URLSearchParams(window.location.search)
  return params.get(LAYER_TEST_LOCALE_URL_PARAM) === 'pseudo'
}

const getLocale = () => {
  const params = new URLSearchParams(window.location.search)
  const localeParam = params.get(LAYER_TEST_LOCALE_URL_PARAM)

  if (localeParam && isSupportedLocale(localeParam)) {
    return localeParam
  }

  return DEFAULT_LOCALE
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
        lng: getLocale(),
        fallbackLng: DEFAULT_LOCALE,
        defaultNS: 'common',
        resources: {
          'en-US': enUS,
          'fr-CA': frCA,
        },
        ...(usePseudo && { lng: DEFAULT_LOCALE, postProcess: ['pseudo'] }),
      })
      .then(() => undefined)
  }

  await initPromise
  return i18next
}

export default i18next

void initI18n()
