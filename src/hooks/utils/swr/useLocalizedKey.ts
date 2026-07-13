import { useCallback } from 'react'

import { useLocale } from '@providers/I18nProvider/LayerI18nProvider'

export const useLocalizedKey = () => {
  const locale = useLocale()

  return useCallback(<Key extends Record<string, unknown>>(key: Key | null | undefined) => {
    if (!key) return
    return { ...key, _locale: locale }
  }, [locale])
}
