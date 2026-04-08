import { useCallback, useEffect, useRef } from 'react'

import { createKeyMatcher } from '@utils/swr/createKeyMatcher'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useLocale } from '@providers/I18nProvider/LayerI18nProvider'

type CacheKeyWithLocale = {
  _locale: string
}

const keyMatchesLocale = createKeyMatcher<CacheKeyWithLocale, CacheKeyWithLocale>([
  { key: '_locale' },
])

/**
 * Clears cached data for the previous locale when the locale changes.
 * Must be rendered inside both LocaleContext and SWRConfig providers.
 */
export function StaleLocaleCacheInvalidator() {
  const locale = useLocale()
  const { patchCache } = useGlobalCacheActions()

  const clearLocaleKeys = useCallback(
    (params: CacheKeyWithLocale) =>
      patchCache<unknown, CacheKeyWithLocale>(
        ({ key }) => keyMatchesLocale(key, params),
        () => undefined,
      ),
    [patchCache],
  )

  const previousLocale = useRef(locale)
  useEffect(() => {
    if (previousLocale.current === locale) return

    const staleLocale = previousLocale.current
    previousLocale.current = locale
    void clearLocaleKeys({ _locale: staleLocale })
  }, [locale, clearLocaleKeys])

  return null
}
