import i18next, { type i18n } from 'i18next'
import Pseudo from 'i18next-pseudo'

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

// A private i18next instance owned by Layer. We intentionally do not use the default singleton
// (`import i18next from 'i18next'`) so we can't inadvertently share state or event subscriptions
// with a customer platform's application's own react-i18next setup.
const layerI18n: i18n = i18next.createInstance()

export const initI18n = (locale: SupportedLocale) => {
  if (layerI18n.isInitialized) return

  const usePseudo = isPseudoEnabled()

  return void layerI18n
    .use(new Pseudo(pseudoOptions({ enabled: usePseudo })))
    .init({
      returnEmptyString: false,
      initAsync: false,
      lng: locale,
      fallbackLng: DEFAULT_LOCALE,
      defaultNS: 'common',
      // React escapes interpolated values at render time, so i18next's own HTML
      // escaping is redundant and would turn characters like `&` into `&amp;`.
      interpolation: { escapeValue: false },
      resources: {
        'en-US': enUS,
        'fr-CA': frCA,
      },
      ...(usePseudo && { lng: DEFAULT_LOCALE, postProcess: ['pseudo'] }),
    })
}

export default layerI18n
