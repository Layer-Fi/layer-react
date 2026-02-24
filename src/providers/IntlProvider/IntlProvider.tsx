import { type PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { I18nextProvider } from 'react-i18next'

import { IntlContext } from '@contexts/IntlContext/IntlContext'
import { initI18n, i18nInstance } from '@i18n/index'
import {
  DEFAULT_INTL_SETTINGS,
  type IntlSettings,
  type IntlSettingsInput,
  type I18nResources,
} from '@i18n/types'
import { setIntlSettings } from '@utils/intl/settingsStore'

type IntlProviderProps = PropsWithChildren<{
  locale?: IntlSettingsInput
  resources?: I18nResources
}>

export const IntlProvider = ({ children, locale, resources }: IntlProviderProps) => {
  const [settings, setSettingsState] = useState<IntlSettings>(() => {
    const merged = { ...DEFAULT_INTL_SETTINGS, ...(locale ?? {}) }
    setIntlSettings(merged)
    // Initialize i18n synchronously on first render to avoid blank screen
    initI18n(merged.language, { resources })
    return merged
  })

  useEffect(() => {
    setIntlSettings(settings)
  }, [settings])

  useEffect(() => {
    if (!locale) {
      return
    }

    setSettingsState(prev => ({ ...prev, ...locale }))
  }, [
    locale?.currency,
    locale?.formatRegion,
    locale?.language,
    locale?.numberFormat,
    locale?.shortDateFormat,
  ])

  useEffect(() => {
    // Re-register resources if they change after initial render
    initI18n(settings.language, { resources })
  }, [resources, settings.language])

  const value = useMemo(
    () => ({
      settings,
      setSettings: (next: Partial<IntlSettings>) =>
        setSettingsState(prev => ({ ...prev, ...next })),
    }),
    [settings],
  )

  return (
    <IntlContext.Provider value={value}>
      <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
    </IntlContext.Provider>
  )
}
