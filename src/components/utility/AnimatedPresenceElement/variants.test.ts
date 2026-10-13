import { describe, expect, it } from 'vitest'

import { variants, withoutDelays } from '@components/utility/AnimatedPresenceElement/variants'

describe('withoutDelays', () => {
  it('drops per-value delays but keeps each fade duration', () => {
    const { animate, exit } = withoutDelays(variants.collapse)

    expect(animate).toMatchObject({ transition: { height: { delay: 0 }, opacity: { delay: 0, duration: 0.2 } } })
    expect(exit).toMatchObject({ transition: { height: { delay: 0 }, opacity: { delay: 0, duration: 0.2 } } })
  })

  it('leaves a variant without per-state transitions unchanged', () => {
    expect(withoutDelays(variants.fade)).toEqual(variants.fade)
  })
})
