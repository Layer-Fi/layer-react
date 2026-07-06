import { type PropsWithChildren } from 'react'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SupportedLocale } from '@utils/i18n/supportedLocale'
import { useLocalizedKey } from '@hooks/utils/swr/useLocalizedKey'

import { LayerTestProvider } from '@test-utils/LayerTestProvider'

const frCaWrapper = ({ children }: PropsWithChildren) => (
  <LayerTestProvider locale={SupportedLocale.frCA}>{children}</LayerTestProvider>
)

const defaultWrapper = ({ children }: PropsWithChildren) => (
  <LayerTestProvider>{children}</LayerTestProvider>
)

describe('useLocalizedKey', () => {
  it('adds the active locale to the key', () => {
    const { result } = renderHook(() => useLocalizedKey(), {
      wrapper: frCaWrapper,
    })

    expect(result.current({ businessId: 'b1' })).toEqual({
      businessId: 'b1',
      _locale: SupportedLocale.frCA,
    })
  })

  it('defaults to en-US when no locale is provided', () => {
    const { result } = renderHook(() => useLocalizedKey(), {
      wrapper: defaultWrapper,
    })

    expect(result.current({ businessId: 'b1' })).toMatchObject({ _locale: SupportedLocale.enUS })
  })

  it('returns undefined for a null or undefined key', () => {
    const { result } = renderHook(() => useLocalizedKey(), {
      wrapper: frCaWrapper,
    })

    expect(result.current(null)).toBeUndefined()
    expect(result.current(undefined)).toBeUndefined()
  })

  it('returns a stable callback across renders while the locale is unchanged', () => {
    const { result, rerender } = renderHook(() => useLocalizedKey(), {
      wrapper: frCaWrapper,
    })

    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })
})
