// Self-reference, so this resolves through the `exports` map to the built declarations the way a
// consumer does — not from `src`, which skips the rollup-dts step where a contract can break.
// `@ts-expect-error` asserts invalid usage does *not* compile, which no runtime test can express.
import type { EventCallbacks, GlobalMonthPicker, LayerProvider } from '@layerfi/components'
import type { ComponentProps } from 'react'
import { assertType, describe, expectTypeOf, it } from 'vitest'

type ProviderProps = ComponentProps<typeof LayerProvider>
type MonthPickerProps = ComponentProps<typeof GlobalMonthPicker>

describe('LayerProvider', () => {
  it('requires businessId as a string', () => {
    expectTypeOf<ProviderProps['businessId']>().toEqualTypeOf<string>()

    // @ts-expect-error businessId is required
    assertType<ProviderProps>({})
    // @ts-expect-error businessId is a string, not a number
    assertType<ProviderProps>({ businessId: 42 })
  })

  it('accepts either environment or an environment config override', () => {
    assertType<ProviderProps>({ businessId: 'business-id', environment: 'staging' })

    // @ts-expect-error not a known environment
    assertType<ProviderProps>({ businessId: 'business-id', environment: 'nope' })
  })

  it('exposes EventCallbacks with optional handlers', () => {
    assertType<EventCallbacks>({})
    expectTypeOf<EventCallbacks>().toBeObject()
  })
})

describe('GlobalMonthPicker', () => {
  it('takes optional booleans only', () => {
    expectTypeOf<MonthPickerProps['showLabel']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<MonthPickerProps['truncateMonth']>().toEqualTypeOf<boolean | undefined>()

    assertType<MonthPickerProps>({})

    // @ts-expect-error showLabel is a boolean, not a string
    assertType<MonthPickerProps>({ showLabel: 'yes' })
  })
})
