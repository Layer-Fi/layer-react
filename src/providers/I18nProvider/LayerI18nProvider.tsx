import { createContext, type PropsWithChildren, useContext, useEffect, useRef } from 'react'
import { I18nProvider as AriaI18nProvider } from 'react-aria-components'
import { I18nextProvider } from 'react-i18next'
import { IntlProvider } from 'react-intl'

import { setLocaleHeader } from '@utils/api/authenticatedHttp'
import i18next, { initI18n } from '@utils/i18n/init'
import { DEFAULT_LOCALE, type SupportedLocale } from '@utils/i18n/supportedLocale'

const EMPTY_MESSAGES = {}

const LocaleContext = createContext<SupportedLocale>(DEFAULT_LOCALE)

export const useLocale = () => useContext(LocaleContext)

type LayerI18nProviderProps = PropsWithChildren<{
  locale?: SupportedLocale
}>

export function LayerI18nProvider({ children, locale = DEFAULT_LOCALE }: LayerI18nProviderProps) {
  const initialized = useRef(false)
  if (!initialized.current) {
    setLocaleHeader(locale)
    initI18n(locale)
    initialized.current = true
  }

  const previousLocale = useRef(locale)
  useEffect(() => {
    if (previousLocale.current === locale) return
    previousLocale.current = locale

    setLocaleHeader(locale)
    void i18next.changeLanguage(locale)
  }, [locale])

  return (
    <LocaleContext.Provider value={locale}>
      <I18nextProvider i18n={i18next}>
        <IntlProvider locale={locale} defaultLocale={DEFAULT_LOCALE} messages={EMPTY_MESSAGES}>
          <AriaI18nProvider locale={locale}>
            {children}
          </AriaI18nProvider>
        </IntlProvider>
      </I18nextProvider>
    </LocaleContext.Provider>
  )
}
