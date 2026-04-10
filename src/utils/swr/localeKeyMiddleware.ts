import type { BareFetcher, Middleware, SWRHook } from 'swr'

import { setLocaleHeader } from '@utils/api/authenticatedHttp'
import type { SupportedLocale } from '@utils/i18n/supportedLocale'
import { useLocale } from '@providers/I18nProvider/LayerI18nProvider'

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

export const useLocalizedKey = () => {
  const locale = useLocale()

  return <Key extends Record<string, unknown>>(key: Key | null | undefined) => {
    if (!key) return
    return { ...key, _locale: locale as string }
  }
}
