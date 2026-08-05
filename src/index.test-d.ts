import type { ComponentProps } from 'react'
import { assertType, describe, expectTypeOf, it } from 'vitest'

import type { EventCallbacks, GlobalMonthPicker, LayerProvider } from './index'

// Consumers hit the types before they hit the runtime, so the types are part of the contract too.
// These are written from a consumer's point of view — valid usage must compile, and invalid usage
// must not, which a runtime test cannot express.

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
