// Self-referenced, so it resolves through the `exports` map to the built declarations a consumer
// gets, not `src`. `@ts-expect-error` asserts invalid usage does *not* compile.
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
