import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ExpandSummaryCardButton } from '@blocks/SummaryCard/ExpandSummaryCardButton'

import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

describe('ExpandSummaryCardButton', () => {
  it('renders a button with the given accessible label', () => {
    render(
      <ExpandSummaryCardButton callback={vi.fn()} ariaLabel='View revenue details' />,
      { wrapper: LayerTestProvider },
    )

    expect(screen.getByRole('button', { name: 'View revenue details' })).toBeInTheDocument()
  })

  it('invokes the callback when pressed', async () => {
    const user = userEvent.setup()
    const callback = vi.fn()

    render(
      <ExpandSummaryCardButton callback={callback} ariaLabel='View revenue details' />,
      { wrapper: LayerTestProvider },
    )

    await user.click(screen.getByRole('button', { name: 'View revenue details' }))

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
