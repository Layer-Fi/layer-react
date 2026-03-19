import { type PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { I18nProvider as AriaI18nProvider } from 'react-aria-components'
import { I18nextProvider } from 'react-i18next'

import i18next from '@utils/i18n/init'
import { DEFAULT_LOCALE, isSupportedLocale } from '@utils/i18n/supportedLocale'
import { I18nLocaleContext } from '@providers/I18nProvider/I18nLocaleContext'

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
      <I18nLocaleContext.Provider value={locale}>
        <AriaI18nProvider locale={locale}>
          {children}
        </AriaI18nProvider>
      </I18nLocaleContext.Provider>
    </I18nextProvider>
  )
}
