// Subpath types cannot be checked by `attw`, which reports `./*` as `(wildcard)` and stops. These
// imports resolve through the real `exports` map, so a broken `dist/exports/*.d.mts` fails here.
import { Direction } from '@layerfi/components/Direction'
import { type GlobalMonthPicker } from '@layerfi/components/GlobalMonthPicker'
import type { EventCallbacks } from '@layerfi/components/LayerProvider'
import { type LayerProvider } from '@layerfi/components/LayerProvider'
import { SupportedLocale } from '@layerfi/components/SupportedLocale'
import type { ComponentProps } from 'react'
import { assertType, describe, it } from 'vitest'

describe('subpath exports', () => {
  it('types a component reached through its own subpath', () => {
    assertType<ComponentProps<typeof GlobalMonthPicker>>({ showLabel: true })

    // @ts-expect-error showLabel is a boolean
    assertType<ComponentProps<typeof GlobalMonthPicker>>({ showLabel: 'yes' })
  })

  it('matches the type the root entry gives for the same component', () => {
    assertType<ComponentProps<typeof LayerProvider>>({ businessId: 'business-id' })

    // @ts-expect-error businessId is required
    assertType<ComponentProps<typeof LayerProvider>>({})
  })

  it('carries sibling type-only exports from the same module', () => {
    assertType<EventCallbacks>({})
  })

  it('resolves enum value exports', () => {
    // The ESLint job lints without a `dist/` build, so these subpaths don't resolve there and the
    // enum member access reads as `any`.

    assertType<Direction>(Direction.DEBIT)

    assertType<SupportedLocale>(SupportedLocale.enUS)
  })
})
