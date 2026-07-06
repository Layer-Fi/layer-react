import { type SWRHook } from 'swr'
import { afterEach, describe, expect, it, vi } from 'vitest'

import * as authenticatedHttp from '@utils/api/authenticatedHttp'
import { SupportedLocale } from '@utils/i18n/supportedLocale'
import { localeKeyMiddleware } from '@utils/swr/localeKeyMiddleware'

afterEach(() => vi.restoreAllMocks())

type Fetcher = ((key: Record<string, unknown>, ...rest: unknown[]) => unknown) | null

/** Runs the middleware and returns the fetcher it handed to the next SWR hook. */
const captureWrappedFetcher = (fetcher: Fetcher): { wrapped: Fetcher, useSWRNext: SWRHook } => {
  let wrapped: Fetcher = null
  const useSWRNext = vi.fn((_key, nextFetcher: Fetcher) => {
    wrapped = nextFetcher
    return {} as never
  }) as unknown as SWRHook

  localeKeyMiddleware(useSWRNext)({ businessId: 'b1' }, fetcher, {} as never)

  return { wrapped, useSWRNext }
}

describe('localeKeyMiddleware', () => {
  it('forwards the key and config unchanged to the next hook', () => {
    const config = { revalidateOnFocus: false } as never
    const useSWRNext = vi.fn(() => ({}) as never) as unknown as SWRHook
    const key = { businessId: 'b1' }

    localeKeyMiddleware(useSWRNext)(key, () => Promise.resolve('data'), config)

    expect(useSWRNext).toHaveBeenCalledWith(key, expect.any(Function), config)
  })

  it('sets the locale header from the key and calls the inner fetcher without _locale', async () => {
    const setLocaleHeader = vi.spyOn(authenticatedHttp, 'setLocaleHeader').mockImplementation(() => {})
    const innerFetcher = vi.fn(() => Promise.resolve('data'))

    const { wrapped } = captureWrappedFetcher(innerFetcher)

    await wrapped?.({ _locale: SupportedLocale.frCA, businessId: 'b1' })

    expect(setLocaleHeader).toHaveBeenCalledWith(SupportedLocale.frCA)
    expect(innerFetcher).toHaveBeenCalledWith({ businessId: 'b1' })
  })

  it('passes a null fetcher straight through', () => {
    const { wrapped } = captureWrappedFetcher(null)
    expect(wrapped).toBeNull()
  })
})
