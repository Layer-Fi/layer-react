import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useLayerContext } from '@providers/global/LayerContext/LayerContext'

import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

describe('BusinessProvider', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('clears pending toast timers on unmount', () => {
    let addToast: ReturnType<typeof useLayerContext>['addToast'] | undefined
    const CaptureAddToast = () => {
      addToast = useLayerContext().addToast
      return null
    }

    const { unmount } = render(<CaptureAddToast />, { wrapper: LayerTestProvider })
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

    act(() => addToast?.({ content: 'Saved' }))
    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })
})
