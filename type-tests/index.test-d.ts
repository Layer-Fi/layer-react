// Self-reference, so this resolves through the `exports` map to the built declarations the way a
// consumer does — not from `src`, which skips the rollup-dts step where a contract can break.
// `@ts-expect-error` asserts invalid usage does *not* compile, which no runtime test can express.
import type { EventCallbacks, LayerProvider } from '@layerfi/components'
import type { ComponentProps } from 'react'
import { assertType, describe, it } from 'vitest'

type ProviderProps = ComponentProps<typeof LayerProvider>

describe('LayerProvider', () => {
  it('requires a string businessId', () => {
    assertType<ProviderProps>({ businessId: 'business-id' })

    // @ts-expect-error businessId is required
    assertType<ProviderProps>({})
    // @ts-expect-error businessId is a string, not a number
    assertType<ProviderProps>({ businessId: 42 })
  })

  it('constrains environment to known values', () => {
    assertType<ProviderProps>({ businessId: 'business-id', environment: 'staging' })

    // @ts-expect-error not a known environment
    assertType<ProviderProps>({ businessId: 'business-id', environment: 'nope' })
  })

  it('leaves every EventCallbacks handler optional', () => {
    assertType<EventCallbacks>({})
  })
})
