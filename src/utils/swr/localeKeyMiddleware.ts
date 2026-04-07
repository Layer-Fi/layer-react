import type { BareFetcher, Middleware, SWRHook } from 'swr'

import { setLocaleHeader } from '@utils/api/authenticatedHttp'
import { isStringArray } from '@utils/array/isStringArray'
import type { SupportedLocale } from '@utils/i18n/supportedLocale'
import { AUTH_TAG_KEY } from '@hooks/utils/auth/useAuth'
import { useLocale } from '@providers/I18nProvider/LayerI18nProvider'

const hasTag = (key: unknown, tag: string): boolean =>
  key !== null
  && typeof key === 'object'
  && 'tags' in key
  && isStringArray((key as Record<string, unknown>).tags)
  && (key as Record<string, unknown> & { tags: string[] }).tags.includes(tag)

const createLocalizedFetcher = <Data>(fetcher: BareFetcher<Data> | null) => {
  if (!fetcher) return null

  return ({ _locale, ...key }: Record<string, unknown> & { _locale: SupportedLocale | undefined }) => {
    setLocaleHeader(_locale)
    return fetcher(key)
  }
}

export const localeKeyMiddleware: Middleware = (useSWRNext: SWRHook) => (key, fetcher, config) => {
  const locale = useLocale()

  const augmentedKey = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- SWR middleware key is loosely typed
    const resolvedKey = typeof key === 'function' ? key() : key

    if (!resolvedKey) return null

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (hasTag(resolvedKey, AUTH_TAG_KEY)) return resolvedKey

    return { ...(resolvedKey as Record<string, unknown>), _locale: locale as string }
  }

  return useSWRNext(augmentedKey, createLocalizedFetcher(fetcher), config)
}
