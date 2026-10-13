import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { type ToastData } from '@internal-types/shared/toastData'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'

import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const renderWithAddToast = () => {
  let addToast: (toast: ToastData) => void = () => {}
  const CaptureAddToast = () => {
    addToast = useLayerContext().addToast
    return null
  }

  const result = render(<CaptureAddToast />, { wrapper: LayerTestProvider })
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

  const addToastInAct = (toast: ToastData) => {
    act(() => {
      addToast(toast)
    })
  }

  return { ...result, addToast: addToastInAct }
}

describe('ToastsContainer', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows a toast, fades it out after its duration, then removes it', () => {
    const { addToast } = renderWithAddToast()

    addToast({ content: 'Saved', duration: 2000 })
    expect(screen.getByText('Saved').parentElement).toHaveAttribute('data-entering')

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByText('Saved').parentElement).toHaveAttribute('data-exiting')

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.queryByText('Saved')).not.toBeInTheDocument()
  })

  it('leaves no toast timers pending after unmount', () => {
    const { addToast, unmount } = renderWithAddToast()

    addToast({ content: 'Saved' })
    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })
})
