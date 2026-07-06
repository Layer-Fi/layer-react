import { renderHook } from '@testing-library/react'
import { type SWRInfiniteResponse } from 'swr/infinite'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SupportedLocale } from '@utils/i18n/supportedLocale'
import { usePreserveInfiniteSize } from '@hooks/utils/swr/usePreserveInfiniteSize'
import { useLocale } from '@providers/I18nProvider/LayerI18nProvider'

vi.mock('@providers/I18nProvider/LayerI18nProvider', () => ({ useLocale: vi.fn() }))

const mockedUseLocale = vi.mocked(useLocale)

type SetSize = SWRInfiniteResponse['setSize']
type Props = { size: number, setSize: SetSize }

const makeSetSize = () => vi.fn() as unknown as SetSize

beforeEach(() => mockedUseLocale.mockReturnValue(SupportedLocale.enUS))
afterEach(() => vi.restoreAllMocks())

const renderPreserve = (initialProps: Props) =>
  renderHook(({ size, setSize }: Props) => usePreserveInfiniteSize({ size, setSize }), { initialProps })

describe('usePreserveInfiniteSize', () => {
  it('does not touch setSize while the locale is unchanged', () => {
    const setSize = makeSetSize()
    const { rerender } = renderPreserve({ size: 3, setSize })

    rerender({ size: 4, setSize })

    expect(setSize).not.toHaveBeenCalled()
  })

  it('restores the pre-change size after a locale change', () => {
    const setSize = makeSetSize()
    const { rerender } = renderPreserve({ size: 3, setSize })

    mockedUseLocale.mockReturnValue(SupportedLocale.frCA)
    rerender({ size: 1, setSize })

    expect(setSize).toHaveBeenCalledWith(3)
  })

  it('does not restore when the tracked size is not greater than one', () => {
    const setSize = makeSetSize()
    const { rerender } = renderPreserve({ size: 1, setSize })

    mockedUseLocale.mockReturnValue(SupportedLocale.frCA)
    rerender({ size: 1, setSize })

    expect(setSize).not.toHaveBeenCalled()
  })
})
