import { createContext, useContext } from 'react'

import { DEFAULT_LOCALE } from '@utils/i18n/supportedLocale'

export const I18nLocaleContext = createContext(DEFAULT_LOCALE)

export const useCurrentLocale = () => useContext(I18nLocaleContext)
