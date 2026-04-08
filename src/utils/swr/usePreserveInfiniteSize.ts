import { useEffect, useRef } from 'react'
import type { SWRInfiniteResponse } from 'swr/infinite'

import { useLocale } from '@providers/I18nProvider/LayerI18nProvider'

/**
 * Preserves the page size of a useSWRInfinite response across locale changes.
 * Without this, changing locale resets to initialSize because the keys change.
 */
export function usePreserveInfiniteSize({ size, setSize }: Pick<SWRInfiniteResponse, 'size' | 'setSize'>) {
  const locale = useLocale()

  const sizeBeforeLocaleChange = useRef(size)
  const previousLocale = useRef(locale)

  // Track size while locale is stable
  if (previousLocale.current === locale) {
    sizeBeforeLocaleChange.current = size
  }

  // Restore size after locale changes
  useEffect(() => {
    if (previousLocale.current === locale) return
    previousLocale.current = locale

    if (sizeBeforeLocaleChange.current > 1) {
      void setSize(sizeBeforeLocaleChange.current)
    }
  }, [locale, setSize])
}
