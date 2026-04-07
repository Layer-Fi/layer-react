import type { Middleware, SWRHook } from 'swr'

import { isStringArray } from '@utils/array/isStringArray'
import { useLocale } from '@providers/I18nProvider/LayerI18nProvider'

const hasTag = (key: unknown, tag: string): boolean =>
  key !== null
  && typeof key === 'object'
  && 'tags' in key
  && isStringArray((key as Record<string, unknown>).tags)
  && (key as Record<string, unknown> & { tags: string[] }).tags.includes(tag)

export const localeKeyMiddleware: Middleware = (useSWRNext: SWRHook) => (key, fetcher, config) => {
  const locale = useLocale()

  const augmentedKey = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- SWR middleware key is loosely typed
    const resolvedKey = typeof key === 'function' ? key() : key

    if (!resolvedKey) return null

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (hasTag(resolvedKey, '#auth')) return resolvedKey

    if (typeof resolvedKey === 'object') {
      return { ...(resolvedKey as Record<string, unknown>), _locale: locale as string }
    }

    return `${String(resolvedKey)}:${locale}`
  }

  return useSWRNext(augmentedKey, fetcher, config)
}
