import { createContext, useContext } from 'react'

import type { IntlSettings } from '@i18n/types'

export type IntlContextShape = {
  settings: IntlSettings
  setSettings: (next: Partial<IntlSettings>) => void
}

export const IntlContext = createContext<IntlContextShape | undefined>(undefined)

export const useIntlSettings = () => {
  const ctx = useContext(IntlContext)
  if (!ctx) {
    throw new Error('useIntlSettings must be used within IntlProvider')
  }

  return ctx
}
