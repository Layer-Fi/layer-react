import { type PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { I18nProvider as AriaI18nProvider } from 'react-aria-components'
import { I18nextProvider } from 'react-i18next'

import i18next from '@utils/i18n/init'

const getLocale = () => i18next.resolvedLanguage || i18next.language || 'en-US'

export function LayerI18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocale] = useState(getLocale)
  const onLanguageChanged = useCallback(() => setLocale(getLocale()), [])

  useEffect(() => {
    i18next.on('languageChanged', onLanguageChanged)
    return () => i18next.off('languageChanged', onLanguageChanged)
  }, [onLanguageChanged])

  return (
    <I18nextProvider i18n={i18next}>
      <AriaI18nProvider locale={locale}>
        {children}
      </AriaI18nProvider>
    </I18nextProvider>
  )
}
