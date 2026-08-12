import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ExpandSummaryCardButton, type ExpandSummaryCardButtonProps } from '@blocks/SummaryCard/ExpandSummaryCardButton'

import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const renderExpandButton = (props: ExpandSummaryCardButtonProps) => {
  const user = userEvent.setup()

  return {
    user,
    ...render(<ExpandSummaryCardButton {...props} />, { wrapper: LayerTestProvider }),
  }
}

describe('ExpandSummaryCardButton', () => {
  it('renders a button with the given accessible label', () => {
    renderExpandButton({ callback: vi.fn(), ariaLabel: 'View revenue details' })

    expect(screen.getByRole('button', { name: 'View revenue details' })).toBeInTheDocument()
  })

  it('invokes the callback when pressed', async () => {
    const callback = vi.fn()

    const { user } = renderExpandButton({ callback, ariaLabel: 'View revenue details' })

    await user.click(screen.getByRole('button', { name: 'View revenue details' }))

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
