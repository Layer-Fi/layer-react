import { type PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { I18nProvider as AriaI18nProvider } from 'react-aria-components'
import { I18nextProvider } from 'react-i18next'
import { IntlProvider } from 'react-intl'

import i18next from '@utils/i18n/init'
import { DEFAULT_LOCALE, isSupportedLocale } from '@utils/i18n/supportedLocale'

const EMPTY_MESSAGES = {}

const getLocale = () => {
  const locale = i18next.resolvedLanguage || i18next.language

  if (!locale || !isSupportedLocale(locale)) return DEFAULT_LOCALE

  return locale
}

export function LayerI18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocale] = useState(getLocale)
  const onLanguageChanged = useCallback(() => setLocale(getLocale()), [])

  useEffect(() => {
    i18next.on('languageChanged', onLanguageChanged)
    return () => i18next.off('languageChanged', onLanguageChanged)
  }, [onLanguageChanged])

  return (
    <I18nextProvider i18n={i18next}>
      <IntlProvider locale={locale} defaultLocale={DEFAULT_LOCALE} messages={EMPTY_MESSAGES}>
        <AriaI18nProvider locale={locale}>
          {children}
        </AriaI18nProvider>
      </IntlProvider>
    </I18nextProvider>
  )
}
