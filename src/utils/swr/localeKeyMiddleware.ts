import type { BareFetcher, Middleware, SWRHook } from 'swr'

import { setLocaleHeader } from '@utils/api/authenticatedHttp'
import type { SupportedLocale } from '@utils/i18n/supportedLocale'

const createLocalizedFetcher = <Data>(fetcher: BareFetcher<Data> | null) => {
  if (!fetcher) return null

  return ({ _locale, ...key }: Record<string, unknown> & { _locale: SupportedLocale | undefined }, ...rest: unknown[]) => {
    setLocaleHeader(_locale)

    return fetcher(key, ...rest)
  }
}

export const localeKeyMiddleware: Middleware = (useSWRNext: SWRHook) => (key, fetcher, config) => {
  return useSWRNext(key, createLocalizedFetcher(fetcher), config)
}
