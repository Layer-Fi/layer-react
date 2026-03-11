import { type PropsWithChildren } from 'react'
import { I18nProvider as AriaI18nProvider } from 'react-aria-components'
import { I18nextProvider } from 'react-i18next'

import i18next from '@utils/i18n/init'

export function LayerI18nProvider({ children }: PropsWithChildren) {
  const locale = i18next.resolvedLanguage || i18next.language || 'en-US'
  return (
    <I18nextProvider i18n={i18next}>
      <AriaI18nProvider locale={locale}>
        {children}
      </AriaI18nProvider>
    </I18nextProvider>
  )
}
