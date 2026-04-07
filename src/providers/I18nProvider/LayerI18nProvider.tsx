import { createContext, type PropsWithChildren, useContext, useEffect, useRef } from 'react'
import { I18nProvider as AriaI18nProvider } from 'react-aria-components'
import { I18nextProvider } from 'react-i18next'
import { IntlProvider } from 'react-intl'

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
    initI18n(locale)
    initialized.current = true
  }

  useEffect(() => {
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
